---
name: VOW.
description: Immersive digital wedding invitations as objects of light. Your moment. Another dimension.
colors:
  obsidian: "#0b0b12"
  obsidian-2: "#12121c"
  obsidian-3: "#1a1a27"
  pearl: "#ede9e4"
  pearl-dim: "#b8b3ad"
  pearl-mute: "#8d8994"
  iris: "#c4b5fd"
  iris-deep: "#8b7ae6"
  chrome: "#b9c8d3"
  line: "rgb(237 233 228 / 0.12)"
  line-strong: "rgb(237 233 228 / 0.24)"
  danger: "#ffb4b4"
  success: "#b8f0d2"
typography:
  display-names:
    fontFamily: "'Bodoni Moda Variable', 'Didot', 'Bodoni 72', serif"
    fontSize: "clamp(4.2rem, min(19vw, 25svh), 17rem)"
    fontWeight: 400
    lineHeight: 0.88
    letterSpacing: "-0.035em"
  display:
    fontFamily: "'Bodoni Moda Variable', 'Didot', 'Bodoni 72', serif"
    fontSize: "clamp(3.3rem, min(12.5vw, 18svh), 12rem)"
    fontWeight: 400
    lineHeight: 0.88
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "'Bodoni Moda Variable', 'Didot', 'Bodoni 72', serif"
    fontSize: "clamp(2.6rem, 6.5vw, 6rem)"
    fontWeight: 400
    lineHeight: 0.88
    letterSpacing: "-0.035em"
  title:
    fontFamily: "'Bodoni Moda Variable', 'Didot', 'Bodoni 72', serif"
    fontSize: "1.9rem"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "-0.035em"
  numeral:
    fontFamily: "'Bodoni Moda Variable', 'Didot', 'Bodoni 72', serif"
    fontSize: "4.5rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.035em"
    fontFeature: "'tnum', 'lnum'"
  body:
    fontFamily: "'Jost Variable', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 380
    lineHeight: 1.6
  body-small:
    fontFamily: "'Jost Variable', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 380
    lineHeight: 1.6
  label:
    fontFamily: "'Jost Variable', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "0.75rem"
    fontWeight: 450
    letterSpacing: "0.18em"
  button:
    fontFamily: "'Jost Variable', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    letterSpacing: "0.08em"
rounded:
  pill: "9999px"
  panel-sm: "1rem"
  panel-md: "1.25rem"
  panel-lg: "1.5rem"
  device: "2.6rem"
  field: "0px"
spacing:
  gutter-mobile: "1.25rem"
  gutter-desktop: "2.5rem"
  section-mobile: "8rem"
  section-desktop: "11rem"
  container: "1440px"
  container-operate: "1280px"
components:
  button-primary:
    backgroundColor: "{colors.pearl}"
    textColor: "{colors.obsidian}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "0 28px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.iris}"
    textColor: "{colors.obsidian}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.pearl}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "0 28px"
    height: "48px"
  button-ghost-hover:
    textColor: "{colors.iris}"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.pearl-dim}"
    typography: "{typography.button}"
    padding: "0"
    height: "40px"
  button-action:
    backgroundColor: "transparent"
    textColor: "{colors.pearl}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "40px"
  field:
    backgroundColor: "transparent"
    textColor: "{colors.pearl}"
    rounded: "{rounded.field}"
    padding: "0.85rem 0 0.7rem"
  chip-status-published:
    backgroundColor: "transparent"
    textColor: "{colors.success}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "6px 12px"
  chip-guest-attending:
    backgroundColor: "rgb(184 240 210 / 0.1)"
    textColor: "{colors.success}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  chip-guest-pending:
    backgroundColor: "transparent"
    textColor: "{colors.pearl-mute}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  badge-demo:
    backgroundColor: "transparent"
    textColor: "{colors.iris}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "6px 12px"
  card-panel:
    backgroundColor: "transparent"
    textColor: "{colors.pearl}"
    rounded: "{rounded.panel-lg}"
    padding: "28px"
---

# Design System: VOW.

## Overview

**Creative North Star: "The Object of Light"**

