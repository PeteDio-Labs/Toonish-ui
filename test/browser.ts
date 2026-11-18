// Browser check of the built dist/: loads the fixture at desktop and phone width and checks what a reader would
// notice. It fails on a console error, a failed request, horizontal overflow, a missing font, a wrong computed
// colour, or a modal or toggle that does not work. It saves a screenshot of each width to test/out/ (CI uploads them).
// Run it with `bun run test:browser`. Set CHROMIUM_PATH to use a browser Playwright did not install.
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright-core';
import { fixture } from './fixture.ts';

const fail: string[] = [];
const check = (ok: boolean, what: string) => { if (!ok) fail.push(what); };
let checks = 0;
const eq = (actual: unknown, expected: unknown, what: string) => { checks++; check(actual === expected, `${what}: expected ${String(expected)}, got ${String(actual)}`); };

const requests: string[] = [];
const server = Bun.serve({
  port: 0,
  async fetch(req) {
    const { pathname } = new URL(req.url);
    if (pathname === '/') return new Response(fixture(), { headers: { 'content-type': 'text/html; charset=utf-8' } });
    // A page the shared modal fetches. The query string must reach the server; the inline handler must be dropped.
    if (pathname === '/page') {
      requests.push(pathname + new URL(req.url).search);
      return new Response('<!doctype html><article><h1>Fetched page</h1><p>Body</p><img src="data:," onerror="window.__xss=1"><a href="javascript:window.__xss=2">x</a></article>', { headers: { 'content-type': 'text/html; charset=utf-8' } });
    }
    if (pathname === '/axe.js') return new Response(Bun.file('node_modules/axe-core/axe.min.js'), { headers: { 'content-type': 'text/javascript' } });
    if (pathname.startsWith('/dist/') && !pathname.includes('..')) {
      const f = Bun.file(`.${pathname}`);
      return (await f.exists()) ? new Response(f) : new Response('not found', { status: 404 });
    }
    return new Response('not found', { status: 404 });
  },
});

