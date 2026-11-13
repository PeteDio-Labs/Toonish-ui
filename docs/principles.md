# Principles

Toonish looks like a comic page that happens to be a website: thin ink outlines, short hard shadows, four bright accents on deep navy, and panels the colour of printed paper. Every rule below serves that look or keeps it usable.

## The look

- **Ink outlines.** Every filled shape has a `2px` ink border (`--toon-border-toon`). Ink is also the text colour on every fill, so contrast never depends on which accent you choose.
- **Hard shadows.** A shadow is an offset copy with no blur: `4px 4px 0` in an accent. A shadow takes the *pair* of its fill, never its own colour. The pairs are in [Tokens](tokens.md#colour).
- **Four accents, one ground.** Blue, red, yellow and violet sit on navy (`ground`). Panels and bubbles are `paper`. No lime, no pink, no mascot.
- **Lettering is Bangers.** Display words use the comic face with an ink outline and a hard shadow, one span per letter so each can tilt and bob (`letters()` with `live`). Body copy is never Bangers.
- **Bounce, then rest.** Hover lifts a panel (`lift`), press flattens it (`press`), and entrances overshoot (`bounce`). Motion is short, and it stops when the visitor asks.
- **Halftone, speed lines and bursts** are the only ornaments. Use them to point at something, not to fill space.

## The rules

### 1. Mobile first

Design the 390 px layout first, then widen it.

- The base rule is the phone layout. Wider layouts sit in `min-width` queries (`sm`, `md`, `lg`).
- Nothing depends on hover. Deck buttons and pager links have a 44 px minimum target. Give any added interactive component the same minimum and a browser check.
- No component traps a scroll. A swipeable component sets `touch-action: pan-y`, so a vertical drag always scrolls the page. The one sideways scroll container is `toon-table-wrap`. Do not add another: use `toon-deck` to flip through cards.
- Decoration shows on a phone. Shrink it (`toon-sfx-sm`) or pin it (`toon-sfx-corner`). Do not hide it.
- No component widens the page. Check the component at 390 px before 1280 px.

### 2. Accessibility is a hard rule

Nothing ships that fails the accessibility checks. The target is WCAG 2.2 AA, and the kit meets it by default so a site built from the kit does too.

- **Semantic HTML first.** Use the element that means the thing: `<button>` for an action, `<a href>` for a place, `<nav>`, `<main>`, `<ul>` and `<ol>` for lists, `<table>` with `<th scope>` for data, `<figure>` for a picture with a caption, `<dialog>` for a modal. Never put a click handler on a `div`.
- **ARIA only where HTML has no word for it.** Add a role, label or state when no element carries it: `role="list"` on a list whose styling removes its semantics, `aria-pressed` on a toggle, `aria-current` on the current page, `aria-roledescription` on a carousel. A wrong ARIA role is worse than none, and `aria-label` never replaces visible text.
- **Every component ships accessible.** The helper writes the roles, labels and states, and throws when a required label or `alt` is missing. [Components](components.md#accessibility-contract) lists the contract per component.
- **Contrast.** Text meets 4.5:1, large text and focus rings 3:1. Figures are in [Tokens](tokens.md#colour). Text on paper uses the `-text` accents, because the fills fail there.
- **Decoration is `aria-hidden`:** `toon-sfx`, `toon-burst`, `toon-speed` and the arrows in `toon-steps`. Put real meaning in text elsewhere.
- **A helper that needs alt text** (`shot`, `portrait`) requires it, because an empty alt hides the picture from a screen reader.
- **Keyboard.** Everything works without a pointer, with a visible two-tone focus ring and a skip link. Targets are at least 24 px, and the kit's controls are 44 px. A swipe always has a button.
- **Motion.** Every animation and transition stops under `prefers-reduced-motion`, and under `data-motion="off"` on `<html>`. A visitor can force motion back on with `data-motion="on"`.
- **Modals are native `<dialog>`,** so the browser traps focus and closes on `Esc`.
- **The tests enforce it.** `bun run test:browser` runs axe at WCAG 2.2 AA at 1280 and 390 px, reads the focus ring and the target sizes, and checks heading order and the skip link. A violation fails CI. Do not skip, relax or quarantine a check to merge. Fix the component.
- **A person checks what a tool cannot:** tab through the change and listen to it in VoiceOver or NVDA before you open the pull request.

### 3. Escape everything

Every helper that returns HTML escapes its input with `esc()`. A helper that wraps markup you supply (`deck`) says so in its docs, and you escape any text you put in a card.

### 4. Fail loudly

A helper throws on a blank label, an unknown accent or an empty list. A build that matches no classes fails instead of writing an empty file. A check that reports success prints what it examined.

### 5. Give each value one home

Tokens live in `tokens/toonish.tokens.json`. The preset, `tokens.css`, `theme.css` and `tokens.json` all build from it, and `dist/` is generated. Do not hand-edit `dist/` or repeat a hex value in a component.

### 6. Compose, don't write bullets

Reach for a component before free text. A list of facts is `toon-list` (or `row()`), a set of figures is `toon-strip` or `toon-stats`, an ordered process is `toon-steps`. A plain bullet list looks like a template.

## Voice

- Sound effects are short words with an exclamation mark: `MERGE!`, `SHIP!`, `CLICK!`, `DEPLOY!`, `STACK!`. The lettering rules are in [Components](components.md#decoration).
- Captions say what the picture shows and mark what is redacted.
- Prose follows Google developer documentation style: second person, active voice, answer first, sentence-case headings.
