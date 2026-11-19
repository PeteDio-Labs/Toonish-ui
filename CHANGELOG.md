# Changelog

All notable changes to this project are in this file. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and the project uses [semantic versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.8.4] - 2026-11-19

### Added

- `segmented()` and `toon-seg`: a filter switch of two to five joined buttons, one pressed, 44 px tall. Pedro asked for a bar with switches and buttons for the Secrets page, and chose the row-and-group layout from three mocks.

## [0.8.3] - 2026-11-19

### Changed

- The red is vermilion: `color.red` is `#ff4b3e` and `color.red-text` is `#b3261b` (5.7:1 on paper). The state word on the ink strip is 5.9:1. Pedro chose it from three options so the "wrong now" colour stays clearly apart from the bubblegum accent.

### Fixed

- `docs/tokens.md` no longer says blue, red and violet are bubblegum pink. Only `color.yellow` is.

## [0.8.2] - 2026-11-19

### Changed

- The accent that was yellow is bubblegum pink: `color.yellow` is `#ff94c8` and `color.yellow-text` is `#b3236f` (5.4:1 on paper). Ink text on the fill is 9.6:1. Pedro chose it from four options. The token, class and helper names keep `yellow`, so no page needs a code change, only the pin.

## [0.8.1] - 2026-11-19

### Changed

- The button in a `statusRow()` is compact: 44 px tall, a 3 px ink shadow, subhead text and a 16 px arrow. A list of rows is shorter.

## [0.8.0] - 2026-11-18

### Added

- `appbar()`, `brief()`, `statusRow()`, `cells()` and `cycle()`, with `toon-appbar`, `toon-brief`, `toon-srow`, `toon-cells` and `toon-cycle`: the top of a status view. A paper bar with a logo tile, title and state pill; a slim verdict strip in the ink, paper, violet or blue palette; a status row with a state rail, a button, a small picture and one fact; a run of cells; and a cycle bar that says on pace or behind. `docs/components.md` has the section "Top of a view".
- `theme.css` carries the `palette` tokens as resolved hex values, so the component CSS reads `--toon-palette-<name>-<role>`.
- `palette` tokens: four ways to dress a strip of the page (ink, paper, violet, blue), each with `fill`, `text`, `state`, `edge`, `shadow` and `accent` roles, written as `--toon-palette-<name>-<role>`. `test/tokens.test.ts` asserts every text pair at 4.5:1 and every strip edge at 3:1. Ink is the choice for the verdict strip. `brief()` reads them.

## [0.7.3] - 2026-11-18

### Added

- `buildBadge({ env, sha })` and `toon-build`: a quiet line that names the environment and the short commit hash on a non-production build, and draws nothing for production. A page passes build-time variables, so a local run can set them too.
- `disclosure({ sub })` and `toon-disclosure-sub`: a muted description line under the title, so a closed row reads as label, title, description and fact, the same scale as `row()`.

### Changed

- The layout baselines in `test/snapshots/` come from the CI runner and match the row, disclosure and badge changes.
- **Layout change for every row:** `row()` puts `sub` on its own line under the title. `row({ leadTone })` and `disclosure({ tone })` colour the lead dot, and a row lead has the dot when `leadTone` is set. On a phone, a disclosure's fact and chevron sit on the lead line, so the title gets the full width. `toon-disclosure-note` and `toon-row-aside` are bold mono, and an open panel ending in a button or link has a 12 px bottom gap.
- The `design-philosophy` skill gains section 8: make components very legible, and hard-code a locked design into the kit.

## [0.7.2] - 2026-11-18

### Added

- `bun run test:layout`: finds clipped svg drawings, cut text and overlapping text at 1280 and 390 px, at rest and under hover, and compares each fixture section with a committed baseline. CI runs it and uploads diffs only on failure.

### Fixed

- A `toon-card` that also has `toon-pop` or `toon-reveal` no longer vanishes when you hover it. The hover hop replaced the entrance animation, and leaving the card replayed that animation from opacity 0. Those cards now lift by transition only. `test/browser.ts` samples the card's opacity through a hover and a leave.
- A row with an icon inside `toon-list-stack` keeps its three-column layout from 640 px up. The stack rule had given it two columns, so the icon column took the space and the text centred. `test/fixture.ts` has the case and `test/browser.ts` asserts the layout.

## [0.7.0] - 2026-11-18

### Added

