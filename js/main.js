/**
 * Entry point: boot the scene and workbench, load the default system,
 * and run the frame loop (integrate → HUD → 2D panels → render).
 */
import { appState } from './state.js';
import { initScene, stepSimulation, renderScene, updateControls } from './scene.js';
import { initWorkbench, loadPreset, updateHUD } from './workbench.js';
import { renderOrientationGizmo, renderNStateOscilloscope } from './panels.js';

let lastFrameTime = performance.now();
let frameCount = 0;

function animate() {
    requestAnimationFrame(animate);

    const now = performance.now();
    frameCount++;
    if (now - lastFrameTime >= 250) {
        const fps = Math.round((frameCount * 1000) / (now - lastFrameTime));
        document.getElementById('hud-fps').textContent = fps;
        frameCount = 0;
        lastFrameTime = now;
    }

    if (appState.isRunning) {
        stepSimulation();
    }

    updateHUD();
    renderNStateOscilloscope();
    renderOrientationGizmo();
    updateControls();
    renderScene();
}

initScene();
initWorkbench();
loadPreset('lorenz1960');
animate();
