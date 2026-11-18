# Patterns

A pattern is a composition of components that solves one page problem. Each pattern here is on pdlab.dev, so you can see it running.

## Landing page

The home page reads as a comic splash page, then a series of panels.

1. **Splash hero.** A full-width headline in `letters(..., { live: true })` with one `burst()` behind its last line, a tilted `toon-frame` holding a terminal, and the name in a `toon-caption`. The headline is `aria-hidden`, and an `sr-only` `h1` carries its text.
2. **Proof strip.** `strip()` with four linked figures. It answers "is this real?" before the visitor scrolls.
3. **Featured work.** `kicker('01', ...)`, then one lead `toon-card` and three compact cards. On a phone the cards are a `deck()`, because a sideways row traps a thumb.
4. **How I work.** `kicker('02', ...)` and `steps()` with three steps.
5. **Closing panel.** A paper `toon-panel` where a `toon-bubble-left` points at the `portrait()`.

Sound effects (`MERGE!`, `SHIP!`, `CLICK!`, `DEPLOY!`) sit on panels with `sfx(..., { corner: true })`, so a phone shows them at the same corner as a desktop.

## Case study

A case study is one long read, so it needs orientation more than decoration.

- A figure in the header (`figure()` or `stat()`), then numbered sections, each led by a `toon-kicker-num` chip.
- A sticky contents rail on wide screens. On a phone the same list sits in a `<details>` disclosure above the first section. Every link in it is 44 px tall.
- The result sits in a paper `toon-panel` with a `SHIP!` sound effect in the corner.
- Pictures use `shot()` with `href` and `hint`, so a tap opens the full-size file. Mark what you redacted in the caption.
- End with `pager()` to the previous and next study.

## Dashboard

A dashboard view answers one question, and its first phone screen holds the answer. The lab dashboard's tabs ask: is anything wrong, what do I act on, what is exposed, can I fail over, and what is open.

1. **The answer.** `verdict()` first: a state, the answer in one sentence, and one line on why or what to do. An unread or stale source gives `unknown`, never ok.
2. **The evidence.** Each group starts with `kicker('01', ..., { heading: 3 })`. Use `statusTile()` in `toon-tiles` or `strip()` for figures, `list()` of `disclosure()` rows for items that open, `switchRow()` for a service on two sides, and `bars()` with `barsKey()` and `chartTable()` for a trend.
3. **What was read.** `readout()` last: counts, the age of the read and the source. "0 findings after reading 4,120 packages" and "0 findings because nothing was read" must not look alike.

- Put charts and tiles on paper. Their ink and `-text` accents fail on the navy ground.
- Use `toon-empty` when there is nothing to show. A value you cannot read is an unknown state or an alert, never a zero that looks like a yes.
- Do not rank text by dimming it. Text on the ground is `paper`, at 15 px or more. Rank it by position and size.

## Architecture diagram

Put the diagram in a `toon-frame` styled as a window, the same frame as the hero terminal. Label each tile with a badge. Keep the diagram's text real, so a screen reader reads it.

## Do and do not

| Do | Don't |
|---|---|
| Write the phone layout first. | Hide decoration on a phone. |
| Use `toon-list` for a list of facts. | Write a bullet list. |
| Pair a shadow with its fill's partner colour. | Give a shadow the same colour as its fill. |
| Use a deck to flip through cards on a phone. | Add a sideways scrolling row. |
| Put meaning in text, and decoration in `aria-hidden` elements. | Put a fact only in a sound effect. |
