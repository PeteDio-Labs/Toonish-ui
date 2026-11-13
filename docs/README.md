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

The live kit page, with every component running, is [pdlab.dev/ui.html](https://pdlab.dev/ui.html). To see a component at its real size, open it on a phone.

## How the docs stay true

A test (`test/docs.test.ts`) fails when `dist/toonish.css` defines a `toon-*` class that [Components](components.md) does not name, and when a markup helper exported from `src/markup.ts` has no section there. A component cannot ship without a docs entry. The test prints how many classes and helpers it compared.

## Decision log

| Date | Decision | Why |
|---|---|---|
| 2026-11-03 | Comic-book look: blue, red, yellow and violet on navy, with Bangers lettering. | The first cyan-and-orange set was rejected. The cream, red and yellow set looked like a default theme. |
| 2026-11-03 | Display text is Bangers with an ink outline and hard shadow. The hand-drawn SVG lettering engine was removed. | The drawn letters read as unfinished. A font is sharper and costs less. |
| 2026-11-13 | Paper is a cool grey (`#eceff3`), not cream. | The cool grey keeps the four accents separate from the panel colour. |
| 2026-11-13 | Headings and body are IBM Plex Sans. Labels are IBM Plex Mono. | One family reads as one voice. Mono marks a label as data. |
| 2026-11-13 | The kit is mobile first. | The owner reviews on a phone, and a layout that works at 390 px widens cleanly. |
| 2026-11-13 | No sideways scroll containers except `toon-table-wrap`. | A scrolling row traps a thumb on a phone. The deck replaces it. |
| 2026-11-13 | Lettered sound effects use Latin letters only. | A sound effect is decoration. It must not borrow a specific manga's glyphs. |
| 2026-11-13 | Accessibility is a hard rule: semantic HTML first, ARIA where needed, WCAG 2.2 AA, enforced by axe in CI. | The site must work for anyone. A tool-checked rule keeps it true as the kit grows. |
| 2026-11-13 | Text on paper uses deeper accents (`blue-text`, `red-text`, `violet-text`, `yellow-text`). | The fill accents are 1.4 to 2.7:1 on paper, which fails WCAG for text. |
