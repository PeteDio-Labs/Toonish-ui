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
| `toon-list`, `toon-row` | `role="list"` and `role="listitem"` | Required label on the list | None | `list()` and `row()` write the roles. An optional `toon-row-icon` is `aria-hidden`. |
| `toon-stat`, `toon-stats` | Text in a tile | Label, value, detail in reading order | None | Do not use colour alone to rank a figure. |
| `toon-bars` | `role="list"` of `role="listitem"` columns | Required label, and a label on each column that says its numbers | None | The shapes are not the only carrier of the numbers. |
| `toon-table` | `<table>` with `<th scope>` | A caption or a label | `Tab` to the panel, then the arrow keys scroll it | The panel scrolls sideways at 320 px and is the one allowed scroll container. Give a `toon-table-wrap` that can scroll `tabindex="0"`, `role="region"` and an `aria-label`, or a keyboard cannot scroll it in every browser. |
| `toon-badge`, `toon-chip`, `toon-caption` | `<span>` | Its text | None | A count has a space before it. Not a control: use a button for something that acts. |
| `toon-shot` | `<figure>`, `<img alt>`, `<figcaption>`, a `<details>` transcript | Required `alt` | The transcript opens with `Enter` | The `alt` says what the picture shows. An empty `alt` throws. The transcript's summary is 44 px tall. |
| `toon-portrait` | `<img alt>` over an `aria-hidden` SVG | Required `alt` | None | Say who is shown and how. The helper throws on a blank `alt`. |
| `toon-sfx`, `toon-burst`, `toon-speed`, `toon-kicker-rule` | `aria-hidden="true"` | None | None | Decoration. Put the meaning in text elsewhere. |
| `toon-type`, `toon-type-comic` | Real text in one span per letter | Its text | None | The comic face is for large words only. The fill must read on its ground. |
| `toon-delta` | `<span role="img" aria-label>` | "up 4 points", "down 32 percent" or "no change" | None | The glyph and the signed number are visible text, so direction is never colour alone. |
| `toon-scale` | `<span role="img" aria-label>` | Required label that says the score and the move | None | The graphic carries no other meaning: the score and delta also appear as text in the row. Every part is a span, so it can sit in a button. |
| `toon-meter`, `toon-meters` | `role="meter"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-valuetext` and `aria-labelledby` the visible label; `meters()` is `role="list"` | The label, and the label on the list is required | None | The printed value is `aria-hidden`, because `aria-valuetext` says it. A sub line is the description. |
| `toon-tabbar` | `<nav aria-label>` around `role="tablist"`; `role="tab"` links with `aria-selected` and `aria-controls`; `role="tabpanel"` panels with `aria-labelledby` | Required label | `Tab` to the selected tab, `ArrowLeft`, `ArrowRight`, `Home`, `End` move and select | Tabs are 48 px tall and 44 px wide. Icons are `aria-hidden`. Without script, every panel shows and the tabs are in-page links. |
| `toon-disclosure` | `role="listitem"` with a `<button aria-expanded aria-controls>` and a panel with `hidden`; or `<details>` with `<summary>` | The row's text, which includes the lead, title, value and delta | `Enter`, `Space` | The row is 44 px tall. A chevron shows the state as well as the tint. `ownerLabel` says the owner aloud. |
| `toon-spark` | `<svg role="img" aria-label>` | Your label, then "Trend from 73 to 82 over 8 readings" | None | Drawn for paper. Put the figure beside it as text. |
| `toon-verdict` | A `<div>` of paragraphs, or a heading for the title when you pass `heading` | The state word, then the answer | None | The state is a glyph and a word. The fill backs it up. `unknown` is dashed and never reads as ok. |
| `toon-build` | `<aside aria-label="Build">` | The environment and the short hash, as one line | None | One mono line at the end of the page, in the flow. Drawn only for a non-production build. |
| `toon-readout` | `<p>` | Its label, then its text | None | Paper text at 15 px on the ground. Do not dim it or shrink it. |
| `toon-toggle` | `<button role="switch" aria-checked aria-label>` | Required label that says what "on" means | `Enter`, `Space` | 44 px tall. The side words are `aria-hidden`, because the label and the checked state say them. Disabled is `aria-disabled` with a visible reason, so it keeps focus. |
| `toon-switch-card` | `role="group"` named by the service, with two `<button aria-pressed>` | The side, its state and "Serving" | `Enter`, `Space` | Each button is 72 px tall. A refused side is `aria-disabled` and points to the visible reason. Text is ink on every fill. |
| `toon-settings` | `<details>` with a `<summary aria-label>` and a `<nav aria-label>` of links; the gears are `aria-hidden` | The control's label, "Settings" by default | `Enter` or `Space` opens it, `Escape` closes it and returns focus to the button | The button is 48 px and each item 44 px tall. It opens without script. The gears turn while it is hovered, focused or open, and reduced motion stops them. |
| `toon-masthead` | `<header>` with the page's `<h1>` | The title | None | The lettering is `aria-hidden` and an `sr-only` span carries the title. |
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
- `toon-pop`, `toon-wiggle`, `toon-blink` and `toon-boing` are animation classes. `toon-dots` on `<body>` draws a halftone ground: faint white dots on a fixed layer behind the page, fading out down the screen. The dots are decoration and sit at 7% white, so text keeps its contrast. Raised surfaces (`toon-card`, `toon-panel`, `toon-frame`, `toon-list`, `toon-strip`, `toon-nav`, `toon-btn`, `toon-pager-link`, `toon-stat`, `toon-table-wrap`, `toon-switch-card`, `toon-bubble`) also cast a soft blurred shadow, because the near-black outline and hard shadow barely show on the navy ground. Add `toon-flat` to one element to turn the blur off. Every animation stops under `prefers-reduced-motion` and `data-motion="off"`.

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

