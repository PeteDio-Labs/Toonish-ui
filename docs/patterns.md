# Patterns

A pattern is a composition of components that solves one page problem. Each pattern here is on pdlab.dev, so you can see it running.

## Landing page

The home page reads as a comic splash page, then a series of panels.

1. **Splash hero.** A full-width headline in `letters(..., { live: true })`, a tilted `toon-frame` holding a terminal, and the name in a `toon-caption`. Add `speedLines()` behind the frame and one `burst()`.
2. **Proof strip.** `strip()` with four linked figures. It answers "is this real?" before the visitor scrolls.
3. **Featured work.** `kicker('01', ...)`, then one lead `toon-panel` and three compact cards. On a phone the cards are a `deck()`, because a sideways row traps a thumb.
4. **How I work.** `kicker('02', ...)` and `steps()` with three steps.
5. **Closing panel.** A paper `toon-panel` where a `toon-bubble-left` points at the `portrait()`.

Sound effects (`MERGE!`, `SHIP!`, `CLICK!`, `DEPLOY!`) sit on panels with `sfx(..., { corner: true })`, so a phone shows them at the same corner as a desktop.

## Case study

A case study is one long read, so it needs orientation more than decoration.

- A figure in the header (`figure()` or `stat()`), then numbered sections with `kicker()`.
- A sticky contents rail on wide screens. On a phone the rail is gone and the numbered kickers do the job.
- The result sits in a paper `toon-panel` with a `SHIP!` sound effect in the corner.
- Pictures use `shot()` with `href` and `hint`, so a tap opens the full-size file. Mark what you redacted in the caption.
- End with `pager()` to the previous and next study.

## Dashboard

- A row of `stat()` tiles in `toon-stats`.
- `bars()` for a trend, with a `toon-bars-key` that names each colour.
- `toon-list` of `row()` entries for the latest events, with a coloured dot for state.
- `toon-table` for the full record. Mark the current row with `aria-current`.
- `toon-empty` when there is nothing to show. A value you cannot read is an empty state or an alert, never a zero that looks like a yes.

## Architecture diagram

Put the diagram in a `toon-frame` styled as a window, the same frame as the hero terminal. Label each tile with a badge. Keep the diagram's text real, so a screen reader reads it.

## Do and don't

| Do | Don't |
|---|---|
| Write the phone layout first. | Hide decoration on a phone. |
| Use `toon-list` for a list of facts. | Write a bullet list. |
| Pair a shadow with its fill's partner colour. | Give a shadow the same colour as its fill. |
| Use a deck to flip through cards on a phone. | Add a sideways scrolling row. |
| Put meaning in text, and decoration in `aria-hidden` elements. | Put a fact only in a sound effect. |