VOW. is a dark room with one lit object in it. Obsidian owns every surface; a living glass-and-chrome sculpture, rendered in hand-written GLSL, is both the product and its proof. Type is monumental and editorial (Bodoni Moda, set tight and tall) for names and statements, and quietly functional (Jost) for everything that works. Colour behaves like light, not paint: Iris appears where light would (sculpture glow, focus, active and selected states, the period in the logo), Chrome appears where metal would (orbit ring, outlined numerals, plate frames, the select chevron).

Composition is asymmetric and generous: the sculpture takes the right two thirds of the landing hero, headlines sit low-left with the second line indented and italic, and sections breathe on 8 to 11rem of vertical air. Film grain sits at the edge of perception (7% overlay) on the hero only. Motion is sparse and authored: one opening moment per page, one scroll grammar for large headlines, and nothing else moves unless touched.

The world refuses the category default (cream card, script type, photo carousel), pervasive gradients and standard glassmorphism. Iridescence lives inside the 3D material and never in text.

The same world carries three modes. **Persuade** (landing) and **Experience** (invitation) are monumental and cinematic. **Operate** (organizer space) keeps the palette, fonts, pills and hairlines but drops the sculpture, the grain and the authored motion, and shrinks display type to working size.

**Key Characteristics:**
- Obsidian ground on every surface; pearl type; iris only as light; chrome only as metal.
- Bodoni Moda at monumental scale with tight tracking (-0.035em) and leading (0.88); Jost at 380 weight for reading.
- Pill controls, underline fields, 1px pearl hairlines at 12% and 24%.
- Procedural WebGL sculpture with device tiers and an instant CSS poster fallback.
- Raster imagery is only ever a still of the real sculpture or a real capture of the product, with provenance.
- Fiction is always labelled as fiction; unavailable features are always labelled as such.

## Colors

A near-black violet ground with warm pearl type, and two cool light-colours that are used as light and metal rather than as fills.

### Primary
- **Iris Light** (iris): the only accent. Focus outline, text caret, selection background, hover state of primary pills, active tab dot, demo badge, checkmarks in plan lists, the period in "VOW.", the recommended-plan ring (at 40%), the opening-control pulse and the sculpture's strip light and glow.
- **Deep Iris** (iris-deep): reserved darker step; present in the tokens, barely used in surfaces.

### Secondary
- **Chrome Hairline Metal** (chrome): the metal voice. Outlined numerals (1px text stroke), plate and device frames (20% to 30%), the fallback orbit ring (40%), the select chevron, and the sculpture's horizon and ambient light.

### Neutral
- **Obsidian** (obsidian): the ground of every page, scrollbar track, plate letterbox, button text on pearl.
- **Obsidian Raised** (obsidian-2): notice bars (local demo mode notice).
- **Obsidian Lifted** (obsidian-3): the highlighted plan card, scrollbar thumb.
- **Pearl** (pearl): primary text and primary pill fill.
- **Pearl Dim** (pearl-dim, 9.4:1 on obsidian): body copy in secondary voice, metadata labels, navigation.
- **Pearl Mute** (pearl-mute, 5.6:1 on obsidian): hints, captions, placeholders, inactive tabs, de-emphasised italic in headlines.
- **Hairline** (line, pearl at 12%): dividers, list rules, header border, panel borders.
- **Hairline Strong** (line-strong, pearl at 24%): field underlines, ghost-pill borders, venue top rules, pending chip dashes.
- **Danger** (danger): field errors, error summary border (50%). Light pink so it reads on obsidian.
- **Success** (success): published status, attending guests. Mint, used as text and at 10% as a chip fill.

### Named Rules
**The Light Not Paint Rule.** Iris marks where light falls or what is active: glow, focus, selection, hover, the active item. It never fills a large surface and never colours body text.

**The Metal Rule.** Chrome is only ever a line: a stroke, a ring, a frame. It is never a fill or a text colour for reading copy.

**The One Ground Rule.** Every surface is obsidian. Raised steps (obsidian-2, obsidian-3) are rare and tonal, never a light theme.

## Typography

**Display Font:** Bodoni Moda Variable, optical sizing on (with Didot, Bodoni 72, serif)
**Body Font:** Jost Variable (with ui-sans-serif, system-ui)

