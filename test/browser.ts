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
      return ['Bangers', 'DM Sans', 'Space Grotesk'].map((f) => [f, [...document.fonts].some((x) => x.family.replace(/"/g, '') === f && x.status === 'loaded')]);
    });
    for (const [f, loaded] of fonts as [string, boolean][]) eq(loaded, true, `${name}: font ${f} loaded`);

    const style = (sel: string, prop: string) => page.$eval(sel, (el, p) => getComputedStyle(el).getPropertyValue(p), prop);
    eq(await style('.toon-btn', 'background-color'), 'rgb(95, 141, 255)', `${name}: .toon-btn fill is blue`);
    eq(await style('.toon-btn', 'border-top-width'), '2px', `${name}: .toon-btn border is 2px`);
    eq(await style('.toon-btn', 'color'), 'rgb(10, 10, 31)', `${name}: .toon-btn text is ink`);
    eq(await style('.toon-card', 'border-top-width'), '2px', `${name}: .toon-card draws its border`);
    eq(await style('.toon-card', 'background-color'), 'rgb(236, 239, 243)', `${name}: .toon-card fill is paper`);
    eq(await style('body', 'background-color'), 'rgb(12, 18, 64)', `${name}: body is the navy ground`);
    eq(await style('.toon-btn', 'font-family'), '"DM Sans", system-ui, sans-serif', `${name}: .toon-btn uses the body family`);

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
    eq(await style('.toon-row + .toon-row', 'border-top-style'), 'solid', `${name}: .toon-row draws its separator`);
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

  // Reduced motion: every animation stops.
  const ctx = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(server.url.href, { waitUntil: 'networkidle' });
  eq(await page.$eval('.toon-btn', (b) => getComputedStyle(b).transitionDuration), '0s', 'reduced motion: transitions stop');
  eq(await page.evaluate(() => [...document.querySelectorAll('*')].every((e) => getComputedStyle(e).animationName === 'none')), true, 'reduced motion: animations stop');
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
console.log(`browser check passed: ${checks} checks at 1280 px and 390 px, plus reduced motion; screenshots in test/out/`);
