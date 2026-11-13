# Changelog

All notable changes to this project are in this file. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and the project uses [semantic versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-11-13

First release: the Toonish kit, extracted from `pdlabs-portfolio` (`tailwind.config.js`, `ui/toonish.css` and the kit helpers in `src/`).

### Added

- Design tokens in the W3C DTCG format, built with Style Dictionary to `tokens.css` and `tokens.json`, and to a Tailwind v3 preset and a generated Tailwind v4 `theme.css`.
- Component CSS as `toonish.css` and `toonish.min.css`, with no reset and no utilities.
- `src/toonish.css`, the full Tailwind v3 entry. Compiled with the portfolio's config, it produces the same 372 rules as the portfolio's own build, apart from the font URL spelling.
- `toonish.js` and `initToonish()` for modals, toggle groups and scroll reveal, written in TypeScript.
- `toonish-ui/markup`: `letters`, `burst`, `speedLines`, `fitSize`, `figure` and `esc`.
- Five self-hosted `woff2` fonts.
- CI (typecheck, build, a check that committed `dist/` is current, tests, a Chromium check at 1280 and 390 px), and a release workflow that attaches a tarball to each tag.

### Fixed

- The documented contrast of paper on the ground is 15.6:1, not 16:1. A test now computes it.
