---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: []
---

# Surface brief — index.html (the whole instrument)

Scope: single Operate surface (a full-viewport tool). Visitor mode: Operate — the visitor runs, edits, and observes simulations; expression outranks expression-of-self.

Audience & job: chaos-curious students/enthusiasts; pick a system, integrate, scrub constants, read the attractor. Action: keep the sim running and touch everything without breaking it. Constraints: desktop-first, WebGL required, client-side only, no build step.

Direction: refinement of the incumbent carbon instrument world (user-confirmed). Inherited: near-black carbon scale (#080807–#32322e), signal orange #ff4f00 single accent, alabaster text, JetBrains Mono for data/notation, Inter for UI prose, zero border radius, 1px #222 borders, dense instrument layout (bar / workbench / viewport / telemetry strip). Memorable moment: dragging a constant and watching the attractor deform in real time.

Direction contract:

THESIS: a bench instrument for dynamical systems — the simulation is the interface, and the chrome behaves like lab hardware, refusing the generic dashboard arrangement of cards-in-a-grid.

OWN-WORLD: carbon-black flat panels with 1px graphite seams, signal-orange as the only accent (active states, values, focus), mono numerals everywhere data lives, zero radius, no shadows, no gradients.

STORY: the visitor sees a running attractor immediately, learns in seconds that equations and constants are editable text, scrubs a slider and watches the orbit respond, and trusts the numbers because errors speak plainly and invariants drift honestly.

FIRST VIEWPORT: full-viewport app at 100vh: 44px instrument bar on top (brand dot, system selector, Run/Step/Reset left; view presets and display toggles right), 430px workbench panel on the left showing the Equations tab with the live system's derivative expressions in mono, the rest of the width given to the black WebGL viewport with the attractor already running and a small telemetry HUD top-left, 96px telemetry strip along the bottom with live state-amplitude bars. Primary action: the orange RUN state and the sliders under the cursor's natural path.

FORM: refinement path — incumbent implementation as authority; no concept roll (established world, user-confirmed refine-in-place; no seed key).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

Unresolved: whether user-defined systems persist (URL/localStorage) — open, do not invent.
