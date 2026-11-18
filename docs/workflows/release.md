# release

Source: `.github/workflows/release.yml`

| | |
|---|---|
| **Trigger** | `push` of a `v*` tag, or `workflow_dispatch` on `main`. |
| **Runner** | GitHub-hosted (`ubuntu-latest`) |
| **Touches** | Builds the package, creates a GitHub release and attaches the tarball and `SHA256SUMS`. |
| **Vault** | None. |
| **Secrets** | `github.token` with `contents: write` on the release job only. |
| **Gates** | Runs the same checks as `ci` first, including the stale-`dist/` check. A manual run creates the tag `vX.Y.Z` from `package.json` at the head of `main`. A tag made that way starts no second run. Consumers install the tag: `bun add github:PeteDio-Labs/toonish-ui#vX.Y.Z`. |
| **Run it** | Actions > release > Run workflow, or push a `v*` tag. |
