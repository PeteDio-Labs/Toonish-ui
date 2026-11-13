# Maintaining toonish-ui

## What CI checks

The `ci` workflow runs on every pull request and every push to `main`. The `check` job fails when any step fails:

1. `bun run typecheck`
2. `bun run build`, then a check that `dist/` matches the commit. A stale `dist/` fails the job and names the changed files.
3. `bun test`
4. A Chromium check at 1280 and 390 px (`bun run test:browser`).

The build and the browser check each print what they examined: the class count and font files in `dist/toonish.css`, and the number of checks run.
A build that matches no classes fails instead of passing on an empty file.
Screenshots from the browser check upload as the `screenshots` artifact on every run.

Every action is pinned to a full commit SHA. Dependabot proposes weekly bumps for the actions and the Bun packages.
A bump that changes the build output fails the `dist/` check until you run `bun run build` and commit `dist/`.

## Branch protection

Two rulesets protect the repository (Settings > Rules > Rulesets). Pedro created them on 2026-11-13; read them back there to check.

**`main`** (ruleset `27183156`, active):

- Changes arrive through a pull request. Zero approvals are required, and a push dismisses stale approvals.
- Every review thread must be resolved before the merge.
- The status check `check` must pass, and the branch must be up to date with `main`.
- Force pushes and deletion are blocked.
- Repository admins and pull request bypass are allowed. Treat a bypass as an exception and say so in the pull request.

**`release-tags`** (ruleset `27183230`, active, pattern `refs/tags/v*`):

- A `v*` tag can be created, but not updated or deleted, so a released tag never moves.
- Organization admins can bypass it.

Squash-merge is the convention, but the ruleset allows merge, squash and rebase. Use squash.

No session merges its own pull request in this repository without the gate in the vault's working agreement, section 5.

## Release

1. Open a pull request that moves the `## [Unreleased]` entries under a new `## [X.Y.Z] - date` heading in `CHANGELOG.md` and sets `version` in `package.json`.
2. Run `bun run build` and commit `dist/`. Merge after `check` passes and every thread is resolved.
3. Start the release. Either run the `release` workflow on `main` (Actions > release > Run workflow), which creates the tag `vX.Y.Z` from `package.json`, or tag the merge commit yourself: `git tag vX.Y.Z && git push origin vX.Y.Z`.
4. The `release` workflow checks that the tag, `package.json` and the changelog agree and that the tag is on `main`. It then rebuilds, checks `dist/` again, runs the tests, and attaches `toonish-ui-X.Y.Z.tgz` and `SHA256SUMS` to a GitHub release.
5. Read the release back: it must list two assets.

Semantic versioning: a removed or renamed class, token or export is a major change. A new class, token or export is minor. A fix that changes no name is a patch.

## Consuming a release

```sh
bun add github:PeteDio-Labs/toonish-ui#vX.Y.Z
```

To move to public npm later, add a publish job that runs on the same tag from a GitHub-hosted runner with `npm publish` and trusted publishing. Nothing else in the layout changes.