**Character:** A high-contrast couture Didone set at monumental size against a geometric, slightly airy sans. The serif speaks (names, statements, prices, numerals); the sans works (body, labels, controls).

### Hierarchy
- **Display Names** (400, clamp(4.2rem, min(19vw, 25svh), 17rem), 0.88): the couple's names on the invitation hero only.
- **Display** (400, clamp(3.3rem, min(12.5vw, 18svh), 12rem), 0.88): the landing hero statement. Second line italic and indented (6vw from md).
- **Headline** (400, around clamp(2.6rem, 6.5vw, 6rem), 0.88): section statements, often with a second clause in italic Pearl Mute. Range observed from clamp(2.4rem…) to clamp(3.2rem, 10vw, 9rem); all use the shared display class (tracking -0.035em, balanced wrap).
- **Title** (400, 1.75 to 2.4rem, leading tight): plan names, panel headings, list item names, venue names, RSVP choices (1.6rem).
- **Numeral** (400, 4.5 to 6rem, 1, tabular lining figures): prices, venue times, countdown, stats. Outlined variant: transparent fill with a 1px chrome stroke for sequence numbers and story chapter numbers, always aria-hidden.
- **Body** (380, 1.0625rem, 1.6): reading copy, max width 34 to 62ch.
- **Body Small** (380, 0.9375rem): hints, errors, link rows, captions (0.875rem for the smallest).
- **Label** (450, 0.75rem, 0.18em, uppercase): the metadata voice. Field labels, legends, dates, plan terms ("Paiement unique · TTC"), navigation, definition-list terms, venue labels, provenance and fiction notes.
- **Button** (500, 0.8125rem, 0.08em, uppercase): every pill. The invitation's opening control widens to 0.2em.

### Named Rules
**The Metadata Not Kicker Rule.** The uppercase label voice describes data (a field, a date, a term, a status). It is never placed as a decorative kicker or eyebrow above a heading.

**The Speaking Serif Rule.** Bodoni is for things that are said or counted; anything that is operated (inputs, buttons, chips, body) is Jost.

**The Iridescence-in-Material Rule.** No gradient text, no iridescent type. Type is pearl, pearl-dim or pearl-mute; iris appears in type only as the logo period and state.

## Layout

Two containers: 1440px for Persuade and Experience surfaces, 1280px for the organizer. Gutters are 1.25rem on mobile and 2.5rem from md. Sections use 8rem vertical padding on mobile and 11rem (sometimes 12 or 13rem) from md. Grids are 12-column and deliberately asymmetric: content spans 5 to 7 columns with an offset start (for example a 5-column panel starting at column 8), and stepped list items drop by 5rem and 10rem on desktop (the three steps). The landing hero is a full small-viewport section (100svh) with copy bottom-left and the sculpture stage offset to the right 70% from md; on portrait screens the sculpture lifts and shrinks above the copy. Safe-area insets are honoured on every fixed or full-height element. Overflow-x is clipped at the root; nothing scrolls sideways.

### Named Rules
**The Low-Left Rule.** Hero statements anchor bottom-left with air above them; the object takes the open space.

## Elevation & Depth

Depth comes from light, not shadow. The UI layer is flat: hairlines and tonal steps (obsidian-2, obsidian-3) separate things. Real depth lives only in the WebGL sculpture and its CSS poster. A single ambient drop shadow exists on the device frame of the demo capture. Backdrop blur is functional only: the scrolled header (obsidian at 85%), the organizer's sticky save bar (95%), the lightbox backdrop and the preview badge; all are near-opaque, never frosted-glass cards.

### Shadow Vocabulary
- **Device drop** (`box-shadow: 0 50px 100px -40px rgb(0 0 0 / 0.9)`): under the iPhone frame holding the real demo capture. Nowhere else.

### Named Rules
**The Light Is the Depth Rule.** If something needs to feel lifted, light it (iris ring at 40%, obsidian-3) rather than shadow it.

