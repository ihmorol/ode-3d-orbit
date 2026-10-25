/**
 * Workbench DOM: equation rows, parameter cards, axis mapping, the HUD
 * readouts, and every event binding. Rendering rebuilds the affected
 * panel; values the visitor is editing are never overwritten mid-edit.
 */
import { appState } from './state.js';
import { buildCyclicStates } from './math.js';
import { PRESETS } from './presets.js';
import { compileSystem, updateStateIndexMap, isLorenz1960Active, computeLorenz1960Invariants } from './solver.js';
import {
    rebuildTrajectories, setCameraView, stepSimulation,
    toggleCameraProjection, setAutoRotate, setAxesVisible, getParticles,
    getHistoryLen, scrubTo, truncateHistoryAfterScrub
} from './scene.js';

const el = (id) => document.getElementById(id);

function esc(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function showError(message) {
    el('error-banner').classList.remove('hidden');
    el('error-message').textContent = message;
}

function clearError() {
    el('error-banner').classList.add('hidden');
}

/** Compile, surfacing failures in the error banner. Returns success. */
function attemptCompile() {
    try {
        compileSystem();
        clearError();
        return true;
    } catch (err) {
        showError(err.message);
        return false;
    }
}

function updateMappingBadge() {
    const cLabel = appState.mapping.color === '_speed' ? '|v|' : appState.mapping.color;
    el('active-mapping-badge').textContent =
        `Axes: ${appState.mapping.x}, ${appState.mapping.y}, ${appState.mapping.z} · Color: ${cLabel}`;
}

/**
 * A generated ring system is no longer the selected preset — make the
 * selector say so instead of silently lying about what's running.
 */
function markSelectorCustom() {
    const select = el('preset-select');
    let custom = select.querySelector('option[value="custom"]');
    if (!custom) {
        custom = document.createElement('option');
        custom.value = 'custom';
        custom.hidden = true;
        custom.textContent = 'Custom system (not a preset)';
        select.appendChild(custom);
    }
    select.value = 'custom';
}

/* ------------------------------------------------------------------
 * Panel rendering
 * ------------------------------------------------------------------ */

function renderEquationsUI() {
    const eqList = el('equations-list');
    const initGrid = el('initial-states-grid');
    eqList.innerHTML = '';
    initGrid.innerHTML = '';

    const N = appState.states.length;
    el('direct-n-input').value = N;
    el('monitor-n-count').textContent = `N = ${N}`;
    el('hud-dim-tag').textContent = `N = ${N}`;

    appState.states.forEach((st, idx) => {
        const row = document.createElement('div');
        row.className = 'eq-row';
        row.innerHTML = `
            <div class="eq-name">
                <span>d</span>
                <input type="text" data-idx="${idx}" value="${esc(st.name)}" class="state-name-input" aria-label="State ${idx + 1} name">
                <span>/dt=</span>
            </div>
            <input type="text" data-idx="${idx}" value="${esc(st.eq)}" class="eq-expr state-eq-input" spellcheck="false" aria-label="Derivative of ${esc(st.name)}">
            ${N > 3 ? `<button data-idx="${idx}" class="eq-remove remove-state-btn" title="Remove state ${esc(st.name)}" aria-label="Remove state ${esc(st.name)}">×</button>` : ''}
        `;
        eqList.appendChild(row);

        const initBox = document.createElement('div');
        initBox.className = 'init-box';
        initBox.innerHTML = `
            <span class="var-name">${esc(st.name)}<sub>0</sub></span>
            <input type="number" step="0.05" data-idx="${idx}" value="${st.init}" class="state-init-input" aria-label="Initial value of ${esc(st.name)}">
        `;
        initGrid.appendChild(initBox);
    });

    eqList.querySelectorAll('.state-name-input').forEach((inp) => {
        inp.addEventListener('input', (e) => {
            const i = Number(e.target.dataset.idx);
            appState.states[i].name = e.target.value.trim() || `s${i}`;
            renderMappingSelectsUI();
            attemptCompile();
        });
    });

    eqList.querySelectorAll('.state-eq-input').forEach((inp) => {
        inp.addEventListener('input', (e) => {
            const i = Number(e.target.dataset.idx);
            appState.states[i].eq = e.target.value;
            attemptCompile();
        });
    });

    initGrid.querySelectorAll('.state-init-input').forEach((inp) => {
        inp.addEventListener('change', (e) => {
            const i = Number(e.target.dataset.idx);
            appState.states[i].init = parseFloat(e.target.value) || 0;
            appState.initialInvariants = { E0: null, V0: null };
            rebuildTrajectories();
        });
    });

    eqList.querySelectorAll('.remove-state-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            const i = Number(e.currentTarget.dataset.idx);
            appState.states.splice(i, 1);
            renderEquationsUI();
            renderMappingSelectsUI();
            if (attemptCompile()) rebuildTrajectories();
        });
    });
}

