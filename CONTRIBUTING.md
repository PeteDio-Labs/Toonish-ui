# Contributing

Toonish is a small kit with a strong look. A change fits when it follows the [principles](docs/principles.md) and ships with its docs, its test and its `dist/`.

## Set up

```sh
bun install
bun run check   # typecheck, build, unit tests, browser check
```

Use Bun, never npm, yarn or pnpm. Use native `fetch`.

## Add or change a token

Read [Tokens](docs/tokens.md#change-a-token). Edit `tokens/toonish.tokens.json` and nothing else for the value.

## Add a component

1. **Design the phone first.** Write the base rule for 390 px, then add `min-width` queries. Do not trap a scroll, and keep targets at 44 px or more.
2. **Write the CSS** in `src/components.css`, in Tailwind v3 syntax (`@apply`, `theme()`). Take every colour, space and radius from a token.
3. **Add a helper** to `src/markup.ts` when the markup is more than a class. Escape every string with `esc()`, throw on a blank required field, and require alt text for an image.
4. **Honour motion settings.** An animation must stop under `prefers-reduced-motion` and `data-motion="off"`.
5. **Test it.** Add a markup test in `test/markup.test.ts` for the helper's output, its escaping and its errors. Add a browser check in `test/browser.ts` for behaviour, and for layout at 390 and 1280 px.
6. **Document it** in [Components](docs/components.md). Name every class and helper. `test/docs.test.ts` fails otherwise.
7. **Rebuild** with `bun run build` and commit `dist/`. Do not edit `dist/` by hand.
8. **Write the changelog entry** under `## [Unreleased]` in `CHANGELOG.md`.

## Check it on a phone

Open the kit page, or your fixture, at 390 px before 1280 px. Decoration must show on the phone. The document must not scroll sideways.

## Open the pull request

- Branch from a fresh `main`, and open a pull request. Squash-merge.
- Fill in the template: what changed, and how you checked it.
- A merge to `main` is not a release. See [Maintaining](docs/maintaining.md#when-to-release).
- If the portfolio needs the change, say so in the pull request. The portfolio pins the kit by commit and needs a pin bump.

## Style

- Write prose in Google developer documentation style: second person, active voice, answer first, sentence-case headings, code font for paths and commands.
- Do not use time-anchored words such as *currently*, *new* or *now* in durable docs. Put dates in the changelog and the decision log.
