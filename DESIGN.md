---
name: ODE 3D Orbit
description: A live dashboard for exploring chaotic systems in 3D
colors:
  bg: "#05080f"
  panel: "#0b1322"
  panel-2: "#0e1830"
  well: "#060b16"
  border: "#1d2a4a"
  border-soft: "#16213c"
  text: "#e8eefc"
  text-2: "#9db0d4"
  text-3: "#7387b0"
  accent: "#4cc3ff"
  good: "#3fd68f"
  warn: "#f5c542"
  bad: "#ff6b6b"
  live: "#ff5c1a"
  ink-accent: "#04101f"
  accent-hover: "#7ad4ff"
  border-hover: "#2c3d6e"
  active: "#1a2a55"
rounded:
  card: "10px"
  control: "6px"
  chip: "5px"
  tag: "4px"
  pill: "3px"
  dot: "2px"
spacing:
  xs: "6px"
  sm: "8px"
  md: "12px"
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
  annotation:
    fontFamily: "Fira Code, ui-monospace, monospace"
    fontSize: "10px"
    fontWeight: 500
rounded:
  none: "0"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "20px"
components:
  button:
    backgroundColor: "{colors.panel-2}"
    textColor: "{colors.text}"
    rounded: "{rounded.none}"
    padding: "6px 12px"
  button-accent-active:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.well}"
    rounded: "{rounded.none}"
    padding: "6px 12px"
  panel:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.text}"
    rounded: "{rounded.none}"
    padding: "12px"
  input:
    backgroundColor: "{colors.well}"
    textColor: "{colors.text}"
    rounded: "{rounded.none}"
    padding: "4px 8px"
---

# Design System: ODE 3D Orbit

## Overview

**Creative North Star: "The Bench Instrument"**

ODE 3D Orbit looks like a mission dashboard: a centered live WebGL viewport with rounded navy cards flanking it on both sides, one cyan voice for anything active or measured, a small orange pulse for the run state, and monospaced numerals wherever data lives. Cards fold down to their title bars, so the visitor decides how much chrome to show. The ground is a cool blue-black, the color of an oscilloscope face, chosen because it keeps long viewing sessions easy on the eyes and lets both the cyan chrome and the warm trail palettes read clearly. Depth does not exist as shadow; hierarchy comes from surface value, hairline borders, and typographic weight. Cards corner at 10px, controls at 6px.

Density is deliberately high, but every value sits at or above the 11px legibility floor, every constant is scrubable in place, and every label says what the thing actually is in plain words.

**Key Characteristics:**
- Rounded navy cards (10px) with 1px slate seams around a centered WebGL hero
- Signal cyan (#4cc3ff) as the primary accent: active states, live values, focus rings; a small orange pulse marks the run state
- Fira Code for every number, equation, and label (ligatures off where symbols are literal); Fira Sans only for descriptive prose
- Three-zone dashboard: system cards left, live viewport and timeline center, view/colors/solver cards right — never a scrolling page on desktop
- The WebGL scene is the interface; chrome recedes to hairlines
- Plain-language labels throughout — no sci-fi cosplay, no unexplained jargon

## Colors

A cool blue-black neutral ladder with one hot accent and three semantic data colors borrowed from oscilloscope channels.

### Primary
- **Signal Cyan** (#4cc3ff): the primary accent. Active buttons, current values, focus rings, the hover probe border, orbit head markers. If cyan appears, something is live or selected.

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
**The One Voice Rule.** Cyan never exceeds a sliver of any screen — one active transport button, a few live numerals, the card title ticks. Its rarity is what makes the dashboard feel precise. A separate orange pulse (#ff5c1a) marks only the running state.

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

Rounded corners: 10px on cards and the viewport frame, 6px on controls and inputs. Range thumbs are circular cyan dots with a soft glow, echoing the reference. Focus is a 2px cyan outline offset 1px.

## Components

### Buttons
- **Shape:** rounded 6px, 1px Midnight 700 border, Midnight 850 fill
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
- **Do** reserve Signal cyan for active/live/selected states and focus rings, and orange only for the run pulse.
- **Do** separate cards with 1px Midnight 700 seams; corners round at 10px (cards) and 6px (controls).
- **Do** keep the frame at exactly 100vh — the page scrolls inside panels, never as a document.
- **Do** write labels in plain words a curious visitor already knows ("Starting values", not "Initial state vector").

### Don't:
- **Don't** introduce shadows, gradients, rounded corners, or glass/blur — the world is flat lab hardware.
- **Don't** add a second accent hue; the channel colors (red/green/amber) exist only for axis/data semantics.
- **Don't** set functional text below 11px (10px floor only for `kbd` hints and scope annotations).
- **Don't** invent sci-fi system names or cosplay copy ("COMPILER FAULT") — labels name what the thing actually is.
- **Don't** let raw technical errors reach the screen (a bare "SyntaxError") — say what broke and how to fix it.