function syncParamValue(i, rawVal) {
    const p = appState.params[i];
    if (!p) return;
    if (!Number.isFinite(rawVal)) return;
    const val = Number(rawVal.toFixed(4));
    p.val = val;
    appState.paramValues[p.name] = val;

    // A parameter change redefines the system: rebase the invariant drift.
    if (isLorenz1960Active()) {
        const particles = getParticles();
        if (particles.length > 0) {
            const inv = computeLorenz1960Invariants(particles[0].stateVec);
            appState.initialInvariants.E0 = inv.E;
            appState.initialInvariants.V0 = inv.V;
        }
    }

    const numInput = document.querySelector(`.param-num-input[data-idx="${i}"]`);
    if (numInput && document.activeElement !== numInput) numInput.value = val;

    const slider = document.querySelector(`.param-slider[data-idx="${i}"]`);
    if (slider && document.activeElement !== slider) slider.value = val;


    if (appState.clearOnScrub) {
        rebuildTrajectories();
    }
}

function renderParametersUI() {
    const paramList = el('parameters-list');
    paramList.innerHTML = '';

    if (appState.params.length === 0) {
        paramList.innerHTML = '<div class="params-empty">No constants defined</div>';
        return;
    }

    appState.params.forEach((p, idx) => {
        const card = document.createElement('div');
        card.className = 'param-card';
        card.innerHTML = `
            <div class="param-card-top">
                <div class="param-id">
                    <span class="scrub-label" data-idx="${idx}" title="Drag horizontally to scrub">${esc(p.name)}</span>
                    <input type="text" data-idx="${idx}" value="${esc(p.name)}" class="param-name-input" aria-label="Constant ${idx + 1} name">
                </div>
                <div class="param-id">
                    <button data-idx="${idx}" data-dir="-1" class="btn step-btn param-step-btn" title="Step down" aria-label="Decrease ${esc(p.name)}">−</button>
                    <input type="number" data-idx="${idx}" step="${p.step}" value="${p.val}" class="param-num-input" aria-label="Value of ${esc(p.name)}">
                    <button data-idx="${idx}" data-dir="1" class="btn step-btn param-step-btn" title="Step up" aria-label="Increase ${esc(p.name)}">+</button>
                    <button data-idx="${idx}" class="btn step-btn param-remove remove-param-btn" title="Remove constant" aria-label="Remove ${esc(p.name)}">×</button>
                </div>
            </div>
            <div class="param-range-row">
                <input type="number" data-idx="${idx}" value="${p.min}" class="param-bound param-min-input" aria-label="Minimum of ${esc(p.name)}">
                <input type="range" data-idx="${idx}" min="${p.min}" max="${p.max}" step="${p.step}" value="${p.val}" class="param-slider" aria-label="Scrub ${esc(p.name)}">
                <input type="number" data-idx="${idx}" value="${p.max}" class="param-bound param-max-input" aria-label="Maximum of ${esc(p.name)}">
            </div>
        `;
        paramList.appendChild(card);
    });

    paramList.querySelectorAll('.param-slider').forEach((slider) => {
        slider.addEventListener('input', (e) => {
            syncParamValue(Number(e.target.dataset.idx), parseFloat(e.target.value));
        });
    });

    paramList.querySelectorAll('.param-num-input').forEach((inp) => {
        inp.addEventListener('input', (e) => {
            syncParamValue(Number(e.target.dataset.idx), parseFloat(e.target.value) || 0);
        });
    });
    paramList.querySelectorAll('.param-step-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            const i = Number(e.currentTarget.dataset.idx);
            const dir = Number(e.currentTarget.dataset.dir);
            const p = appState.params[i];
            syncParamValue(i, p.val + dir * (p.step || 0.05));
        });
    });

    // Drag-to-scrub on the constant name chips (cards and quick pills alike)
    const bindScrubs = (scope) => {
        scope.querySelectorAll('.scrub-label').forEach((lbl) => {
            lbl.addEventListener('mousedown', (e) => {
                const i = Number(lbl.dataset.idx);
                const p = appState.params[i];
                const startX = e.clientX;
                const startVal = p.val;
                const step = p.step || 0.05;

                const onMove = (moveEvt) => {
                    syncParamValue(i, startVal + (moveEvt.clientX - startX) * step * 0.5);
                };
                const onUp = () => {
                    window.removeEventListener('mousemove', onMove);
                    window.removeEventListener('mouseup', onUp);
                };
                window.addEventListener('mousemove', onMove);
                window.addEventListener('mouseup', onUp);
            });
        });
    };
    bindScrubs(paramList);

    paramList.querySelectorAll('.param-name-input').forEach((inp) => {
        inp.addEventListener('input', (e) => {
            const i = Number(e.target.dataset.idx);
            appState.params[i].name = e.target.value.trim() || `p${i}`;
            attemptCompile();
        });
    });

    paramList.querySelectorAll('.param-min-input').forEach((inp) => {
        inp.addEventListener('change', (e) => {
            const i = Number(e.target.dataset.idx);
            appState.params[i].min = parseFloat(e.target.value) || 0;
            renderParametersUI();
        });
    });

    paramList.querySelectorAll('.param-max-input').forEach((inp) => {
        inp.addEventListener('change', (e) => {
            const i = Number(e.target.dataset.idx);
            appState.params[i].max = parseFloat(e.target.value) || 10;
            renderParametersUI();
        });
    });

    paramList.querySelectorAll('.remove-param-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            const i = Number(e.currentTarget.dataset.idx);
            appState.params.splice(i, 1);
            renderParametersUI();
            attemptCompile();
        });
    });
}

