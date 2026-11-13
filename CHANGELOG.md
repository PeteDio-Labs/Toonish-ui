# Changelog

All notable changes to this project are in this file. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and the project uses [semantic versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Three colour tokens: `muted` (secondary text on paper), `mist` (secondary text on the ground, and the quiet fill for a closed or inactive state) and `rule` (grid lines and the current-row fill on paper). Tests check their contrast.
- Data components: `toon-stat` and `toon-stats` (figure tiles), `toon-list` and `toon-row` (rows with a lead, a body and an aside), `toon-chip`, `toon-empty`, `toon-table` in a `toon-table-wrap` panel, and `toon-bars` (stacked columns with a dashed target line).
- `toon-table-text`, a table modifier for words: left-aligned cells that wrap, with the first column in bold.
- Badge modifiers `toon-badge-paper` and `toon-badge-mist`, and `toon-badge-count` for a count inside a badge.
- `badge()`, `chip()`, `stat()`, `row()` and `bars()` in `toonish-ui/markup`. `bars()` computes segment heights and the target position, labels each column for a screen reader, and throws on an empty chart.

### Fixed

- Browser checks now cover the `toon-bars` divider rules (a hatch at the bottom, middle, top and beside another hatch), the label alignment across an empty column, and the room under the current day's label.
- In `toon-bars`, the red underline under the current day overlapped the date below it. Each day label now has 8px of bottom padding, so the underline sits clear of the date.
- In `toon-bars`, adjacent segments drew a 4px line between colours. The stack now has a 2px outline with 1px dividers inside, and a hatch segment meets its neighbour with no divider.
- In `toon-bars`, a column with no segments sat its labels 2px higher than the others, because its empty total was shorter than one line. The total's minimum height is now one line.

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
