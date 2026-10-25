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

    ctx.font = '600 10px "JetBrains Mono", monospace';
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

    ctx.fillStyle = '#ededec';
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

    const midY = Math.floor(h * 0.5) + 0.5;

    // Graticule
    ctx.strokeStyle = '#1a1a17';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, Math.floor(h * 0.25) + 0.5);
    ctx.lineTo(w, Math.floor(h * 0.25) + 0.5);
    ctx.moveTo(0, Math.floor(h * 0.75) + 0.5);
    ctx.lineTo(w, Math.floor(h * 0.75) + 0.5);
    ctx.stroke();

    ctx.strokeStyle = '#32322e';
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

    const padX = 12;
    const slotW = (w - padX * 2) / N;
    const barW = Math.max(4, Math.min(36, slotW * 0.62));

    ctx.font = '500 10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';

    for (let i = 0; i < N; i++) {
        const val = leadState[i] || 0;
        const norm = Math.max(-1, Math.min(1, val / maxAbs));
        const barH = Math.abs(norm) * (h * 0.40);
        const x = padX + i * slotW + (slotW - barW) * 0.5;
        const y = norm >= 0 ? midY - barH : midY;

        if (i === appState.stateIndices.x) ctx.fillStyle = '#ef4444';
        else if (i === appState.stateIndices.y) ctx.fillStyle = '#10b981';
        else if (i === appState.stateIndices.z) ctx.fillStyle = '#eab308';
        else ctx.fillStyle = '#8a8a85';

        ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(barW), Math.max(2, Math.ceil(barH)));

        if (N <= 24) {
            ctx.fillStyle = '#8a8a85';
            const name = appState.states[i] ? appState.states[i].name : `x${i + 1}`;
            ctx.fillText(name.slice(0, 4), x + barW * 0.5, h - 3);
        }
    }
}
