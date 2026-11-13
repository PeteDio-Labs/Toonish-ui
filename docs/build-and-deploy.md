# Build and deploy

## From tokens to files

```
tokens/toonish.tokens.json ──┬─> dist/tokens.css     (--toon-* variables)
                             ├─> dist/theme.css      (Tailwind v4 @theme)
                             ├─> dist/preset.js      (Tailwind v3 preset)
                             └─> dist/tokens.json    (resolved values)
src/components.css ──────────────> dist/toonish.css, dist/toonish.min.css
src/behaviour.ts   ──────────────> dist/toonish.js, dist/index.js
src/markup.ts      ──────────────> dist/markup.js, dist/types/
@fontsource/*      ──────────────> dist/fonts/*.woff2
```

`bun run build` runs `scripts/build.ts`, which uses Style Dictionary for the tokens and Tailwind v3 to compile the components. The compiled CSS has the kit's base rules and components, with no reset and no utilities.

`dist/` is committed. Bun does not run a dependency's build scripts, so a site that installs the kit from Git gets `dist/` as committed. CI rebuilds and fails when `dist/` differs from the commit, and it prints how many files it compared.

## How a site consumes the kit

A site installs a tagged or pinned commit:

```sh
bun add github:PeteDio-Labs/toonish-ui#<tag-or-commit>
```

The portfolio pins by commit while the kit is `0.x`. A merge to the kit's `main` is therefore not visible on the site until the portfolio's pin moves. When you merge a kit change that a site needs, open a pull request in that site that bumps the pin.

Three ways to use the files are in the [README](../README.md): plain CSS and script, the Tailwind v3 preset, and the Tailwind v4 theme.

## How pdlab.dev deploys

The site is a static build, kept in the `pdlabs-portfolio` repository. The kit page, `/ui.html`, is part of that site and not of this repository.

1. **Branch work goes to `staging`.** A change to the site or the kit's look merges to `staging` first, which publishes a staging site behind a sign-in.
2. **Review on a phone.** The owner reviews the staging site at 390 px. A change batches on `staging` until the owner approves it.
3. **Promote with a pull request.** A pull request from `staging` to `main` carries the approved batch. The staging-only marker is dropped in the promotion.
4. **Deploy on merge.** A push to `main` runs the deploy workflow on a GitHub-hosted runner. It builds the site, syncs it to an S3 bucket and invalidates the CloudFront distribution, then waits for the invalidation. The change is live in about a minute.
5. **Cache.** HTML is cached for 300 seconds. Images and SVG are cached for a day.

Case studies skip `staging` and go straight to `main`. A merge to `main` also merges back into `staging`, so the two do not drift.

The deploy workflow's authentication is a known gap, tracked in the PeteDio tracker as `PET-816`: the workflow uses a stored deploy credential until OpenID Connect works for it. Do not describe the site's deploy as OIDC.

## Checks

| Check | Where | What it examined |
|---|---|---|
| `bun run typecheck` | CI and local | The TypeScript in `src/` and `test/`. |
| `bun run build` and the `dist/` diff | CI and local | That `dist/` matches a fresh build, with the file count. |
| `bun test` | CI and local | Tokens and contrast, markup output, `dist/` contents and the docs coverage. |
| `bun run test:browser` | CI and local | A fixture page at 1280 and 390 px in Chromium: fonts, computed colours, overflow, modal, toggle, reduced motion and console errors. |

CI branch protection and releases are in [Maintaining](maintaining.md).
