/**
 * Central application state. Mutated in place by the solver, scene,
 * and workbench modules; never persisted.
 */
export const appState = {
    currentPresetKey: 'lorenz1960',
    isRunning: true,
    isOrtho: false,
    autoRotate: false,
    showAxes: true,
    clearOnScrub: false,
    seedStrategy: 'levelsets',
    simTime: 0.0,
    initialInvariants: { E0: null, V0: null },

    // Live system definition (editable by the visitor)
    states: [],
    params: [],
    mapping: { x: 'A', y: 'F', z: 'G', color: '_speed' },

    palette: 'thermal',
    dt: 0.015,
    stepsPerFrame: 4,
    particleCount: 20,
    trailLength: 900,
    spread: 1.15,

    compiledDerivative: null,
    paramValues: {},
    stateIndices: { x: 0, y: 1, z: 2, color: -1 },
    colorBounds: { min: -10, max: 10 },
    lastAttractorSpan: 10.0,

    // Timeline scrubbing
    scrubbing: false,
    scrubIndex: 0,
    scrubTime: 0.0
};
