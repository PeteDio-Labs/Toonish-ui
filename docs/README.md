# Toonish design docs

Toonish is the design system behind [pdlab.dev](https://pdlab.dev). These pages hold the decisions, the tokens, every component and the rules for changing them. The code is the source of truth for values; these pages say why the values are what they are and how to use them.

| Page | Read it to |
|---|---|
| [Principles](principles.md) | Learn the look and the rules that every component follows. |
| [Tokens](tokens.md) | Find a colour, font, space, radius, shadow or motion value, and why it has that value. |
| [Components](components.md) | Pick a component, see its markup helper, its modifiers and its accessibility behaviour. |
| [Patterns](patterns.md) | Compose components into a page: the landing page, a case study, a dashboard. |
| [Build and deploy](build-and-deploy.md) | Learn how tokens become files, how a site consumes the kit and how the site deploys. |
| [Contributing](../CONTRIBUTING.md) | Change the kit: add a token or component, check it and open a pull request. |
| [Maintaining](maintaining.md) | Run CI, branch protection and releases. |

The site has no live kit page. To see every component, open the fixture in `test/fixture.ts` in a browser, at phone width first.

## How the docs stay true

A test (`test/docs.test.ts`) fails when `dist/toonish.css` defines a `toon-*` class that [Components](components.md) does not name, and when a markup helper exported from `src/markup.ts` has no section there. A component cannot ship without a docs entry. The test prints how many classes and helpers it compared.

## Decision log

| Date | Decision | Why |
|---|---|---|
| 2026-11-18 | The top of a status view is an app bar, a slim ink verdict strip and one list of status rows, each with one button style. | Pedro picked the app bar and the ink strip from three header options, and the one-list hybrid over a queue. Mixed button styles in one list read as a mistake. |
| 2026-11-18 | Four strip palettes, ink, paper, violet and blue, are tokens. Ink is the verdict strip's choice. | Pedro liked all four and picked ink because it draws the eye. A role name lets a page switch with one line. |
| 2026-11-03 | Comic-book look: blue, red, yellow and violet on navy, with Bangers lettering. | The first cyan-and-orange set was rejected. The cream, red and yellow set looked like a default theme. |
| 2026-11-03 | Display text is Bangers with an ink outline and hard shadow. The hand-drawn SVG lettering engine was removed. | The drawn letters read as unfinished. A font is sharper and costs less. |
| 2026-11-15 | Tailwind v4 and TypeScript 7 replace v3 and 5.8. The kit's CSS compiles on v4 and the v3 entry is gone. | Pedro asked for every dependency to be up to date. Consumers move to v4 in the same change. |
| 2026-11-13 | Paper is a cool grey (`#eceff3`), not cream. | The cool grey keeps the four accents separate from the panel colour. |
| 2026-11-13 | Headings and body are IBM Plex Sans. Labels are IBM Plex Mono. | One family reads as one voice. Mono marks a label as data. |
| 2026-11-13 | The kit is mobile first. | The owner reviews on a phone, and a layout that works at 390 px widens cleanly. |
| 2026-11-13 | No sideways scroll containers except `toon-table-wrap`. | A scrolling row traps a thumb on a phone. The deck replaces it. |
| 2026-11-13 | Lettered sound effects use Latin letters only. | A sound effect is decoration. It must not borrow a specific manga's glyphs. |
| 2026-11-13 | Accessibility is a hard rule: semantic HTML first, ARIA where needed, WCAG 2.2 AA, enforced by axe in CI. | The site must work for anyone. A tool-checked rule keeps it true as the kit grows. |
| 2026-11-13 | Text on paper uses deeper accents (`blue-text`, `red-text`, `violet-text`, `yellow-text`). | The fill accents are 1.4 to 2.7:1 on paper, which fails WCAG for text. |
| 2026-11-14 | The portfolio's kit page is removed. The fixture and `docs/components.md` replace it. | A component gallery reads as a side project. The kit still powers the site. |
| 2026-11-16 | Add `toon-delta`, `toon-scale`, `toon-meter`, `toon-tabbar`, `toon-disclosure` and `toon-spark`, with owner `a` or `b` shown by colour and by dot shape. | The World Desk pages drop their hand-drawn CSS. Direction and owner must not depend on colour alone. |
| 2026-11-18 | A view answers one question first: `verdict()`, then the evidence, then `readout()`. Text on the ground is never dimmed to rank it. | Pedro found the dashboard's grey footnote text hard on the eyes, and wants each page to flow with a purpose instead of stacking cards. |
| 2026-11-18 | Add green (`#4ccf8f`) as the ok state colour, with `green-text` for paper. It is not a fifth accent. | Pedro asked for a green. A dashboard needs "all good" to look different from "something to read". |
| 2026-11-18 | A service's two sides are two buttons (`switchCard()`): more button, fewer words. | Pedro found the switch rows wordy. The card shows the side, its state and which one serves. |
