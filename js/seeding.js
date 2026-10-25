/**
 * Initial ensemble placement strategies.
 * Orbit 0 is always the exact initial condition; the other strategies
 * spread the remaining orbits around it so the ensemble shows sensitivity
 * to initial conditions as the trajectories separate.
 */
import { appState } from './state.js';

export function seedParticlePosition(stateVec, particleIndex) {
    const dim = appState.states.length;
    const spread = appState.spread;
    const strategy = appState.seedStrategy;

    if (strategy === 'single' || particleIndex === 0) {
        for (let d = 0; d < dim; d++) {
            stateVec[d] = Number(appState.states[d].init) || 0;
        }
        return;
    }

    if (strategy === 'levelsets') {
        // Orbits distributed along a ring in (x₁, x₂, x₃) — samples the
        // invariant level sets of near-conservative systems.
        const total = Math.max(2, appState.particleCount);
        const frac = particleIndex / (total - 1);
        const angle = frac * Math.PI * 2;
        const scale = 0.30 + frac * spread * 1.25;

        for (let d = 0; d < dim; d++) {
            const base = Number(appState.states[d].init) || 0;
            if (d === 0) stateVec[d] = base * scale * Math.cos(angle * 0.5) + (base === 0 ? spread * Math.cos(angle) : 0);
            else if (d === 1) stateVec[d] = base * scale + spread * 0.55 * Math.sin(angle);
            else if (d === 2) stateVec[d] = base * scale + spread * 0.55 * Math.cos(angle);
            else stateVec[d] = base + spread * 0.25 * Math.sin(angle + d);
        }
        return;
    }

    // 'cloud': uniform perturbation within a δ-box around the seed.
    for (let d = 0; d < dim; d++) {
        const base = Number(appState.states[d].init) || 0;
        const offset = (Math.random() - 0.5) * 2 * spread;
        stateVec[d] = base + offset;
    }
}
