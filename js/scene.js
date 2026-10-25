/**
 * Three.js viewport: cameras, reference cage, ensemble trail rendering,
 * the color palettes, and the hover probe. Coordinates map the dynamical
 * axes onto Three.js as X₁→X, X₂→Z, X₃→Y (Y is up).
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { appState } from './state.js';
import { rk4Step } from './solver.js';
import { seedParticlePosition } from './seeding.js';

let scene, perspCamera, orthoCamera, activeCamera, renderer, controls;
let axesGroup, trailsGroup, headsMesh;
let particles = [];
const raycaster = new THREE.Raycaster();
const mouseNDC = new THREE.Vector2();

export function getParticles() {
    return particles;
}

export function initScene() {
    const container = document.getElementById('canvas-container');
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    const aspect = w / h;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060a14);

    perspCamera = new THREE.PerspectiveCamera(50, aspect, 0.05, 3000);
    perspCamera.position.set(40, 30, 45);

    const frustumSize = 40;
    orthoCamera = new THREE.OrthographicCamera(
        -frustumSize * aspect / 2,
        frustumSize * aspect / 2,
        frustumSize / 2,
        -frustumSize / 2,
        -2000,
        2000
    );
    orthoCamera.position.copy(perspCamera.position);

    activeCamera = perspCamera;

    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    controls = makeControls();

    axesGroup = new THREE.Group();
    scene.add(axesGroup);

    trailsGroup = new THREE.Group();
    scene.add(trailsGroup);

    window.addEventListener('resize', resizeViewport);
    renderer.domElement.addEventListener('mousemove', onViewportMouseMove);
    renderer.domElement.addEventListener('mouseleave', () => {
        document.getElementById('probe-readout').classList.add('hidden');
    });
}

function makeControls() {
    const c = new OrbitControls(activeCamera, renderer.domElement);
    c.enableDamping = true;
    c.dampingFactor = 0.08;
    c.rotateSpeed = 0.85;
    c.zoomSpeed = 1.1;
    c.autoRotate = appState.autoRotate;
    return c;
}

/** Rebuild the reference cage (grid floor, bounding box, colored axis lines) at a new half-extent. */
export function buildReferenceCage(halfExtent = 10) {
    while (axesGroup.children.length > 0) {
        const child = axesGroup.children[0];
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
        axesGroup.remove(child);
    }

    const ext = Math.max(1.5, halfExtent);
    const divisions = 16;
    const gridHelper = new THREE.GridHelper(ext * 2, divisions, 0x273052, 0x141b30);
    gridHelper.position.y = -ext;
    axesGroup.add(gridHelper);

    const boxGeo = new THREE.BoxGeometry(ext * 2, ext * 2, ext * 2);
    const edgesGeo = new THREE.EdgesGeometry(boxGeo);
    const edgesMat = new THREE.LineBasicMaterial({ color: 0x223054 });
    axesGroup.add(new THREE.LineSegments(edgesGeo, edgesMat));
    boxGeo.dispose();

    const makeAxis = (p1, p2, hex) => {
        const g = new THREE.BufferGeometry().setFromPoints([p1, p2]);
        const m = new THREE.LineBasicMaterial({ color: hex, transparent: true, opacity: 0.65 });
        return new THREE.Line(g, m);
    };
    axesGroup.add(makeAxis(new THREE.Vector3(-ext, 0, 0), new THREE.Vector3(ext, 0, 0), 0xff6b6b));
    axesGroup.add(makeAxis(new THREE.Vector3(0, 0, -ext), new THREE.Vector3(0, 0, ext), 0x3fd68f));
    axesGroup.add(makeAxis(new THREE.Vector3(0, -ext, 0), new THREE.Vector3(0, ext, 0), 0xf5c542));
}

/**
 * Map a normalized value t∈[0,1] to an RGB triple in the selected palette.
 * Thermal runs charcoal → signal orange → gold → alabaster; oscilloscope
 * is a phosphor green → amber ramp; bipolar spans steel blue → red.
 */
