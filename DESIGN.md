---
name: Phase Space
description: A bench instrument for exploring the phase space of dynamical systems
colors:
  carbon-950: "#080807"
  carbon-900: "#0c0c0b"
  carbon-850: "#131311"
  carbon-800: "#1a1a17"
  carbon-700: "#222220"
  carbon-600: "#32322e"
  alabaster: "#ededec"
  ash: "#96968f"
  dim: "#82827b"
  signal: "#ff4f00"
  amber: "#eab308"
  emerald: "#10b981"
  crimson: "#ef4444"
typography:
  brand:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "13px"
    fontWeight: 600
    letterSpacing: "0.08em"
    textTransform: "uppercase"
  label:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "11px"
    fontWeight: 600
    letterSpacing: "0.06em"
    textTransform: "uppercase"
  data:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "12px"
    fontWeight: 500
    fontVariant: "tabular-nums"
  body:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.45
rounded:
  none: "0"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "20px"
components:
  button:
    backgroundColor: "{colors.carbon-850}"
    textColor: "{colors.alabaster}"
    rounded: "{rounded.none}"
    padding: "5px 10px"
  button-accent-active:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.carbon-950}"
    rounded: "{rounded.none}"
    padding: "5px 10px"
  panel:
    backgroundColor: "{colors.carbon-900}"
    textColor: "{colors.alabaster}"
    rounded: "{rounded.none}"
    padding: "12px"
  input:
    backgroundColor: "{colors.carbon-950}"
    textColor: "{colors.alabaster}"
    rounded: "{rounded.none}"
    padding: "4px 8px"
---

# Design System: Phase Space

## Overview

**Creative North Star: "The Bench Instrument"**

Phase Space looks like lab hardware, not a website: a full-viewport frame of flat carbon panels joined by 1px graphite seams, one saturated signal-orange voice for anything active or measured, and monospaced numerals wherever data lives. Depth does not exist as shadow — hierarchy comes from surface value (four near-black steps), hairline borders, and typographic weight. Corners are square everywhere; the device has no radius because physical instruments have none.

Density is deliberately high — this is a tool a physicist stares at for an hour — but every value sits at or above the 11px legibility floor and every constant is scrubable in place. The one moment of expressiveness is the simulation itself: colored trail integrations rendering inside a black WebGL viewport that occupies most of the frame.

