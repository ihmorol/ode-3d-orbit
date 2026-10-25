# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML/CSS/JS (explicitly requested by the user — no framework, no build step). Three.js loaded as an ES module via a pinned CDN import map. Deployed as a static site on Vercel.

## Users

*(Inferred from the artifact and the user's publishing brief — not separately interviewed.)* Students, educators, and self-studying enthusiasts of dynamical systems and chaos theory; secondary: researchers who want a quick way to eyeball an ODE system's phase-space geometry. They arrive curious, pick a system or type their own equations, and explore how attractors deform as parameters change.

## Product Purpose

An interactive explorer for the phase space of nonlinear dynamical systems. It numerically integrates user-editable systems of first-order ODEs with RK4, renders ensemble trajectories as colored 3D trails, and lets the visitor scrub parameters live to watch the attractor respond. Success is a visitor forming physical intuition within seconds of loading — seeing chaos, not reading about it.

## Positioning

The mechanism a generic plotter cannot copy: equations, initial conditions, and constants are all live-editable in the same view as the simulation, and an indexed "ring generator" expands one rule into an N-dimensional coupled lattice — so a visitor can go from Lorenz-96 with N=8 to their own N=40 system without touching code. Invariant diagnostics (energy/enstrophy drift for the Lorenz 1960 system) expose integrator quality honestly.

## Operating Context

Runs entirely client-side in a modern desktop browser; the 3D viewport expects mouse or trackpad orbit. Keyboard shortcuts (Space, R, C, 1–4) support rapid manipulation. No backend, no accounts, no data leaves the browser. Shared as a public URL (Vercel) and as source on GitHub.

## Capabilities and Constraints

- 16 built-in preset systems (Lorenz 1960 & 1963, Lorenz-96 rings, Thomas, cyclic Lotka-Volterra, Kuramoto, Rössler, Rössler hyperchaos, Lorenz-Stenflo, Chen, Halvorsen, Aizawa, Rabinovich-Fabrikant), each with a one-line honest attribution.
- Free editing of state variables, equations (a fixed math-function grammar, evaluated client-side via `new Function` — an accepted, self-inflicted-only surface), initial values, and constants with scrub sliders.
- Indexed ring compiler: `dx[i]/dt = f(x[i+1], x[i-2], …)` expanded over N states (3–40) with periodic wrap.
- Ensemble rendering: level-set tori, Gaussian cloud, or single orbit; trail length, particle count, Δt, substeps, and dispersion all adjustable.
- Camera: perspective/orthographic toggle, axis view presets, fit-to-attractor, turntable orbit, reference cage toggle.
- Four color palettes; color mapped to a chosen state variable or to speed.
- Constraints: desktop-first layout (the workbench collapses for narrow screens); WebGL required; no persistence of user edits between reloads (undecided whether to add URL or localStorage sharing — open decision, do not invent).

## Brand Commitments

Name: **Phase Space**. The existing dark "measurement instrument" visual identity (near-black carbon surfaces, signal-orange accent, mono numerals for data) is confirmed as the world to refine within, not replace.

## Evidence on Hand

The incumbent single-file implementation (`non_linear_phase_space_visualizer.html`) is the source of truth for all physics: preset definitions, invariant formulas (Lorenz 1960 Tellus 12 paper — a real citation, keep attributions), RK4 implementation, and seeding strategies. No imagery, testimonials, or benchmarks exist; none may be fabricated.

## Product Principles

1. The simulation is the interface — a first-time visitor should see a running attractor within one second, before reading anything.
2. Honesty over cosplay — real citations, real units, plain-language labels; no invented sci-fi systems ("SYS.ODE-RK4", "COMPILER FAULT").
3. Every number is live — scrubbing a constant must move the attractor, never require a reload or a hidden apply step.
4. Keyboard-first operation — every transport and view action reachable without the mouse.
5. Failure teaches — an invalid expression says what broke and where to look, in the user's language.
