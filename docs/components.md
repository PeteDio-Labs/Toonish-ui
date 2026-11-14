# Components

Each section names the classes, the markup helper from `toonish-ui/markup` (if any), and what the component does for keyboards, screen readers and reduced motion. For tokens, see [Tokens](tokens.md). For a page built from these parts, see [Patterns](patterns.md).

Helpers return an HTML string. They escape every string you pass, throw on an unknown accent, and name what is wrong in the error message. An **accent** is one of `blue`, `red`, `yellow`, `violet`.

A class listed here as `toon-x-y` is a modifier of `toon-x` unless the text says otherwise. Internal parts, such as `toon-bar-seg`, are named so the docs check can account for them.

## Accessibility contract

This table is the contract. Every component meets it by default, and `test/browser.ts` fails the build when the fixture breaks it. [Principles](principles.md#2-accessibility-is-a-hard-rule) makes it a hard rule.

Applies to every component: the text and the focus ring meet WCAG 2.2 AA, targets are at least 24 px and the kit's own controls are 44 px, the page reflows at 320 px, nothing depends on hover or on motion, and every animation stops under `prefers-reduced-motion` and `data-motion="off"`.

| Component | Element and role | Name | Keyboard | Notes |
|---|---|---|---|---|
| `toon-btn` | `<button type="button">` or `<a>` | Its text | `Enter`, `Space` | Never a `div`. A link that looks like a button stays an `<a>`. |
| `toon-link` | `<a href>` | Its text | `Enter` | Takes the surface's text colour. Link text says where it goes. |
| `toon-skip` | `<a href="#main">` | Its text | `Enter` | First tab stop. Hidden until focused. |
| `toon-nav` | `<nav aria-label>` of links, or a `role="group"` of buttons | Required label | `Tab`, `Enter` | The current page carries `aria-current="page"`. A toggle group carries `aria-pressed`. Pills are 44 px tall. |
| `toon-pager` | `<nav aria-label>` | Required label | `Tab`, `Enter` | The arrow is `aria-hidden`; the direction and title are text. |
| `toon-modal` | Native `<dialog aria-modal aria-labelledby>` | The title | `Esc` closes, focus is trapped, focus returns to the opener | Needs a visible `Close` button, which is 44 px tall. A `toon-heading` in `toon-modal-head` is ink, because yellow on the blue bar is 1.96:1. |
| `toon-deck` | `role="group" aria-roledescription="carousel"` of `role="group" aria-roledescription="slide"` cards, labelled `n of m` | Required label | `Tab` to the buttons, `ArrowLeft` and `ArrowRight` flip | Cards below the top are `inert`. The counter is a polite live region. A swipe is never the only way: the buttons flip. |
| `toon-strip` | `<ul role="list" aria-label>` | Optional label | A linked cell is a link | The figure reads as text, with a space before its label. |
| `toon-steps` | `<ol role="list" aria-label>` | Optional label | None | The number and arrow are `aria-hidden`; the list gives the order. |
| `toon-list`, `toon-row` | `role="list"` and `role="listitem"` | Required label on the list | None | `list()` and `row()` write the roles. |
| `toon-stat`, `toon-stats` | Text in a tile | Label, value, detail in reading order | None | Do not use colour alone to rank a figure. |
| `toon-bars` | `role="list"` of `role="listitem"` columns | Required label, and a label on each column that says its numbers | None | The shapes are not the only carrier of the numbers. |
| `toon-table` | `<table>` with `<th scope>` | A caption or a label | `Tab` to the panel, then the arrow keys scroll it | The panel scrolls sideways at 320 px and is the one allowed scroll container. Give a `toon-table-wrap` that can scroll `tabindex="0"`, `role="region"` and an `aria-label`, or a keyboard cannot scroll it in every browser. |
| `toon-badge`, `toon-chip`, `toon-caption` | `<span>` | Its text | None | A count has a space before it. Not a control: use a button for something that acts. |
| `toon-shot` | `<figure>`, `<img alt>`, `<figcaption>`, a `<details>` transcript | Required `alt` | The transcript opens with `Enter` | The `alt` says what the picture shows. An empty `alt` throws. The transcript's summary is 44 px tall. |
| `toon-portrait` | `<img alt>` over an `aria-hidden` SVG | Required `alt` | None | Say who is shown and how. The helper throws on a blank `alt`. |
| `toon-sfx`, `toon-burst`, `toon-speed`, `toon-kicker-rule` | `aria-hidden="true"` | None | None | Decoration. Put the meaning in text elsewhere. |
| `toon-type`, `toon-type-comic` | Real text in one span per letter | Its text | None | The comic face is for large words only. The fill must read on its ground. |
| `toon-motion` | `<button aria-pressed>` | Its text, or an `aria-label` | `Enter`, `Space` | It lets a visitor stop motion. |

**Contrast on paper.** The fill accents are for the navy ground and for shapes. Large text on paper uses the `-text` accents. `figure()` and `strip()` do this for you.

**Heading order.** A page has one `h1`. Headings never skip a level. A comic word that acts as a heading keeps a real heading element with its text in `sr-only` when the letters would read badly.

**Focus ring.** The ring is two-tone, an ink ring against the element and a yellow ring outside it, so it keeps 3:1 on paper and on the ground. A component that throws its own shadow repeats the ink ring ahead of it. Do not remove the outline.

**Forced colours.** Under `forced-colors: active`, shadows and outlined lettering drop away and the focus ring is the system `Highlight`.

### Check a component

1. Run `bun run test:browser`. It runs axe at WCAG 2.2 AA on the fixture at 1280 and 390 px, once with the page at rest and once with the modal open. It reads the focus ring on every focusable element, checks the kit's target sizes and the heading order, and checks the skip link is the first tab stop. It prints how many rules and elements it examined.
2. Add the component to `test/fixture.ts`, so axe reads it.
3. Tab through it, then turn on VoiceOver or NVDA and listen to it once.

## Foundation

### Page and motion

- `toon-page` wraps the page and clips sideways overflow, so a decoration that pokes out cannot widen the document.
- `toon-reveal` marks a block that rises in when it scrolls into view. The script adds `toon-js` to `<html>`, then `toon-in` to the block. Without script, the block shows.
- `toon-motion` and `toon-motion-label` make the motion toggle button. The label hides on a phone and shows from `sm`.
- `toon-pop`, `toon-wiggle`, `toon-blink` and `toon-boing` are animation classes. `toon-dots` is a hook class for a halftone ground on `<body>`. The kit sets no rule on it, so the site draws the dots. Every animation stops under `prefers-reduced-motion` and `data-motion="off"`.

### Type

- `toon-type`, `toon-type-comic`, `toon-type-flat`, `toon-word`: display lettering. Helper: `letters(text, accent, { live, flat, onPaper, cls, size })`. Each letter is its own span. Plain `toon-type` is the heavy sans. `live` adds `toon-type-comic`: the Bangers face with an ink outline and a paired shadow, tilting and bobbing in turn. `onPaper` uses the deeper `-text` accent, for lettering on a paper panel. The text stays real text.
- `figure(value, accent, max, avail)` lays a number out as flat display type that shrinks to fit a card. It uses the `-text` accents, which read on paper; the fill accents do not (see [Tokens](tokens.md#colour)). `fitSize(value, max, avail)` returns that size in px.
- `toon-heading` and `toon-heading-xl` are section headings. `toon-link` is an inked link. It takes the text colour of its surface (`color: inherit`), so it reads on both paper and the ground.
- `toon-caption` is a caption box in the mono face.

## Actions and labels

### Button

`toon-btn` is the blue button. Variants: `toon-btn-red`, `toon-btn-yellow`, `toon-btn-paper`. It lifts on hover and flattens on press. Use a `<button>` for an action and an `<a>` for navigation.

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

- `toon-skip` is the skip link, off screen until it takes focus. Helper: `skipLink(target?, text?)`. Make it the first element in `<body>` and point it at the id of `<main>`.
- `toon-nav` and `toon-nav-wrap`: the top bar.
- `toon-footer`, `toon-footer-links`, `toon-footer-note`: the page footer.
- `toon-pager`, with `toon-pager-link`, `toon-pager-prev`, `toon-pager-next`, `toon-pager-arrow`, `toon-pager-text`, `toon-pager-dir`, `toon-pager-title` and `toon-pager-sep`: previous and next links in the shape of the deck's switcher. Helper: `pager({ prev, next, label })`. Each link is `{ href, title, dir? }`. Pass either link or both. The nav needs a label.

## Section structure

### Kicker

`toon-kicker` is a numbered section lead-in: a number chip (`toon-kicker-num`), a label (`toon-kicker-label`), a rule to the edge (`toon-kicker-rule`) and an optional link (`toon-kicker-link`, 44 px tall). Helper: `kicker('01', 'Featured work', { link })`.

### Strip

`toon-strip` is a row of figure cells in one bordered panel: four across, two by two on a phone. Parts: `toon-strip-cell`, `toon-strip-item`, `toon-strip-value`, `toon-strip-label`. Helper: `strip(cells, { label })`, where a cell is `{ value, label, href?, accent? }`. A cell with `href` is a link. Without `accent`, the colour cycles by cell.

### Steps

`toon-steps` is a numbered process. Parts: `toon-step`, `toon-step-num`, `toon-step-title`, `toon-step-body`, `toon-step-arrow`. It is a row from `md` and stacked below. The arrow is decorative. Helper: `steps([{ title, body }], { label })`.

## Data

None of these holds data. You pass your own.

### Stat

`toon-stat` and `toon-stats` make figure tiles, with `toon-stat-label`, `toon-stat-value` and `toon-stat-detail`. Helper: `stat(label, value, detail?)`.

### List and row

`toon-list` and `toon-row` make rows with a lead (`toon-row-lead`), a body (`toon-row-body`) and an aside (`toon-row-aside`). Add `toon-list-stack` to a list in a narrow column: each row's lead keeps its own line at every width, as it does on a phone. Helpers: `list(rows, { label, cls })` writes the container with `role="list"` and a label, and `row({ lead, title, sub, aside, dot })` writes each `role="listitem"`. Use them instead of a bullet list.

### Bars

`toon-bars` draws stacked columns with a dashed target line. Parts: `toon-bar`, `toon-bar-plot`, `toon-bar-stack`, `toon-bar-seg`, `toon-bar-total`, `toon-bar-label`, `toon-bars-target`, `toon-bars-key`. Segment tones are the badge tones plus `hatch`: `toon-bar-seg-red`, `toon-bar-seg-yellow`, `toon-bar-seg-violet`, `toon-bar-seg-paper`, `toon-bar-seg-mist`, `toon-bar-seg-hatch`. Helper: `bars({ label, columns, max?, target? })`, where a column is `{ label, sub?, segments, current? }` and a segment is `{ value, tone, label }`.

The helper scales heights to `max`, which defaults to the tallest stack or the target. It labels each column for a screen reader and throws on an empty chart. Name what each colour means with a `<ul class="toon-bars-key">`, setting `--toon-dot` on each `<i>`.

### Table

Put `<table class="toon-table">` in a `<div class="toon-table-wrap">`. The wrap is the one sideways scroll container in the kit, for a table wider than a phone. When the table can outgrow a phone, add `tabindex="0"`, `role="region"` and an `aria-label` to the wrap, so a keyboard can scroll it. Mark the current row with `aria-current`. Add `toon-table-text` when the cells hold words: they left-align and wrap.

### Empty state

`toon-empty` says that a view has nothing in it, and what to do next.

## Media

### Shot

`toon-shot` is a screenshot in a comic panel: `toon-shot-panel` holds the image, `toon-shot-badge` a corner badge, `toon-shot-cap` the caption and `toon-shot-text` a transcript in a `<details>`. Helper: `shot({ src, alt, width, height, caption, badge, accent, transcript, open, href, hrefLabel, corner, hint, eager, cls })`.

- Alt text, width and height are required. The size reserves the space so the page does not jump.
- `href` makes the whole picture a link to the full-size file (`toon-shot-link`). It requires `hrefLabel`, the link's accessible name.
- `corner` adds a second badge on the top right (`toon-shot-badge-end`), such as `1 / 4`.
- `hint` adds a "Tap to enlarge" badge (`toon-shot-hint`) that hides from `lg`.
- `transcript` renders one `<p>` per line. Pass `open: true` to show it expanded.

### Portrait

`toon-portrait` puts a cut-out person on a vector studio backdrop, with `toon-portrait-bg` for the SVG. Helper: `portrait({ src, alt, width, height, backdrop, accent, eager, cls })`. Images lazy-load unless you set `eager`. Pass a PNG or WebP with a transparent background. `backdrop` is `slate` (dark studio grey) or `paper` (the kit's cool grey). The accent colours the ring and the halftone corner. The backdrop is vector, so it stays sharp and adds no image bytes.

## Interactive

### Modal

`toon-modal` is a native `<dialog>`, with `toon-modal-box`, `toon-modal-head`, `toon-modal-body`, and `toon-modal-x` (the close button). The script sets `toon-modal-open` on `<html>` as a scroll lock while a modal is open. The browser traps focus, closes on `Esc` and makes the page behind inert.

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
