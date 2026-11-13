# toonish-ui (agent context)

The Toonish UI kit as a package. `README.md` covers install and usage. `docs/` holds the design docs (start at `docs/README.md`); `docs/maintaining.md` covers CI, branch protection and releases.

- **Bun only,** with native `fetch`. No npm, yarn or pnpm.
- **`dist/` is committed** and `bun run build` regenerates it. CI fails when it is stale. Run `bun run check` before you push.
- **Tokens have one home:** `tokens/toonish.tokens.json`. The preset, `tokens.css` and `theme.css` all build from it. Do not hand-edit `dist/`.
- **Components stay Tailwind v3 syntax** (`@apply`, `theme()`) until the Tailwind v4 upgrade is its own change.
- **Every helper that returns HTML escapes its input** with `esc()`.
- **Mobile first.** Write the phone layout as the base rule and add wider layouts in `min-width` queries. Check a component at 390 px before 1280 px. Decoration shows on a phone. `docs/principles.md` has the rules.
- **A check that reports success must say what it examined.** The build and browser check print counts; keep that.
- **The kit page is not in this repo.** It is `/ui.html` in `pdlabs-portfolio`. `test/fixture.ts` is a test fixture only.
- Write prose in Google developer documentation style: second person, active voice, no time-anchored words.
- **Code and docs change together.** A change to a token, class, helper, option, behaviour or design decision updates its page in the same PR: `docs/tokens.md`, `docs/components.md`, `docs/patterns.md`, `docs/principles.md` or `docs/build-and-deploy.md`. Add a dated row to the decision log in `docs/README.md` when Pedro made the call, and a `CHANGELOG.md` entry under Unreleased. Do not copy a fact into `README.md`; link to its page.
- **Tests enforce the checkable part.** `test/docs.test.ts` fails when `docs/components.md` lacks a `toon-*` class, a markup helper or a helper option, or when `docs/tokens.md` disagrees with the tokens. It cannot judge the prose, so read the section you changed.