function renderMappingSelectsUI() {
    const selects = {
        x: el('map-x'),
        y: el('map-y'),
        z: el('map-z'),
        color: el('map-color')
    };

    const stateNames = appState.states.map((s) => s.name);

    ['x', 'y', 'z'].forEach((axis, idx) => {
        const sel = selects[axis];
        sel.innerHTML = '';
        stateNames.forEach((name) => {
            const opt = document.createElement('option');
            opt.value = name;
            opt.textContent = name;
            sel.appendChild(opt);
        });

        if (!stateNames.includes(appState.mapping[axis])) {
            appState.mapping[axis] = stateNames[Math.min(idx, stateNames.length - 1)];
        }
        sel.value = appState.mapping[axis];
    });

    const cSel = selects.color;
    cSel.innerHTML = '';
    const speedOpt = document.createElement('option');
    speedOpt.value = '_speed';
    speedOpt.textContent = 'Speed (|dS/dt|)';
    cSel.appendChild(speedOpt);

    stateNames.forEach((name) => {
        const opt = document.createElement('option');
        opt.value = name;
        opt.textContent = `state: ${name}`;
        cSel.appendChild(opt);
    });

    if (appState.mapping.color !== '_speed' && !stateNames.includes(appState.mapping.color)) {
        appState.mapping.color = '_speed';
    }
    cSel.value = appState.mapping.color;
    updateMappingBadge();
}