### The Sculpture
- **Material:** an icosahedron displaced by simplex noise, shaded with a thin-film iridescence approximation over a procedural "couture studio" (key softbox upper-left, iris strip light right, overhead ring, chrome horizon glow, back fill, ambient wash). No HDR environment maps; the scene ships in a few KB. A chrome torus orbit ring and pearl/iris point particles accompany it. Output is display-referred with a soft filmic shoulder.
- **Device tiers:** high (desktop): geometry detail 72, 1400 particles, DPR up to 2, antialias. Mid (coarse pointer or small screen): detail 44, 700 particles, DPR up to 1.6. Low (2 GB memory or 2 cores or fewer): detail 24, 280 particles, DPR 1, no antialias, lighter ring.
- **Progressive load:** the CSS poster paints first; the WebGL chunk mounts on idle (or immediately in the hero) and crossfades in over 1400ms once its first frame is ready. The render loop stops when the stage is off-screen.
- **Fallback:** no WebGL, save-data or 2G, render error, or context loss switch permanently to the CSS sculpture: conic-gradient body in obsidian, iris, pearl and chrome, iris halo, pearl specular, chrome orbit ring and a static constellation. It drifts slowly (14s) unless reduced motion is on.
- **Interaction:** drag to spin with inertia, pointer tilt, vertical pan preserved (touch-action pan-y). Canvas is aria-hidden.

## Shapes

Two shape families. Controls are full pills (9999px): every button, chip, badge, RSVP choice and the opening control. Containers are softly rounded panels (1rem for small media and error summaries, 1.25rem for feature plates, 1.5rem for form panels and plan cards; the device frame 2.6rem). Fields have no radius at all: they are a single underline. Rules are 1px. The sculpture fallback is the only organic silhouette.

## Components

### Buttons
Calm, uppercase, couture pills that respond with light.
- **Shape:** full pill (9999px), minimum height 48px, horizontal padding 28px.
- **Primary:** pearl fill, obsidian text. Hover turns the fill iris. Active scales to 0.98. Optional arrow nudges 4px right on hover. Transitions 500ms on the couture ease.
- **Ghost:** transparent with a Hairline Strong border, pearl text; hover shifts border and text to iris.
- **Quiet:** text-only in pearl-dim, underline appears on hover (offset 8px).
- **Action (Operate):** 40px compact pill with Hairline Strong border, 0.8125rem sentence-case text, for dense lists.
- **Opening control (Experience):** 56px pill with pearl border at 40%, 0.2em tracking, an iris pulse dot; hover fills pearl over 700ms.
- **Focus:** global 1.5px iris outline at 3px offset.

### Chips
- **Event status:** Label voice in a pill with a 6px dot. Published uses success text and a success border at 50%; draft uses Hairline Strong and a pearl-mute dot.
- **Guest status:** 0.8125rem sentence case. Attending: success at 10% fill with success text and tabular companion count. Declined: pearl at 5% with pearl-dim text. Pending: dashed Hairline Strong border with pearl-mute text.
- **Demo badge:** Label voice in iris with an iris border at 40% and an iris dot. Default text "Démonstration — contenu fictif".
- **Soon tag:** tiny (0.625rem) Label pill with a Hairline Strong border, reading "Bientôt", set inline after a feature name.

### Cards / Containers
- **Corner Style:** 1.5rem for form panels and plan cards.
- **Background:** transparent on obsidian; obsidian-3 only for the highlighted plan.
- **Shadow Strategy:** none (see Elevation & Depth).
- **Border:** Hairline; the highlighted plan uses an iris ring at 40% instead.
- **Internal Padding:** 28px (40px for plans on desktop).

### Inputs / Fields
- **Style:** underline only. Transparent background, no radius, 1px Hairline Strong bottom border, 1rem text (prevents iOS zoom), pearl-mute placeholder. Select uses a chrome chevron.
- **Label:** above, in the Label voice (pearl-dim). Optional fields append "(facultatif)" in sentence case.
- **Focus:** underline turns iris over 300ms; no outline box.
- **Error:** underline turns danger; inline error in body-small danger with role alert. After a failed submit an error summary panel (1rem radius, danger border at 50%) takes focus and links to each field.