`toon-kicker` is a numbered section lead-in: a number chip (`toon-kicker-num`), a label (`toon-kicker-label`), a rule to the edge (`toon-kicker-rule`) and an optional link (`toon-kicker-link`, 44 px tall). Helper: `kicker('01', 'Featured work', { link, heading })`. Pass `heading: 3` to make the label an `h3`, so the section shows in the page outline. The number chip is then `aria-hidden`.

### Strip

`toon-strip` is a row of figure cells in one bordered panel: four across, two by two on a phone. Parts: `toon-strip-cell`, `toon-strip-item`, `toon-strip-value`, `toon-strip-label`. Helper: `strip(cells, { label })`, where a cell is `{ value, label, href?, accent? }`. A cell with `href` is a link. Without `accent`, the colour cycles by cell.

### Steps

`toon-steps` is a numbered process. Parts: `toon-step`, `toon-step-num`, `toon-step-title`, `toon-step-body`, `toon-step-arrow`. It is a row from `md` and stacked below. The arrow is decorative. Helper: `steps([{ title, body }], { label })`.

## Data

None of these holds data. You pass your own.

### Stat

`toon-stat` and `toon-stats` make figure tiles, with `toon-stat-label`, `toon-stat-value` and `toon-stat-detail`. Helper: `stat(label, value, detail?)`.

### List and row

`toon-list` and `toon-row` make rows with a lead (`toon-row-lead`), a body (`toon-row-body`) and an aside (`toon-row-aside`). Add `toon-list-stack` to a list in a narrow column: each row's lead keeps its own line at every width, as it does on a phone. Helpers: `list(rows, { label, cls })` writes the container with `role="list"` and a label, and `row({ lead, title, sub, aside, dot, leadTone, icon })` writes each `role="listitem"`. Use them instead of a bullet list.

`sub` sits on its own line under the title. `leadTone` is a `Tone` that draws a small dot before the lead in that colour. Without it the lead has no dot. `aside` is bold mono type.

`icon` is one inline `<svg>` about 48 px square, drawn by the caller. The helper puts it in `toon-row-icon`, hides it from a screen reader (`aria-hidden`), and throws when the markup is not a single `<svg>` or holds a script, `foreignObject`, event attribute or `javascript:` link. The icon is decoration, so the row's text must say everything the icon does. Give the row an aside that tells a reader one fact, such as a number or a state: on a phone it sits under the body, and from `sm` it sits at the end of the row. Animate an icon with CSS that you scope to `prefers-reduced-motion: no-preference`; the kit also stops animation when the motion switch is off.

