# Components

Each section names the classes, the markup helper from `toonish-ui/markup` (if any), and what the component does for keyboards, screen readers and reduced motion. For tokens, see [Tokens](tokens.md). For a page built from these parts, see [Patterns](patterns.md).

Helpers return an HTML string. They escape every string you pass, throw on an unknown accent, and name what is wrong in the error message. An **accent** is one of `blue`, `red`, `yellow`, `violet`.

A class listed here as `toon-x-y` is a modifier of `toon-x` unless the text says otherwise. Internal parts, such as `toon-bar-seg`, are named so the docs check can account for them.

## Foundation

### Page and motion

- `toon-page` wraps the page and clips sideways overflow, so a decoration that pokes out cannot widen the document.
- `toon-reveal` marks a block that rises in when it scrolls into view. The script adds `toon-js` to `<html>`, then `toon-in` to the block. Without script, the block shows.
- `toon-motion` and `toon-motion-label` make the motion toggle button. The label hides on a phone and shows from `sm`.
- `toon-pop`, `toon-wiggle`, `toon-blink`, `toon-boing`, `toon-dots` and `toon-motion` are animation hooks. Every one stops under `prefers-reduced-motion` and `data-motion="off"`.

### Type

- `toon-type`, `toon-type-comic`, `toon-type-flat`, `toon-word`: display lettering in the comic face. Helper: `letters(text, accent, { live, flat, cls, size })`. With `live`, each letter is a span that tilts and bobs in turn. The text stays real text, so a screen reader reads the word.
- `figure(value, accent, max, avail)` lays a number out as flat display type that shrinks to fit a card. `fitSize(value, max, avail)` returns that size in px.
- `toon-heading` and `toon-heading-xl` are section headings. `toon-link` is an inked link.
- `toon-caption` is a caption box in the mono face.

## Actions and labels

### Button

`toon-btn` is the blue button. Variants: `toon-btn-red`, `toon-btn-yellow`, `toon-btn-paper`. It lifts on hover, flattens on press and keeps a 44 px target. Use a `<button>` for an action and an `<a>` for navigation.

### Badge and chip

- `toon-badge` is a small label. Tones: `toon-badge-blue`, `toon-badge-yellow`, `toon-badge-violet`, `toon-badge-paper`, `toon-badge-mist`. `toon-badge-count` styles a count inside it. Helper: `badge(text, tone, count?)`.
- `toon-chip` is a neutral tag. Helper: `chip(text)`.

## Containers

### Card

`toon-card` is a paper panel with an ink border and a hard shadow. Add `toon-corner` for a corner tab, and `toon-pop` for a pop-in entrance.

### Panel, callout and frame

- `toon-panel` is a large paper section panel with a hard shadow.
- `toon-callout` and `toon-callout-yellow` hold a note that interrupts the flow.
- `toon-frame` wraps content in an inked frame, such as a terminal or a diagram.

### Bubble

`toon-bubble` is a speech bubble. `toon-bubble-left` and `toon-bubble-up` point it at a speaker beside it or above it. The default does not change.

### Tilt

`toon-tilt-l` and `toon-tilt-r` turn a block 2 degrees from `sm` up. They use the `rotate` property, so scroll reveal, `toon-pop` and a hover lift do not replace the angle.

## Navigation

- `toon-nav` and `toon-nav-wrap`: the top bar. A link keeps a 44 px target.
- `toon-footer`, `toon-footer-links`, `toon-footer-note`: the page footer.
- `toon-pager`, with `toon-pager-link`, `toon-pager-prev`, `toon-pager-next`, `toon-pager-arrow`, `toon-pager-text`, `toon-pager-dir`, `toon-pager-title` and `toon-pager-sep`: previous and next links in the shape of the deck's switcher. Helper: `pager({ prev, next, label })`. Each link is `{ href, title, dir? }`. Pass either link or both. The nav needs a label.

## Section structure

### Kicker

`toon-kicker` is a numbered section lead-in: a number chip (`toon-kicker-num`), a label (`toon-kicker-label`), a rule to the edge (`toon-kicker-rule`) and an optional link (`toon-kicker-link`). Helper: `kicker('01', 'Featured work', { link })`.

### Strip

`toon-strip` is a row of figure cells in one bordered panel: four across, two by two on a phone. Parts: `toon-strip-cell`, `toon-strip-item`, `toon-strip-value`, `toon-strip-label`. Helper: `strip(cells, { label })`, where a cell is `{ value, label, href?, accent? }`. A cell with `href` is a link. Without `accent`, the colour cycles by cell.

### Steps

`toon-steps` is a numbered process. Parts: `toon-step`, `toon-step-num`, `toon-step-title`, `toon-step-body`, `toon-step-arrow`. It is a row from `md` and stacked below. The arrow is decorative. Helper: `steps([{ title, body }], { label })`.

## Data

None of these holds data. You pass your own.

### Stat

`toon-stat` and `toon-stats` make figure tiles, with `toon-stat-label`, `toon-stat-value` and `toon-stat-detail`. Helper: `stat(label, value, detail?)`.

### List and row

`toon-list` and `toon-row` make rows with a lead (`toon-row-lead`), a body (`toon-row-body`) and an aside (`toon-row-aside`). Add `toon-list-stack` to a list in a narrow column: each row's lead keeps its own line at every width, as it does on a phone. Helper: `row({ lead, title, sub, aside, dot })`. Use it instead of a bullet list.