await mkdir('test/out', { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
try {
  for (const [name, width, height] of [['desktop', 1280, 900], ['phone', 390, 844]] as const) {
    const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    const problems: string[] = [];
    page.on('console', (m) => { if (m.type() === 'error') problems.push(`console: ${m.text()}`); });
    page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
    page.on('requestfailed', (r) => problems.push(`request failed: ${r.url()}`));
    page.on('response', (r) => { if (r.status() >= 400) problems.push(`${r.status()}: ${r.url()}`); });
    await page.goto(server.url.href, { waitUntil: 'networkidle' });
    // The dialog's close event fires on a later task, so wait for the state instead of reading it at once.
    const settled = (fn: () => boolean) => page.waitForFunction(fn, undefined, { timeout: 2000 }).then(() => true, () => false);

    // Fonts: all three families the kit names must be loaded, not fall back.
    const fonts = await page.evaluate(async () => {
      await document.fonts.ready;
      return ['Bangers', 'IBM Plex Sans', 'IBM Plex Mono'].map((f) => [f, [...document.fonts].some((x) => x.family.replace(/"/g, '') === f && x.status === 'loaded')]);
    });
    for (const [f, loaded] of fonts as [string, boolean][]) eq(loaded, true, `${name}: font ${f} loaded`);

    const style = (sel: string, prop: string) => page.$eval(sel, (el, p) => getComputedStyle(el).getPropertyValue(p), prop);
    eq(await style('.toon-btn', 'background-color'), 'rgb(95, 141, 255)', `${name}: .toon-btn fill is blue`);
    eq(await style('.toon-btn', 'border-top-width'), '2px', `${name}: .toon-btn border is 2px`);
    eq(await style('.toon-btn', 'color'), 'rgb(10, 10, 31)', `${name}: .toon-btn text is ink`);
    eq(await style('.toon-card', 'border-top-width'), '2px', `${name}: .toon-card draws its border`);
    eq(await style('.toon-card', 'background-color'), 'rgb(236, 239, 243)', `${name}: .toon-card fill is paper`);
    eq(await style('body', 'background-color'), 'rgb(12, 18, 64)', `${name}: body is the navy ground`);
    eq(await style('.toon-btn', 'font-family'), '"IBM Plex Sans", system-ui, sans-serif', `${name}: .toon-btn uses the body family`);

    // Nothing may widen the page: a phone browser stretches its layout viewport to fit any overflow.
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    eq(overflow <= 0, true, `${name}: no horizontal overflow (scrollWidth - innerWidth = ${overflow})`);

    // Shot: the panel keeps the ink border and paper fill, the image fits the panel, the badge overlaps the corner, the transcript is text.
    eq(await style('.toon-shot-panel', 'border-top-width'), '2px', `${name}: .toon-shot-panel border is 2px`);
    eq(await style('.toon-shot-panel', 'background-color'), 'rgb(236, 239, 243)', `${name}: .toon-shot-panel fill is paper`);
    const shotBox = await page.evaluate(() => {
      const panel = document.querySelector('.toon-shot-panel')!.getBoundingClientRect();
      const img = document.querySelector('.toon-shot-panel img') as HTMLImageElement;
      const badge = document.querySelector('.toon-shot-badge')!.getBoundingClientRect();
      return { fits: img.getBoundingClientRect().width <= panel.width, tall: img.getBoundingClientRect().height > 0, loaded: img.complete && img.naturalWidth > 0, overlaps: badge.top < panel.top && badge.left < panel.left + 20 };
    });
    eq(shotBox.fits, true, `${name}: shot image fits its panel`);
    eq(shotBox.loaded && shotBox.tall, true, `${name}: shot image loaded with a height`);
    eq(shotBox.overlaps, true, `${name}: shot badge sits on the panel corner`);
    eq(await page.$eval('.toon-shot-text', (d) => (d as HTMLDetailsElement).open && d.querySelectorAll('p').length), 2, `${name}: shot transcript is open with 2 lines`);

    // Data components: tiles, list, bars and table keep the paper fill and border, and the bars have real heights.
    eq(await style('.toon-stat', 'background-color'), 'rgb(236, 239, 243)', `${name}: .toon-stat fill is paper`);
    eq(await style('.toon-stat', 'border-top-width'), '2px', `${name}: .toon-stat draws its border`);
    eq(await style('.toon-stat-label', 'color'), 'rgb(74, 77, 120)', `${name}: .toon-stat-label uses the muted token`);
    eq(await style('.toon-list', 'border-top-width'), '2px', `${name}: .toon-list draws its border`);
    eq(await page.$eval('#list-stack .toon-row', (e) => { const l = e.querySelector('.toon-row-lead')!.getBoundingClientRect(), b = e.querySelector('.toon-row-body')!.getBoundingClientRect(); return l.bottom <= b.top + 1 && Math.abs(l.left - b.left) < 1; }), true, `${name}: .toon-list-stack keeps the lead on its own line above the body`);
    eq(await style('.toon-row + .toon-row', 'border-top-style'), 'solid', `${name}: .toon-row draws its separator`);
    eq(await page.evaluate(() => { const b = getComputedStyle(document.body, '::before'); return `${b.position}|${b.pointerEvents}|${b.backgroundImage.startsWith('radial-gradient')}`; }), 'fixed|none|true', `${name}: toon-dots draws a fixed, click-through halftone layer`);
    eq(await page.$eval('.toon-card', (c) => getComputedStyle(c).filter.startsWith('drop-shadow') || getComputedStyle(c).filter.includes('drop-shadow')), true, `${name}: a raised surface casts a blurred shadow`);
    eq(await page.$eval('#btn-demo a.toon-btn-back', (a) => { const i = a.querySelector('.toon-btn-ico')!.getBoundingClientRect(), l = a.querySelector('.toon-btn-label')!.getBoundingClientRect(), r = a.getBoundingClientRect(); return i.right <= l.left + 1 && Math.round(r.height) >= 44 && getComputedStyle(a).display === 'inline-flex'; }), true, `${name}: a back button puts its arrow before the label, as an inline-flex row at least 44 px tall`);
    eq(await page.$eval('#btn-demo .toon-btn-next', (a) => { const i = a.querySelector('.toon-btn-ico')!.getBoundingClientRect(), l = a.querySelector('.toon-btn-label')!.getBoundingClientRect(); return l.right <= i.left + 1; }), true, `${name}: a next button puts its arrow after the label`);
    eq(await page.$eval('#btn-demo .toon-btn-back', (a) => `${getComputedStyle(a).animationName}|${getComputedStyle(a.querySelector('.toon-btn-ico')!).animationName}`), 'toon-btn-hop|toon-nudge-back', `${name}: an active button hops now and then and its arrow nudges`);
    eq(await page.$eval('#btn-demo [aria-disabled="true"]', (a) => getComputedStyle(a).animationName), 'none', `${name}: a button that cannot act stays still`);
    eq(await page.$eval('#btn-demo .toon-btn-paper', (a) => getComputedStyle(a).boxShadow.includes('inset')), true, `${name}: a button has an inner lower edge, so it differs from a card`);
    eq(await page.$eval('#list-icons .toon-row', (e) => { const i = e.querySelector('.toon-row-icon')!.getBoundingClientRect(), b = e.querySelector('.toon-row-body')!.getBoundingClientRect(); return Math.round(i.width) === 48 && Math.round(i.height) === 48 && i.right <= b.left && Math.abs((i.top + i.height / 2) - (e.getBoundingClientRect().top + e.getBoundingClientRect().height / 2)) < 4; }), true, `${name}: .toon-row-icon is 48 px, sits before the body and centres on the row`);
    eq(await page.$eval('#list-icons-stack .toon-row', (e) => { const i = e.querySelector('.toon-row-icon')!.getBoundingClientRect(), b = e.querySelector('.toon-row-body')!.getBoundingClientRect(), r = e.getBoundingClientRect(); return i.right <= b.left && i.left - r.left < 40 && b.left - i.right < 40 && b.width > r.width / 2; }), true, `${name}: an icon row inside .toon-list-stack keeps a narrow icon column and a wide text column`);
    eq(await page.$eval('#list-icons .toon-row', (e) => { const a = e.querySelector('.toon-row-aside')!.getBoundingClientRect(), b = e.querySelector('.toon-row-body')!.getBoundingClientRect(), r = e.getBoundingClientRect(); return a.right <= r.right + 1 && (a.top >= b.bottom - 1 || a.left >= b.right - 1); }), true, `${name}: a row with an icon keeps its aside inside the row, under the body on a phone and beside it from sm`);
    eq(await style('.toon-table td', 'border-bottom-style'), 'solid', `${name}: .toon-table draws its rules`);
    eq(await style('.toon-badge-mist', 'background-color'), 'rgb(185, 189, 224)', `${name}: .toon-badge-mist fill is mist`);
    const barBox = await page.evaluate(() => {
      const root = document.querySelector('.toon-bars:not(#dividers .toon-bars)')!;
      const plot = root.querySelector('.toon-bar-plot')!.getBoundingClientRect();
      const segs = [...root.querySelectorAll('.toon-bar-seg')].map((e) => e.getBoundingClientRect());
      const target = root.querySelector('.toon-bars-target')!.getBoundingClientRect();
      return { plot: plot.height, h: segs.map((r) => r.height), segs: segs.length, tall: segs.every((r) => r.height > 0), fits: segs.every((r) => r.bottom <= plot.bottom + 1), targetInside: target.top >= plot.top - 1 && target.top <= plot.bottom };
    });
    eq(barBox.segs, 3, `${name}: bars drew 3 segments`);
    eq(barBox.tall && barBox.fits, true, `${name}: every bar segment has height and stays in its plot`);
    // Mon: 0.6 and 0.2 of a 1.1 scale; Tue: 1.1. The tallest segment fills its plot and the first is 0.6/1.1 of it.
    eq(Math.abs(barBox.h[2]! - barBox.plot) <= 2 && Math.abs(barBox.h[0]! - barBox.plot * 0.6 / 1.1) <= 3, true, `${name}: segment heights follow their share of the scale (${barBox.h.map(Math.round)} in ${Math.round(barBox.plot)})`);
    // Divider rules. Each segment's bottom border is the divider to the one below it; the stack is column-reverse, so the first child is the bottom.
    const edges = await page.evaluate(() => [...document.querySelectorAll('#dividers .toon-bar')].map((col) => [...col.querySelectorAll('.toon-bar-seg')].map((s) => { const c = getComputedStyle(s); return `${c.borderTopWidth}/${c.borderBottomWidth}`; })));
    eq(JSON.stringify(edges), JSON.stringify([
      ['0px/2px', '2px/0px'],
      ['0px/2px', '0px/0px', '2px/0px'],
      ['0px/2px', '2px/0px'],
      ['0px/2px', '2px/1px'],
      [],
    ]), `${name}: dividers are 1px between colours and none beside a hatch, inside a 2px outline (${JSON.stringify(edges)})`);
    // Labels sit at one height in a chart that has an empty column and a current day, and the underline has room below the date.
    const labels = await page.evaluate(() => [...document.querySelectorAll('#dividers .toon-bar-label')].map((e) => Math.round(e.getBoundingClientRect().top)));
    eq(new Set(labels).size, 1, `${name}: every column's labels start at the same height (${labels})`);
    eq(await page.$eval('#dividers [aria-current] .toon-bar-label b', (e) => getComputedStyle(e).paddingBottom), '8px', `${name}: the current-day label has 8px below it for its underline`);
    eq(barBox.targetInside, true, `${name}: the target line sits inside the plot`);
    eq(await style('.toon-table-wrap', 'background-color'), 'rgb(236, 239, 243)', `${name}: .toon-table-wrap fill is paper`);
    // The second column and the header are the ones the base table right-aligns and keeps on one line.
    eq(await style('.toon-table-text td:nth-child(2)', 'text-align'), 'left', `${name}: .toon-table-text second column is left-aligned`);
    eq(await style('.toon-table-text td:nth-child(2)', 'white-space'), 'normal', `${name}: .toon-table-text second column wraps`);
    eq(await style('.toon-table-text th:nth-child(2)', 'text-align'), 'left', `${name}: .toon-table-text header is left-aligned`);
    eq(await style('.toon-table:not(.toon-table-text) td:nth-child(2)', 'text-align'), 'right', `${name}: a plain .toon-table still right-aligns figures`);
    eq(await page.$eval('.toon-table-text', (t) => t.getBoundingClientRect().width <= (t.parentElement as HTMLElement).clientWidth + 1), true, `${name}: .toon-table-text fits its panel without scrolling`);
    eq(await page.$eval('.toon-table tfoot td', (e) => getComputedStyle(e).fontWeight), '700', `${name}: .toon-table total row is bold`);

    // Landing-page components. Rects are read in one pass so each layout claim names what it measured.
    const wide = width >= 640;
    const flow = await page.evaluate(() => {
      const r = (e: Element) => e.getBoundingClientRect();
      const cells = [...document.querySelectorAll('.toon-strip-cell')].map(r);
      const strip = r(document.querySelector('.toon-strip')!);
      const values = [...document.querySelectorAll('.toon-strip-value')].map((v) => ({ over: v.scrollWidth - v.clientWidth, within: r(v).right <= r(v.closest('.toon-strip-cell')!).right + 0.5 }));
      const lis = [...document.querySelectorAll('.toon-step')].map(r);
      const arrows = [...document.querySelectorAll('.toon-step-arrow')].map(r);
      const kick = document.querySelector('#flow .toon-kicker')!;
      const rule = r(kick.querySelector('.toon-kicker-rule')!);
      const link = r(kick.querySelector('.toon-kicker-link')!);
      const num = kick.querySelector('.toon-kicker-num')!;
      return {
        cells, strip, values, lis, arrows, ruleW: rule.width, ruleToLink: link.left - rule.right, kickRight: r(kick).right,
        numBorder: getComputedStyle(num).borderTopWidth, numFont: getComputedStyle(num).fontFamily,
        arrowSvg: document.querySelector('.toon-step-arrow')!.getAttribute('aria-hidden'),
        stepsTag: document.querySelector('.toon-steps')!.tagName,
        steps: lis.length,
      };
    });
    const sameRow = (rs: { top: number }[]) => rs.every((x) => Math.abs(x.top - rs[0]!.top) < 1);
    eq(flow.cells.length, 4, `${name}: the strip has 4 cells`);
    eq(wide ? sameRow(flow.cells) : sameRow(flow.cells.slice(0, 2)) && sameRow(flow.cells.slice(2)) && flow.cells[2]!.top > flow.cells[0]!.bottom - 1, true, `${name}: the strip is ${wide ? '4 across' : '2 by 2'}`);
    eq(new Set(flow.cells.map((c) => Math.round(c.left))).size, wide ? 4 : 2, `${name}: the strip has ${wide ? 4 : 2} columns`);
    eq(flow.cells.every((c) => c.left >= flow.strip.left - 1 && c.right <= flow.strip.right + 1), true, `${name}: strip cells stay inside the strip`);
    eq(flow.values.every((v) => v.over <= 0 && v.within), true, `${name}: every strip figure fits its cell (${flow.values.map((v) => v.over)})`);
    eq(await style('.toon-strip', 'border-top-width'), '2px', `${name}: .toon-strip draws its border`);
    eq(await style('.toon-strip-cell', 'background-color'), 'rgb(236, 239, 243)', `${name}: a strip cell is paper`);
    eq(flow.steps, 3, `${name}: 3 steps`);
    eq(flow.stepsTag, 'OL', `${name}: steps are an ordered list`);
    eq(width >= 768 ? sameRow(flow.lis) : flow.lis.every((l, i) => Math.abs(l.left - flow.lis[0]!.left) < 1 && (i === 0 || l.top > flow.lis[i - 1]!.bottom)), true, `${name}: steps are ${width >= 768 ? 'a row' : 'stacked'}`);
    eq(flow.arrows.length, 2, `${name}: 2 arrows between 3 steps`);
    // The arrow sits in the gap between two panels: beside them in a row, below the first when stacked.
    eq(flow.arrows.every((a, i) => {
      const c = { x: a.left + a.width / 2, y: a.top + a.height / 2 };
      const p = flow.lis[i]!, n = flow.lis[i + 1]!;
      return width >= 768 ? c.x > p.right - 2 && c.x < n.left + 2 && Math.abs(c.y - (p.top + p.height / 2)) < 2 : c.y > p.bottom - 2 && c.y < n.top + 2 && Math.abs(c.x - (p.left + p.width / 2)) < 2;
    }), true, `${name}: arrows sit between the panels`);
    // A right arrow has no rotation; a stacked one is turned 90 degrees to point down.
    eq(await page.$eval('.toon-step-arrow', (a) => { const m = new DOMMatrix(getComputedStyle(a).transform); return Math.round(Math.atan2(m.b, m.a) * 180 / Math.PI); }), width >= 768 ? 0 : 90, `${name}: the arrow points ${width >= 768 ? 'right' : 'down'}`);
    eq(flow.arrowSvg, 'true', `${name}: arrows are hidden from readers`);
    eq(flow.numBorder, '2px', `${name}: the kicker chip has an ink border`);
    eq(flow.numFont.includes('IBM Plex Mono'), true, `${name}: the kicker chip is mono`);
    eq(flow.ruleW > 20 && flow.ruleToLink >= 0 && flow.ruleToLink < 24, true, `${name}: the kicker rule fills the row up to the link (rule ${Math.round(flow.ruleW)} px, ${Math.round(flow.ruleToLink)} px from the link)`);
    eq(await style('#panel', 'background-color'), 'rgb(236, 239, 243)', `${name}: .toon-panel is paper`);
    eq(await style('#panel', 'border-top-width'), '2px', `${name}: .toon-panel draws its border`);
    eq((await style('#panel', 'box-shadow')).includes('6px 6px'), true, `${name}: .toon-panel has a hard shadow`);
    eq(await style('#panel .toon-kicker-rule', 'border-top-color'), 'rgb(10, 10, 31)', `${name}: a kicker rule inside a panel is ink`);
    eq(await style('#flow .toon-kicker-rule', 'border-top-color'), 'rgb(236, 239, 243)', `${name}: a kicker rule on the ground is paper`);
    // Bubble tails: the tail is the pseudo-element's border, drawn in ink on the side that points away from the bubble.
    const tail = (sel: string, prop: string) => page.$eval(sel, (el, p) => getComputedStyle(el, '::before').getPropertyValue(p), prop);
    eq(await tail('#bubble-left', 'border-right-color'), 'rgb(10, 10, 31)', `${name}: .toon-bubble-left tail is ink and points left`);
    eq(await tail('#bubble-left', 'left'), '-24px', `${name}: .toon-bubble-left tail sits on the left edge`);
    eq(await tail('#bubble-left', 'border-top-width'), '16px', `${name}: .toon-bubble-left tail is drawn sideways`);
    eq(await tail('#bubble-up', 'border-bottom-color'), 'rgb(10, 10, 31)', `${name}: .toon-bubble-up tail is ink and points up`);
    eq(await tail('#bubble-up', 'top'), '-24px', `${name}: .toon-bubble-up tail sits on the top edge`);
    eq(await tail('.toon-bubble:not([class*="toon-bubble-"])', 'border-top-color'), 'rgb(10, 10, 31)', `${name}: the default bubble keeps its bottom tail`);
    const tilt = (sel: string) => page.$eval(sel, (el) => { const r = getComputedStyle(el).rotate; return r === 'none' ? 0 : parseFloat(r); });
    eq(await tilt('#tilt-l'), wide ? -2 : 0, `${name}: .toon-tilt-l turns ${wide ? '-2' : 'no'} degrees`);
    eq(await tilt('#tilt-r'), wide ? 2 : 0, `${name}: .toon-tilt-r turns ${wide ? '2' : 'no'} degrees`);
    // A frame below the fold gets toon-reveal, which sets transform. The angle must survive it.
    await page.$eval('#tilt-r', (el) => el.classList.add('toon-reveal', 'toon-in'));
    eq(await tilt('#tilt-r'), wide ? 2 : 0, `${name}: the tilt survives scroll reveal`);

    // Sfx: decoration only, in the comic face, hand-lettered, and it drifts unless motion is off.
    eq(await style('.toon-portrait', 'border-top-width'), '2px', `${name}: .toon-portrait border is 2px`);
    const pbox = await page.evaluate(() => {
      const box = document.querySelector('.toon-portrait')!.getBoundingClientRect();
      const bg = document.querySelector('.toon-portrait-bg')!.getBoundingClientRect();
      const img = document.querySelector('.toon-portrait > img') as HTMLImageElement;
      return { fills: Math.abs(bg.width - (box.width - 4)) < 1 && Math.abs(bg.height - (box.height - 4)) < 1, loaded: img.complete && img.naturalWidth > 0 };
    });
    eq(pbox.fills, true, `${name}: portrait backdrop fills the panel`);
    eq(pbox.loaded, true, `${name}: portrait image loaded`);
    eq(await style('.toon-sfx', 'pointer-events'), 'none', `${name}: .toon-sfx takes no pointer`);
    eq(await style('.toon-sfx', 'user-select'), 'none', `${name}: .toon-sfx cannot be selected`);
    eq((await style('.toon-sfx', 'font-family')).includes('Bangers'), true, `${name}: .toon-sfx uses the comic face`);
    eq(await page.$$eval('.toon-sfx[aria-hidden="true"]', (e) => e.length), 3, `${name}: every sfx is hidden from readers`);
    eq(await page.$eval('.toon-sfx', (e) => new Set([...e.children].map((c) => getComputedStyle(c).transform)).size > 3), true, `${name}: sfx letters differ in turn and rise`);
    eq(await page.$eval('.toon-sfx > span', (c) => getComputedStyle(c).animationName), 'toon-sfx-drift', `${name}: sfx letters drift when motion is allowed`);
    eq(await page.$eval('.toon-sfx-ghost', (e) => [getComputedStyle(e).color, getComputedStyle(e).opacity].join()), 'rgba(0, 0, 0, 0),0.4', `${name}: .toon-sfx-ghost is an outline only`);
    eq(await page.$eval('.toon-sfx-lg', (e) => parseFloat(getComputedStyle(e).fontSize)) > (await page.$eval('.toon-sfx-sm', (e) => parseFloat(getComputedStyle(e).fontSize))), true, `${name}: sfx size modifiers order sm < lg`);
    eq(await page.$eval('.toon-sfx', (e) => getComputedStyle(e).rotate), '-5deg', `${name}: the word is tilted`);
    eq(await page.$eval('.toon-sfx-corner', (e) => { const r = e.getBoundingClientRect(), b = e.parentElement!.getBoundingClientRect(); return getComputedStyle(e).display !== 'none' && getComputedStyle(e).position === 'absolute' && r.width > 0 && r.top < b.top && r.right <= b.right && b.right - r.right < 40; }), true, `${name}: .toon-sfx-corner shows, absolutely placed, above its parent's top edge and within 40 px of its right edge`);

    // Toggle group: pressing the second button moves aria-pressed.
    await page.click('.toon-nav button:nth-child(2)');
    eq(await page.$eval('.toon-nav button:nth-child(2)', (b) => b.getAttribute('aria-pressed')), 'true', `${name}: toggle presses the tapped button`);
    eq(await page.$eval('.toon-nav button:nth-child(1)', (b) => b.getAttribute('aria-pressed')), 'false', `${name}: toggle releases the other button`);

    // Modal: opens, locks scroll, closes on Escape, returns focus.
    await page.click('#open');
    eq(await page.$eval('#demo', (d) => (d as HTMLDialogElement).open), true, `${name}: modal opens`);
    eq(await page.evaluate(() => document.documentElement.classList.contains('toon-modal-open')), true, `${name}: modal locks scroll`);
    await page.screenshot({ path: `test/out/${name}-modal.png` });

    // A link with data-toon-modal opens a shared dialog on top of the open one.
    await page.click('#more');
    await settled(() => document.getElementById('toon-modal-title')?.textContent === 'Fetched page');
    eq(await page.$eval('#toon-modal-title', (h) => h.textContent), 'Fetched page', `${name}: shared modal shows the fetched title`);
    eq(requests.includes('/page?v=2'), true, `${name}: the query string reaches the server (${requests.join(', ')})`);
    eq(await page.evaluate(() => (window as unknown as { __xss?: number }).__xss === undefined && !document.querySelector('.toon-modal-body [onerror]') && !document.querySelector('.toon-modal-body [href^="javascript:"]')), true, `${name}: fetched markup loses inline handlers and javascript: links`);
    eq(await page.$eval('.toon-modal-body a.toon-link[href^="/page"]', (a) => a.getAttribute('href')), '/page?v=2', `${name}: "Open as a full page" keeps the query string`);
    // Closing the top modal leaves the other one open, so the page must stay locked.
    await page.keyboard.press('Escape');
    eq(await settled(() => document.querySelectorAll('dialog.toon-modal[open]').length === 1), true, `${name}: Escape closes only the top modal`);
    eq(await page.evaluate(() => document.documentElement.classList.contains('toon-modal-open')), true, `${name}: scroll stays locked while a modal is open`);
    await page.keyboard.press('Escape');
    eq(await settled(() => !(document.getElementById('demo') as HTMLDialogElement).open), true, `${name}: Escape closes the modal`);
    eq(await settled(() => !document.documentElement.classList.contains('toon-modal-open')), true, `${name}: closing unlocks scroll`);
    eq(await page.evaluate(() => document.activeElement?.id), 'open', `${name}: focus returns to the opener`);

    await page.screenshot({ path: `test/out/${name}.png`, fullPage: true });
    eq(problems.length, 0, `${name}: no console errors or failed requests (${problems.join('; ')})`);
    await ctx.close();
  }

  // Deck: a pile on a phone, a grid from md. Each case runs in a fresh context so a failed flip cannot leak into the next.
  const deckPage = async (width: number, opts: Parameters<typeof browser.newContext>[0] = {}) => {
    const c = await browser.newContext({ viewport: { width, height: 844 }, hasTouch: true, ...opts });
    const p = await c.newPage();
    const problems: string[] = [];
    p.on('console', (m) => { if (m.type() === 'error') problems.push(m.text()); });
    p.on('pageerror', (e) => problems.push(e.message));
    await p.goto(server.url.href, { waitUntil: 'networkidle' });
    return { c, p, problems };
  };
  const state = (p: Awaited<ReturnType<typeof deckPage>>['p'], sel = '#deck-demo .toon-deck') => p.$eval(sel, (d) => {
    const cards = [...d.querySelectorAll<HTMLElement>('.toon-deck-card')];
    const ctl = d.querySelector('.toon-deck-controls') as HTMLElement;
    return {
      on: d.hasAttribute('data-toon-deck-on'),
      top: cards.findIndex((c) => !c.inert),
      inert: cards.filter((c) => c.inert).length,
      count: d.querySelector('.toon-deck-count')!.textContent,
      controls: getComputedStyle(ctl).display,
      pan: getComputedStyle(d.querySelector('.toon-deck-pile')!).touchAction,
      tops: cards.map((c) => Math.round(c.offsetTop)),
      lefts: cards.map((c) => c.offsetLeft),
      heights: cards.map((c) => c.offsetHeight),
    };
  });
  const overflowOf = (p: Awaited<ReturnType<typeof deckPage>>['p']) => p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  {
    // 390 px: the pile.
    const { c, p, problems } = await deckPage(390);
    let st = await state(p);
    eq(st.on, true, 'deck 390: the pile is on');
    eq(st.top === 0 && st.inert === 2, true, `deck 390: the first card is active and the other two are inert (top ${st.top}, inert ${st.inert})`);
    eq(st.count, '1 / 3', 'deck 390: the counter starts at 1 / 3');
    eq(st.controls, 'flex', 'deck 390: the controls show');
    eq(st.pan, 'pan-y', 'deck 390: the pile allows vertical panning only');
    eq(new Set(st.heights).size, 1, `deck 390: every card is as tall as the tallest (${st.heights})`);
    eq(await p.$$eval('#deck-demo .toon-deck-btn', (bs) => bs.every((b) => b.getBoundingClientRect().height >= 44 && b.getBoundingClientRect().width >= 44)), true, 'deck 390: both buttons are at least 44 px');
    eq(await p.$eval('#deck-demo .toon-deck-pile', (el) => el.getAttribute('role') + '/' + el.getAttribute('aria-roledescription')), 'group/carousel', 'deck 390: the pile is a carousel group');
    eq(await p.$$eval('#deck-demo > .toon-deck:first-child .toon-deck-card', (cs) => cs.map((x) => x.getAttribute('aria-label')).join()), '1 of 3,2 of 3,3 of 3', 'deck 390: each card is labelled "n of 3"');
    // The under-cards peek: card 2 and 3 reach past the top card's right and bottom edges.
    const peek = await p.$$eval('#deck-demo .toon-deck-card', (cs) => cs.map((x) => { const r = x.getBoundingClientRect(); return [Math.round(r.right), Math.round(r.bottom)]; }));
    eq(peek[1]![0]! > peek[0]![0]! && peek[2]![0]! > peek[1]![0]! && peek[1]![1]! > peek[0]![1]! && peek[2]![1]! > peek[1]![1]!, true, `deck 390: the under-cards peek out down and to the right (${JSON.stringify(peek)})`);
    await p.$eval('#deck-demo', (e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await p.screenshot({ path: 'test/out/deck-390-1.png' });
    await p.focus('#deck-demo [data-toon-deck-next]');
    await p.click('#deck-demo [data-toon-deck-next]');
    eq((await overflowOf(p)) <= 0, true, 'deck 390: no horizontal overflow while a card flies out');
    st = await state(p);
    eq(st.top === 1 && st.inert === 2 && st.count === '2 / 3', true, `deck 390: Next flips to card 2 (top ${st.top}, ${st.count})`);
    eq(await p.evaluate(() => document.activeElement?.hasAttribute('data-toon-deck-next')), true, 'deck 390: focus stays on Next after a flip');
    await p.click('#deck-demo [data-toon-deck-next]');
    await p.click('#deck-demo [data-toon-deck-next]');
    st = await state(p);
    eq(st.top === 0 && st.count === '1 / 3', true, `deck 390: Next on the last card wraps to the first (top ${st.top}, ${st.count})`);
    await p.click('#deck-demo [data-toon-deck-prev]');
    eq((await overflowOf(p)) <= 0, true, 'deck 390: no horizontal overflow while a card flies in');
    st = await state(p);
    eq(st.top === 2 && st.count === '3 / 3', true, `deck 390: Previous on the first card wraps to the last (top ${st.top}, ${st.count})`);
    await p.keyboard.press('ArrowRight');
    st = await state(p);
    eq(st.top === 0 && st.count === '1 / 3', true, 'deck 390: ArrowRight on a control flips forward');
    await p.keyboard.press('ArrowLeft');
    st = await state(p);
    eq(st.top === 2, true, 'deck 390: ArrowLeft on a control flips back');
    await p.screenshot({ path: 'test/out/deck-390-2.png' });
    eq((await overflowOf(p)) <= 0, true, 'deck 390: no horizontal overflow after flipping');
    eq(problems.length, 0, `deck 390: no console errors (${problems.join('; ')})`);
    await c.close();
  }
  {
    // Touch: a horizontal swipe flips, a vertical drag scrolls the page, a tap on a link navigates.
    const { c, p, problems } = await deckPage(390);
    await p.$eval('#deck-demo', (e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
    const cdp = await c.newCDPSession(p);
    const touch = async (type: 'touchStart' | 'touchMove' | 'touchEnd', x?: number, y?: number) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: x === undefined ? [] : [{ x, y: y! }] });
    const drag = async (x0: number, y0: number, dx: number, dy: number, steps = 8) => {
      await touch('touchStart', x0, y0);
      for (let k = 1; k <= steps; k++) await touch('touchMove', x0 + (dx * k) / steps, y0 + (dy * k) / steps);
      await touch('touchEnd');
      await p.waitForTimeout(450);
    };
    const box = (await (await p.$('#deck-demo .toon-deck-pile'))!.boundingBox())!;
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    await drag(cx + 60, cy, -140, 6);
    let st = await state(p);
    eq(st.top === 1 && st.count === '2 / 3', true, `deck swipe: a swipe left flips to card 2 (top ${st.top}, ${st.count})`);
    await drag(cx - 60, cy, 140, -6);
    st = await state(p);
    eq(st.top === 0 && st.count === '1 / 3', true, `deck swipe: a swipe right goes back to card 1 (top ${st.top}, ${st.count})`);
    await drag(cx - 60, cy, 140, -6);
    st = await state(p);
    eq(st.top === 2 && st.count === '3 / 3', true, `deck swipe: a swipe right on the first card loops to the last (top ${st.top}, ${st.count})`);
    await drag(cx + 60, cy, -140, 6);
    st = await state(p);
    eq(st.top === 0 && st.count === '1 / 3', true, `deck swipe: a swipe left on the last card loops to the first (top ${st.top}, ${st.count})`);
    await drag(cx - 60, cy, 140, -6);
    st = await state(p);
    eq(st.top === 2 && st.count === '3 / 3', true, `deck swipe: and back to the last (top ${st.top}, ${st.count})`);
    await drag(cx, cy, 20, 4); // short and slow: springs back
    st = await state(p);
    eq(st.top === 2, true, `deck swipe: a short drag springs back (top ${st.top})`);
    const y0 = await p.evaluate(() => scrollY);
    await drag(cx, cy + 10, 6, 160);
    const y1 = await p.evaluate(() => scrollY);
    st = await state(p);
    eq(y1 < y0 - 40, true, `deck swipe: a vertical drag that starts on the deck scrolls the page (scrollY ${y0} -> ${y1})`);
    eq(st.top === 2, true, 'deck swipe: a vertical drag does not flip');
    // Tap a link in the top card. Bring card 1 up first, then tap its link.
    await p.click('#deck-demo [data-toon-deck-next]');
    await p.$eval('#deck-demo', (e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
    const lb = (await (await p.$('#deck-link'))!.boundingBox())!;
    await p.touchscreen.tap(lb.x + lb.width / 2, lb.y + lb.height / 2);
    eq(await p.evaluate(() => location.hash), '#tapped', 'deck swipe: a tap on a link in the top card navigates');
    eq((await overflowOf(p)) <= 0, true, 'deck swipe: no horizontal overflow');
    // The pager stacks on a phone, and each link is at least a 44 px target with its arrow on the outer side.
    const pg = await p.evaluate(() => {
      const [a, b] = [...document.querySelectorAll<HTMLElement>('.pager-demo .toon-pager-link')].map((l) => ({ r: l.getBoundingClientRect(), ar: l.querySelector('.toon-pager-arrow')!.getBoundingClientRect(), t: l.querySelector('.toon-pager-title')!.getBoundingClientRect(), lh: parseFloat(getComputedStyle(l.querySelector('.toon-pager-title')!).lineHeight) }));
      return { stacked: b!.r.top >= a!.r.bottom, minH: Math.min(a!.r.height, b!.r.height), prevArrowLeft: a!.ar.left < a!.t.left, nextArrowRight: b!.ar.right > b!.t.right, lines: Math.round(b!.t.height / b!.lh) };
    });
    eq(pg.stacked, true, 'pager 390: the two links stack');
    eq(pg.minH >= 44, true, `pager 390: each link is at least 44 px tall (${pg.minH})`);
    eq(pg.prevArrowLeft && pg.nextArrowRight, true, 'pager 390: the previous arrow sits left of its text and the next arrow right of its text');
    eq(pg.lines <= 2, true, `pager 390: a long title is cut at two lines (${pg.lines})`);
    const sep = await p.$eval('.pager-demo .toon-pager-sep', (e) => { const r = e.getBoundingClientRect(); return r.width <= 1 && r.height <= 1; });
    eq(sep, true, 'pager 390: the separator between direction and title is hidden from sight');
    const stale = await p.$$eval('#deck-demo .toon-deck-card', (cs) => cs.filter((c) => (c as HTMLElement).style.getPropertyValue('--dx') !== '').length);
    eq(stale, 0, `deck swipe: no card keeps a drag offset after the swipes (${stale})`);
    eq(problems.length, 0, `deck swipe: no console errors (${problems.join('; ')})`);
    await c.close();
  }
  {
    // 1280 px: no pile, a grid of three. The `always` deck stays on.
    const { c, p, problems } = await deckPage(1280);
    const st = await state(p);
    eq(st.on, false, 'deck 1280: the pile is off');
    const side = await p.evaluate(() => { const [a, b] = [...document.querySelectorAll('.pager-demo .toon-pager-link')].map((l) => l.getBoundingClientRect()); return Math.abs(a!.top - b!.top) < 2 && b!.left > a!.right; });
    eq(side, true, 'pager 1280: the two links sit side by side');
    eq(st.inert, 0, 'deck 1280: no card is inert');
    eq(st.controls, 'none', 'deck 1280: the controls are hidden');
    eq(new Set(st.tops).size === 1 && new Set(st.lefts).size === 3, true, `deck 1280: the cards lay out in a row of three (tops ${st.tops}, lefts ${st.lefts})`);
    const al = await state(p, '#deck-demo .deck-always');
    eq(al.on && al.inert === 1 && al.controls === 'flex', true, `deck 1280: an "always" deck stays a pile (on ${al.on}, inert ${al.inert}, controls ${al.controls})`);
    // Crossing the breakpoint updates the pile without a reload.
    await p.setViewportSize({ width: 390, height: 844 });
    await p.waitForTimeout(150);
    let sm = await state(p);
    eq(sm.on && sm.inert === 2, true, `deck resize: narrowing to 390 turns the pile on (on ${sm.on}, inert ${sm.inert})`);
    await p.click('#deck-demo [data-toon-deck-next]');
    await p.setViewportSize({ width: 1280, height: 844 });
    await p.waitForTimeout(150);
    sm = await state(p);
    eq(!sm.on && sm.inert === 0 && sm.controls === 'none', true, `deck resize: widening to 1280 turns it off and clears inert (on ${sm.on}, inert ${sm.inert})`);
    await p.setViewportSize({ width: 390, height: 844 });
    await p.waitForTimeout(150);
    sm = await state(p);
    eq(sm.on && sm.top === 1 && sm.count === '2 / 3', true, `deck resize: the pile keeps its place when it returns (top ${sm.top}, ${sm.count})`);
    eq(problems.length, 0, `deck 1280: no console errors (${problems.join('; ')})`);
    await c.close();
  }
  for (const [what, opts] of [['reduced motion', { reducedMotion: 'reduce' }], ['data-motion=off', {}]] as const) {
    // With motion off a flip still completes, because the state does not wait on an animation.
    const { c, p } = await deckPage(390, opts);
    if (what === 'data-motion=off') await p.evaluate(() => { document.documentElement.dataset.motion = 'off'; });
    await p.click('#deck-demo [data-toon-deck-next]');
    const st = await state(p);
    eq(st.top === 1 && st.count === '2 / 3', true, `deck ${what}: a click still flips (top ${st.top}, ${st.count})`);
    eq(await p.$eval('#deck-demo .toon-deck-card', (x) => getComputedStyle(x).animationName), 'none', `deck ${what}: the flip animation is off`);
    eq(await p.$eval('#deck-demo .toon-deck-card', (x) => getComputedStyle(x).transitionDuration), '0s', `deck ${what}: the card transition is off`);
    eq(await p.$eval('#deck-demo .toon-deck-card[data-pos="1"]', (x) => getComputedStyle(x).transform !== 'none'), true, `deck ${what}: the under-cards keep their resting tilt`);
    await c.close();
  }

  // Accessibility: axe at WCAG 2.2 AA on both widths, then what axe cannot see. Motion is off so a colour caught mid-animation
  // is not read as a contrast failure. A violation fails the check and prints the rule, the count and the first node.
  for (const [name, width, height] of [['desktop', 1280, 900], ['phone', 390, 844]] as const) {
    const c = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
    const p = await c.newPage();
    await p.goto(server.url.href, { waitUntil: 'networkidle' });
    await p.addScriptTag({ url: '/axe.js' });
    const res = await p.evaluate(() => (window as any).axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] }));
    console.log(`a11y ${name}: axe ran ${res.passes.length} rules to a pass, ${res.violations.length} violations, ${res.incomplete.length} needing review`);
    eq(res.passes.length > 30, true, `a11y ${name}: axe ran (only ${res.passes.length} rules passed)`);
    for (const v of res.violations) check(false, `a11y ${name}: ${v.id} (${v.nodes.length}): ${v.help}; first ${v.nodes[0].target.join(' ')}: ${v.nodes[0].any[0]?.message ?? ''}`);
    await p.keyboard.press('Tab'); // before any focus() call moves the starting point
    eq(await p.evaluate(() => document.activeElement?.className), 'toon-skip', `a11y ${name}: the skip link is the first tab stop`);
    // The focus ring: every tabbable element shows an ink ring or an ink outline, so it keeps 3:1 on paper and the navy ground.
    const rings = await p.evaluate(async () => {
      const out: string[] = []; let n = 0;
      for (const el of [...document.querySelectorAll<HTMLElement>('a[href],button,summary')]) {
        if (!el.offsetParent && getComputedStyle(el).position !== 'fixed') continue;
        if (el.closest('dialog:not([open]),[inert]') || (el.closest('details:not([open])') && el.tagName !== 'SUMMARY')) continue;
        el.focus({ focusVisible: true } as FocusOptions); n++;
        const cs = getComputedStyle(el);
        const ink = /rgb\(10, 10, 31\) 0px 0px 0px 2px/.test(cs.boxShadow) || cs.outlineColor === 'rgb(10, 10, 31)';
        if (!ink || cs.outlineStyle === 'none') out.push(`${el.tagName}.${String(el.className).slice(0, 30)} outline ${cs.outlineStyle} ${cs.outlineColor}, shadow ${cs.boxShadow.slice(0, 40)}`);
        el.blur();
      }
      return { n, out };
    });
    console.log(`a11y ${name}: focus ring read on ${rings.n} focusable elements`);
    eq(rings.n > 10, true, `a11y ${name}: focus ring checked ${rings.n} elements`);
    eq(rings.out.join(' | '), '', `a11y ${name}: every focusable element has an ink ring and an outline`);
    // Target size: WCAG 2.2 asks 24 px; the kit's own controls keep 44 px, Apple's minimum.
    const TARGETS = '.toon-btn,.toon-nav a,.toon-nav button,.toon-pager-link,.toon-deck-btn,.toon-modal-x,.toon-motion,.toon-kicker-link,.toon-shot-text > summary,.toon-tab,.toon-disclosure-btn';
    const sizes = (sel: string) => p.evaluate((s) => { const els = [...document.querySelectorAll<HTMLElement>(s)].filter((e) => e.getClientRects().length); return { n: els.length, small: els.filter((e) => e.getBoundingClientRect().height < 43.5).map((e) => `${e.tagName.toLowerCase()}.${String(e.className).slice(0, 30)} ${Math.round(e.getBoundingClientRect().height)}px`) }; }, sel);
    const at = await sizes(TARGETS);
    console.log(`a11y ${name}: target size read on ${at.n} kit controls`);
    eq(at.n > 8, true, `a11y ${name}: target size checked ${at.n} controls`);
    eq(at.small.join(' | '), '', `a11y ${name}: kit controls are 44 px tall`);
    // Semantics: one h1, a main landmark, an h2 before any h3, and a skip link that is the first tab stop.
    const sem = await p.evaluate(() => { const hs = [...document.querySelectorAll('h1,h2,h3,h4')].map((h) => +h.tagName[1]!); return { h1: hs.filter((h) => h === 1).length, jump: hs.some((h, i) => i > 0 && h - hs[i - 1]! > 1), main: document.querySelectorAll('main').length }; });
    eq(sem.h1, 1, `a11y ${name}: one h1`); eq(sem.jump, false, `a11y ${name}: headings never skip a level`); eq(sem.main, 1, `a11y ${name}: one main landmark`);
    // The modal is closed in the pass above, so axe and the target check never saw it. Open it and read both again.
    await p.click('#open');
    eq(await p.$eval('#demo', (d) => (d as HTMLDialogElement).open), true, `a11y ${name}: the modal is open for its own pass`);
    const open = await p.evaluate(() => (window as any).axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] }));
    console.log(`a11y ${name}, modal open: axe ran ${open.passes.length} rules to a pass, ${open.violations.length} violations`);
    eq(open.passes.some((r: { id: string }) => r.id === 'color-contrast'), true, `a11y ${name}, modal open: axe read contrast inside the modal`);
    for (const v of open.violations) check(false, `a11y ${name}, modal open: ${v.id} (${v.nodes.length}): ${v.help}; first ${v.nodes[0].target.join(' ')}: ${v.nodes[0].any[0]?.message ?? ''}`);
    const x = await sizes('#demo .toon-modal-x');
    eq(x.n, 1, `a11y ${name}, modal open: the close button is measured`);
    eq(x.small.join(' | '), '', `a11y ${name}, modal open: the close button is 44 px tall`);
    await c.close();
  }

  // Desk components: tab bar and disclosure behaviour, and layout claims that axe cannot make.
  for (const [name, width, height] of [['desktop', 1280, 900], ['phone', 390, 844]] as const) {
    const c = await browser.newContext({ viewport: { width, height } });
    const p = await c.newPage();
    await p.goto(server.url.href, { waitUntil: 'networkidle' });
    const q = <T>(fn: () => T) => p.evaluate(fn);
    const tabs = '[role="tab"]';
    // Initial state: the first tab is selected, the others leave the tab order, and only its panel shows.
    eq(await q(() => [...document.querySelectorAll('[role="tab"]')].map((t) => `${t.getAttribute('aria-selected')}/${(t as HTMLElement).tabIndex}`).join()), 'true/0,false/-1,false/-1', `${name}: tabs start with the first selected and a roving tab stop`);
    eq(await q(() => [...document.querySelectorAll('.toon-tabpanel')].map((e) => (e as HTMLElement).hidden).join()), 'false,true,true', `${name}: only the first panel shows`);
    await p.click('#tab-brief-tab');
    eq(await q(() => `${location.hash}|${document.querySelector('#tab-brief')!.hasAttribute('hidden')}|${document.querySelector('#tab-board')!.hasAttribute('hidden')}|${document.querySelector('#tab-brief-tab')!.getAttribute('aria-selected')}`), '#tab-brief|false|true|true', `${name}: a click opens the panel and keeps it in the hash`);
    eq(await q(() => scrollY), 0, `${name}: a tab click scrolls to the top`);
    await p.focus('#tab-brief-tab');
    await p.keyboard.press('ArrowRight');
    eq(await q(() => `${document.activeElement?.id}|${location.hash}`), 'tab-record-tab|#tab-record', `${name}: ArrowRight moves to the next tab`);
    await p.keyboard.press('ArrowRight');
    eq(await q(() => document.activeElement?.id), 'tab-board-tab', `${name}: ArrowRight wraps to the first tab`);
    await p.keyboard.press('ArrowLeft');
    eq(await q(() => document.activeElement?.id), 'tab-record-tab', `${name}: ArrowLeft wraps to the last tab`);
    await p.keyboard.press('Home');
    eq(await q(() => document.activeElement?.id), 'tab-board-tab', `${name}: Home goes to the first tab`);
    await p.keyboard.press('End');
    eq(await q(() => `${document.activeElement?.id}|${document.querySelector('#tab-record')!.hasAttribute('hidden')}`), 'tab-record-tab|false', `${name}: End goes to the last tab and shows its panel`);
    await p.goBack();
    eq(await p.evaluate(() => document.querySelector('#tab-board-tab')!.getAttribute('aria-selected')), 'true', `${name}: Back to an entry with no hash returns to the first tab`);
    await p.goto('about:blank'); // a new document, because a change of hash alone is not a load
    await p.goto(server.url.href + '#%E0%A4', { waitUntil: 'networkidle' });
    eq(await q(() => document.querySelector('#p-01-btn')!.getAttribute('aria-controls')), 'p-01', `${name}: a malformed hash does not stop the script`);
    await p.click('#p-02-btn');
    eq(await q(() => (document.querySelector('#p-02') as HTMLElement).hidden), false, `${name}: disclosure still works after a malformed hash`);
    await p.goto('about:blank');
    await p.goto(server.url.href + '#tab-record', { waitUntil: 'networkidle' });
    eq(await q(() => scrollY < 5), true, `${name}: a load with a tab hash starts at the top`);
    eq(await q(() => document.querySelector('#tab-record-tab')!.getAttribute('aria-selected')), 'true', `${name}: a link with a hash opens that tab on load`);
    eq(await q(() => document.activeElement === document.body), true, `${name}: a load with a tab hash leaves no focus ring around the panel`);
    eq(await q(() => { const el = document.querySelector('#tab-record') as HTMLElement; el.focus(); return document.activeElement === el; }), true, `${name}: a later focus on that panel stays, with no key or pointer press`);
    await q(() => (document.activeElement as HTMLElement).blur());
    eq(await q(() => `${(document.querySelector('.toon-tab') as HTMLElement).getBoundingClientRect().height >= 48}|${[...document.querySelectorAll('.toon-tab')].every((t) => t.getBoundingClientRect().width >= 44)}`), 'true|true', `${name}: tabs are 48 px tall and 44 px wide`);
    const bar = await q(() => { const r = document.querySelector('.toon-tabbar')!.getBoundingClientRect(); return { bottom: Math.round(innerHeight - r.bottom), h: Math.round(r.height), var: getComputedStyle(document.querySelector('.toon-page')!).paddingBottom }; });
    eq(bar.bottom, 0, `${name}: the tab bar sits at the bottom`);
    eq(`${bar.h}px`, bar.var, `${name}: --toon-tabbar-h equals the bar's height (${bar.h}px)`);
    eq(await p.$eval('.toon-tabbar', (e) => getComputedStyle(e).borderTopWidth), '3px', `${name}: the tab bar has a 3px top border`);
    await p.waitForTimeout(500); // the fill transitions
    eq(await p.$eval('.toon-tab[aria-selected="true"]', (e) => getComputedStyle(e).backgroundColor), 'rgb(242, 201, 76)', `${name}: the selected tab is yellow`);

    // Disclosure: a click toggles aria-expanded and the panel; the native row opens with its summary.
    await p.goto(server.url.href, { waitUntil: 'networkidle' });
    eq(await q(() => `${document.querySelector('#p-01-btn')!.getAttribute('aria-expanded')}|${document.querySelector('#p-02-btn')!.getAttribute('aria-expanded')}`), 'true|false', `${name}: disclosure open state starts as written`);
    await p.click('#p-02-btn');
    eq(await q(() => `${document.querySelector('#p-02-btn')!.getAttribute('aria-expanded')}|${(document.querySelector('#p-02') as HTMLElement).hidden}`), 'true|false', `${name}: a click opens a disclosure`);
    await p.focus('#p-02-btn');
    await p.keyboard.press('Enter');
    eq(await q(() => `${document.querySelector('#p-02-btn')!.getAttribute('aria-expanded')}|${(document.querySelector('#p-02') as HTMLElement).hidden}`), 'false|true', `${name}: Enter closes it again`);
    await p.keyboard.press('Space');
    eq(await q(() => (document.querySelector('#p-02') as HTMLElement).hidden), false, `${name}: Space opens it`);
    await p.click('#p-03-btn');
    eq(await q(() => (document.querySelector('#p-03-btn')!.closest('details') as HTMLDetailsElement).open), true, `${name}: the native row opens with its summary`);
    eq(await q(() => [...document.querySelectorAll('.toon-disclosure-btn')].every((b) => b.getBoundingClientRect().height >= 43.5)), true, `${name}: every disclosure row is 44 px tall`);
    // Layout: the panel indents to the title from sm and is full width on a phone.
    const ind = await q(() => { const t = document.querySelector('#p-01-btn .toon-disclosure-title')!.getBoundingClientRect().left; const pn = document.querySelector('#p-01 > .toon-chip')!.getBoundingClientRect().left; const row = document.querySelector('#p-01')!.getBoundingClientRect().left; return { t, pn, row }; });
    eq(width >= 640 ? Math.abs(ind.pn - ind.t) < 1 : Math.abs(ind.pn - ind.row - 16) < 1, true, `${name}: the panel ${width >= 640 ? 'lines up with the title' : 'is full width'} (${JSON.stringify(ind)})`);
    // The delta says its direction in text, and the marker and the fill differ by owner.
    eq(await q(() => [...document.querySelectorAll('#desk-card > p:first-child .toon-delta')].map((d) => d.textContent).join('|')), '▲ 4|▼ 32|· 0|▲ 1.5%', `${name}: deltas show a glyph and a signed number`);
    eq(await q(() => `${getComputedStyle(document.querySelector('.toon-owner-a.toon-scale-mark')!).backgroundColor}|${getComputedStyle(document.querySelector('.toon-owner-b.toon-scale-mark')!).backgroundColor}`), 'rgb(10, 10, 31)|rgb(169, 149, 240)', `${name}: owner a is ink and owner b is violet`);
    eq(await q(() => `${getComputedStyle(document.querySelector('#desk-card .toon-delta-up')!).color}|${getComputedStyle(document.querySelector('#desk-card .toon-delta-down')!).color}|${getComputedStyle(document.querySelector('#ground-deltas .toon-delta-up')!).color}|${getComputedStyle(document.querySelector('#ground-deltas .toon-delta-flat')!).color}`), 'rgb(200, 50, 43)|rgb(42, 87, 214)|rgb(242, 112, 106)|rgb(185, 189, 224)', `${name}: delta colours are red-text and blue-text on paper, red and mist on the ground`);
    eq(await q(() => `${getComputedStyle(document.querySelector('#desk-card .toon-delta-invert')!).color}`), 'rgb(42, 87, 214)', `${name}: invert swaps up to blue`);
    // The scale: the marker follows its value on the track, past dots are faint, and nothing widens the page.
    const sc = await q(() => { const t = document.querySelector('#desk-card .toon-scale')!.getBoundingClientRect(); const m = document.querySelector('#desk-card .toon-scale-mark')!.getBoundingClientRect(); return { at: (m.left + m.width / 2 - t.left) / t.width, w: m.width, past: getComputedStyle(document.querySelector('.toon-scale-past')!).opacity, trackH: t.height, over: document.documentElement.scrollWidth - innerWidth }; });
    eq(Math.abs(sc.at - 0.82) < 0.02 && sc.w === 16 && sc.past === '0.4' && sc.trackH === 6 && sc.over <= 0, true, `${name}: scale marker sits at 82% (${JSON.stringify(sc)})`);
    // The meter: the fill is its share of the well, and the row is two lines on a phone and one row from sm.
    const mt = await q(() => { const root = document.querySelector('#desk-card .toon-meter')!; const bar = root.querySelector('.toon-meter-bar')!.getBoundingClientRect(); const fill = root.querySelector('.toon-meter-fill')!.getBoundingClientRect(); const lab = root.querySelector('.toon-meter-label')!.getBoundingClientRect(); return { share: fill.width / (bar.width - 4), barH: bar.height, labelAbove: lab.bottom <= bar.top + 1 }; });
    eq(Math.abs(mt.share - 0.07) < 0.02 && mt.barH === 16 && mt.labelAbove === (width < 640), true, `${name}: large meter fill is 7%, 16px tall, label ${width < 640 ? 'above' : 'beside'} the bar (${JSON.stringify(mt)})`);
    eq(await q(() => document.documentElement.scrollWidth - innerWidth <= 0), true, `${name}: the desk components do not widen the page`);
    // Dashboard components: the switch button drops a click while it is aria-disabled, and nothing widens the page.
    const sw = await q(() => { let hits = 0; document.querySelectorAll('[data-toon-switch-to]').forEach((b) => b.addEventListener('click', () => hits++)); (document.querySelector('#switches .toon-switch-row:nth-child(1) [data-toon-switch-to]') as HTMLElement).click(); const off = hits; (document.querySelector('#switches .toon-switch-row:nth-child(2) [data-toon-switch-to]') as HTMLElement).click(); return `${off}|${hits}`; });
    eq(sw, '0|1', `${name}: a click on an aria-disabled switch button is dropped, and an enabled one reaches its handler`);
    eq(await q(() => `${document.querySelectorAll('#dash .toon-uptime-cell').length}|${[...document.querySelectorAll('#dash [data-toon-switch-to], #dash .toon-chart-table > summary')].every((e) => e.getBoundingClientRect().height >= 43.5)}`), '96|true', `${name}: 96 uptime cells render and the switch buttons and table toggles are 44 px tall`);
    eq(await q(() => { const h = (c: string) => document.querySelector(c)!.getBoundingClientRect().height; return h('.toon-uptime-unknown') < h('.toon-uptime-ok'); }), true, `${name}: an unknown uptime cell is shorter than an ok cell`);
    eq(await q(() => document.documentElement.scrollWidth - innerWidth <= 0 && [...document.querySelectorAll('#dash *')].filter((e) => !e.closest('.toon-table-wrap')).every((e) => e.getBoundingClientRect().right <= innerWidth + 1)), true, `${name}: the dashboard components fit the page`);
    // Answer-first components: the toggle is 44 px and drops a click while aria-disabled, and the readout on the ground is full-strength text.
    const tg = await q(() => { let hits = 0; const ts = [...document.querySelectorAll<HTMLElement>('#toggles .toon-toggle')]; ts.forEach((b) => b.addEventListener('click', () => hits++)); ts[0]!.click(); const off = hits; ts[1]!.click(); return `${ts.length}|${off}|${hits}|${[...document.querySelectorAll('.toon-toggle')].every((b) => b.getBoundingClientRect().height >= 44)}|${ts[0]!.getAttribute('aria-checked')}${ts[1]!.getAttribute('aria-checked')}`; });
    eq(tg, '2|0|1|true|falsetrue', `${name}: a disabled toggle drops its click, an enabled one reaches its handler, and each is 44 px tall`);
    // Settings: the button is 48 px and the items 44 px, a click opens it, the gears turn while it is open, Escape closes it and returns focus.
    const st0 = await q(() => { const b = document.querySelector<HTMLElement>('#st-demo > summary')!; const r = b.getBoundingClientRect(); return `${Math.round(r.width)}x${Math.round(r.height)}|${(document.getElementById('st-demo') as HTMLDetailsElement).open}`; });
    eq(st0, '48x48|false', `${name}: the settings button is 48 px and starts closed`);
    await p.click('#st-demo > summary');
    await p.waitForTimeout(150);
    const st1 = await q(() => { const d = document.getElementById('st-demo') as HTMLDetailsElement; const it = d.querySelector<HTMLElement>('.toon-settings-item')!; const g = getComputedStyle(d.querySelector('.toon-gear-big')!).animationName; return `${d.open}|${Math.round(it.getBoundingClientRect().height) >= 44}|${g}|${it.getBoundingClientRect().right <= innerWidth}`; });
    eq(st1, 'true|true|toon-spin|true', `${name}: a click opens the settings menu, its item is 44 px tall, the gears turn and the panel stays on screen`);
    await p.keyboard.press('Escape');
    eq(await q(() => `${(document.getElementById('st-demo') as HTMLDetailsElement).open}|${document.activeElement === document.querySelector('#st-demo > summary')}`), 'false|true', `${name}: Escape closes the settings menu and returns focus to its button`);
    const cards = await q(() => { let hits = 0; const bs = [...document.querySelectorAll<HTMLElement>('#switch-cards .toon-switch-card-side')]; bs.forEach((b) => b.addEventListener('click', () => hits++)); document.getElementById('sc-a-cloud')!.click(); const off = hits; document.getElementById('sc-b-lab')!.click(); return `${bs.length}|${off}|${hits}|${bs.every((b) => b.getBoundingClientRect().height >= 44)}|${document.querySelectorAll('#switch-cards [aria-pressed="true"]').length}`; });
    eq(cards, '6|0|1|true|3', `${name}: a refused switch card side drops its click, an allowed one reaches its handler, each side is 44 px tall and one side per card is pressed`);
    const ro = await q(() => {
      const lum = (c: string) => { const v = c.match(/[\d.]+/g)!.slice(0, 3).map((x) => +x / 255).map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4)); return 0.2126 * v[0]! + 0.7152 * v[1]! + 0.0722 * v[2]!; };
      const ratio = (a: string, b: string) => { const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x); return (hi! + 0.05) / (lo! + 0.05); };
      const ground = getComputedStyle(document.body).backgroundColor;
      const r = document.querySelector('#readout-ground')!;
      const parts = [r.querySelector('.toon-readout-text')!, r.querySelector('.toon-readout-label')!].map((e) => { const cs = getComputedStyle(e); let op = 1; for (let n: Element | null = e; n; n = n.parentElement) op *= +getComputedStyle(n).opacity; return { size: parseFloat(cs.fontSize), ratio: ratio(cs.color, ground), op }; });
      return { text: parts[0]!, label: parts[1]!, width: r.getBoundingClientRect().width };
    });
    eq(ro.text.size >= 15 && ro.text.ratio >= 7 && ro.text.op === 1 && ro.label.size >= 12 && ro.label.ratio >= 7 && ro.label.op === 1, true, `${name}: the readout on the ground is at least 15 px, 7:1 and never dimmed (${JSON.stringify(ro)})`);
    eq(await q(() => document.documentElement.scrollWidth - innerWidth <= 0 && [...document.querySelectorAll('#answers *, .toon-masthead *')].filter((e) => !e.closest('.toon-table-wrap, .toon-masthead-sr')).every((e) => e.getBoundingClientRect().right <= innerWidth + 1)), true, `${name}: the answer-first components and the masthead fit the page`);
    const small = await q(() => {
      let n = 0; const out = new Set<string>();
      for (const el of document.querySelectorAll<HTMLElement>('body *')) {
        if (el.closest('svg, [aria-hidden="true"], [hidden]') || ![...el.childNodes].some((t) => t.nodeType === 3 && t.textContent!.trim())) continue;
        if (!el.getClientRects().length) continue;
        n++;
        if (parseFloat(getComputedStyle(el).fontSize) < 12) out.add(`${el.className || el.tagName} ${getComputedStyle(el).fontSize}`);
      }
      let charts = 0;
      for (const t of document.querySelectorAll<SVGTextElement>('svg text')) {
        const svg = t.ownerSVGElement!;
        if (!svg.getClientRects().length || !svg.viewBox.baseVal.width) continue;
        charts++;
        const drawn = parseFloat(getComputedStyle(t).fontSize) * (svg.getBoundingClientRect().width / svg.viewBox.baseVal.width);
        if (drawn < 12) out.add(`svg text ${drawn.toFixed(1)}px`);
      }
      return { n, charts, out: [...out].join(', ') };
    });
    eq(`${small.n > 100 && small.charts > 0}|${small.out}`, 'true|', `${name}: no visible text is under 12 px as drawn (read ${small.n} elements and ${small.charts} chart labels)`);
    await p.setViewportSize({ width: 320, height: 700 });
    eq(await q(() => [...document.querySelectorAll('#answers *, .toon-masthead *')].filter((e) => !e.closest('.toon-table-wrap, .toon-masthead-sr')).filter((e) => e.getBoundingClientRect().right > innerWidth + 1).map((e) => e.className).join(',')), '', `${name}: the answer-first components and the masthead fit at 320 px`);
    eq(await q(() => document.documentElement.scrollWidth - innerWidth <= 0 && [...document.querySelectorAll('#desk *')].every((e) => e.getBoundingClientRect().right <= innerWidth + 1)), true, `${name}: the desk components fit at 320 px`);
    await c.close();
  }

  // Reduced motion: every animation stops.
  const ctx = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(server.url.href, { waitUntil: 'networkidle' });
  eq(await page.$eval('.toon-btn', (b) => getComputedStyle(b).transitionDuration), '0s', 'reduced motion: transitions stop');
  eq(await page.evaluate(() => [...document.querySelectorAll('*')].every((e) => getComputedStyle(e).animationName === 'none')), true, 'reduced motion: animations stop');
  eq(await page.evaluate(() => ['.toon-scale-mark', '.toon-scale-move', '.toon-meter-fill', '.toon-disclosure-panel'].map((s) => getComputedStyle(document.querySelector(s)!).animationName).join()), 'none,none,none,none', 'reduced motion: scale, meter and disclosure animations stop');
  await ctx.close();

  // The motion switch: data-motion="off" stops every animation without the system preference.
  const ctx2 = await browser.newContext();
  const page2 = await ctx2.newPage();
  await page2.goto(server.url.href, { waitUntil: 'networkidle' });
  await page2.evaluate(() => { document.documentElement.dataset.motion = 'off'; });
  eq(await page2.$eval('.toon-btn', (b) => getComputedStyle(b).transitionDuration), '0s', 'data-motion=off: transitions stop');
  eq(await page2.evaluate(() => [...document.querySelectorAll('*')].every((e) => getComputedStyle(e).animationName === 'none')), true, 'data-motion=off: animations stop');
  await ctx2.close();
} finally {
  await browser.close();
  server.stop(true);
}

if (fail.length) {
  console.error(`browser check FAILED, ${fail.length} of ${checks} checks:\n- ${fail.join('\n- ')}`);
  process.exit(1);
}
console.log(`browser check passed: ${checks} checks at 1280 px and 390 px, plus the deck, accessibility (axe at WCAG 2.2 AA, focus rings, target size, semantics) and reduced motion; screenshots in test/out/`);