export function sampleTechnicalPalette(t, paletteName, outRGB) {
    const u = Math.max(0, Math.min(1, t));
    if (paletteName === 'thermal') {
        if (u < 0.5) {
            const s = u * 2;
            outRGB[0] = 0.20 + s * 0.80;
            outRGB[1] = 0.08 + s * 0.23;
            outRGB[2] = 0.02;
        } else {
            const s = (u - 0.5) * 2;
            outRGB[0] = 1.00;
            outRGB[1] = 0.31 + s * 0.62;
            outRGB[2] = 0.02 + s * 0.70;
        }
    } else if (paletteName === 'oscilloscope') {
        outRGB[0] = 0.06 + u * 0.85;
        outRGB[1] = 0.35 + u * 0.60;
        outRGB[2] = 0.20 * (1 - u);
    } else if (paletteName === 'monochrome') {
        const v = 0.22 + u * 0.75;
        outRGB[0] = v;
        outRGB[1] = v;
        outRGB[2] = v * 0.96;
    } else {
        if (u < 0.5) {
            const s = u * 2;
            outRGB[0] = 0.20 + s * 0.72;
            outRGB[1] = 0.48 + s * 0.44;
            outRGB[2] = 0.88 + s * 0.04;
        } else {
            const s = (u - 0.5) * 2;
            outRGB[0] = 0.92 + s * 0.08;
            outRGB[1] = 0.92 - s * 0.68;
            outRGB[2] = 0.92 - s * 0.82;
        }
    }
}

/** (Re)create ensemble trajectories: one Float64 state vector and one trail buffer per orbit. */
export function rebuildTrajectories() {
    while (trailsGroup.children.length > 0) {
        const obj = trailsGroup.children[0];
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
        trailsGroup.remove(obj);
    }
    particles = [];
    appState.simTime = 0.0;

    const count = appState.seedStrategy === 'single' ? 1 : appState.particleCount;
    const trailLen = appState.trailLength;
    const dim = appState.states.length;

    const footerModeEl = document.getElementById('footer-ensemble-label');
    if (footerModeEl) {
        const label = appState.seedStrategy === 'single' ? 'Single'
            : appState.seedStrategy === 'levelsets' ? 'Ring' : 'Cloud';
        footerModeEl.textContent = `${label} (${count})`;
    }

    const lineMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.92
    });

    const headGeo = new THREE.BoxGeometry(0.25, 0.25, 0.25);
    const headMat = new THREE.MeshBasicMaterial({ color: 0xff4f00 });
    headsMesh = new THREE.InstancedMesh(headGeo, headMat, count);
    trailsGroup.add(headsMesh);

    const ix = appState.stateIndices.x;
    const iy = appState.stateIndices.y;
    const iz = appState.stateIndices.z;

    for (let i = 0; i < count; i++) {
        const stateVec = new Float64Array(dim);
        seedParticlePosition(stateVec, i);

        const positions = new Float32Array(trailLen * 3);
        const colors = new Float32Array(trailLen * 3);
        const rawHistory = new Float32Array(trailLen);

        const initX = stateVec[ix] || 0;
        const initY = stateVec[iy] || 0;
        const initZ = stateVec[iz] || 0;

        for (let j = 0; j < trailLen; j++) {
            positions[j * 3] = initX;
            positions[j * 3 + 1] = initZ;
            positions[j * 3 + 2] = initY;
            colors[j * 3] = 0.9;
            colors[j * 3 + 1] = 0.3;
            colors[j * 3 + 2] = 0.0;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const line = new THREE.Line(geometry, lineMaterial);
        line.userData = { orbitIndex: i };
        line.frustumCulled = false;
        trailsGroup.add(line);

        particles.push({
            stateVec,
            positions,
            colors,
            rawHistory,
            geometry,
            lastSpeed: 0
        });
    }

    // Pre-warm so the attractor shape is visible immediately on load.
    stepSimulation(70);
}

const dummyMatrix = new THREE.Matrix4();
const rgbScratch = [0, 0, 0];