### Navigation
- **Site header:** 64px (80px from md), logo left, Label-voice links in pearl-dim turning pearl on hover, an outlined pill for the organizer CTA. Transparent at rest; on scroll gains a hairline and obsidian at 85% with blur. Mobile uses a two-line hairline toggle.
- **Organizer header:** 64px, hairline bottom, logo plus a Label-voice section link; email in pearl-mute; sign-out as a Label-voice text button.

### Plates
Raster plates are only stills of the real VOW. sculpture (rendered from the dev plate route by the plate script, seeds 3, 5, 7, 11, 13, 17, 23, 29, 31, 41) or real captures of the product (the demo invitation on an emulated iPhone 14 Pro). Every file has an entry in the plates provenance file. Plates stand in for photography in demos and are framed with a chrome border at 20% and a 1 to 1.25rem radius. When a plate carries meaning it gets alt text naming it as a render of the sculpture; demo galleries carry a visible note that they are sculpture renders, not real photos.

### Honest labels
- Fictional content carries the demo badge, plus inline notes ("Récit fictif de démonstration", "Lieu fictif — l'adresse exacte est communiquée par les mariés.", the fictional footer line).
- Features not yet shipped carry the Soon tag and say what is available today.
- The local backend shows an obsidian-2 notice bar with an iris lead-in ("Mode démo local.") explaining that data stays in the browser.
- Demo RSVPs state that the reply stays in the browser.

### Motion grammar
- **Easing:** couture ease (expo-out) for entrances and state; silk ease (in-out) for ambient loops.
- **One opening moment per page.** Landing: headline lines rise from a mask (1.6s, 0.12s stagger), copy and actions fade up, the sculpture settles from an inflated state. Invitation: the gate blurs out, the sculpture inflates with light, a pearl-to-iris radial flash crosses the screen, the names rise from depth (blur 22px and scale 1.18 settling to sharp over 2.1s), then a beam sweeps.
- **One scroll grammar.** Only large headlines marked for reveal rise 32px and sharpen from blur 6px, starting from 30% opacity so they are legible if the trigger never fires. Everything else is still.
- **Reduced motion:** no timelines, no scroll reveal, no pointer parallax; the WebGL scene renders on demand with frozen time, the CSS fallback stops drifting, and global animation and transition durations collapse to near zero. The invitation opens directly to its final state with focus moved to the heading.

### Operate surfaces
The organizer space uses the same tokens with more restraint: 1280px container, no sculpture, no grain, no authored opening, no scroll reveal. Display type drops to working size (page titles clamp(2.6rem, 5vw, 4rem) to 4.75rem; panel titles 1.75 to 2.2rem). Density rises through hairline-divided lists, tabular numbers, compact action pills and status chips. A sticky save bar uses obsidian at 95%. The preview of an invitation is labelled with an iris badge.

## Do's and Don'ts

### Do:
- **Do** keep obsidian as the ground of every surface and pearl as the reading colour.
- **Do** use iris only for light and state: focus, selection, hover, active, glow, the logo period.
- **Do** use chrome only as line: strokes, rings, frames, outlined numerals.
- **Do** make every control a pill and every field an underline.
- **Do** set statements in Bodoni Moda with tracking -0.035em and leading 0.88, and keep a second clause in italic Pearl Mute when a headline has two beats.
- **Do** give each page at most one authored opening moment and start every scroll reveal from a legible state.
- **Do** ship the CSS sculpture first and let WebGL crossfade in; keep the tier budgets (detail 72/44/24, particles 1400/700/280).
- **Do** label fiction, unavailable features and local-only data in plain words, every time.
- **Do** add a provenance entry for every raster plate.

### Don't:
- **Don't** use gradient or iridescent text; iridescence lives in the 3D material.
- **Don't** use stock photography, AI-generated imagery or invented photos; plates are stills of the real sculpture or real product captures only.
- **Don't** invent testimonials, customers, press, addresses or results.
- **Don't** use frosted-glass cards; blur is reserved for near-opaque functional chrome (header, save bar, lightbox).
- **Don't** add shadows to UI elements; the device frame drop is the only one.
- **Don't** put the uppercase Label voice above a heading as a kicker.
- **Don't** bring the sculpture, grain or opening choreography into Operate surfaces.
