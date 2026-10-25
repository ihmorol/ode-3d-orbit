/**
 * ODE compilation and RK4 integration. `compileSystem` turns the live
 * state/equation definitions into one vector derivative function and
 * validates it; `rk4Step` advances a single trajectory in place.
 */
import { appState } from './state.js';
import { MATH_ENV, preprocessMathExpression } from './math.js';

/**
 * Compile the current equations into appState.compiledDerivative.
 * Throws an Error with a visitor-readable message on invalid input.
 */
export function compileSystem() {
    const stateNames = appState.states.map((s) => s.name.trim());
    const paramNames = appState.params.map((p) => p.name.trim());

    const identifierRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
    for (const name of stateNames) {
        if (!identifierRegex.test(name)) {
            throw new Error(`"${name}" cannot be a variable name. Use letters, digits and underscores.`);
        }
    }
    for (const name of paramNames) {
        if (!identifierRegex.test(name)) {
            throw new Error(`"${name}" cannot be a constant name. Use letters, digits and underscores.`);
        }
    }

    const fnLines = [
        'const { sin, cos, tan, asin, acos, atan, atan2, sinh, cosh, tanh, exp, log, sqrt, cbrt, abs, min, max, pow, sign, floor, ceil, pi, PI, e, E } = math;'
    ];
    stateNames.forEach((name, idx) => {
        fnLines.push(`const ${name} = S[${idx}];`);
    });
    paramNames.forEach((name) => {
        fnLines.push(`const ${name} = P.${name};`);
    });
    appState.states.forEach((st, idx) => {
        fnLines.push(`out[${idx}] = ${preprocessMathExpression(st.eq || '0')};`);
    });

    let compiledFn;
    try {
        compiledFn = new Function('S', 'P', 'math', 'out', fnLines.join('\n'));
    } catch (err) {
        throw new Error(`Couldn't read the equations. Check for missing brackets, operators, or stray characters. (${err.message})`);
    }

    // Smoke-test at a benign point so a bad expression surfaces now,
    // not as NaN coordinates several seconds into the run.
    const testS = new Float64Array(appState.states.length).fill(0.5);
    const testOut = new Float64Array(appState.states.length);
    const testP = {};
    appState.params.forEach((p) => { testP[p.name] = p.val; });
    try {
        compiledFn(testS, testP, MATH_ENV, testOut);
    } catch (err) {
        throw new Error(`The equations crashed at the test point — check every function name and constant. (${err.message})`);
    }

    for (let i = 0; i < testOut.length; i++) {
        if (Number.isNaN(testOut[i])) {
            throw new Error(`d${appState.states[i].name}/dt gives no number at the test point. Check for division by zero or log of a negative value.`);
        }
    }

    appState.compiledDerivative = compiledFn;
    appState.paramValues = testP;
    updateStateIndexMap();
}

/** Recompute which state variable feeds each viewport axis and the color channel. */
export function updateStateIndexMap() {
    const names = appState.states.map((s) => s.name);
    appState.stateIndices.x = Math.max(0, names.indexOf(appState.mapping.x));
    appState.stateIndices.y = Math.max(0, names.indexOf(appState.mapping.y));
    appState.stateIndices.z = Math.max(0, names.indexOf(appState.mapping.z));
    appState.stateIndices.color = names.indexOf(appState.mapping.color);
}

let k1 = new Float64Array(40);
let k2 = new Float64Array(40);
let k3 = new Float64Array(40);
let k4 = new Float64Array(40);
let tempState = new Float64Array(40);

/**
 * One classical RK4 step. Returns |dS/dt| at the step start, used as the
 * default color channel.
 */
export function rk4Step(stateVec, dt, dim) {
    const deriv = appState.compiledDerivative;
    if (!deriv) return 0;

    if (k1.length < dim) {
        k1 = new Float64Array(dim);
        k2 = new Float64Array(dim);
        k3 = new Float64Array(dim);
        k4 = new Float64Array(dim);
        tempState = new Float64Array(dim);
    }

    const P = appState.paramValues;
    const halfDt = dt * 0.5;
    const sixthDt = dt / 6.0;

    deriv(stateVec, P, MATH_ENV, k1);
    for (let i = 0; i < dim; i++) tempState[i] = stateVec[i] + halfDt * k1[i];
    deriv(tempState, P, MATH_ENV, k2);

    for (let i = 0; i < dim; i++) tempState[i] = stateVec[i] + halfDt * k2[i];
    deriv(tempState, P, MATH_ENV, k3);

    for (let i = 0; i < dim; i++) tempState[i] = stateVec[i] + dt * k3[i];
    deriv(tempState, P, MATH_ENV, k4);

    let speedSq = 0;
    for (let i = 0; i < dim; i++) {
        stateVec[i] += sixthDt * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]);
        speedSq += k1[i] * k1[i];
    }
    return Math.sqrt(speedSq);
}

/** The Lorenz 1960 system is detected structurally: states named A, F, G. */
export function isLorenz1960Active() {
    return appState.states.length === 3 &&
        appState.states[0].name === 'A' &&
        appState.states[1].name === 'F' &&
        appState.states[2].name === 'G';
}

/**
 * Conserved quantities of the Lorenz 1960 system — Tellus 12 (1960),
 * eq. (18)–(19): E = ¼(A²/l² + F²/k² + 2G²/(k²+l²)) and
 * V = ¼(A² + F² + 2G²). Their drift over a run measures integrator error.
 */
export function computeLorenz1960Invariants(stateVec) {
    const A = stateVec[0] || 0;
    const F = stateVec[1] || 0;
    const G = stateVec[2] || 0;
    const k = appState.paramValues.k ?? 1.0;
    const l = appState.paramValues.l ?? 2.0;
    const k2 = k * k;
    const l2 = l * l;
    const E = 0.25 * (A * A / l2 + F * F / k2 + 2 * G * G / (k2 + l2));
    const V = 0.25 * (A * A + F * F + 2 * G * G);
    return { E, V };
}
