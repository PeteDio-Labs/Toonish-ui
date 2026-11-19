# Tokens

The tokens are in `tokens/toonish.tokens.json`, in the W3C Design Tokens format. The build writes them to four files:

| File | Holds | Use it for |
|---|---|---|
| `tokens.css` | `--toon-*` CSS variables | Any stylesheet. `var(--toon-color-blue)`, `var(--toon-space-s4)`. |
| `theme.css` | A Tailwind v4 `@theme` block | Tailwind v4. The build compiles the components against it. |
| `preset.js` | A Tailwind v3 preset | Legacy Tailwind v3, no longer exercised by the build. Adds `toon-*` colours, `font-display`, `shadow-toon-*` and more. |
| `tokens.json` | The resolved values | Tools and tests. |

## Colour

| Token | Value | Use |
|---|---|---|
| `color.ground` | `#0c1240` | Page background, deep navy. |
| `color.ink` | `#0a0a1f` | Outlines, and text on every fill. |
| `color.paper` | `#eceff3` | Panels and bubbles. Text on the ground. |
| `color.blue` | `#5f8dff` | Fill and shadow. |
| `color.red` | `#ff4b3e` | Fill and shadow. Vermilion since 0.8.3 (2026-11-19). |
| `color.yellow` | `#ff94c8` | Fill and shadow. Bubblegum pink since 0.8.2 (2026-11-19); the name `yellow` is kept so no class or token changes. |
| `color.violet` | `#a995f0` | Fill and shadow. |
| `color.blue-text` | `#2a57d6` | Blue for large text on paper. 5.3:1. |
| `color.red-text` | `#b3261b` | Red for large text on paper. 5.7:1. |
| `color.violet-text` | `#6b4fd6` | Violet for large text on paper. 4.9:1. |
| `color.yellow-text` | `#b3236f` | The accent for large text on paper. 5.4:1. |
| `color.green` | `#4ccf8f` | The ok state: a fill and a shadow. Not an accent. |
| `color.green-text` | `#0f6e42` | An ok state's text on paper. 5.5:1. |
| `color.muted` | `#4a4d78` | Secondary text on paper. |
| `color.mist` | `#b9bde0` | Secondary text on the ground, and the quiet fill for a closed or inactive state. |
| `color.rule` | `#d3d8e0` | Grid lines, and the current-row fill on paper. |

**Contrast.** Ink on the accent fills is 6.3:1 or better (blue is the lowest at 6.3:1). Ink on paper is 16.9:1, `muted` on paper is 6.9:1 and paper on the ground is 15.5:1. All pass WCAG AA. The tests assert a floor of 5.1:1 for ink on every fill.

**Text on the ground.** Running text on the navy ground is `paper` at full strength, 15 px or larger. `mist` is 9.5:1 on the ground and is for short labels, such as an unselected tab. Do not lower a text's opacity to rank it: `readout()` shows the quiet form that stays readable. The tests assert 7:1 for `paper` and `mist` on the ground.

**Accents on paper.** The fills are 1.4 to 2.7:1 on paper, so they fail as text. Use the `-text` tokens for any text on paper. The tests assert 4.5:1 for each. `figure()` and `strip()` use them.

**Green is a state, not an accent.** It says ok, clear or serving, and nothing else: an ok `verdict()`, an ok tile, the serving side of a `switchCard()`. Do not use it for decoration, a button or a chart series, or it stops meaning ok. Ink on green is 9.6:1, and green never carries the state alone: a glyph and a word say it too. Pedro added it on 2026-11-18.

**Pairing.** A shadow takes its fill's pair: blue and red use yellow, yellow uses blue, violet uses red. Palette shadows are the exception: they avoid red against yellow, so they use blue, or violet under the blue palette.

**History.** On 2026-11-19 Pedro replaced the yellow fill #f2c94c with bubblegum #ff94c8 (text variant #b3236f): he had started to dislike the yellow. The first set was cyan with orange, which was rejected. The second was cream, red and yellow, which looked like a default theme. Paper moved from cream to a cool grey on 2026-11-13.

## Palettes

A palette dresses one strip of the page, such as a verdict banner. Four exist: ink, paper, violet and blue. Pedro liked all four on 2026-11-18 and chose `ink` for the verdict strip, because it draws the eye. A page asks for the role, so the choice stays one line to change. Each palette has six roles, written as `--toon-palette-<name>-<role>`.

| Palette | `fill` | `text` | `state` | `edge` | `shadow` | `accent` |
|---|---|---|---|---|---|---|
| `ink` | `#0a0a1f` | `#eceff3` | `#ff4b3e` | `#b9bde0` | `#5f8dff` | `#ff4b3e` |
| `paper` | `#eceff3` | `#0a0a1f` | `#b3261b` | `#0a0a1f` | `#5f8dff` | `#ff4b3e` |
| `violet` | `#a995f0` | `#0a0a1f` | `#0a0a1f` | `#0a0a1f` | `#5f8dff` | `#eceff3` |
| `blue` | `#5f8dff` | `#0a0a1f` | `#0a0a1f` | `#0a0a1f` | `#a995f0` | `#eceff3` |

- `text` is the sentence on the fill. It is 16.9:1 on ink and paper, 7.7:1 on violet and 6.3:1 on blue.
- `state` is the state word, such as "Needs you". It is red only where red passes: 5.9:1 on ink and 5.7:1 on paper. On violet and blue it is ink, because red fails there.
- `edge` is the outline that separates the strip from the navy ground. Ink on the ground is 1.09:1, so the ink palette uses mist, which is 9.7:1. The other three fills are 5.7:1 or better against the ground.
- `accent` fills large lettering, such as a count in Bangers. It is decoration, so the sentence carries the meaning. Outline it in ink, or in paper on ink.
- No palette puts red against yellow. The `shadow` is blue, or violet under the blue palette, so it differs from the fill.

The tests assert each text pair at 4.5:1, and that the edge or the fill of each strip is 3:1 against the ground. They print how many pairs they read.

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
| `shadow.lift` | `6px 7px 0 var(--toon-shadow, #ff4b3e)`. Applies on hover. |
| `shadow.press` | `0 0 0 var(--toon-shadow, #ff4b3e)`. Applies while pressed. |

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
