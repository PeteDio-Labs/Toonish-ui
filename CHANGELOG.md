# Changelog

All notable changes to this project are in this file. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and the project uses [semantic versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Accessibility as a hard rule, in code, tests and docs. An axe check at WCAG 2.2 AA runs in `test/browser.ts` on the fixture at both widths, with checks for the focus ring, target size, heading order and the skip link. `docs/components.md` carries the contract per component.
- `list()`, `skipLink()` and `toon-skip`; the `-text` accent tokens and `HEX_TEXT`, which read on paper; and `letters(..., { onPaper })`.
- Forced-colours support: a visible focus ring, and plain lettering.
- Design docs in `docs/`: principles, tokens, components, patterns and build and deploy, with a decision log, plus `CONTRIBUTING.md`. `test/docs.test.ts` fails when a `toon-*` class or markup helper is missing from `docs/components.md`.
- `portrait()` and `toon-portrait`: any cut-out person (transparent PNG or WebP) on a themed vector studio backdrop, `slate` or `paper`, with a halftone corner and ring in an accent colour.
- Three colour tokens: `muted` (secondary text on paper), `mist` (secondary text on the ground, and the quiet fill for a closed or inactive state) and `rule` (grid lines and the current-row fill on paper). Tests check their contrast.
- Data components: `toon-stat` and `toon-stats` (figure tiles), `toon-list` and `toon-row` (rows with a lead, a body and an aside), `toon-chip`, `toon-empty`, `toon-table` in a `toon-table-wrap` panel, and `toon-bars` (stacked columns with a dashed target line).
- `toon-table-text`, a table modifier for words: left-aligned cells that wrap, with the first column in bold.
- Badge modifiers `toon-badge-paper` and `toon-badge-mist`, and `toon-badge-count` for a count inside a badge.
- `badge()`, `chip()`, `stat()`, `row()` and `bars()` in `toonish-ui/markup`. `bars()` computes segment heights and the target position, labels each column for a screen reader, and throws on an empty chart.

- Landing-page components: `toon-kicker` (a numbered section lead-in with a rule and an optional link), `toon-strip` (figure cells in one bordered panel, four across and two by two on a phone, each cell optionally a link), `toon-steps` (numbered panels with an arrow between them, a row from `md` and stacked below), and `toon-panel` (a large paper section panel with a hard shadow).
- `toon-bubble-left` and `toon-bubble-up`, tail variants that point a bubble at a speaker beside or above it. The default bubble does not change.
- `toon-tilt-l` and `toon-tilt-r`, a 2 degree turn from `sm` up. They use the `rotate` property, so scroll reveal, `toon-pop` and a hover lift do not replace the angle.
- `toon-list-stack`: a `toon-list` in a narrow column keeps each row's lead on its own line at every width.
- `toon-sfx-corner` and the `corner` option of `sfx()`: the word sits as a sticker on the top right corner of a `relative` parent, at the same place on a phone and a desktop.
- `toon-sfx`, floating sound-effect lettering in the comic face: each letter has its own turn, rise and size, derived from its index so the build is reproducible, and drifts in turn. It is decoration (`aria-hidden`, no pointer, no selection) and you position it. `toon-sfx-sm`, `toon-sfx-lg` and `toon-sfx-ghost` (outline only, for sitting behind content) modify it. The drift stops under reduced motion and `data-motion="off"`, and the letters keep their turn.
- `kicker()`, `strip()`, `steps()` and `sfx()` in `toonish-ui/markup`. Each escapes its input and throws on an empty list or a blank label.
- `toon-deck`, a pile of cards you flip through on a phone. Without script the cards are a plain list, and from `md` they are a grid. The script (`data-toon-deck`) stacks them in one grid cell, with the two under the top card peeking out and turned a few degrees, and adds a previous button, a counter and a next button. A sideways swipe flips the top card away, a vertical drag still scrolls the page (`touch-action: pan-y`), and a tap on a link in the top card still navigates. Cards under the top one are `inert`, the counter is a polite live region, and the arrow keys flip from a focused control. It wraps at both ends. `data-toon-deck="always"` keeps the pile at every width. The breakpoint is one `matchMedia` query, so a resize or a rotation updates it. The slide stops under reduced motion and `data-motion="off"`, and the flip still completes.
- `deck()` in `toonish-ui/markup`. It wraps card HTML you supply and does not escape it. It escapes the label, the button text and the class, and throws on an empty pile or a blank label.
- `toon-pager` and `pager()`, previous and next links in the shape of the deck's switcher: an arrow in a disc, the direction in bold and the destination's title under it, cut at two lines. `pager()` escapes every string and throws when it has no link or no label.
- `shot()` takes `href` and `hrefLabel` (the whole picture is a link to the full-size file), `corner` (a second badge on the top right, such as "1 / 4") and `hint` (a "Tap to enlarge" badge on the bottom right that hides from `lg`). The classes are `toon-shot-link`, `toon-shot-badge-end` and `toon-shot-hint`.

### Changed

- In `toon-deck`, a swipe right goes to the previous card. A swipe in either direction used to go to the next one. Both directions wrap, so the pile loops.

- `paper` is a cool grey off-white (`#eceff3`, was the cream `#f3efe6`), and `rule` is a matching cool grey (`#d3d8e0`, was `#ddd6c6`). Ink on paper is 16.9:1 and `muted` on paper is 6.9:1.

- Fonts are IBM Plex Sans (headings and body) and IBM Plex Mono (badges, chips, stat labels and captions), replacing Space Grotesk and DM Sans. Bangers stays the comic face. A new `font.family.mono` token and `font-mono` utility carry the mono stack. All three are SIL OFL 1.1.

### Fixed

- In `toon-bars`, the red underline under the current day overlapped the date below it. Each day label now has 8px of bottom padding, so the underline sits clear of the date.
- In `toon-bars`, adjacent segments drew a 4px line between colours. The stack now has a 2px outline with 1px dividers inside, and a hatch segment meets its neighbour with no divider.
- In `toon-bars`, a column with no segments sat its labels 2px higher than the others, because its empty total was shorter than one line. The total's minimum height is now one line.

### Tests

- Browser checks cover the `toon-bars` divider rules (a hatch at the bottom, in the middle and beside another hatch), the label alignment across an empty column, and the room under the current day's label.

### Changed

- **Focus ring** is two-tone: an ink ring inside a yellow ring. Yellow alone was 1.4:1 on paper.
- `figure()` and `strip()` figures use the `-text` accents on paper, which changes how they look.
- `toon-link` takes its surface's text colour instead of the browser's link blue, which was 1.9:1 on the ground.
- `toon-nav` pills and `toon-motion` are 44 px tall. `row()` writes `role="listitem"`, so a `toon-list` must be `role="list"`: use `list()`. Deck cards are `aria-roledescription="slide"`. A badge count has a space before it.

## [0.2.0] - 2026-11-13

### Added

- `toon-shot`, a picture border for screenshots: an ink-bordered panel with a hard shadow, an optional corner badge, a caption box and a transcript below the image.
- `shot()` in `toonish-ui/markup`, which returns the `<figure>` markup. It requires alt text and the image's width and height, escapes every string, and lazy-loads by default.

### Fixed

- In the precompiled `toonish.css`, bordered `div` and `figure` components drew no border, because the build has no Tailwind reset to set `border-style`. A test now reads `.toon-card`'s border width.

## [0.1.0] - 2026-11-13

First release: the Toonish kit, extracted from `pdlabs-portfolio` (`tailwind.config.js`, `ui/toonish.css` and the kit helpers in `src/`).

### Added

- Design tokens in the W3C DTCG format, built with Style Dictionary to `tokens.css` and `tokens.json`, and to a Tailwind v3 preset and a generated Tailwind v4 `theme.css`.
- Component CSS as `toonish.css` and `toonish.min.css`, with no reset and no utilities.
- `src/toonish.css`, the full Tailwind v3 entry. Compiled with the portfolio's config, it produces the same 372 rules as the portfolio's own build, apart from the font URL spelling.
- `toonish.js` and `initToonish()` for modals, toggle groups and scroll reveal, written in TypeScript.
- `toonish-ui/markup`: `letters`, `burst`, `speedLines`, `fitSize`, `figure` and `esc`.
- Five self-hosted `woff2` fonts.
- CI (typecheck, build, a check that committed `dist/` is current, tests, a Chromium check at 1280 and 390 px), and a release workflow that attaches a tarball to each tag.

### Fixed

- The documented contrast of paper on the ground is 15.6:1, not 16:1. A test now computes it.
- Browser checks cover the new components at 1280 and 390 px: `toon-strip` is four across and then two by two, `toon-steps` is a row and then stacked with its arrows between the panels, the bubble tails point left and up, the tilt applies only from `sm`, and no figure overflows its cell.