**Key Characteristics:**
- Flat carbon panel ladder (4 near-black steps) with 1px seams; zero shadows, zero radius
- Signal orange (#ff4f00) as the single accent: active states, live values, focus rings, run state
- JetBrains Mono for every number, equation, and label; Inter only for descriptive prose
- Full-viewport app frame: bar / workbench / viewport / telemetry strip — never a scrolling page
- The WebGL scene is the interface; chrome recedes to hairlines

## Colors

A near-black neutral ladder with one hot accent and three semantic data colors borrowed from oscilloscope channels.

### Primary
- **Signal Orange** (#ff4f00): the only accent. Active buttons, the run indicator, current values, focus rings, the error probe border, trail color mapping. If orange appears, something is live or selected.

### Tertiary
- **Phosphor Amber** (#eab308): X₃ channel color, halted state, amber data readouts.
- **Channel Green** (#10b981): X₂ channel color, invariant drift OK.
- **Channel Red** (#ef4444): X₁ channel color, destructive hover, error banner.

### Neutral
- **Carbon 950** (#080807): page and viewport ground, input wells.
- **Carbon 900** (#0c0c0b): app bar, workbench, telemetry panels.
- **Carbon 850** (#131311): resting button fill, active tab fill.
- **Carbon 800** (#1a1a17): hover fill.
- **Carbon 700** (#222220): all 1px borders and seams.
- **Carbon 600** (#32322e): range tracks, scrollbar thumb, strong rules.
- **Alabaster** (#ededec): primary text.
- **Ash** (#96968f): secondary text and annotations.
- **Dim** (#82827b): tertiary text (footers, key hints) — held at ≥4.5:1 on every ground.

### Named Rules
**The One Voice Rule.** Signal orange never exceeds a sliver of any screen — one active transport button, a run dot, a few live numerals. Its rarity is what makes the instrument feel precise.

**The Seams Rule.** Panels separate with 1px Carbon 700 borders only. No shadow may ever substitute for a seam.

## Typography

**Display/Brand Font:** JetBrains Mono (with ui-monospace fallback)
**Body Font:** Inter (with system sans fallback)
**Data Font:** JetBrains Mono, tabular numerals

**Character:** A measurement pairing — Inter speaks plain prose quietly, while JetBrains Mono carries every equation, constant, and readout like an engraved instrument scale. Nothing is set larger than 13px; hierarchy is weight and case, not size.

### Hierarchy
- **Brand** (600, 13px, +0.08em, uppercase): the wordmark only.
- **Label** (600, 11px, +0.06em, uppercase): panel labels — "STATE DIMENSION (N)".
- **Data** (500–600, 12px, tabular): equations, constants, HUD readouts, values in inputs.
- **Body** (400, 11px, 1.45): descriptive prose inside panels (max ~60ch in the 430px workbench).
- **Annotation** (400–500, 10–11px): key hints (`kbd`), scope annotations, secondary notes.

### Named Rules
**The Data-in-Mono Rule.** Any number a visitor can read or edit is monospaced with tabular figures so it never shifts width while scrubbing.

## Layout

A fixed 100vh instrument frame, never a scrolling document: 44px app bar on top, 96px telemetry strip on the bottom, a 430px workbench column on the left, and the black WebGL viewport taking all remaining space. Panels pad at 12px with 8px internal grids; two-column field rows use an equal 1fr 1fr grid. The workbench body scrolls internally; the frame never does.

Responsive: below 1024px the view-preset group hides; below 768px the "System" label hides; below 640px the workbench takes the full width (the Panel toggle reveals the viewport) and the brand lockup collapses to its dot.

## Elevation & Depth

No shadows anywhere in the system — depth is expressed as a four-step value ladder (950 ground → 900 chrome → 850 controls → 800 hover) plus 1px seams. The only perceptual depth is inside the WebGL viewport, where trail age fades toward the ground color.

## Shapes

Zero border radius on every element, enforced globally. Controls are square-stroked rectangles; the range thumb is a 6×12px blade; panel corners meet at true right angles. Focus is a 2px signal-orange outline offset 1px — the only "glow" the system allows.

## Components

### Buttons
- **Shape:** square (0 radius), 1px Carbon 700 border, Carbon 850 fill
- **Resting:** Alabaster mono uppercase 11px label, 5×10px padding
- **Hover:** Carbon 800 fill, Dim border; **Active:** Signal fill, Carbon 950 text, weight 600
- **Small variant:** 3×8px padding for the bar groups; **Block variant:** full-width for primary form actions

### Tabs
- Four-column strip on Carbon 950; resting Ash mono 11px; active Carbon 850 fill with Signal text and 600 weight; a 10px `kbd` key hint rides right-aligned in each tab

### Inputs / Fields
- **Style:** Carbon 950 well, 1px Carbon 700 stroke, mono 12px, 4×8px padding
- **Focus:** border shifts to Signal (no outline on inner fields; the outline is for buttons/tabs)
- **Range:** 2px Carbon 600 track with a 6×12px Signal blade thumb that turns Alabaster on hover

### Panels
- 12px padding, Carbon 900 ground; inset variant Carbon 850; note variant Carbon 950
- Labeled with an 11px uppercase mono label; separated inside the workbench by 1px seams

### Error banner
- Crimson 15% wash, 1px Crimson bottom seam, "Expression error" title + visitor-readable message; appears directly under the tab strip

### Telemetry strip
- 96px: a 224px summary block (integrator, ensemble, fps in tabular mono) beside a full-bleed state-amplitude scope with graticule lines and a channel-color legend

## Do's and Don'ts

### Do:
- **Do** set every editable or displayed number in JetBrains Mono with `font-variant-numeric: tabular-nums`.
- **Do** reserve Signal orange for active/live/selected states and focus rings.
- **Do** separate panels with 1px Carbon 700 seams and keep corners at 0 radius.
- **Do** keep the frame at exactly 100vh — the page scrolls inside panels, never as a document.

### Don't:
- **Don't** introduce shadows, gradients, rounded corners, or glass/blur — the world is flat lab hardware.
- **Don't** add a second accent hue; the channel colors (red/green/amber) exist only for axis/data semantics.
- **Don't** set functional text below 11px (10px floor only for `kbd` hints and scope annotations).
- **Don't** invent sci-fi system names or cosplay copy ("COMPILER FAULT") — labels name what the thing actually is.