### Bars

`toon-bars` draws stacked columns with a dashed target line. Parts: `toon-bar`, `toon-bar-plot`, `toon-bar-stack`, `toon-bar-seg`, `toon-bar-total`, `toon-bar-label`, `toon-bars-target`, `toon-bars-key`. Segment tones are the badge tones plus `hatch`: `toon-bar-seg-red`, `toon-bar-seg-yellow`, `toon-bar-seg-violet`, `toon-bar-seg-paper`, `toon-bar-seg-mist`, `toon-bar-seg-hatch`. Helper: `bars({ label, columns, max?, target? })`.

The helper scales heights to `max`, which defaults to the tallest stack or the target. It labels each column for a screen reader and throws on an empty chart. Name what each colour means with a `<ul class="toon-bars-key">`, setting `--toon-dot` on each `<i>`.

### Table

Put `<table class="toon-table">` in a `<div class="toon-table-wrap">`. The wrap is the one sideways scroll container in the kit, for a table wider than a phone. Mark the current row with `aria-current`. Add `toon-table-text` when the cells hold words: they left-align and wrap.

### Empty state

`toon-empty` says that a view has nothing in it, and what to do next.

## Media

### Shot

`toon-shot` is a screenshot in a comic panel: `toon-shot-panel` holds the image, `toon-shot-badge` a corner badge, `toon-shot-cap` the caption and `toon-shot-text` a transcript in a `<details>`. Helper: `shot({ src, alt, width, height, caption, badge, accent, transcript, open, href, corner, hint, eager })`.

- Alt text, width and height are required. The size reserves the space so the page does not jump.
- `href` makes the whole picture a link to the full-size file (`toon-shot-link`).
- `corner` adds a second badge on the top right (`toon-shot-badge-end`), such as `1 / 4`.
- `hint` adds a "Tap to enlarge" badge (`toon-shot-hint`) that hides from `lg`.
- `transcript` renders one `<p>` per line. Pass `open: true` to show it expanded.

### Portrait

`toon-portrait` puts a cut-out person on a vector studio backdrop, with `toon-portrait-bg` for the SVG. Helper: `portrait({ src, alt, width, height, backdrop, accent })`. Pass a PNG or WebP with a transparent background. `backdrop` is `slate` (dark studio grey) or `paper` (the kit's cool grey). The accent colours the ring and the halftone corner. The backdrop is vector, so it stays sharp and adds no image bytes.

## Interactive

### Modal

`toon-modal` is a native `<dialog>`, with `toon-modal-box`, `toon-modal-head`, `toon-modal-body`, `toon-modal-x` (the close button) and `toon-modal-open` (an opener). The browser traps focus, closes on `Esc` and makes the page behind inert.

- **Inline:** put a `<dialog class="toon-modal">` in the page, and a button with `data-toon-modal-open="<dialog id>"`. A `data-toon-modal-close` button inside closes it.
- **From a page:** a link with `data-toon-modal` fetches its own `href` and shows the page's `<article>` in a shared modal. Without script the link navigates. The script drops `on*` attributes and `javascript:` URLs, but link only to your own pages: the fetched HTML is not otherwise sanitised.

### Toggle group

An element with `data-toon-toggle` is a group of buttons where one is pressed at a time. The script sets `aria-pressed` on each button and bounces the one you tapped.

### Deck

`toon-deck` is a pile of cards to flip through on a phone and a grid from `md`. Parts: `toon-deck-pile`, `toon-deck-card`, `toon-deck-controls`, `toon-deck-btn`, `toon-deck-count`. Helper: `deck(cards, { label, always, cols, prevLabel, nextLabel })`.

- A swipe left goes to the next card and a swipe right to the previous one. Both wrap. A vertical drag still scrolls the page (`touch-action: pan-y`).
- Cards under the top one are `inert`. The counter is a polite live region. The arrow keys flip from a focused control.
- Without script the cards are a plain list and the controls stay hidden.
- `always` keeps the pile at every width. `cols` sets the grid columns from `md`.
- `deck()` does not escape the card HTML, because a card is markup you wrote. Escape any text you put in one.

## Decoration

All decoration is `aria-hidden`.

- `toon-burst`, `toon-burst-hero`, `toon-burst-spin`: an SVG starburst. Helper: `burst(accent, cls)`.
- `toon-speed`, `toon-speed-hero`, `toon-speed-line`: a fan of yellow speed lines behind a panel. Helper: `speedLines(cls)`. Yellow, because ink vanishes on the navy ground.
- `toon-sfx`, `toon-sfx-sm`, `toon-sfx-lg`, `toon-sfx-ghost`, `toon-sfx-corner`: floating sound-effect lettering. Helper: `sfx(text, accent, { size, ghost, corner })`.
  - Each letter has its own turn, rise and size, derived from its index, so the same word always letters the same way.
  - You position it with `absolute` inside a `relative` parent. `toon-sfx-corner` instead pins it as a sticker to the top right corner at every width.
  - `toon-sfx-ghost` is outline only, for sitting behind content.
  - Use Latin letters. Do not use katakana or a specific manga's glyphs.
  - The drift stops under reduced motion and `data-motion="off"`. The letters keep their turn.