`button({ label, href, kind, icon, iconPosition, direction, type, full, cls, attrs })` writes a `toon-btn` as an `<a>` (with `href`) or a `<button>`. `kind` is `primary` (blue), `secondary` (paper), `accent` (yellow) or `danger` (red). `icon` is a built-in name (`arrow-left`, `arrow-right`, `plus`, `check`, `external`) or your own inline `<svg>`, and `iconPosition` puts it at the `start` or the `end`. `direction: 'back'` puts a left arrow before the label, and `direction: 'next'` puts a right arrow after it. The icon is `aria-hidden`, so the label must say what the button does. `attrs` carries `data-*` and `aria-*` attributes only; every other name is refused. An `href` that starts with `//` is refused. An inline icon may hold only drawing elements (`svg`, `g`, `path`, `circle`, `ellipse`, `rect`, `line`, `polyline`, `polygon`, `defs`, gradients, `stop`, `title`) and no `href`, `style`, event attribute or character reference. The helper adds `toon-btn-icon` (the flex row), `toon-btn-ico` (the icon's box), `toon-btn-back` or `toon-btn-next` (the nudging arrow) and `toon-btn-full` (the full-width button). A button has an inner lower edge so it does not read as a card of the same colour. Every button that can act hops now and then, and a back or next button nudges its arrow. A button with `aria-disabled="true"` or `disabled` stays still, and reduced motion or the motion switch stops all of it.

### Bars

`toon-bars` draws stacked columns with a dashed target line. Parts: `toon-bar`, `toon-bar-plot`, `toon-bar-stack`, `toon-bar-seg`, `toon-bar-total`, `toon-bar-label`, `toon-bars-target`, `toon-bars-key`. Segment tones are the badge tones plus `hatch`: `toon-bar-seg-red`, `toon-bar-seg-yellow`, `toon-bar-seg-violet`, `toon-bar-seg-paper`, `toon-bar-seg-mist`, `toon-bar-seg-hatch`. Helper: `bars({ label, columns, max?, target? })`, where a column is `{ label, sub?, segments, current? }` and a segment is `{ value, tone, label }`.

The helper scales heights to `max`, which defaults to the tallest stack or the target. It labels each column for a screen reader and throws on an empty chart.

- `barsKey(items, { label })` writes the key, where an item is `{ label, tone }`. A `hatch` entry draws the hatch of its segment (`toon-bars-key-hatch`), so the key matches the bars.
- `chartTable({ caption, head, rows, summary })` writes the numbers as a `toon-chart-table`: a `<details>` whose toggle is 44 px tall, around a `toon-table` in a `toon-table-wrap` that a keyboard can scroll. The first cell of each row is its heading. Every `bars()` chart needs one, because the shapes alone do not say the numbers.

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

## Desk components

Six parts for pages that track values over time: a board of calls, a likelihood gauge, a tab bar and a trend. They share four rules.

- **Direction is never colour alone.** Every up or down shows a ▲ or ▼ and a signed number. Colour backs it up: toward is red, away is blue and flat is muted (mist on the ground).
- **Two owners.** `owner` is `a` or `b`, written as `toon-owner-a` or `toon-owner-b`. Owner `a` is ink with a solid dot. Owner `b` is violet with a dot inside an ink ring, so the shape changes with the colour. The helper throws on any other value.
- **The scale is 0 to 100.** A helper throws on `NaN` and on a value outside its range. Pass `clamp: true` to clamp instead.
- **Text on paper uses the `-text` accents.** Fills stay on shapes. Inside a disclosure row, accent text mixes toward ink, so it keeps 4.5:1 on the hover and open tint.

### Delta

`toon-delta` is a signed change such as `▲ 4`, `▼ 32` or `· 0`. Modifiers: `toon-delta-up`, `toon-delta-down`, `toon-delta-flat`, `toon-delta-invert` and `toon-delta-ground`. Helper: `delta(n, { unit, invert, ground })`.

- On paper, up is `red-text`, down is `blue-text` and flat is `muted`. `ground` uses `red`, `blue` and `mist` for the navy ground.
- `invert` swaps the colours for a measure where down is good. The glyph still says which way it moved.
- `aria-label` says "up 4 points". A `unit` of `%` says "percent", and another unit is spoken as written.

### Scale

`toon-scale` is a 0 to 100 track with one current marker, faint dots for past values and a segment for the latest move. Parts: `toon-scale-tick`, `toon-scale-past`, `toon-scale-move`, `toon-scale-move-up`, `toon-scale-move-down`, `toon-scale-mark`, `toon-scale-axis` and `toon-scale-empty`. Helpers: `scale({ value, history, owner, ticks, label, clamp })` and `scaleAxis()`.

- `history` holds past values, oldest first. The last entry is the previous value, and the move segment runs from it to `value`: red when the value rose, blue when it fell.
- `label` is required, for example "P-01 scores 82, up 4 from 78". The helper throws when it is blank.
- `value: null` draws a dashed `toon-scale-empty` track for an item with no score.
- The marker is 16 px with a 2 px ink border and a 2 px yellow shadow. It is ink for owner `a` and violet for owner `b`.
- The track keeps 10 px at each end, so a value of 0 or 100 cannot widen the page at 320 px.
- `scaleAxis()` writes the 0, 25, 50, 75 and 100 labels, with the first at the left edge and the last at the right edge. It is `aria-hidden`.
- On first render the marker slides from the previous value to the current one and the move segment grows. Both stop under reduced motion.

### Meter

`toon-meter` is a bar for one value out of a maximum. Parts: `toon-meter-name`, `toon-meter-label`, `toon-meter-sub`, `toon-meter-bar`, `toon-meter-fill`, `toon-meter-value`, `toon-meter-scale`, `toon-meter-lg`. Fill tones: `toon-meter-fill-red`, `toon-meter-fill-yellow`, `toon-meter-fill-violet`, `toon-meter-fill-mist`, `toon-meter-fill-green`. Use `green` only for a count of ok things. `toon-meters` and `toon-meters-item` make a list with ink dividers, for use inside a card. Helpers: `meter({ label, value, max, tone, size, sub, scaleLabels, valueText, clamp, id })` and `meters(items, { label, cls })`.

- A phone shows two lines: the label, then the bar and the value. From `sm` it is one row (`120px 1fr 3ch`).
- `size: 'lg'` makes the bar 16 px and the number larger. `scaleLabels` adds a row of labels under it, such as "0 · coincidence".
- `valueText` replaces the printed number and the spoken value, such as "~7%".
- `meter()` generates the ids that tie the label to the bar. Pass `id` for stable output.
- `meters()` takes options or markup from `meter()`, and writes `role="list"` with a required label.
- The fill grows from 0 when it appears, including when a closed panel opens. It stops under reduced motion.

### Tab bar

`toon-tabbar` is a bottom tab bar for a single-page app with two to five sections. Parts: `toon-tablist`, `toon-tab`, `toon-tab-icon`, `toon-tab-label`, `toon-tabpanel` and `toon-tabbar-top`. Helpers: `tabbar(tabs, { label, selected, top, cls })`, where a tab is `{ id, label, icon? }`, and `tabpanel(id, html, cls?)`.

- The bar is fixed to the bottom of the page. `toon-tabbar-top` makes it a sticky row of pills from `md`.
- The kit exports `--toon-tabbar-h`, the bar's height with the safe area. Give the page `padding-bottom: var(--toon-tabbar-h)`. It is `0px` for a top bar from `md`. The kit also sets `scroll-padding` so a focused element does not sit under the bar.
- `icon` is an SVG you trust.
- The script wires `[data-toon-tabs]`. A click switches panels and scrolls to the top. `ArrowLeft`, `ArrowRight`, `Home` and `End` move between tabs and select them, and the tab stop roves. The selected tab is kept in `location.hash`, so a reload or a link opens it, and Back goes to the previous tab. A modified click still opens a new tab.
- Without script, every panel shows and each tab is an in-page link. A link to an element inside a hidden panel does not open it: link to the tab's id.
- `tabpanel()` sets `tabindex="0"`, so a keyboard can reach a panel with nothing focusable in it.
- The selected tab bounces with `toon-boing`, which stops under reduced motion.

### Disclosure

`toon-disclosure` is a list row that opens to show detail. Put rows in `list()`. Parts: `toon-disclosure-btn`, `toon-disclosure-lead`, `toon-disclosure-title`, `toon-disclosure-sub`, `toon-disclosure-value`, `toon-disclosure-below`, `toon-disclosure-panel`, `toon-disclosure-owner`, `toon-disclosure-h`, `toon-disclosure-details`. Helper: `disclosure({ id, lead, title, sub, badge, value, note, delta, tone, below, panel, open, owner, ownerLabel, native, heading })`.

- `sub` is a line of plain words under the title that says what the row means. It is muted subhead type, wraps, and sits between the title and `below`. Use it so a closed row is informative without opening it.
- `note` is a short text at the end of the line, such as "15 hours ago" (`toon-disclosure-note`). It is small bold mono type, and it does not wrap from 640 px. `tone` is a `Tone` that colours the lead's dot (default ink, or violet for owner `b`). Below 640 px the value or note, the delta and the chevron sit on the lead line, so the title and `sub` get the full width; from 640 px they sit at the end of the title line. `value` is sized for a figure, so do not pass words to it. Pass one or the other.
- `id` names the panel, and the button takes `<id>-btn`. `lead` is a mono id such as "P-01" in the owner colour. `lead` and `title` are required.
- `badge` is text or `{ text, tone }`, and `delta` is a number or `{ value, unit, invert }`. `below` and `panel` are markup you trust and are not escaped. Escape any text you put in them.
- `below` is a full-width slot under the line, for example a `scale()`.
- By default the row is a `<button>` with `aria-expanded` and `aria-controls`, and the panel uses `hidden`. The script toggles it. `native: true` writes `<details>` and `<summary>` with the same classes, and needs no script.
- `heading` wraps the button in a heading of that level. It is not available with `native`.
- `ownerLabel` says the owner aloud, such as "Pedro". The dot and colour show it to the eye.
- From `sm` the panel indents to the title column. On a phone it is full width. The panel slides in over `duration.normal`, unless motion is reduced.

Slots in the panel, all optional, in this order:

1. A status chip: `toon-chip`, which takes a paper fill and a violet shadow here.
2. Body text.
3. `toon-meters`.
4. `toon-kv`: a `<dl>` with `dt` in uppercase mono 12 px `muted` and `dd` in body text. Put `toon-kv-warn` on a `dt` for `red-text`.
5. `toon-note`: a dated update log in a pale yellow box with a 2 px ink border and a 3 px yellow shadow. The fill is `yellow` at 20% over white, so the kit adds no new colour.
6. `toon-meta`: an uppercase mono 12 px line such as "Last revised 16 Nov".

### Spark

`toon-spark` is a small inline trend: a 2 px ink line, a dot per reading and a ringed last dot in the accent. Sizes: `toon-spark-sm` (64 by 20) and `toon-spark-lg` (120 by 32). A dashed baseline marks a `target` (`toon-spark-target`). Helper: `spark(values, { min, max, accent, target, label, size, clamp })`.

- It throws on fewer than two values and on a blank label.
- `aria-label` is your label followed by "Trend from 73 to 82 over 8 readings".
- It is drawn in ink, for paper.

## Dashboard components

Four parts for a status dashboard: an uptime strip, a line chart, a status tile and a service switch row. They follow the desk rules above, and add these.

- **Put them on paper.** Draw each one inside a `toon-card` or another paper surface. Their text and strokes are ink and the deeper `-text` accents, which fail contrast on the navy ground.
- **Colour is never the only cue.** A glyph (`✓`, `!`, `✕`, `?`), a height, a hatch, a dash pattern, a marker shape or a word says the same thing.
- **`unknown` is a state, and it never reads as ok.** Every state count includes it.
- **Every chart has a text equivalent.** The line chart carries a table. The uptime strip is a list of spoken cells with a summary line. For `bars()`, write your own `<details>` table.
- **Times are ISO 8601 strings,** printed in UTC as "Nov 16 14:02 UTC".

### Uptime

`toon-uptime` is one cell per interval, oldest first. Parts: `toon-uptime-cells`, `toon-uptime-cell`, `toon-uptime-ok`, `toon-uptime-down`, `toon-uptime-unknown`, `toon-uptime-ends`, `toon-uptime-summary`, `toon-uptime-keys`, `toon-uptime-key`, `toon-uptime-key-down`, `toon-uptime-key-unknown`. Helper: `uptime({ label, windowLabel, cells })`, where a cell is `{ at, state, detail }` and `state` is `ok`, `down` or `unknown`.

- An ok cell is solid green (`green-text`) and full height. A down cell is red with an ink hatch. An unknown cell is short, empty and outlined.
- The list is `role="list"` and each cell is a `listitem` with a spoken label such as "Nov 16 02:00 UTC: down. timeout after 5 s".
- The summary line reads "90 of 96 intervals ok, 1 down, 5 unknown". It leaves out a zero count.
- The strip fills its container and the cells share it, so 96 cells fit at 320 px. The helper throws above 150 cells: group the readings into longer intervals.

### Line chart

`toon-line` is a line chart of one to four series. Its axis labels are 14 units in a 320-unit view box, so they draw at 12 px or more while the chart is at least 275 px wide. Parts: `toon-chart`, `toon-chart-title`, `toon-chart-unit`, `toon-chart-cap`, `toon-line-svg`, `toon-chart-key`, `toon-chart-swatch`, `toon-chart-name`, `toon-chart-end`, `toon-chart-at`, `toon-chart-table`. Helper: `line({ label, series, yUnit, target, min, max, tableLabel })`, where a series is `{ name, points }` and a point is `{ x, y }`.

- Each series has its own colour, dash pattern and marker shape (circle, square, triangle, diamond). The key repeats all three.
- The key prints each series' latest value and its time, so the chart needs no hover.
- Points sit on an even category axis with one slot per distinct `x`. When every `x` is an ISO time the slots run oldest first, and other labels keep the order you give them. A series with no point at an `x` breaks there. Markers show on every point up to 12 readings, and beyond that on the last point and on any point with no neighbour.
- `min` defaults to 0 and a lower value throws. `max` defaults to the largest value or `target`, rounded up.
- `target` must be at least `min`. It draws a dotted ink line and a row in the table.
- The SVG is `role="img"` and its label gives each series' first, last, lowest and highest value. The `<details>` table has the same numbers, with a visible toggle that is 44 px tall.
- The SVG is at most 560 px wide.

### Status tile

`toon-tile` is a figure with a state. Parts: `toon-tiles`, `toon-tile-ok`, `toon-tile-warn`, `toon-tile-down`, `toon-tile-unknown`, `toon-tile-label`, `toon-tile-value`, `toon-tile-none`, `toon-tile-state`, `toon-tile-detail`, `toon-tile-read`, `toon-tile-sr`. Helper: `statusTile({ label, value, state, delta, readAt, readAtText, detail, extra })`. Put tiles in `<div class="toon-tiles">`.

- The state line is a glyph and a word: "✓ Ok", "! Warning", "✕ Down" or "? Unknown". An ok tile has a green shadow and `green-text` for its state. An unknown tile has a dashed border.
- Leave `value` out only for `unknown`. The tile prints "—" and says "no reading" aloud.
- `readAt` prints "Read Nov 16 14:02 UTC" in a `<time>` element. `readAtText` replaces it with your own text, such as "4 min ago".
- `delta` is a number or the options of `delta()`. `extra` is markup you trust, such as a `spark()`. It is not escaped.

### Switch row

`toon-switch-row` shows a service that runs in the lab or in the cloud, with both sides next to each other. Parts: `toon-switch-head`, `toon-switch-name`, `toon-switch-host`, `toon-switch-tags`, `toon-switch-sides`, `toon-switch-side`, `toon-switch-side-on`, `toon-switch-where`, `toon-switch-state`, `toon-switch-ok`, `toon-switch-down`, `toon-switch-unknown`, `toon-switch-age`, `toon-switch-serving`, `toon-switch-btn`, `toon-switch-reason`. Helper: `switchRow({ name, hostname, active, labState, cloudState, labAge, cloudAge, dataClass, pinned, canSwitch, reason, buttonLabel, action, control, labels, id })`.

- The serving side has a solid border and the word "Serving". The other side is dashed. Each side shows a glyph and "Up", "Down" or "Unknown", and the age of its reading.
- The button carries `data-toon-switch` (the name) and `data-toon-switch-to` (`lab` or `cloud`). The kit attaches no handler: you listen for a click on `[data-toon-switch-to]`.
- `control: 'toggle'` draws a [toggle](#toggle) in place of the button, checked when the cloud serves. It carries the same `data-toon-switch` attributes. `labels` renames the sides, such as `{ lab: 'Lab' }`.
- `reason` shows under the row whenever you pass it, and the control points to it with `aria-describedby`. Use it while a switch is allowed to say what it waits for.
- When `canSwitch` is false, `reason` is required. The button gets `aria-disabled="true"` and `aria-describedby` pointing at the visible reason. It stays focusable, and the kit script drops its click before your handler sees it.
- `action` is markup you trust, in place of the default button. You then own its disabled state: give it `aria-disabled="true"`, `data-toon-switch-to` and `aria-describedby="<id>-reason"` when `canSwitch` is false. `dataClass` is a chip and `pinned` adds a "Pinned" badge.

## Answer first

Four parts for a view that answers one question. Lead with the `verdict()`, put the evidence under it, and end with a `readout()`. [Patterns](patterns.md#dashboard) shows the order.

### Verdict

`toon-verdict` is the answer a view leads with. Parts: `toon-verdict-state`, `toon-verdict-title`, `toon-verdict-body`. States: `toon-verdict-ok`, `toon-verdict-warn`, `toon-verdict-down`, `toon-verdict-unknown`. Helper: `verdict({ state, title, body, stateText, heading, id, cls })`.

- The state line is a glyph and a word: "✓ Ok", "! Warning", "✕ Down" or "? Unknown". `stateText` replaces the word, such as "Needs you".
- `title` is the answer in one short sentence. `body` is one or two sentences under it.
- Ok is green, a warning is yellow and down is red, each with ink text. Unknown is a dashed paper panel, so it never reads as ok.
- `heading` makes the title a heading of that level. Without it the title is a paragraph.

### Readout

`toon-readout` says what a view read: counts, the age of the read and the source. Parts: `toon-readout-label`, `toon-readout-text`. Helper: `readout(text, { label, onPaper, cls })`.

- It sits on the navy ground: paper text at 15 px with a 1.55 line height and a 62-character measure, under a yellow mono label. The label defaults to "What was read".
- `onPaper` adds `toon-readout-paper` for a paper surface, where the label and the rule are ink.
- It is the last line of a section. Position and size rank it below the answer. Do not lower its opacity or shrink it below 15 px: a line that is hard to read is not quiet, it is unread.

### Build badge

`toon-build` names the build on a staging page. Helper: `buildBadge({ env, sha })`. The helper returns an empty string when `env` is empty, `production` or `prod`, so a page passes its build-time variables and production ships nothing.

- Pass `process.env.BUILD_ENV` and the commit hash at build time. A staging build sets `BUILD_ENV=staging`, and a local run sets it by hand. Do not detect staging from the URL.
- The hash is hex, 7 to 40 characters, and the line shows the first 7. A malformed hash throws.
- The `<aside>` is a labelled complementary landmark, so a page with its own site footer has no duplicate landmark. Put it last in `<body>`, outside `<main>`. It sits in the flow after the last content, so it never covers a control. `data-toon-build` carries the environment for a test.
- Components: `toon-build` holds the line, and its `<code>` holds the hash.

### Toggle

`toon-toggle` is a two-state switch between two visible words. Parts: `toon-toggle-row`, `toon-toggle-side`, `toon-toggle-side-on`, `toon-toggle-thumb`. Helper: `toggle({ label, checked, off, on, disabled, describedBy, id, attrs })`.

- The control is a `<button role="switch">`, 44 px tall. `label` is its accessible name and says what "on" means, such as "Authentik: run on cloud".
- `off` and `on` are the visible words. The side that is on is bold and underlined and the thumb sits next to it, so the state is never colour alone.
- The kit attaches no handler and does not flip the state. Listen for a click, and render it again with the new `checked` when the change has happened.
- `disabled` sets `aria-disabled="true"`: the control turns dashed and hollow, keeps focus, and the kit script drops its click. Point `describedBy` at the id of the visible reason.
- `attrs` adds `data-*` attributes for your handler. Any other attribute name throws.
- It is drawn for paper.

### Settings

`toon-settings` is the settings control: a button of two meshing gears that opens a short list of links. Parts: `toon-settings-btn`, `toon-settings-panel`, `toon-settings-item`, `toon-gears`, `toon-gears-always`, `toon-gear`, `toon-gear-big`, `toon-gear-small`. Helpers: `settingsMenu({ label, items, id, spin, cls })` and `gears({ spin, cls })`.

- `settingsMenu()` returns a `<details>`, so it opens and closes without script. The script closes it on `Escape`, on a tap outside it and when you choose an item.
- `items` is `{ label, href, current? }[]`. Use a `#hash` href to stay on the page. An href that is not a hash, a path, a query or an http(s), mailto or tel link throws, after tabs, newlines and control characters are removed as a browser removes them.
- `gears()` draws the icon alone: a large gear and a small one that turn in opposite directions. It is `aria-hidden`, so name the control that holds it.
- `spin` is `active` (the default: the gears turn while the control is hovered, focused or open) or `always`.
- The gears use the kit's motion rules. The system's reduced-motion setting stops them unless the visitor chose motion on.
- Put it in a header. The panel hangs from the right edge of the button.

### Switch card

`toon-switch-card` is a service that runs on one of two sides, drawn as two buttons. Use it in place of `switchRow()` when the page is for acting, not for reading. Parts: `toon-switch-card-head`, `toon-switch-card-name`, `toon-switch-card-tags`, `toon-switch-card-sides`, `toon-switch-card-side`, `toon-switch-card-ok`, `toon-switch-card-down`, `toon-switch-card-unknown`, `toon-switch-card-where`, `toon-switch-card-state`, `toon-switch-card-serving`, `toon-switch-card-reason`. Helper: `switchCard({ name, active, labState, cloudState, canSwitch, reason, dataClass, pinned, labels, id })`.

- Each side is a `<button aria-pressed>` that says its side and its state with a glyph and a word: "✓ Up", "✕ Down" or "? Unknown".
- The side that serves is pressed and says "Serving". Its fill is green when it is up, red when it is down and mist when it is unknown.
- The other side is a raised white button. A click on it asks for the switch. When `canSwitch` is false it is dashed and flat, carries `aria-disabled="true"`, and points to `reason`, which is then required.
- `reason` is one short sentence under the buttons. Pass it while a switch is allowed to say what the switch waits for.
- Both buttons carry `data-toon-switch` (the name). Only the idle side carries `data-toon-switch-to` (`lab` or `cloud`), so a click handler on `[data-toon-switch-to]` never asks for the side that already serves. The kit attaches no handler. The kit script drops a click on an `aria-disabled` side.
- `labels` renames the sides. `dataClass` is a chip and `pinned` adds a badge.

### Masthead

`toon-masthead` is the header of an app page. Parts: `toon-masthead-eyebrow`, `toon-masthead-title`, `toon-masthead-lede`, `toon-masthead-sr`. Helper: `masthead({ title, accent, eyebrow, lede, cls })`.

- `title` is the page's `h1`, lettered in the comic face. The lettering is `aria-hidden` and an `sr-only` span carries the text, so a screen reader hears one word group, not letters.
- `eyebrow` is a `toon-caption` box above the title. `lede` is one line that says what the page is for.

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