/** Advance every orbit `steps` RK4 steps and refresh trail geometry + colors. */
export function stepSimulation(overrideSteps = null) {
    if (!appState.compiledDerivative || particles.length === 0) return;

    const steps = overrideSteps !== null ? overrideSteps : appState.stepsPerFrame;
    const dt = appState.dt;
    const dim = appState.states.length;
    const trailLen = appState.trailLength;

    appState.simTime += steps * dt;

    const ix = appState.stateIndices.x;
    const iy = appState.stateIndices.y;
    const iz = appState.stateIndices.z;
    const ic = appState.stateIndices.color;

    let minC = Infinity;
    let maxC = -Infinity;

    for (let pIdx = 0; pIdx < particles.length; pIdx++) {
        const p = particles[pIdx];
        const posArr = p.positions;
        const cHist = p.rawHistory;

        for (let s = 0; s < steps; s++) {
            const speed = rk4Step(p.stateVec, dt, dim);
            p.lastSpeed = speed;

            let diverged = false;
            for (let d = 0; d < dim; d++) {
                if (!Number.isFinite(p.stateVec[d]) || Math.abs(p.stateVec[d]) > 1e5) {
                    diverged = true;
                    break;
                }
            }
            if (diverged) {
                seedParticlePosition(p.stateVec, pIdx);
            }

            posArr.copyWithin(0, 3);
            cHist.copyWithin(0, 1);

            const headOffset = (trailLen - 1) * 3;
            posArr[headOffset] = p.stateVec[ix];
            posArr[headOffset + 1] = p.stateVec[iz];
            posArr[headOffset + 2] = p.stateVec[iy];

            const cVal = ic === -1 ? speed : p.stateVec[ic];
            cHist[trailLen - 1] = cVal;
        }

        for (let j = 0; j < trailLen; j += 12) {
            const v = cHist[j];
            if (v < minC) minC = v;
            if (v > maxC) maxC = v;
        }
    }

    if (Number.isFinite(minC) && Number.isFinite(maxC)) {
        appState.colorBounds.min += (minC - appState.colorBounds.min) * 0.15;
        appState.colorBounds.max += (maxC - appState.colorBounds.max) * 0.15;
    }
    const cSpan = Math.max(1e-5, appState.colorBounds.max - appState.colorBounds.min);
    const cMin = appState.colorBounds.min;

    for (let pIdx = 0; pIdx < particles.length; pIdx++) {
        const p = particles[pIdx];
        const posArr = p.positions;
        const colArr = p.colors;
        const cHist = p.rawHistory;

        for (let j = 0; j < trailLen; j++) {
            const normC = (cHist[j] - cMin) / cSpan;
            const ageFade = 0.12 + 0.88 * Math.pow(j / (trailLen - 1), 1.35);
            sampleTechnicalPalette(normC, appState.palette, rgbScratch);

            const idx3 = j * 3;
            colArr[idx3] = rgbScratch[0] * ageFade;
            colArr[idx3 + 1] = rgbScratch[1] * ageFade;
            colArr[idx3 + 2] = rgbScratch[2] * ageFade;
        }

        p.geometry.attributes.position.needsUpdate = true;
        p.geometry.attributes.color.needsUpdate = true;

        const lastIdx = (trailLen - 1) * 3;
        dummyMatrix.makeTranslation(posArr[lastIdx], posArr[lastIdx + 1], posArr[lastIdx + 2]);
        headsMesh.setMatrixAt(pIdx, dummyMatrix);
    }

    headsMesh.instanceMatrix.needsUpdate = true;
}

function computeAttractorBoundingBox() {
    const box = new THREE.Box3();
    const v = new THREE.Vector3();
    const trailLen = appState.trailLength;

    for (let i = 0; i < particles.length; i++) {
        const pos = particles[i].positions;
        for (let j = Math.floor(trailLen * 0.15); j < trailLen; j += 8) {
            v.set(pos[j * 3], pos[j * 3 + 1], pos[j * 3 + 2]);
            if (Number.isFinite(v.x) && Number.isFinite(v.y) && Number.isFinite(v.z)) {
                box.expandByPoint(v);
            }
        }
    }
    return box;
}

/** Place the camera on a named preset (ISO / XY / XZ / YZ) fitted to the attractor. */
export function setCameraView(presetMode) {
    const box = computeAttractorBoundingBox();
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    if (!box.isEmpty()) {
        box.getCenter(center);
        box.getSize(size);
    }

    const maxDim = Math.max(size.x, size.y, size.z, 2.0);
    appState.lastAttractorSpan = maxDim;
    const dist = maxDim * 1.65;

    controls.target.copy(center);

    if (presetMode === 'XY') {
        activeCamera.position.set(center.x, center.y + dist * 1.3, center.z + 0.001);
    } else if (presetMode === 'XZ') {
        activeCamera.position.set(center.x, center.y, center.z + dist * 1.3);
    } else if (presetMode === 'YZ') {
        activeCamera.position.set(center.x + dist * 1.3, center.y, center.z);
    } else {
        activeCamera.position.set(center.x + dist * 0.85, center.y + dist * 0.65, center.z + dist * 0.90);
    }

    syncOrthographicFrustum(maxDim * 1.5);
    controls.update();

    buildReferenceCage(maxDim * 0.65);

    if (headsMesh) {
        const headSize = Math.max(0.025, maxDim * 0.015);
        headsMesh.geometry.dispose();
        headsMesh.geometry = new THREE.BoxGeometry(headSize, headSize, headSize);
    }
}