- `row({ icon })` and `toon-row-icon`: an optional 48 px inline `<svg>` at the start of a row, hidden from a screen reader. The helper throws when the markup is not one clean `<svg>`. A row with an icon puts its aside under the body on a phone and at the end of the row from `sm`.
- `button({ label, href, kind, icon, iconPosition, direction, type, full, cls, attrs })`: a `toon-btn` as a link or a button, with `primary`, `secondary`, `accent` and `danger` looks, a built-in or custom icon, and `back` and `next` directions that put the arrow before or after the label. New classes: `toon-btn-icon`, `toon-btn-ico`, `toon-btn-back`, `toon-btn-next`, `toon-btn-full`.

### Changed

- `toon-dots` on `<body>` draws a halftone ground: faint dots on a fixed layer that fade out down the screen. Before, it was an empty hook and no site drew the dots, so the comic ground was missing.
- Raised surfaces cast a soft blurred shadow (`filter: drop-shadow`) so the near-black outline and hard shadow lift off the navy ground. `toon-flat` turns the blur off for one element.
- A button has an inner lower edge, so a paper button no longer reads as a card of the same colour.
- A button that can act hops now and then, and a back or next button nudges its arrow, so a touch screen with no hover still shows what you can press. A disabled or `aria-disabled` button stays still. Reduced motion and the motion switch stop all of it.

## [0.6.0] - 2026-11-18

### Added

- `gears({ spin, cls })` and `settingsMenu({ label, items, id, spin, cls })` with `toon-settings`: a double-layered gear icon that turns, and the button that opens a list of links. The menu is a `<details>`, so it works without script, and the script adds `Escape`, outside-tap and choose-to-close. Reduced motion stops the turning.

## [0.5.1] - 2026-11-18

### Changed

- No visible text is under 12 px at 390 px. Tab labels, `toon-kv` labels, `toon-meta`, the scale axis and the meter scale move from 11 px to the caption size. The line chart's axis labels move from 10 to 14 chart units, which draw at 12 px or more while the chart is at least 275 px wide. The browser check reads every visible text element and chart label in the fixture.

## [0.5.0] - 2026-11-18

### Added

- `color.green` (`#4ccf8f`) and `color.green-text` (`#0f6e42`): the ok state. Green is a state colour, not a fifth accent. An ok `verdict()` is green, an ok `statusTile()` has a green shadow and green state text, an up side in `switchRow()` is green text, an ok `uptime()` cell is green, and `meter()` takes `tone: 'green'`.
- `switchCard({ name, active, labState, cloudState, canSwitch, reason })` and `toon-switch-card`: a service's two sides as two buttons. The serving side is pressed, and the other asks for the switch or says why it cannot.
- `verdict({ state, title, body, stateText, heading })` and `toon-verdict`: the answer a view leads with. A glyph and a word say the state, the fill backs it up, and `unknown` is a dashed panel.
- `readout(text, { label, onPaper })` and `toon-readout`: what a view read, as a last line that stays readable. Paper text at 15 px on the ground, under a yellow mono label.
- `toggle({ label, checked, off, on, disabled, describedBy, attrs })` and `toon-toggle`: a 44 px `role="switch"` between two visible words. `switchRow({ control: 'toggle', labels })` draws it in place of the button.
- `masthead({ title, eyebrow, lede })` and `toon-masthead`: an app page's header, with the title as a real `h1` under the lettering.
- `barsKey()` and `chartTable()`: the key and the table of numbers for `bars()`. A hatch entry in the key draws a hatch.
- `kicker(..., { heading })` makes the label a heading. `disclosure({ note })` ends a row with small mono text in place of a figure.

### Changed

- `switchRow()` shows `reason` whenever you pass it, not only while the switch is refused.
- The small mono lines on paper (`toon-tile-read`, `toon-switch-age`, `toon-chart-at`, the uptime ends and keys) are 12 px, up from 11 px.
- A row heading in a `toon-table` body reads as a cell: 15 px ink, not an uppercase column label.

### Fixed

- A page that loads with a tab's hash no longer shows a focus ring around the whole panel. The browser focused the hash target, and the script now drops that focus.

### Added

- A `design-philosophy` agent skill in `.claude/skills/`, linked from `CLAUDE.md` and `docs/principles.md`. The skill holds the rule that each page answers one question first, with portfolio and dashboard examples.

