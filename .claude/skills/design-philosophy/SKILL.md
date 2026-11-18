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
- Each page answers one question first. See the Apple lessons in section 7.
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

## 7. Apple lessons

Pedro spent a year at Apple as a full-stack engineer. In his words, cleaned up (2026-11-17):

- **It works everywhere.** The site must work even in a poor browser. Build on plain HTML and CSS, and treat scripts and newer features as enhancements. A page that breaks on an old or limited browser is broken.
- **Render and function come first.** Content must appear, and every control must work, before any flourish. Polish never replaces function.
- **Every visitor gets a good experience.** A good UX is the default for everyone, not a premium for modern devices.
- **Anyone can use the site.** Accessibility is part of that promise, not a separate task. See section 1.
- **Each page answers one question first.** Name the question before you design the page, and answer it at the top. Detail sits underneath for the reader who wants it. A page with no question is a pile of blocks.

Examples of the question each page answers, from the portfolio and the dashboard:

**Portfolio (`pdlab.dev`), built that way:**

| Page | Question | How the page answers it |
|---|---|---|
| Home | Can this person build systems with AI? | The splash headline and the proof strip of four linked figures answer first. The lead case study and three compact cards sit underneath. |
| Work | Which study should I read? | The filterable list of case studies, so a reader narrows to the one that matches. |
| A case study | What happened, and what did it prove? | The title and the key figure sit together in the header. The result gets the one light panel. Numbered sections follow for the reader who wants the detail. |
| About | Who is this person? | The portrait and a short bio come first. |

**Dashboard, designed that way.** Each tab has one question. Detail sits under it in a `toon-disclosure`.

| Tab | Question | Answer at the top |
|---|---|---|
| Now | Is anything wrong? | One state: all clear, or the thing that needs you. `unknown` is its own state, never "all clear". |
| Alerts | What do I act on? | The alerts that need an action, ordered by urgency. Noise sits below. |
| Services | Can I fail over? | Per service: is the cloud side healthy, how stale is it, and is the switch enabled or disabled with a reason. |
| CVE | What is exposed, and what do I patch? | Fixable vulnerabilities on running services first. |
| Plane | What is open, and what is blocked? | Open work that waits on Pedro, then the rest. |

To design a page: write its question in one line, put the answer in the first screen at 390 px, and move everything else below it.

To apply them: test the change with scripts off and in Safari, and check that the page reads and works without the decoration.

Pedro may add more lessons here. Keep each one short and dated.

## Checklist before a pull request

1. Did you check it at 390 px, then 1280 px?
2. Does it render and work in a limited browser, and from the keyboard, and did the axe checks pass without a skipped rule?
3. Does the page answer one named question first, and is the key result easy to find?
4. Is every state shown honestly, including unknown, empty and error?
5. Is the copy plain, and does `docs/` change with the code?
