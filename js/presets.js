/**
 * Built-in dynamical systems. Equations and default parameters follow the
 * original publications where cited (Lorenz 1960: Tellus 12, 243–254;
 * Lorenz 1963: Journal of the Atmospheric Sciences 20, 130–141).
 */
import { buildCyclicStates } from './math.js';

export const PRESETS = {
    lorenz1960: {
        name: 'Lorenz 1960 (Tellus 12, 243–254)',
        isLorenz1960: true,
        // Tellus 12 (1960), eq. (15)–(17):
        //   dA/dt = −(1/k² − 1/(k²+l²))·kl·F·G
        //   dF/dt =  (1/l² − 1/(k²+l²))·kl·A·G
        //   dG/dt = −½(1/l² − 1/k²)·kl·A·F
        states: [
            { name: 'A', eq: '-(1 / k^2 - 1 / (k^2 + l^2)) * k * l * F * G', init: 1.20 },
            { name: 'F', eq: '(1 / l^2 - 1 / (k^2 + l^2)) * k * l * A * G', init: 0.80 },
            { name: 'G', eq: '-0.5 * (1 / l^2 - 1 / k^2) * k * l * A * F', init: 0.00 }
        ],
        params: [
            { name: 'k', val: 1.0, min: 0.2, max: 4.0, step: 0.05 },
            { name: 'l', val: 2.0, min: 0.2, max: 5.0, step: 0.05 }
        ],
        mapping: { x: 'A', y: 'F', z: 'G', color: '_speed' },
        dt: 0.015,
        stepsPerFrame: 4,
        spread: 1.15,
        seedStrategy: 'levelsets'
    },

    lorenz1963: {
        name: 'Lorenz 1963 strange attractor',
        states: [
            { name: 'x', eq: 'sigma * (y - x)', init: 0.1 },
            { name: 'y', eq: 'x * (rho - z) - y', init: 0.0 },
            { name: 'z', eq: 'x * y - beta * z', init: 0.0 }
        ],
        params: [
            { name: 'sigma', val: 10.0, min: 0, max: 30, step: 0.1 },
            { name: 'rho', val: 28.0, min: 0, max: 60, step: 0.1 },
            { name: 'beta', val: 2.6667, min: 0, max: 10, step: 0.01 }
        ],
        mapping: { x: 'x', y: 'y', z: 'z', color: 'z' },
        dt: 0.005,
        stepsPerFrame: 4,
        spread: 0.8,
        seedStrategy: 'cloud'
    },

    lorenz96_8: {
        name: 'Lorenz-96 coupled ring (N=8)',
        nGenConfig: {
            N: 8,
            formula: '(x[i+1] - x[i-2]) * x[i-1] - x[i] + F',
            initFormula: 'F + (i == 1 ? 0.08 : -0.02 * sin(i))'
        },
        states: buildCyclicStates(8, '(x[i+1] - x[i-2]) * x[i-1] - x[i] + F', 'F + (i == 1 ? 0.08 : -0.02 * sin(i))', { F: 8.0 }),
        params: [
            { name: 'F', val: 8.0, min: 0.0, max: 24.0, step: 0.1 }
        ],
        mapping: { x: 'x1', y: 'x2', z: 'x3', color: 'x4' },
        dt: 0.005,
        stepsPerFrame: 4,
        spread: 0.25,
        seedStrategy: 'cloud'
    },

    lorenz96_18: {
        name: 'Lorenz-96 high-dimensional chaos (N=18)',
        nGenConfig: {
            N: 18,
            formula: '(x[i+1] - x[i-2]) * x[i-1] - x[i] + F',
            initFormula: 'F + (i == 1 ? 0.1 : 0.02 * cos(i))'
        },
        states: buildCyclicStates(18, '(x[i+1] - x[i-2]) * x[i-1] - x[i] + F', 'F + (i == 1 ? 0.1 : 0.02 * cos(i))', { F: 8.0 }),
        params: [
            { name: 'F', val: 8.0, min: 0.0, max: 24.0, step: 0.1 }
        ],
        mapping: { x: 'x1', y: 'x2', z: 'x3', color: 'x4' },
        dt: 0.004,
        stepsPerFrame: 4,
        spread: 0.2,
        seedStrategy: 'cloud'
    },

    thomas_nd: {
        name: 'Thomas cyclic lattice (N=6)',
        nGenConfig: {
            N: 6,
            formula: 'sin(x[i+1]) - b * x[i]',
            initFormula: '0.5 * sin(i)'
        },
        states: buildCyclicStates(6, 'sin(x[i+1]) - b * x[i]', '0.5 * sin(i)', { b: 0.18 }),
        params: [
            { name: 'b', val: 0.18, min: 0.01, max: 0.6, step: 0.005 }
        ],
        mapping: { x: 'x1', y: 'x2', z: 'x3', color: 'x4' },
        dt: 0.025,
        stepsPerFrame: 4,
        spread: 0.35,
        seedStrategy: 'cloud'
    },

    lotka_nd: {
        name: 'Cyclic Lotka–Volterra (N=5)',
        nGenConfig: {
            N: 5,
            formula: 'x[i] * (r - a * x[i] + c * (x[i+1] - x[i-1]))',
            initFormula: '0.5 + 0.2 * sin(i)'
        },
        states: buildCyclicStates(5, 'x[i] * (r - a * x[i] + c * (x[i+1] - x[i-1]))', '0.5 + 0.2 * sin(i)', { r: 0.2, a: 0.2, c: 1.2 }),
        params: [
            { name: 'r', val: 0.2, min: 0.0, max: 2.0, step: 0.02 },
            { name: 'a', val: 0.2, min: 0.01, max: 2.0, step: 0.02 },
            { name: 'c', val: 1.2, min: 0.1, max: 3.0, step: 0.05 }
        ],
        mapping: { x: 'x1', y: 'x2', z: 'x3', color: 'x4' },
        dt: 0.015,
        stepsPerFrame: 4,
        spread: 0.15,
        seedStrategy: 'cloud'
    },

    kuramoto_nd: {
        name: 'Kuramoto coupled lattice (N=10)',
        nGenConfig: {
            N: 10,
            formula: 'omega + K * (sin(x[i+1] - x[i]) + sin(x[i-1] - x[i])) - 0.15 * x[i]',
            initFormula: 'cos(2 * pi * i / N)'
        },
        states: buildCyclicStates(10, 'omega + K * (sin(x[i+1] - x[i]) + sin(x[i-1] - x[i])) - 0.15 * x[i]', 'cos(2 * pi * i / N)', { omega: 0.4, K: 1.8 }),
        params: [
            { name: 'omega', val: 0.4, min: -2.0, max: 2.0, step: 0.05 },
            { name: 'K', val: 1.8, min: 0.0, max: 5.0, step: 0.05 }
        ],
        mapping: { x: 'x1', y: 'x2', z: 'x3', color: 'x4' },
        dt: 0.015,
        stepsPerFrame: 4,
        spread: 0.3,
        seedStrategy: 'cloud'
    },

    hyper_rossler: {
        name: 'Rössler hyperchaos (4 variables)',
        states: [
            { name: 'x', eq: '-y - z', init: -10.0 },
            { name: 'y', eq: 'x + a * y + w', init: -6.0 },
            { name: 'z', eq: 'b + x * z', init: 0.0 },
            { name: 'w', eq: '-c * z + d * w', init: 10.0 }
        ],
        params: [
            { name: 'a', val: 0.25, min: 0.05, max: 0.6, step: 0.01 },
            { name: 'b', val: 3.0, min: 0.5, max: 6.0, step: 0.1 },
            { name: 'c', val: 0.5, min: 0.1, max: 2.0, step: 0.02 },
            { name: 'd', val: 0.05, min: 0.0, max: 0.3, step: 0.005 }
        ],
        mapping: { x: 'x', y: 'y', z: 'z', color: 'w' },
        dt: 0.008,
        stepsPerFrame: 4,
        spread: 0.5,
        seedStrategy: 'cloud'
    },

    hyper_lorenz: {
        name: 'Lorenz–Stenflo hyperchaos (4 variables)',
        states: [
            { name: 'x', eq: 'a * (y - x) + s * w', init: 1.0 },
            { name: 'y', eq: 'c * x - x * z - y', init: 0.5 },
            { name: 'z', eq: 'x * y - b * z', init: 1.0 },
            { name: 'w', eq: '-x - a * w', init: 0.5 }
        ],
        params: [
            { name: 'a', val: 1.0, min: 0.1, max: 10, step: 0.05 },
            { name: 'b', val: 0.7, min: 0.1, max: 5, step: 0.05 },
            { name: 'c', val: 26.0, min: 1, max: 50, step: 0.2 },
            { name: 's', val: 1.5, min: 0.1, max: 10, step: 0.05 }
        ],
        mapping: { x: 'x', y: 'y', z: 'z', color: 'w' },
        dt: 0.008,
        stepsPerFrame: 4,
        spread: 0.6,
        seedStrategy: 'cloud'
    },

    rossler: {
        name: 'Rössler attractor (3 variables)',
        states: [
            { name: 'x', eq: '-y - z', init: 0.1 },
            { name: 'y', eq: 'x + a * y', init: 0.1 },
            { name: 'z', eq: 'b + z * (x - c)', init: 0.1 }
        ],
        params: [
            { name: 'a', val: 0.2, min: 0.0, max: 0.5, step: 0.005 },
            { name: 'b', val: 0.2, min: 0.0, max: 2.0, step: 0.01 },
            { name: 'c', val: 5.7, min: 1.0, max: 18.0, step: 0.1 }
        ],
        mapping: { x: 'x', y: 'y', z: 'z', color: 'z' },
        dt: 0.015,
        stepsPerFrame: 4,
        spread: 0.5,
        seedStrategy: 'cloud'
    },

    chen: {
        name: 'Chen attractor (3 variables)',
        states: [
            { name: 'x', eq: 'a * (y - x)', init: -0.1 },
            { name: 'y', eq: '(c - a) * x - x * z + c * y', init: 0.5 },
            { name: 'z', eq: 'x * y - b * z', init: -0.6 }
        ],
        params: [
            { name: 'a', val: 35.0, min: 20, max: 50, step: 0.2 },
            { name: 'b', val: 3.0, min: 0.5, max: 10, step: 0.1 },
            { name: 'c', val: 28.0, min: 15, max: 40, step: 0.2 }
        ],
        mapping: { x: 'x', y: 'y', z: 'z', color: '_speed' },
        dt: 0.002,
        stepsPerFrame: 5,
        spread: 0.6,
        seedStrategy: 'cloud'
    },

    thomas: {
        name: 'Thomas cyclic attractor (3 variables)',
        states: [
            { name: 'x', eq: 'sin(y) - b * x', init: 0.1 },
            { name: 'y', eq: 'sin(z) - b * y', init: 0.0 },
            { name: 'z', eq: 'sin(x) - b * z', init: 0.0 }
        ],
        params: [
            { name: 'b', val: 0.19, min: 0.01, max: 0.5, step: 0.005 }
        ],
        mapping: { x: 'x', y: 'y', z: 'z', color: '_speed' },
        dt: 0.03,
        stepsPerFrame: 5,
        spread: 0.4,
        seedStrategy: 'cloud'
    },

    halvorsen: {
        name: 'Halvorsen attractor (3 variables)',
        states: [
            { name: 'x', eq: '-a * x - 4 * y - 4 * z - y^2', init: -1.48 },
            { name: 'y', eq: '-a * y - 4 * z - 4 * x - z^2', init: -1.51 },
            { name: 'z', eq: '-a * z - 4 * x - 4 * y - x^2', init: 2.04 }
        ],
        params: [
            { name: 'a', val: 1.4, min: 1.0, max: 2.5, step: 0.01 }
        ],
        mapping: { x: 'x', y: 'y', z: 'z', color: '_speed' },
        dt: 0.004,
        stepsPerFrame: 4,
        spread: 0.3,
        seedStrategy: 'cloud'
    },

    aizawa: {
        name: 'Aizawa attractor (3 variables)',
        states: [
            { name: 'x', eq: '(z - b) * x - d * y', init: 0.1 },
            { name: 'y', eq: 'd * x + (z - b) * y', init: 0.0 },
            { name: 'z', eq: 'c + a * z - (z^3)/3 - (x^2 + y^2) * (1 + e * z) + f * z * (x^3)', init: 0.0 }
        ],
        params: [
            { name: 'a', val: 0.95, min: 0.1, max: 2.0, step: 0.01 },
            { name: 'b', val: 0.7, min: 0.1, max: 2.0, step: 0.01 },
            { name: 'c', val: 0.6, min: 0.1, max: 2.0, step: 0.01 },
            { name: 'd', val: 3.5, min: 0.5, max: 6.0, step: 0.05 },
            { name: 'e', val: 0.25, min: 0.0, max: 1.0, step: 0.01 },
            { name: 'f', val: 0.1, min: 0.0, max: 1.0, step: 0.01 }
        ],
        mapping: { x: 'x', y: 'y', z: 'z', color: 'z' },
        dt: 0.01,
        stepsPerFrame: 4,
        spread: 0.15,
        seedStrategy: 'cloud'
    },

    rabinovich: {
        name: 'Rabinovich–Fabrikant (3 variables)',
        states: [
            { name: 'x', eq: 'y * (z - 1 + x^2) + gamma * x', init: -1.0 },
            { name: 'y', eq: 'x * (3 * z + 1 - x^2) + gamma * y', init: 0.0 },
            { name: 'z', eq: '-2 * z * (alpha + x * y)', init: 0.5 }
        ],
        params: [
            { name: 'alpha', val: 0.14, min: 0.05, max: 1.5, step: 0.01 },
            { name: 'gamma', val: 0.10, min: 0.01, max: 1.0, step: 0.01 }
        ],
        mapping: { x: 'x', y: 'y', z: 'z', color: 'z' },
        dt: 0.005,
        stepsPerFrame: 5,
        spread: 0.05,
        seedStrategy: 'cloud'
    }
};