## [0.4.0] - 2026-11-16

### Added

- Dashboard components, each drawn for paper, with a text equivalent and no meaning carried by colour alone: `uptime()` (a strip of interval cells that counts `unknown` apart from ok), `line()` (a line chart with a marker and dash per series, a key with latest values and a table), `statusTile()` (a figure with a glyph, a word and a read time, where `unknown` is a state) and `switchRow()` (lab and cloud side by side, with a button that carries `data-toon-switch-to` and a visible reason when disabled).
- The kit script drops a click on a `[data-toon-switch-to][aria-disabled="true"]` button before any handler runs.

## [0.3.0] - 2026-11-16

### Changed

- **Breaking:** the kit compiles on Tailwind v4 (4.3.5) through `@tailwindcss/cli`. `src/toonish.css` is the v4 full entry, `tailwind.config.ts` is gone, and `components.css` uses `var(--color-toon-*)` in place of `theme()`. A Tailwind v3 consumer must upgrade or use the precompiled `toonish.css`. `toonish-ui/preset` is still exported but no longer exercised.
- `dist/toonish.css` is now in cascade layers (`base`, `components`), and carries Tailwind's theme variables and `@property` rules for the few utilities `@apply` uses. A consumer's unlayered CSS, such as a reset, beats the kit regardless of specificity. Move any rule that must lose to the kit into a lower layer.
- TypeScript 7.0.2. The emitted `dist/types` are byte-identical to the TypeScript 5.8 output.
- axe-core 4.14.0 and playwright-core 1.65.1.
- `dist/toonish.css` now carries `.toon-page`, which `docs/components.md` documented but the Tailwind v3 build dropped as unused. It clips sideways overflow and pads the right by 20px. `toon-dots` and `toon-burst-spin` are hook classes with no rules, so they no longer appear in the compiled file.

- Docs no longer point to a live kit page. The portfolio removed `/ui.html`, which now redirects to the kit's case study.

### Added

- Desk components for pages that track values over time. Every one is accessible by default, stops its motion under reduced motion, and has a markup helper that escapes its input and throws on a bad argument.
- `toon-delta` and `delta(n, { unit, invert, ground })`: a signed change with a ▲, ▼ or · glyph, colour as a second cue, and a spoken form.
- `toon-scale` and `scale({ value, history, owner, ticks, label, clamp })`, with `scaleAxis()`: a 0 to 100 track with a current marker, past dots and a segment for the latest move. `value: null` draws an empty track.
- `toon-meter`, `toon-meters` and `meter()`, `meters()`: a bar for one value out of a maximum, with `role="meter"`, a large size, scale labels and `valueText`.
- `toon-tabbar`, `toon-tabpanel` and `tabbar()`, `tabpanel()`: a bottom tab bar for up to five sections, wired by `initToonish`: arrow keys, `Home`, `End`, a roving tab stop and the selected tab in `location.hash`. It exports `--toon-tabbar-h`, and `toon-tabbar-top` makes it a row of pills from `md`.
- `toon-disclosure` and `disclosure()`: a list row that opens to show detail, as a button or as `<details>` with `native: true`. Panel slots `toon-kv`, `toon-kv-warn`, `toon-note` and `toon-meta`.
- `toon-spark` and `spark()`: an inline trend with a generated `aria-label`.
- Owner `a` or `b`, shown by colour and by dot shape, on `scale()` and `disclosure()`.
- The browser check covers all six at 1280, 390 and 320 px, with tab and disclosure behaviour, delta colours, layout and reduced motion.
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

- The modal title is ink on the blue bar. `toon-heading` is yellow, and yellow on blue is 1.96:1. The browser check never opened the modal for axe, so it passed. It opens the modal for a second pass.
- `toon-modal-x`, `toon-kicker-link` and the `toon-shot-text` summary are 44 px tall. They were 31, 20 and 26 px. The target check listed `toon-modal-x` but skipped it, because the dialog was closed. The check prints how many controls it read.
- `strip()` puts a space between a figure and its label, so a linked cell is named "22 case studies", not "22case studies".
- Docs: `letters()` lists `onPaper`, `toon-dots` is described as the halftone hook it is, the table contract says how to make the scroll panel reachable by keyboard, and the landing-page and case-study patterns match pdlab.dev. `test/docs.test.ts` reads one-line interfaces, which it skipped, so `onPaper` went unnoticed.
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
