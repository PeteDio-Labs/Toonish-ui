---
name: design-philosophy
description: "Pedro's design philosophy for toonish-ui and every site or app built on it. Use before you design, build or review a screen, a component or page copy."
---

# Design philosophy

Use this skill to decide *why* a design looks the way it does. The rules for each component are in `docs/principles.md`, `docs/components.md` and `docs/patterns.md`. This page holds the reasoning behind them. When this page and the code disagree, the code and `docs/` win, and you fix this page.

Sources: Pedro's words in project threads, `docs/principles.md`, the portfolio's `CLAUDE.md`, the 2026-11-13 and 2026-11-14 design reviews, and the vault note `People/Notes on Pedro/pedro-design-taste.md`. Pedro made each call below. Do not reopen one unless he does.

## 1. Anyone can use it

Accessibility is a hard rule, not a polish pass. A page that fails it is not done.

- Use the HTML element that means the thing before you reach for a `div`. Add ARIA only where HTML has no word for it.
- Build the roles, labels and states into the kit component, so a page built from the kit is accessible by default.
- Meet WCAG 2.2 AA. The axe checks in CI enforce it. Never skip, relax or quarantine a check to merge. Fix the component.
- A person checks what a tool cannot: tab through the change, and listen to it in VoiceOver before the pull request.
- A check that passes must say what it examined. The 2026-11-14 review found four checks that reported success for work they never did.

## 2. Phone first

Pedro reviews on his phone, so the phone is the design, not a fallback.

- Design the 390 px layout first. Write the phone layout as the base rule and widen it in `min-width` queries.
- Nothing depends on hover. Every control is at least 44 px.
- Never trap a thumb. No sideways scroll container except `toon-table-wrap`. Use `toon-deck` to flip through cards.
- Show the signature pieces on the phone. Shrink or pin a sound effect. Never hide it.
- Show before and after images at 390 px and at 1280 px.

## 3. A page flows

A page is a path with a purpose, not blocks stacked on a page. Pedro's words: it "just looks like things on the page."

- Decide the one thing a reader should do or understand. Order the page so each section leads to the next.
- Give sections different weight. The result gets the one light `toon-panel`. A reader sees where the answer is.
- Number the steps. Point at the thing that matters with a bubble, a burst or a speed line. Decoration points; it does not fill space.
- Compose components instead of writing bullets. A list of facts is `toon-list`, figures are `toon-strip`, a process is `toon-steps`.

## 4. Easy on the eyes

- Body text is IBM Plex Sans, and labels and data are IBM Plex Mono. One family reads as one voice.
- Bangers is for display words only, with an ink outline and a hard shadow.
- Text meets 4.5:1. Text on paper uses the deeper `-text` accents, because the fill accents fail there.
- Paper is a cool grey (`#eceff3`). Keep line length and spacing generous, and motion short. Motion stops when the visitor asks.

## 5. Make it feel like his

- The signature is the comic page: ink outlines, hard shadows, four accents on navy, and Latin-letter sound effects.
- Reject anything that "looks AI": cream backgrounds, trendy display fonts, template layouts. Ask what the design would look like if Pedro had drawn it.
- A rejected style is rejected for the whole site, not only the page where he said it.
- When he shows you options, render them side by side and let him pick.
- "Make it universal" means: move the piece into the kit, not leave it on one page.

## 6. Say it plainly, and say what is true

- Copy is terse and plain. Cut filler. A caption says what the picture shows and marks what is redacted.
- Show state honestly. Unknown is not zero, and a missing value is not a green check. A figure that reads alone says what it counts; a bare "0" does not.
- Fail loudly. A component throws on a blank label instead of rendering something empty.
- Do not claim what is not true yet, such as a degree in progress or a check that has not run.

## 7. Apple lessons (needs Pedro's words)

> **Draft, not complete.** Pedro spent a year at Apple as a full-stack engineer. Nothing he learned there is written down in a source the project can read. Do not invent it. Sections 1 to 6 hold only what he has said about design in this project.

Pedro to fill in, in his own words:

- What Apple taught him about accessibility as a default.
- What he learned about the way design and engineering work together.
- What he learned about detail, polish and what ships.
- What he would carry into this kit, and what he would not.

Until he answers, apply sections 1 to 6 and leave this section as is. When he answers, replace the placeholder with his lessons, dated, and keep them short.

## Checklist before a pull request

1. Did you check it at 390 px, then 1280 px?
2. Does it work from the keyboard, and did the axe checks pass without a skipped rule?
3. Does the page lead somewhere, and is the key result easy to find?
4. Is every state shown honestly, including unknown, empty and error?
5. Is the copy plain, and does `docs/` change with the code?