function syncOrthographicFrustum(span) {
    const container = document.getElementById('canvas-container');
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    const aspect = w / h;
    const f = Math.max(2.0, span || appState.lastAttractorSpan * 1.5);

    orthoCamera.left = -f * aspect / 2;
    orthoCamera.right = f * aspect / 2;
    orthoCamera.top = f / 2;
    orthoCamera.bottom = -f / 2;
    orthoCamera.updateProjectionMatrix();
}

/** Swap perspective ↔ orthographic. Controls are rebuilt: OrbitControls binds one camera. */
export function toggleCameraProjection() {
    appState.isOrtho = !appState.isOrtho;
    const prevCam = activeCamera;
    activeCamera = appState.isOrtho ? orthoCamera : perspCamera;

    activeCamera.position.copy(prevCam.position);
    activeCamera.quaternion.copy(prevCam.quaternion);

    const target = controls.target.clone();
    controls.dispose();
    controls = makeControls();
    controls.target.copy(target);

    syncOrthographicFrustum(appState.lastAttractorSpan * 1.5);
    controls.update();

    const btn = document.getElementById('proj-toggle-btn');
    btn.textContent = appState.isOrtho ? 'Ortho' : 'Persp';
    btn.classList.toggle('active', appState.isOrtho);
}

export function setAutoRotate(on) {
    appState.autoRotate = on;
    controls.autoRotate = on;
}

export function setAxesVisible(on) {
    appState.showAxes = on;
    axesGroup.visible = on;
}

function onViewportMouseMove(e) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouseNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.params.Line.threshold = Math.max(0.05, appState.lastAttractorSpan * 0.025);
    raycaster.setFromCamera(mouseNDC, activeCamera);

    const lineObjects = trailsGroup.children.filter((c) => c.isLine);
    const intersects = raycaster.intersectObjects(lineObjects, false);
    const probeEl = document.getElementById('probe-readout');

    if (intersects.length > 0) {
        const hit = intersects[0];
        const orbitIdx = hit.object.userData.orbitIndex ?? 0;
        const pt = hit.point;
        // Convert Three.js (X, Y_up, Z) back to dynamical (X₁, X₂, X₃)
        probeEl.classList.remove('hidden');
        document.getElementById('probe-orbit-id').textContent = orbitIdx + 1;
        document.getElementById('probe-coords').textContent =
            `(${appState.mapping.x}: ${pt.x.toFixed(3)}, ${appState.mapping.y}: ${pt.z.toFixed(3)}, ${appState.mapping.z}: ${pt.y.toFixed(3)})`;
    } else {
        probeEl.classList.add('hidden');
    }
}

export function resizeViewport() {
    const container = document.getElementById('canvas-container');
    if (!container) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w === 0 || h === 0) return;

    perspCamera.aspect = w / h;
    perspCamera.updateProjectionMatrix();
    syncOrthographicFrustum();
    renderer.setSize(w, h);
}

/**
 * Dynamical axis directions as seen by the active camera, depth-sorted
 * for the painter's-algorithm gizmo. Returns null before scene init.
 */
export function getGizmoAxes() {
    if (!activeCamera) return null;
    const invQuat = activeCamera.quaternion.clone().invert();
    return [
        { label: appState.mapping.x.slice(0, 2), vec: new THREE.Vector3(1, 0, 0).applyQuaternion(invQuat), color: '#ef4444' },
        { label: appState.mapping.y.slice(0, 2), vec: new THREE.Vector3(0, 0, 1).applyQuaternion(invQuat), color: '#10b981' },
        { label: appState.mapping.z.slice(0, 2), vec: new THREE.Vector3(0, 1, 0).applyQuaternion(invQuat), color: '#eab308' }
    ].sort((a, b) => a.vec.z - b.vec.z);
}

export function renderScene() {
    renderer.render(scene, activeCamera);
}

export function updateControls() {
    controls.update();
}
