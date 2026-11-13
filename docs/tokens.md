# Tokens

The tokens are in `tokens/toonish.tokens.json`, in the W3C Design Tokens format. The build writes them to four files:

| File | Holds | Use it for |
|---|---|---|
| `tokens.css` | `--toon-*` CSS variables | Any stylesheet. `var(--toon-color-blue)`, `var(--toon-space-s4)`. |
| `theme.css` | A Tailwind v4 `@theme` block | Tailwind v4. Unverified against a v4 build. |
| `preset.js` | A Tailwind v3 preset | Tailwind v3. Adds `toon-*` colours, `font-display`, `shadow-toon-*` and more. |
| `tokens.json` | The resolved values | Tools and tests. |

## Colour

| Token | Value | Use |
|---|---|---|
| `color.ground` | `#0c1240` | Page background, deep navy. |
| `color.ink` | `#0a0a1f` | Outlines, and text on every fill. |
| `color.paper` | `#eceff3` | Panels and bubbles. Text on the ground. |
| `color.blue` | `#5f8dff` | Fill and shadow. |
| `color.red` | `#f2706a` | Fill and shadow. |
| `color.yellow` | `#f2c94c` | Fill and shadow. |
| `color.violet` | `#a995f0` | Fill and shadow. |
| `color.muted` | `#4a4d78` | Secondary text on paper. |
| `color.mist` | `#b9bde0` | Secondary text on the ground, and the quiet fill for a closed or inactive state. |
| `color.rule` | `#d3d8e0` | Grid lines, and the current-row fill on paper. |

**Contrast.** Ink on the accent fills is 6.3:1 or better (blue is the lowest at 6.3:1). Ink on paper is 16.9:1, `muted` on paper is 6.9:1 and paper on the ground is 15.5:1. All pass WCAG AA. The tests assert a floor of 5.1:1 for ink on every fill.

**Pairing.** A shadow takes its fill's pair: blue and red use yellow, yellow uses blue, violet uses red.

**History.** The first set was cyan with orange, which was rejected. The second was cream, red and yellow, which looked like a default theme. Paper moved from cream to a cool grey on 2026-11-13.

## Type

| Token | Value | Use |
|---|---|---|
| `font.family.display` | IBM Plex Sans | Headings. |
| `font.family.body` | IBM Plex Sans | Body copy. |
| `font.family.comic` | Bangers | Lettered display words and sound effects only. |
| `font.family.mono` | IBM Plex Mono | Labels: badges, chips, stat labels and captions. |

The fonts are self-hosted `woff2` files in `dist/fonts/`, all under the SIL Open Font License 1.1.

| Size token | px | | Fluid token | Value |
|---|---|---|---|---|
| `caption2` | 11 | | `display2` | `clamp(32px,5.5vw,52px)` |
| `caption1` | 12 | | `display1` | `clamp(44px,10vw,104px)` |
| `footnote` | 13 | | `hero` | `clamp(52px,10vw,144px)` |
| `subhead` | 15 | | | |
| `body` | 17 | | | |
| `title3` | 20 | | | |
| `title2` | 22 | | | |
| `title1` | 28 | | | |

A fluid size is a plain CSS string, because the token format has no type for `clamp()`.

## Space, radius and border

| Space | px | Radius | px |
|---|---|---|---|
| `s1` | 4 | `toon` | 10 |
| `s2` | 8 | `group` | 12 |
| `s3` | 12 | `card` | 16 |
| `s4` | 16 | `hero` | 24 |
| `s5` | 20 | `sheet` | 28 |
| `s6` | 24 | | |
| `s8` | 32 | | |

The border is `2px` (`border.toon`). The scale has no `s7`: it skips from `s6` to `s8`.

## Shadow

| Token | Value |
|---|---|
| `shadow.blue`, `.red`, `.yellow`, `.violet` | `4px 4px 0` in the accent |
| `shadow.lift` | `6px 7px 0 var(--toon-shadow, #f2706a)`. Applies on hover. |
| `shadow.press` | `0 0 0 var(--toon-shadow, #f2706a)`. Applies while pressed. |

Shadows are plain CSS strings, because the token format has no way to say "a `var()` colour".

## Motion

| Token | Value | Use |
|---|---|---|
| `ease.spring` | `cubic-bezier(0.175, 0.885, 0.32, 1.275)` | The house spring. |
| `ease.bounce` | `cubic-bezier(0.34, 1.8, 0.5, 1)` | Toon overshoot: entrances, badge boing, letter bob. |
| `duration.fast` | 200 ms | Quick state changes. |
| `duration.normal` | 300 ms | Most transitions. |
| `duration.slow` | 500 ms | Slower entrances. |

Structure (space, radius, type scale, spring) comes from the PeteDio house tokens. The colours are a deliberate break from them.

## Change a token

1. Edit `tokens/toonish.tokens.json`. Add a `$description` that says what the value is for.
2. Run `bun run build`, and commit `dist/`.
3. If the token is a colour used for text, add its contrast pair to `test/tokens.test.ts`.
4. Add a `CHANGELOG.md` entry. A changed colour alters how every page looks, so it is a minor release while the version is `0.x`.
5. Update the tables on this page, and bump the portfolio's pin as [Build and deploy](build-and-deploy.md#how-a-site-consumes-the-kit) describes.
