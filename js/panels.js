/**
 * 2D canvas panels: the camera orientation gizmo in the viewport corner
 * and the live state-amplitude bars in the telemetry strip.
 */
import { appState } from './state.js';
import { getParticles, getGizmoAxes } from './scene.js';

export function renderOrientationGizmo() {
    const canvas = document.getElementById('gizmo-canvas');
    const axes = getGizmoAxes();
    if (!canvas || !axes) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const len = 28;

    ctx.clearRect(0, 0, w, h);

    ctx.font = '600 10px "Fira Code", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    axes.forEach((ax) => {
        const ex = cx + ax.vec.x * len;
        const ey = cy - ax.vec.y * len;

        ctx.strokeStyle = ax.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(ex, ey);
        ctx.stroke();

        ctx.fillStyle = ax.color;
        ctx.fillText(ax.label, cx + ax.vec.x * (len + 8), cy - ax.vec.y * (len + 8));
    });

    ctx.fillStyle = '#edf2fb';
    ctx.fillRect(cx - 1.5, cy - 1.5, 3, 3);
}

export function renderNStateOscilloscope() {
    const canvas = document.getElementById('nstate-canvas');
    const particles = getParticles();
    if (!canvas || particles.length === 0) return;

    const rect = canvas.parentElement.getBoundingClientRect();
    if (canvas.width !== Math.floor(rect.width) || canvas.height !== Math.floor(rect.height)) {
        canvas.width = Math.max(200, Math.floor(rect.width));
        canvas.height = Math.max(40, Math.floor(rect.height));
    }

    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const midY = Math.floor(h * 0.56) + 0.5;

    // Graticule
    ctx.strokeStyle = '#182242';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, Math.floor(h * 0.3) + 0.5);
    ctx.lineTo(w, Math.floor(h * 0.3) + 0.5);
    ctx.moveTo(0, Math.floor(h * 0.82) + 0.5);
    ctx.lineTo(w, Math.floor(h * 0.82) + 0.5);
    ctx.stroke();

    ctx.strokeStyle = '#31406e';
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(w, midY);
    ctx.stroke();

    const leadState = particles[0].stateVec;
    const N = leadState.length;

    let maxAbs = 1.0;
    for (let i = 0; i < N; i++) {
        const a = Math.abs(leadState[i]);
        if (Number.isFinite(a) && a > maxAbs) maxAbs = a;
    }

    // Bars fill their slot; the roomy case (few variables) also shows the
    // numeric value above each bar so the strip carries real information.
    const padX = 14;
    const slotW = (w - padX * 2) / N;
    const barW = Math.max(6, Math.min(150, slotW * 0.55));
    const maxBar = midY - 26;

    ctx.textAlign = 'center';

    for (let i = 0; i < N; i++) {
        const val = leadState[i] || 0;
        const norm = Math.max(-1, Math.min(1, val / maxAbs));
        const barH = Math.abs(norm) * maxBar;
        const x = padX + i * slotW + (slotW - barW) * 0.5;
        const y = norm >= 0 ? midY - barH : midY;
        const cx = x + barW * 0.5;

        let color = '#9fb0cf';
        if (i === appState.stateIndices.x) color = '#ff6b6b';
        else if (i === appState.stateIndices.y) color = '#3fd68f';
        else if (i === appState.stateIndices.z) color = '#f5c542';

        ctx.fillStyle = color;
        ctx.fillRect(Math.floor(x), Math.floor(y), Math.ceil(barW), Math.max(2, Math.ceil(barH)));

        if (N <= 16) {
            ctx.font = '700 13px "Fira Code", monospace';
            ctx.fillStyle = color;
            ctx.fillText(val.toFixed(2), cx, 17);
        }
        if (N <= 24) {
            ctx.font = '500 10px "Fira Code", monospace';
            ctx.fillStyle = '#7387b0';
            const name = appState.states[i] ? appState.states[i].name : `x${i + 1}`;
            ctx.fillText(name.slice(0, 4), cx, h - 4);
        }
    }
}