/* ------------------------------------------------------------------
 * System lifecycle
 * ------------------------------------------------------------------ */

export function loadPreset(presetKey) {
    const preset = PRESETS[presetKey];
    if (!preset) return;

    appState.currentPresetKey = presetKey;
    appState.states = JSON.parse(JSON.stringify(preset.states));
    appState.params = JSON.parse(JSON.stringify(preset.params));
    appState.mapping = { ...preset.mapping };
    appState.dt = preset.dt;
    appState.stepsPerFrame = preset.stepsPerFrame;
    appState.spread = preset.spread;
    appState.seedStrategy = preset.seedStrategy || 'cloud';
    appState.initialInvariants = { E0: null, V0: null };

    if (preset.nGenConfig) {
        el('ngen-count').value = preset.nGenConfig.N;
        el('ngen-formula').value = preset.nGenConfig.formula;
        el('ngen-init-formula').value = preset.nGenConfig.initFormula;
    }

    el('slider-dt').value = appState.dt;
    el('val-dt').textContent = appState.dt.toFixed(4);
    el('slider-steps').value = appState.stepsPerFrame;
    el('val-steps').textContent = appState.stepsPerFrame;
    el('slider-spread').value = appState.spread;
    el('val-spread').textContent = appState.spread.toFixed(2);
    el('seed-strategy-select').value = appState.seedStrategy;
    el('direct-n-input').value = appState.states.length;

    el('hud-system-title').textContent = preset.name;

    renderEquationsUI();
    renderParametersUI();
    renderMappingSelectsUI();

    if (attemptCompile()) {
        rebuildTrajectories();
        setCameraView('ISO');
    }
}

function resizeStatesCount(targetN) {
    const N = Math.max(3, Math.min(40, parseInt(targetN, 10) || 3));
    const currentLen = appState.states.length;
    if (N === currentLen) return;

    if (N < currentLen) {
        appState.states.splice(N);
    } else {
        const existingNames = appState.states.map((s) => s.name);
        for (let i = currentLen + 1; i <= N; i++) {
            let candidate = `x${i}`;
            if (existingNames.includes(candidate)) candidate = `s${i}`;
            const prevName = appState.states[i - 2] ? appState.states[i - 2].name : appState.states[0].name;
            appState.states.push({
                name: candidate,
                eq: `${prevName} - ${candidate}`,
                init: Number((0.2 * Math.sin(i)).toFixed(3))
            });
        }
    }

    el('direct-n-input').value = appState.states.length;
    renderEquationsUI();
    renderMappingSelectsUI();
    if (attemptCompile()) {
        rebuildTrajectories();
        setCameraView('ISO');
    }
}

export function toggleRunState() {
    if (!appState.isRunning && appState.scrubbing) truncateHistoryAfterScrub();
    appState.isRunning = !appState.isRunning;
    const btn = el('play-pause-btn');
    const ind = el('run-indicator');

    if (appState.isRunning) {
        btn.textContent = 'Run';
        btn.classList.add('active');
        ind.style.background = 'var(--signal)';
    } else {
        btn.textContent = 'Halt';
        btn.classList.remove('active');
        ind.style.background = 'var(--amber)';
    }
}

function resetSimulation() {
    appState.initialInvariants = { E0: null, V0: null };
    appState.scrubbing = false;
    rebuildTrajectories();
    syncTimeline();
}

/* ------------------------------------------------------------------
 * HUD
 * ------------------------------------------------------------------ */

