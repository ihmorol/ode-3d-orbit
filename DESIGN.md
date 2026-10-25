---
name: ODE 3D Orbit
description: A bench instrument for exploring chaotic systems in 3D
colors:
  midnight-950: "#060a14"
  midnight-900: "#0b1120"
  midnight-850: "#111a30"
  midnight-800: "#182342"
  midnight-700: "#223054"
  midnight-600: "#31406e"
  ice: "#edf2fb"
  ash: "#9fb0cf"
  dim: "#8091b4"
  signal: "#ff4f00"
  amber: "#f5c542"
  emerald: "#3fd68f"
  crimson: "#ff6b6b"
typography:
  brand:
    fontFamily: "Fira Code, ui-monospace, monospace"
    fontSize: "13px"
    fontWeight: 600
    letterSpacing: "0.08em"
    textTransform: "uppercase"
  label:
    fontFamily: "Fira Code, ui-monospace, monospace"
    fontSize: "11px"
    fontWeight: 600
    letterSpacing: "0.06em"
    textTransform: "uppercase"
  data:
    fontFamily: "Fira Code, ui-monospace, monospace"
    fontSize: "12px"
    fontWeight: 500
    fontVariant: "tabular-nums"
  body:
    fontFamily: "Fira Sans, -apple-system, BlinkMacSystemFont, sans-serif"
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
    backgroundColor: "{colors.midnight-850}"
    textColor: "{colors.ice}"
    rounded: "{rounded.none}"
    padding: "6px 11px"
  button-accent-active:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.midnight-950}"
    rounded: "{rounded.none}"
    padding: "6px 11px"
  panel:
    backgroundColor: "{colors.midnight-900}"
    textColor: "{colors.ice}"
    rounded: "{rounded.none}"
    padding: "12px"
  input:
    backgroundColor: "{colors.midnight-950}"
    textColor: "{colors.ice}"
    rounded: "{rounded.none}"
    padding: "4px 8px"
---

# Design System: ODE 3D Orbit

## Overview

**Creative North Star: "The Bench Instrument"**

ODE 3D Orbit looks like lab hardware, not a website: a full-viewport frame of flat midnight-blue panels joined by 1px slate seams, one saturated signal-orange voice for anything active or measured, and monospaced numerals wherever data lives. The ground is a cool blue-black — the color of an oscilloscope face — chosen because it makes the orange read hot by contrast and keeps long viewing sessions easy on the eyes. Depth does not exist as shadow; hierarchy comes from surface value, hairline borders, and typographic weight. Corners are square everywhere.

Density is deliberately high — this is a tool a curious person stares at for an hour — but every value sits at or above the 11px legibility floor, every constant is scrubable in place, and every label says what the thing actually is in plain words.

