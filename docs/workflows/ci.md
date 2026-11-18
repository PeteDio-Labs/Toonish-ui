# ci

Source: `.github/workflows/ci.yml`

| | |
|---|---|
| **Trigger** | `pull_request`, `push` to `main`. |
| **Runner** | GitHub-hosted (`ubuntu-latest`) |
| **Touches** | Nothing outside the checkout. |
| **Vault** | None. |
| **Secrets** | None. |
| **Gates** | Typecheck, build, a stale-`dist/` check (CI fails when `dist/` differs from a fresh build), `bun test`, and the Playwright browser and accessibility checks in `test/browser.ts`. Do not skip or relax an a11y check. Group `ci-<ref>`. |
| **Run it** | Open a PR. Locally: `bun run check`. |