export function updateHUD() {
    const particles = getParticles();
    if (particles.length === 0) return;
    const lead = particles[0];
    const s = lead.stateVec;
    const ix = appState.stateIndices.x;
    const iy = appState.stateIndices.y;
    const iz = appState.stateIndices.z;

    const shownTime = appState.scrubbing ? appState.scrubTime : appState.simTime;
    el('hud-time').textContent = shownTime.toFixed(3);
    el('hud-coords').textContent =
        `(${(s[ix] || 0).toFixed(3)}, ${(s[iy] || 0).toFixed(3)}, ${(s[iz] || 0).toFixed(3)})`;
    el('hud-speed').textContent = (lead.lastSpeed || 0).toFixed(3);

    const invRow = el('hud-invariants-row');
    const specBox = el('lorenz1960-spec-box');

    if (isLorenz1960Active()) {
        invRow.classList.remove('hidden');
        specBox.classList.remove('hidden');

        const { E, V } = computeLorenz1960Invariants(s);
        if (appState.initialInvariants.E0 === null) {
            appState.initialInvariants.E0 = E;
            appState.initialInvariants.V0 = V;
        }
        const dE = Math.abs(E - appState.initialInvariants.E0);
        const dV = Math.abs(V - appState.initialInvariants.V0);

        el('hud-energy').textContent = E.toFixed(6);
        el('hud-enstrophy').textContent = V.toFixed(6);
        el('hud-drift-e').textContent = `(ΔE: ${dE.toExponential(1)})`;
        el('hud-drift-v').textContent = `(ΔV: ${dV.toExponential(1)})`;
    } else {
        invRow.classList.add('hidden');
        specBox.classList.add('hidden');
    }

    syncTimeline();
}

function syncTimeline() {
    const tl = el('timeline-slider');
    if (!tl) return;
    const len = getHistoryLen();
    tl.max = String(Math.max(0, len - 1));
    if (!appState.scrubbing) {
        tl.value = String(Math.max(0, len - 1));
        el('timeline-readout').textContent = 't = ' + appState.simTime.toFixed(3);
    }
}

/* ------------------------------------------------------------------
 * Event wiring
 * ------------------------------------------------------------------ */


