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

const server = Bun.serve({
  port: 0,
  async fetch(req) {
    const { pathname } = new URL(req.url);
    if (pathname === '/') return new Response(fixture(), { headers: { 'content-type': 'text/html; charset=utf-8' } });
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
    eq(await style('.toon-card', 'background-color'), 'rgb(243, 239, 230)', `${name}: .toon-card fill is paper`);
    eq(await style('body', 'background-color'), 'rgb(12, 18, 64)', `${name}: body is the navy ground`);
    eq(await style('.toon-btn', 'font-family'), '"DM Sans", system-ui, sans-serif', `${name}: .toon-btn uses the body family`);

    // Nothing may widen the page: a phone browser stretches its layout viewport to fit any overflow.
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    eq(overflow <= 0, true, `${name}: no horizontal overflow (scrollWidth - innerWidth = ${overflow})`);

    // Toggle group: pressing the second button moves aria-pressed.
    await page.click('.toon-nav button:nth-child(2)');
    eq(await page.$eval('.toon-nav button:nth-child(2)', (b) => b.getAttribute('aria-pressed')), 'true', `${name}: toggle presses the tapped button`);
    eq(await page.$eval('.toon-nav button:nth-child(1)', (b) => b.getAttribute('aria-pressed')), 'false', `${name}: toggle releases the other button`);

    // Modal: opens, locks scroll, closes on Escape, returns focus.
    await page.click('#open');
    eq(await page.$eval('#demo', (d) => (d as HTMLDialogElement).open), true, `${name}: modal opens`);
    eq(await page.evaluate(() => document.documentElement.classList.contains('toon-modal-open')), true, `${name}: modal locks scroll`);
    await page.screenshot({ path: `test/out/${name}-modal.png` });
    await page.keyboard.press('Escape');
    // The dialog's close event fires on a later task, so wait for the state instead of reading it at once.
    const settled = (fn: () => boolean) => page.waitForFunction(fn, undefined, { timeout: 2000 }).then(() => true, () => false);
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
} finally {
  await browser.close();
  server.stop(true);
}

if (fail.length) {
  console.error(`browser check FAILED, ${fail.length} of ${checks} checks:\n- ${fail.join('\n- ')}`);
  process.exit(1);
}
console.log(`browser check passed: ${checks} checks at 1280 px and 390 px, plus reduced motion; screenshots in test/out/`);
