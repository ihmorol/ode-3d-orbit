<p align="center">
  <img src="docs/icon.svg" width="84" alt="ODE 3D Orbit logo">
</p>

<h1 align="center">ODE 3D Orbit</h1>

<p align="center">
  <a href="https://phase-space-explorer.vercel.app"><img src="https://img.shields.io/badge/live-ode--3d--orbit.vercel.app-ff4f00" alt="Live demo"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT"></a>
  <img src="https://img.shields.io/badge/three.js-0.186-0b1120?logo=three.js" alt="Three.js 0.186">
  <img src="https://img.shields.io/badge/build%20step-none-31406e" alt="No build step">
</p>

> Pick a system of equations, or write your own, and watch it move in 3D. Drag a constant and the shape follows while it runs.

![ODE 3D Orbit running the Lorenz 1960 system](docs/screenshot.png)

ODE 3D Orbit is a small tool for playing with systems of differential equations. Type the equations, press run, and every solution gets drawn as a colored trail in 3D. It all runs in your browser. Nothing to install, and your equations never leave it.

## Who it is for

- Students who want to see chaos instead of reading about it. Two orbits that start almost the same fall apart right in front of you.
- Teachers who need a live demo for class. Every constant is a slider, so "what happens if I turn this up?" gets answered on the spot.
- Anyone with equations to check. Type them in, spin the view around, hover an orbit to read its values.
- And if you just want to press buttons: it starts running the moment it loads, and you can't break anything. Reset is right there.

## What it does

- 16 systems ready to go: Lorenz 1960 and 1963, Lorenz-96 rings, Thomas, Lotka-Volterra, Kuramoto, Rössler, Chen, Halvorsen, Aizawa, Rabinovich-Fabrikant, and two 4-variable hyperchaotic ones. Each one says where it came from.
- Change anything while it runs: the equations, the starting values, the constants.
- The generator takes one rule for a variable `i` and copies it around a ring of up to 40 variables, with the ends wrapping around. That's how the Lorenz-96 systems are built.
- Every constant has a slider, step buttons, and a name chip you can drag to scrub. Watch the attractor change shape as you drag.
- For Lorenz 1960 it shows the two quantities that should stay constant, and how much they drift. Big drift means a bad time step.
- Camera: perspective and orthographic, plane views, a fit button, turntable spin, and a box that rescales to your system.
- 4 color palettes. The color can follow any variable, or the speed.
- Shortcuts for run, pause, reset, and fit, so you don't need the mouse.

## How it works

1. You type a system: N variables, one equation each (like `x * (rho - z) - y`), plus constants. You can use sin, cos, exp, log, sqrt, tanh, atan2, `^`, pi, and a few more.
2. The equations get compiled into one solver function and tested once. If something is wrong you get a message in plain words.
3. Every frame, each orbit moves one RK4 step (4th order Runge-Kutta). You control the step size and how many steps per frame.
4. Three.js draws the trails. Older parts of a trail fade out. Hover an orbit to read its exact values.
5. For systems with conserved quantities (Lorenz 1960 has two), the app shows them and their drift, so you can see how good the numbers are.

> [!NOTE]
> Equations run through `new Function` in your own browser. That's what keeps the app a static site with no backend. Type equations you actually want to run.

## Run it

Open [ode-3d-orbit.vercel.app](https://ode-3d-orbit.vercel.app). It starts moving right away.

To run it locally, serve the folder with any static file server (the browser won't load the modules from a `file://` path):

```bash
npx serve .
# or: python -m http.server
```

> [!TIP]
> Keys: Space runs and pauses. R resets. C fits the view. Drag a constant's name to scrub it.

## Add your own system

Add an entry to `PRESETS` in `js/presets.js` and an `<option>` to the selector in `index.html`:

```js
mySystem: {
    name: 'My system (3 variables)',
    states: [
        { name: 'x', eq: 'a * (y - x)', init: 0.1 },
        { name: 'y', eq: 'x * (b - z) - y', init: 0.0 },
        { name: 'z', eq: 'x * y - c * z', init: 0.0 }
    ],
    params: [
        { name: 'a', val: 10.0, min: 0, max: 30, step: 0.1 },
        { name: 'b', val: 28.0, min: 0, max: 60, step: 0.1 },
        { name: 'c', val: 2.6667, min: 0, max: 10, step: 0.01 }
    ],
    mapping: { x: 'x', y: 'y', z: 'z', color: 'z' },
    dt: 0.005,
    stepsPerFrame: 4,
    spread: 0.8,
    seedStrategy: 'cloud'
}
```

Equations can use any variable or constant name, plus the functions listed in the app's Math you can use panel.

## Project layout

```
index.html          markup and import map (Three.js is vendored in js/vendor)
css/styles.css      the whole look: design tokens and components
js/main.js          entry point and frame loop
js/state.js         the app's shared state
js/math.js          the math parser and the ring rule expander
js/presets.js       the 16 built-in systems
js/solver.js        ODE compilation and the RK4 stepper
js/seeding.js       how the other orbits get placed at the start
js/scene.js         Three.js scene, trails, cameras, hover probe
js/panels.js        2D canvases: orientation gizmo, live variable scope
js/workbench.js     panels, buttons, and the on-screen readouts
```

## Deployment

The site is fully static and deploys anywhere. This repository is connected to Vercel, so every push to `main` deploys on its own.

## Credits

The Lorenz systems follow E. N. Lorenz, *"Maximum simplification of the dynamic equations"*, Tellus **12**, 243-254 (1960) and *"Deterministic nonperiodic flow"*, Journal of the Atmospheric Sciences **20**, 130-141 (1963). Rendering is [Three.js](https://threejs.org/). Type is [Fira Sans](https://fonts.google.com/specimen/Fira+Sans) and [Fira Code](https://fonts.google.com/specimen/Fira+Code).

Licensed under [MIT](LICENSE).
