# Phase Space

An interactive explorer for the phase space of nonlinear dynamical systems.
Pick a system — or write your own equations — and watch an ensemble of
trajectories integrate in real time as glowing 3D trails. Scrub a constant
and the attractor deforms under your cursor.

Everything runs client-side: plain HTML, CSS, and JavaScript with
[Three.js](https://threejs.org/) for rendering. No build step, no backend.

## Running it

Serve the folder with any static file server (ES modules won't load from
`file://`):

```bash
npx serve .
# or: python -m http.server
```

Then open the printed URL. The Lorenz 1960 system starts integrating immediately.

## What you can do

- **Choose a system** — 16 presets, from Lorenz 1960/1963 through Lorenz-96
  rings, coupled Kuramoto oscillators, and hyperchaotic 4D attractors. Each
  carries its original attribution.
- **Edit the physics live** — every state variable, derivative expression,
  and initial value is a text field. Expressions compile on keystroke and the
  simulation restarts from the new system. A fixed grammar provides `sin`,
  `cos`, `exp`, `log`, `sqrt`, `tanh`, `atan2`, `^`, `pi`, and friends.
- **Generate N-state rings** — write one indexed rule such as
  `(x[i+1] - x[i-2]) * x[i-1] - x[i] + F` and expand it across any N from 3
  to 40 with periodic boundary wrapping (this is the Lorenz-96 construction).
- **Scrub constants** — sliders, stepper buttons, and drag-to-scrub name
  chips all change the system while it runs.
- **Control the view** — perspective/orthographic projection, axis-aligned
  plane views, fit-to-attractor, turntable orbit, and a reference cage that
  rescales to the attractor's bounding box.
- **Read the numbers** — a HUD shows simulation time, the lead trajectory's
  coordinates, and |dS/dt|. For Lorenz 1960 the two conserved quantities
  (kinetic energy and enstrophy) are tracked with their drift, so you can
  watch the RK4 integrator earn its error bars.

## Keyboard

| Key | Action |
|-----|--------|
| `Space` | Run / halt integration |
| `R` | Reset initial conditions |
| `C` | Fit view to attractor |
| `1`–`4` | Switch workbench tab |

## Project layout

```
index.html          markup and import map (pins the Three.js version)
css/styles.css      the whole visual system as design tokens + components
js/main.js          entry point and frame loop
js/state.js         central mutable application state
js/math.js          expression grammar and indexed (ring) expansion
js/presets.js       the 16 built-in systems
js/solver.js        ODE compilation and the RK4 stepper
js/seeding.js       ensemble placement strategies
js/scene.js         Three.js scene, trails, cameras, hover probe
js/panels.js        2D canvases: orientation gizmo, amplitude scope
js/workbench.js     DOM panels, events, HUD
```

## Adding a preset

Add an entry to `PRESETS` in `js/presets.js`:

```js
mySystem: {
    name: 'My system (3D)',
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
},
```

then an `<option>` in the system selector in `index.html`. Equations may use
any state or constant name plus the functions listed in the in-app grammar
reference.

## Deployment

The site is static and deploys anywhere — it currently runs on Vercel, which
auto-deploys every push to the connected repository.

## Credits

Built as a refinement of an earlier single-file prototype. The Lorenz 1960
implementation follows E. N. Lorenz, *"Maximum simplification of the dynamic
equations"*, Tellus **12**, 243–254 (1960); the classic attractor follows
*"Deterministic nonperiodic flow"*, Journal of the Atmospheric Sciences
**20**, 130–141 (1963).

## License

[MIT](LICENSE)
