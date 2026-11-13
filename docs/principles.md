# Principles

Toonish looks like a comic page that happens to be a website: thin ink outlines, short hard shadows, four bright accents on deep navy, and panels the colour of printed paper. Every rule below serves that look or keeps it usable.

## The look

- **Ink outlines.** Every filled shape has a `2px` ink border (`--toon-border-toon`). Ink is also the text colour on every fill, so contrast never depends on which accent you choose.
- **Hard shadows.** A shadow is an offset copy with no blur: `4px 4px 0` in an accent. A shadow takes the *pair* of its fill, never its own colour. Blue and red carry yellow, yellow carries blue, violet carries red (`PAIR` in `src/markup.ts`).
- **Four accents, one ground.** Blue, red, yellow and violet sit on navy (`ground`). Panels and bubbles are `paper`. No lime, no pink, no mascot.
- **Lettering is Bangers.** Display words use the comic face with an ink outline and a hard shadow, one span per letter so each can tilt and bob (`toon-type`). Body copy is never Bangers.
- **Bounce, then rest.** Hover lifts a panel (`lift`), press flattens it (`press`), and entrances overshoot (`bounce`). Motion is short, and it stops when the visitor asks.
- **Halftone, speed lines and bursts** are the only ornaments. Use them to point at something, not to fill space.

## The rules

### 1. Mobile first

Design the 390 px layout first, then widen it.

- The base rule is the phone layout. Wider layouts sit in `min-width` queries (`sm`, `md`, `lg`).
- A touch target is at least 44 px, and nothing depends on hover.
- No component traps a scroll. A swipeable component sets `touch-action: pan-y`, so a vertical drag always scrolls the page. The one sideways scroll container is `toon-table-wrap`. Do not add another: use `toon-deck` to flip through cards.
- Decoration shows on a phone. Shrink it (`toon-sfx-sm`) or pin it (`toon-sfx-corner`). Do not hide it.
- No component widens the page. Check the component at 390 px before 1280 px.

### 2. Accessibility is part of the component

- Ink on the darkest fill (blue) measures 5.1:1. Paper on the ground measures 15.5:1. `test/tokens.test.ts` computes both on every run.
- Decoration is `aria-hidden`: `toon-sfx`, `toon-burst`, `toon-speed` and the arrows in `toon-steps`. Put real meaning in text elsewhere.
- A helper that needs alt text (`shot`, `portrait`) requires it, because an empty alt hides the picture from a screen reader.
- Every animation and transition stops under `prefers-reduced-motion`, and under `data-motion="off"` on `<html>`. A visitor can force motion back on with `data-motion="on"`.
- Modals are native `<dialog>`, so the browser traps focus and closes on `Esc`.

### 3. Escape everything

Every helper that returns HTML escapes its input with `esc()`. A helper that wraps markup you supply (`deck`) says so in its docs, and you escape any text you put in a card.

### 4. Fail loudly

A helper throws on a blank label, an unknown accent or an empty list. A build that matches no classes fails instead of writing an empty file. A check that reports success prints what it examined.

### 5. One home for each value

Tokens live in `tokens/toonish.tokens.json`. The preset, `tokens.css`, `theme.css` and `tokens.json` all build from it, and `dist/` is generated. Do not hand-edit `dist/` or repeat a hex value in a component.

### 6. Compose, don't write bullets

Reach for a component before free text. A list of facts is `toon-list` (or `row()`), a set of figures is `toon-strip` or `toon-stats`, an ordered process is `toon-steps`. A plain bullet list looks like a template.

## Voice

- Sound effects are short Latin-letter words with an exclamation mark: `MERGE!`, `SHIP!`, `CLICK!`, `DEPLOY!`, `STACK!`. They are decoration. Never use katakana or a specific manga's lettering.
- Captions say what the picture shows and mark what is redacted.
- Prose follows Google developer documentation style: second person, active voice, answer first, sentence-case headings.