export function initWorkbench() {
    el('preset-select').addEventListener('change', (e) => loadPreset(e.target.value));

    el('play-pause-btn').addEventListener('click', toggleRunState);

    el('step-once-btn').addEventListener('click', () => {
        if (appState.isRunning) toggleRunState();
        if (appState.scrubbing) truncateHistoryAfterScrub();
        stepSimulation(appState.stepsPerFrame);
        syncTimeline();
        updateHUD();
    });

    el('reset-sim-btn').addEventListener('click', resetSimulation);

    document.querySelectorAll('.cam-preset-btn').forEach((btn) => {
        btn.addEventListener('click', () => setCameraView(btn.dataset.cam));
    });

    el('fit-cam-btn').addEventListener('click', () => setCameraView('ISO'));

    el('proj-toggle-btn').addEventListener('click', () => toggleCameraProjection());

    el('autorotate-btn').addEventListener('click', (e) => {
        setAutoRotate(!appState.autoRotate);
        e.currentTarget.classList.toggle('active', appState.autoRotate);
    });

    el('axes-toggle-btn').addEventListener('click', (e) => {
        setAxesVisible(!appState.showAxes);
        e.currentTarget.classList.toggle('active', appState.showAxes);
    });

    el('n-dec-btn').addEventListener('click', () => resizeStatesCount(appState.states.length - 1));
    el('n-inc-btn').addEventListener('click', () => resizeStatesCount(appState.states.length + 1));
    el('apply-direct-n-btn').addEventListener('click', () => {
        resizeStatesCount(el('direct-n-input').value);
    });
    el('direct-n-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            resizeStatesCount(el('direct-n-input').value);
            e.target.blur();
        }
    });

    el('add-state-btn').addEventListener('click', () => {
        const candidateNames = ['w', 'u', 'v', 'p', 'q', 'r', 's'];
        const existing = appState.states.map((s) => s.name);
        const nextName = candidateNames.find((n) => !existing.includes(n)) || `x${appState.states.length + 1}`;
        appState.states.push({ name: nextName, eq: `-${nextName}`, init: 0.1 });
        renderEquationsUI();
        renderMappingSelectsUI();
        if (attemptCompile()) rebuildTrajectories();
    });

    el('add-param-btn').addEventListener('click', () => {
        const existing = appState.params.map((p) => p.name);
        const candidates = ['k', 'l', 'mu', 'eps', 'omega', 'lambda'];
        const nextParam = candidates.find((n) => !existing.includes(n)) || `c${appState.params.length + 1}`;
        appState.params.push({ name: nextParam, val: 1.0, min: 0.0, max: 10.0, step: 0.05 });
        renderParametersUI();
        attemptCompile();
    });

    el('ngen-template-select').addEventListener('change', (e) => {
        const tpl = e.target.value;
        const formulaEl = el('ngen-formula');
        const initEl = el('ngen-init-formula');
        if (tpl === 'lorenz96') {
            formulaEl.value = '(x[i+1] - x[i-2]) * x[i-1] - x[i] + F';
            initEl.value = 'F + (i == 1 ? 0.08 : -0.02 * sin(i))';
            appState.params = [{ name: 'F', val: 8.0, min: 0, max: 24, step: 0.1 }];
        } else if (tpl === 'thomas_ring') {
            formulaEl.value = 'sin(x[i+1]) - b * x[i]';
            initEl.value = '0.5 * sin(i)';
            appState.params = [{ name: 'b', val: 0.18, min: 0.01, max: 0.6, step: 0.005 }];
        } else if (tpl === 'lotka_ring') {
            formulaEl.value = 'x[i] * (r - a * x[i] + c * (x[i+1] - x[i-1]))';
            initEl.value = '0.5 + 0.2 * sin(i)';
            appState.params = [
                { name: 'r', val: 0.2, min: 0.0, max: 2.0, step: 0.02 },
                { name: 'a', val: 0.2, min: 0.01, max: 2.0, step: 0.02 },
                { name: 'c', val: 1.2, min: 0.1, max: 3.0, step: 0.05 }
            ];
        } else if (tpl === 'kuramoto_ring') {
            formulaEl.value = 'omega + K * (sin(x[i+1] - x[i]) + sin(x[i-1] - x[i])) - 0.15 * x[i]';
            initEl.value = 'cos(2 * pi * i / N)';
            appState.params = [
                { name: 'omega', val: 0.4, min: -2.0, max: 2.0, step: 0.05 },
                { name: 'K', val: 1.8, min: 0.0, max: 5.0, step: 0.05 }
            ];
        }
        renderParametersUI();
    });

    el('ngen-generate-btn').addEventListener('click', () => {
        const N = Math.max(3, Math.min(40, parseInt(el('ngen-count').value, 10) || 8));
        const formula = el('ngen-formula').value.trim();
        const initFormula = el('ngen-init-formula').value.trim();

        const pMap = {};
        appState.params.forEach((p) => { pMap[p.name] = p.val; });

        appState.states = buildCyclicStates(N, formula, initFormula, pMap);
        appState.mapping = {
            x: 'x1',
            y: 'x2',
            z: 'x3',
            color: N >= 4 ? 'x4' : '_speed'
        };
        el('hud-system-title').textContent = `Ring system (N=${N})`;
        markSelectorCustom();

        renderEquationsUI();
        renderMappingSelectsUI();
        if (attemptCompile()) {
            rebuildTrajectories();
            setCameraView('ISO');
        }
    });

    el('clear-on-scrub-toggle').addEventListener('change', (e) => {
        appState.clearOnScrub = e.target.checked;
    });

    ['x', 'y', 'z', 'color'].forEach((key) => {
        el(`map-${key}`).addEventListener('change', (e) => {
            appState.mapping[key] = e.target.value;
            updateStateIndexMap();
            rebuildTrajectories();
            setCameraView('ISO');
        });
    });

    el('color-palette').addEventListener('change', (e) => {
        appState.palette = e.target.value;
    });

    el('seed-strategy-select').addEventListener('change', (e) => {
        appState.seedStrategy = e.target.value;
        rebuildTrajectories();
    });

    // Integrator controls
    const updateDt = (newDt) => {
        appState.dt = Math.max(0.0005, Math.min(0.04, Number(newDt.toFixed(4))));
        el('slider-dt').value = appState.dt;
        el('val-dt').textContent = appState.dt.toFixed(4);
    };
    el('slider-dt').addEventListener('input', (e) => updateDt(parseFloat(e.target.value)));
    el('dt-half-btn').addEventListener('click', () => updateDt(appState.dt * 0.5));
    el('dt-double-btn').addEventListener('click', () => updateDt(appState.dt * 2.0));

    el('slider-steps').addEventListener('input', (e) => {
        appState.stepsPerFrame = parseInt(e.target.value, 10);
        el('val-steps').textContent = appState.stepsPerFrame;
    });

    el('slider-particles').addEventListener('change', (e) => {
        appState.particleCount = parseInt(e.target.value, 10);
        el('val-particles').textContent = appState.particleCount;
        rebuildTrajectories();
    });
    el('slider-particles').addEventListener('input', (e) => {
        el('val-particles').textContent = e.target.value;
    });

    el('slider-trail').addEventListener('change', (e) => {
        appState.trailLength = parseInt(e.target.value, 10);
        el('val-trail').textContent = appState.trailLength;
        rebuildTrajectories();
    });
    el('slider-trail').addEventListener('input', (e) => {
        el('val-trail').textContent = e.target.value;
    });

    el('slider-spread').addEventListener('change', (e) => {
        appState.spread = parseFloat(e.target.value);
        el('val-spread').textContent = appState.spread.toFixed(2);
        rebuildTrajectories();
    });
    el('slider-spread').addEventListener('input', (e) => {
        el('val-spread').textContent = parseFloat(e.target.value).toFixed(2);
    });

    // Collapsible cards: chevron on each head, choice remembered
    const savedCards = JSON.parse(localStorage.getItem('ode-cards2') || '{}');
    document.querySelectorAll('.card').forEach((card) => {
        const head = card.querySelector('.card-head');
        const title = card.querySelector('h2');
        if (!head || !title) return;
        const key = title.textContent.trim();
        const toggle = document.createElement('button');
        toggle.className = 'card-toggle';
        toggle.setAttribute('aria-expanded', 'true');
        head.appendChild(toggle);
        const setCollapsed = (c) => {
            card.classList.toggle('collapsed', c);
            toggle.setAttribute('aria-expanded', String(!c));
            toggle.setAttribute('aria-label', (c ? 'Expand ' : 'Collapse ') + key);
            savedCards[key] = c;
            localStorage.setItem('ode-cards2', JSON.stringify(savedCards));
        };
        if (savedCards[key] !== undefined) setCollapsed(savedCards[key]);
        else if (key === 'Generator') setCollapsed(true);
        toggle.addEventListener('click', () => setCollapsed(!card.classList.contains('collapsed')));
        title.addEventListener('click', () => setCollapsed(!card.classList.contains('collapsed')));
    });

    // Timeline scrubber
    const tl = el('timeline-slider');
    tl.addEventListener('pointerdown', () => {
        if (appState.isRunning) toggleRunState();
        appState.scrubbing = true;
    });
    tl.addEventListener('input', (e) => {
        if (!appState.scrubbing) appState.scrubbing = true;
        scrubTo(Number(e.target.value));
        el('timeline-readout').textContent = 't = ' + appState.scrubTime.toFixed(3);
    });
    tl.addEventListener('change', () => {
        el('timeline-readout').textContent = 't = ' + appState.scrubTime.toFixed(3);
    });

    // Keyboard shortcuts — disabled while typing in a field
    window.addEventListener('keydown', (e) => {
        const tag = document.activeElement ? document.activeElement.tagName : '';
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

        if (e.code === 'Space') {
            e.preventDefault();
            toggleRunState();
        } else if (e.key === 'r' || e.key === 'R') {
            resetSimulation();
        } else if (e.key === 'c' || e.key === 'C') {
            setCameraView('ISO');
        }
    });
}
