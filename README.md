# toonish-ui

Toonish is an original comic-book UI kit: thin ink outlines, short hard shadows and a gentle lift on hover,
in blue, red, yellow and violet on deep navy with off-white panels. It powers [pdlab.dev](https://pdlab.dev).
The site has no kit page. `test/fixture.ts` shows every component once, and [docs/components.md](docs/components.md) lists them. [The case study](https://pdlab.dev/work/toonish-ui-design-system.html) tells how the kit is built.

## Design docs

Start with the [design docs](docs/README.md): [principles](docs/principles.md) (the look, mobile first, accessibility),
[tokens](docs/tokens.md), [components](docs/components.md), [patterns](docs/patterns.md) for composing pages,
[build and deploy](docs/build-and-deploy.md), and [CONTRIBUTING.md](CONTRIBUTING.md) for changing the kit.

The package ships:

- **Tokens** in the W3C Design Tokens format (`tokens/toonish.tokens.json`), built to CSS variables, a Tailwind v4 `@theme`, a legacy Tailwind v3 preset and JSON.
- **Component CSS** (`toon-btn`, `toon-card`, `toon-modal` and more) as plain CSS. It needs no Tailwind.
- **A small script** for modals, toggle groups and scroll reveal. No framework.
- **TypeScript helpers** that return markup for the lettered display type, bursts and speed lines.
- **Fonts**: Bangers, IBM Plex Sans and IBM Plex Mono as self-hosted `woff2` files.

## Install

The package installs from a tagged commit of this repository. `dist/` is committed, because Bun does not run
a dependency's build scripts.

```sh
bun add github:PeteDio-Labs/toonish-ui#v0.2.0
```

Pin a tag, not `main`. Each release also attaches a tarball, with checksums, to its
[GitHub release](https://github.com/PeteDio-Labs/toonish-ui/releases).

## Use it without Tailwind

Link the compiled CSS and the script. Copy `dist/fonts/` next to the CSS file, because the CSS names its fonts as `./fonts/…`.

```html
<link rel="stylesheet" href="/toonish.css">
<script src="/toonish.js" defer></script>
<button class="toon-btn" type="button">Blue</button>
```

`toonish.css` has the kit's base rules and components and **no reset and no utilities**. Bring your own reset.
If you want only the colours, fonts and spacing as CSS variables, link `tokens.css` and skip the rest:
`var(--toon-color-blue)`, `var(--toon-space-s4)`, `var(--toon-font-family-display)`.

## Use it with Tailwind v4

Compile the package's full entry file. It holds Tailwind's theme, reset and utilities, the kit's fonts and theme, and the components. It scans the kit's markup helpers and script, so the `toon-*` classes they write are kept.

```sh
bunx @tailwindcss/cli -i node_modules/toonish-ui/src/toonish.css -o dist/toonish.css --minify
```

Add `@source "./src";` to your own stylesheet if you compile a file of your own that imports `toonish-ui/src/toonish.css`.
Copy `node_modules/toonish-ui/dist/fonts/` to `dist/fonts/`, so the font URLs resolve.

`theme.css` holds the tokens in the namespaces Tailwind v4 reads, so you can also import it on its own:

```css
@import "tailwindcss";
@import "toonish-ui/theme.css";
```

It adds the `toon-*` colours, `font-display`, `font-comic`, `font-body`, the type scale (`text-body`, `text-hero`), the spacing names `s1`–`s8`, the radii, the `shadow-toon-*` shadows and the easings. The kit's own build compiles `src/toonish.css` on every `bun run build`, so this path has a check.

## Tailwind v3

The kit no longer builds on Tailwind v3. `toonish-ui/preset` is still exported for a v3 config, but nothing in the kit's build or tests exercises it, and the full entry file needs v4. Use the precompiled `toonish.css`, or upgrade.

## TypeScript helpers

```ts
import { letters, burst, figure } from 'toonish-ui/markup';

letters('pdlab', 'yellow', { live: true }); // the comic-face logo, one span per letter
burst('red', 'toon-burst-spin');            // an SVG starburst
```

Every helper escapes its input and throws on an unknown accent or a blank required field. To run the behaviour yourself
instead of loading `toonish.js`, call `initToonish()` from `toonish-ui`. The [components page](docs/components.md) lists every
helper and option.

## Tokens, components and rules

These live in the docs, so each fact has one home:

- [Tokens](docs/tokens.md): colours, contrast, type, space, shadow and motion.
- [Components](docs/components.md): every `toon-*` class and helper, including the data components, `shot()`, `portrait()` and the modal.
- [Principles](docs/principles.md): the look, mobile first and accessibility.

## Develop

```sh
bun install
bun run check   # typecheck, build, unit tests, browser check
```

| Command | What it does |
|---|---|
| `bun run build` | Rebuilds `dist/`. Commit the result. |
| `bun test` | Token, markup and `dist/` tests. |
| `bun run test:browser` | Loads a fixture page at 1280 and 390 px in Chromium. Checks fonts, computed colours, overflow, modal, toggle, reduced motion and console errors. Writes screenshots to `test/out/`. Set `CHROMIUM_PATH` to use an installed browser. |

The browser check asserts computed styles and behaviour. It does not compare screenshots pixel by pixel, because font
rendering differs between machines. CI keeps the screenshots as an artifact for a human to look at.

Releases, branch protection and what CI checks are in [docs/maintaining.md](docs/maintaining.md). To change the kit, read [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT. The bundled fonts are under the SIL Open Font License 1.1; see [NOTICE](NOTICE).
