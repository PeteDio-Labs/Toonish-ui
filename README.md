# toonish-ui

Toonish is an original comic-book UI kit: thin ink outlines, short hard shadows and a gentle lift on hover,
in blue, red, yellow and violet on deep navy with off-white panels. It powers [pdlab.dev](https://pdlab.dev).
The kit page, with every component running, is [pdlab.dev/ui.html](https://pdlab.dev/ui.html).

The package ships:

- **Tokens** in the W3C Design Tokens format (`tokens/toonish.tokens.json`), built to CSS variables, a Tailwind v4 `@theme`, a Tailwind v3 preset and JSON.
- **Component CSS** (`toon-btn`, `toon-card`, `toon-modal` and more) as plain CSS. It needs no Tailwind.
- **A small script** for modals, toggle groups and scroll reveal. No framework.
- **TypeScript helpers** that return markup for the lettered display type, bursts and speed lines.
- **Fonts**: Bangers, DM Sans and Space Grotesk as self-hosted `woff2` files.

## Install

The package installs from a tagged commit of this repository. `dist/` is committed, because Bun does not run
a dependency's build scripts.

```sh
bun add github:PeteDio-Labs/toonish-ui#v0.1.0
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

## Use it with Tailwind v3

Add the preset, then compile the package's entry file, which holds the fonts, the kit and Tailwind's layers.

```js
// tailwind.config.js
import toonish from 'toonish-ui/preset';
export default { presets: [toonish], content: ['./src/**/*.ts'] };
```

```sh
bunx tailwindcss -i node_modules/toonish-ui/src/toonish.css -o dist/toonish.css --minify
```

The preset adds the `toon-*` colours, `font-display`, `font-comic`, `font-body`, the type scale (`text-body`, `text-hero`), the
spacing names `s1`–`s8`, the radii, the `shadow-toon-*` shadows, the easings and the `bob`, `squash` and `pop` animations.
Copy `node_modules/toonish-ui/dist/fonts/` to `dist/fonts/`, so the font URLs resolve.

## Use it with Tailwind v4

```css
@import "tailwindcss";
@import "toonish-ui/theme.css";
```

`theme.css` is generated from the same tokens. It has not been checked against a Tailwind v4 build yet; treat it as
unverified until the changelog says otherwise. Use `toonish.css` for the components.

## TypeScript helpers

```ts
import { letters, burst, figure } from 'toonish-ui/markup';

letters('pdlab', 'yellow', { live: true }); // the comic-face logo, one span per letter
burst('red', 'toon-burst-spin');            // an SVG starburst
figure('214', 'blue', 52, 200);             // a number that shrinks to fit a card
```

Every interpolated string is escaped with `esc()`. To run the behaviour yourself instead of loading `toonish.js`,
call `initToonish()` from `toonish-ui`.

## Tokens

| Token | Value | Use |
|---|---|---|
| `color.ground` | `#0c1240` | Page background |
| `color.ink` | `#0a0a1f` | Outlines, and text on every fill |
| `color.paper` | `#f3efe6` | Panels and bubbles; text on the ground |
| `color.blue` | `#5f8dff` | Fill and shadow |
| `color.red` | `#f2706a` | Fill and shadow |
| `color.yellow` | `#f2c94c` | Fill and shadow |
| `color.violet` | `#a995f0` | Fill and shadow |

Ink on the darkest fill (blue) measures 5.1:1. Paper on the ground measures 15.6:1. Both pass WCAG AA, and
`test/tokens.test.ts` computes both on every run.

The spacing grid, type scale, radius names and spring easing come from the PeteDio house tokens. The colours are a
deliberate break from them. Shadows and fluid sizes are plain CSS strings, because DTCG 2025.10 has no type for a
`clamp()` or for a shadow with a `var()` colour.

## Components

`toon-btn` (plus `-red`, `-yellow`, `-paper`, and `toon-wiggle`), `toon-card` (plus `toon-corner`, `toon-pop`),
`toon-heading` (plus `-xl`), `toon-link`, `toon-badge` (plus `-blue`, `-yellow`, `-violet`), `toon-nav`, `toon-callout`,
`toon-footer`, `toon-modal`, `toon-frame`, `toon-bubble`, `toon-caption`, `toon-burst`, `toon-speed` and `toon-type`
(plus `-comic`, `-flat`).

Every animation and transition stops under `prefers-reduced-motion`, and under `data-motion="off"` on `<html>`.

### Modal

`toon-modal` is a native `<dialog>`: the browser traps focus, closes it on `Esc` and makes the page behind it inert.
The script adds backdrop taps, scroll lock and focus return.

- **Inline:** put a `<dialog class="toon-modal">` in the page, with `toon-modal-box`, `toon-modal-head` and `toon-modal-body`, and a button with `data-toon-modal-open="<dialog id>"`. A `data-toon-modal-close` button inside closes it.
- **From a page:** a link with `data-toon-modal` fetches its own `href` and shows the page's `<article>` in a shared modal. Without JavaScript, the link navigates normally.

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

Releases, branch protection and what CI checks are in [docs/maintaining.md](docs/maintaining.md).

## License

MIT. The bundled fonts are under the SIL Open Font License 1.1; see [NOTICE](NOTICE).