**Key Characteristics:**
- Flat midnight panel ladder (4 blue-black steps) with 1px seams; zero shadows, zero radius
- Signal orange (#ff4f00) as the single accent: active states, live values, focus rings, run state
- Fira Code for every number, equation, and label (ligatures off where symbols are literal); Fira Sans only for descriptive prose
- Full-viewport app frame: bar / workbench / viewport / telemetry strip — never a scrolling page
- The WebGL scene is the interface; chrome recedes to hairlines
- Plain-language labels throughout — no sci-fi cosplay, no unexplained jargon

## Colors

A cool blue-black neutral ladder with one hot accent and three semantic data colors borrowed from oscilloscope channels.

### Primary
- **Signal Orange** (#ff4f00): the only accent. Active buttons, the run indicator, current values, focus rings, the error probe border, trail color mapping. If orange appears, something is live or selected.

### Tertiary
- **Phosphor Amber** (#f5c542): X₃ channel color, halted state, amber data readouts.
- **Channel Green** (#3fd68f): X₂ channel color, invariant drift OK.
- **Channel Red** (#ff6b6b): X₁ channel color, destructive hover, error banner.

### Neutral
- **Midnight 950** (#060a14): page and viewport ground, input wells.
- **Midnight 900** (#0b1120): app bar, workbench, telemetry panels.
- **Midnight 850** (#111a30): resting button fill, active tab fill.
- **Midnight 800** (#182342): hover fill.
- **Midnight 700** (#223054): all 1px borders and seams.
- **Midnight 600** (#31406e): range tracks, scrollbar thumb, strong rules.
- **Ice** (#edf2fb): primary text.
- **Ash** (#9fb0cf): secondary text and annotations.
- **Dim** (#8091b4): tertiary text (footers, key hints) — held at ≥4.5:1 on every ground.

### Named Rules
**The One Voice Rule.** Signal orange never exceeds a sliver of any screen — one active transport button, a run dot, a few live numerals. Its rarity is what makes the instrument feel precise.

**The Seams Rule.** Panels separate with 1px Midnight 700 borders only. No shadow may ever substitute for a seam.

**The Cold Ground Rule.** Neutrals stay in the blue-black family so the orange accent and warm trail palettes read hot against a cold ground. Never warm the grays.

## Typography

**Display/Label Font:** Fira Code (with ui-monospace fallback)
**Body Font:** Fira Sans (with system sans fallback)
**Data Font:** Fira Code, tabular numerals

**Character:** A measurement pairing from the dashboard/data tradition — Fira Sans speaks plain prose quietly, while Fira Code carries every equation, constant, and readout like an engraved instrument scale. Literal-symbol contexts (equation inputs, syntax references) disable ligatures so `**` never renders as a merged glyph. Nothing is set larger than 13px; hierarchy is weight and case, not size.

### Hierarchy
- **Brand** (600, 13px, +0.08em, uppercase): the wordmark only.
- **Label** (600, 11px, +0.06em, uppercase): panel labels — "NUMBER OF VARIABLES (N)".
- **Data** (500–600, 12px, tabular): equations, constants, HUD readouts, values in inputs.
- **Body** (400, 11px, 1.45): descriptive prose inside panels (max ~60ch in the 430px workbench).
- **Annotation** (400–500, 10–11px): key hints (`kbd`), scope annotations, secondary notes.

### Named Rules
**The Data-in-Mono Rule.** Any number a visitor can read or edit is monospaced with tabular figures so it never shifts width while scrubbing.

**The Honest-Symbol Rule.** Where the visitor types or reads literal math, ligatures are off — the glyphs on screen are the characters in the file.

## Layout

A fixed 100vh instrument frame, never a scrolling document: 44px app bar on top, 96px telemetry strip on the bottom, a 430px workbench column on the left, and the black WebGL viewport taking all remaining space. Panels pad at 12px with 8px internal grids; two-column field rows use an equal 1fr 1fr grid. The workbench body scrolls internally; the frame never does.

Responsive: below 1024px the view-preset group hides; below 768px the "System" label hides; below 640px the workbench takes the full width (the Panel toggle reveals the viewport) and the brand lockup collapses to its dot.

## Elevation & Depth

No shadows anywhere in the system — depth is expressed as a four-step value ladder (950 ground → 900 chrome → 850 controls → 800 hover) plus 1px seams. The only perceptual depth is inside the WebGL viewport, where trail age fades toward the ground color.

## Shapes

Zero border radius on every element, enforced globally. Controls are square-stroked rectangles; the range thumb is a 6×12px blade; panel corners meet at true right angles. Focus is a 2px signal-orange outline offset 1px — the only "glow" the system allows.

## Components

### Buttons
- **Shape:** square (0 radius), 1px Midnight 700 border, Midnight 850 fill
- **Resting:** Ice mono uppercase 11px label, 6×11px padding
- **Hover:** Midnight 800 fill, Dim border; **Active:** Signal fill, Midnight 950 text, weight 600
- **Small variant:** 3×9px padding for the bar groups; **Block variant:** full-width for primary form actions

### Tabs
- Four-column strip on Midnight 950; resting Ash mono 11px; active Midnight 850 fill with Signal text and 600 weight; a 10px `kbd` key hint rides right-aligned in each tab

### Inputs / Fields
- **Style:** Midnight 950 well, 1px Midnight 700 stroke, mono 12px, 4×8px padding
- **Focus:** border shifts to Signal (no outline on inner fields; the outline is for buttons/tabs)
- **Range:** 2px Midnight 600 track with a 6×12px Signal blade thumb that turns Ice on hover

### Panels
- 12px padding, Midnight 900 ground; inset variant Midnight 850; note variant Midnight 950
- Labeled with an 11px uppercase mono label; separated inside the workbench by 1px seams

### Error banner
- Crimson 12% wash, 1px Crimson bottom seam, "Expression error" title + a plain-language message that names the recovery; appears directly under the tab strip

### Telemetry strip
- 96px: a 224px summary block (solver, orbits, fps in tabular mono) beside a full-bleed state scope with graticule lines and a channel-color legend

## Do's and Don'ts

### Do:
- **Do** set every editable or displayed number in Fira Code with `font-variant-numeric: tabular-nums`.
- **Do** reserve Signal orange for active/live/selected states and focus rings.
- **Do** separate panels with 1px Midnight 700 seams and keep corners at 0 radius.
- **Do** keep the frame at exactly 100vh — the page scrolls inside panels, never as a document.
- **Do** write labels in plain words a curious visitor already knows ("Starting values", not "Initial state vector").

### Don't:
- **Don't** introduce shadows, gradients, rounded corners, or glass/blur — the world is flat lab hardware.
- **Don't** add a second accent hue; the channel colors (red/green/amber) exist only for axis/data semantics.
- **Don't** set functional text below 11px (10px floor only for `kbd` hints and scope annotations).
- **Don't** invent sci-fi system names or cosplay copy ("COMPILER FAULT") — labels name what the thing actually is.
- **Don't** let raw technical errors reach the screen (a bare "SyntaxError") — say what broke and how to fix it.
