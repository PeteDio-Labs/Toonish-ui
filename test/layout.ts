// Layout and snapshot check of the built dist/. It loads the fixture at 1280 px and 390 px and fails on:
//   - a layout finding from test/layout-audit.ts (clipped svg, cut text, overlapping text), at rest and under hover
//   - a section whose pixels differ from its committed baseline in test/snapshots/
// A missing baseline fails too, so a new section cannot pass unchecked. To accept a deliberate change, run
// `UPDATE_SNAPSHOTS=1 bun run test:layout`, look at the changed files in test/snapshots/, and commit them.
// On a failure the actual and diff images go to test/out/layout/, and CI uploads them for one day.
// Set CHROMIUM_PATH to use a browser Playwright did not install.
import { mkdir, rm } from 'node:fs/promises';
import { chromium, type Page } from 'playwright-core';
import { fixture } from './fixture.ts';
import { audit, diffPngs, type Finding } from './layout-audit.ts';

const SNAPSHOTS = 'test/snapshots';
const OUT = 'test/out/layout';
const TOLERANCE = 10; // per channel, out of 255: absorbs text antialiasing between browser builds
const MAX_DIFF = 0.002; // share of pixels allowed to differ beyond the tolerance
const update = process.env.UPDATE_SNAPSHOTS === '1';

const server = Bun.serve({
  port: 0,
  async fetch(req) {
    const { pathname } = new URL(req.url);
    if (pathname === '/canary') return new Response(canary, { headers: { 'content-type': 'text/html; charset=utf-8' } });
    if (pathname === '/') return new Response(fixture(), { headers: { 'content-type': 'text/html; charset=utf-8' } });
    if (pathname.startsWith('/dist/') && !pathname.includes('..')) {
      const f = Bun.file(`.${pathname}`);
      return (await f.exists()) ? new Response(f) : new Response('not found', { status: 404 });
    }
    return new Response('not found', { status: 404 });
  },
});

// Known-bad page. The audit must flag each defect, so a green run proves the audit can see. These are the bugs
// found by eye on staging: an icon cut by its svg, a badge on top of a heading and a heading cut by a clipping box.
const canary = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>canary</title></head>
<body style="margin:0;font:20px sans-serif"><div style="width:120px"><svg id="icon" viewBox="0 0 20 20" width="40" height="40"><path d="M2 10h22" stroke="black" stroke-width="3" fill="none"/></svg></div>
<div style="position:relative;width:200px;margin-top:20px"><h2 id="h" style="margin:0">Heading text</h2><span id="b" style="position:absolute;left:30px;top:6px;background:#ff0">FIXED!</span></div>
<div style="width:100px;height:20px;overflow:hidden;margin-top:20px"><p id="p" style="margin:0 0 0 60px;width:200px">Cut off text here</p></div></body></html>`;

const fail: string[] = [];
let checks = 0, textBoxes = 0, svgs = 0, shots = 0, hovers = 0;

const key = (f: Finding) => `${f.rule}|${f.what}|${f.detail}`;

await mkdir(OUT, { recursive: true });
await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });
if (update) await mkdir(SNAPSHOTS, { recursive: true });

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
try {
  const diffPage = await (await browser.newContext()).newPage();
  const compare = async (actual: Buffer, file: string, what: string) => {
    checks++;
    const base = Bun.file(`${SNAPSHOTS}/${file}`);
    if (update) { await Bun.write(`${SNAPSHOTS}/${file}`, actual); return; }
    if (!(await base.exists())) { fail.push(`${what}: no baseline ${SNAPSHOTS}/${file}. Run UPDATE_SNAPSHOTS=1 bun run test:layout and commit it.`); return; }
    const png = (b: Uint8Array | Buffer) => `data:image/png;base64,${Buffer.from(b).toString('base64')}`;
    const r = await diffPage.evaluate(diffPngs, { a: png(Buffer.from(await base.arrayBuffer())), b: png(actual), tolerance: TOLERANCE });
    if (r.sizeMismatch || r.ratio > MAX_DIFF) {
      await Bun.write(`${OUT}/${file}.actual.png`, actual);
      await Bun.write(`${OUT}/${file}.diff.png`, Buffer.from(r.diff.split(',')[1]!, 'base64'));
      fail.push(`${what}: ${r.sizeMismatch ? 'the size changed' : `${(r.ratio * 100).toFixed(2)}% of pixels differ (limit ${MAX_DIFF * 100}%)`}. See ${OUT}/${file}.diff.png`);
    }
  };

  const run = async (page: Page, label: string, known: Set<string>) => {
    const r = await page.evaluate(audit);
    textBoxes += r.textBoxes; svgs += r.svgs;
    for (const f of r.findings) if (!known.has(key(f))) { fail.push(`${label}: ${f.rule}: ${f.what}: ${f.detail}`); known.add(key(f)); }
    return r;
  };

  const cp = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  await cp.goto(`${server.url.href}canary`, { waitUntil: 'load' });
  checks++;
  const caught = (await cp.evaluate(audit)).findings.map((f) => f.rule).sort().join();
  if (caught !== 'svg-clipped,text-cut,text-overlap') fail.push(`canary: the audit should flag svg-clipped, text-cut and text-overlap on the known-bad page, and flagged "${caught}"`);
  await cp.context().close();

  for (const [name, width, height] of [['desktop', 1280, 900], ['phone', 390, 844]] as const) {
    const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, reducedMotion: 'reduce', hasTouch: width < 640 });
    const page = await ctx.newPage();
    await page.goto(server.url.href, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const known = new Set<string>();

    // 1. Layout audit at rest, with every disclosure open so hidden panels are read too.
    checks++;
    const rest = await run(page, `${name}`, known);
    if (rest.textBoxes < 100 || rest.svgs < 5) fail.push(`${name}: the audit read only ${rest.textBoxes} text boxes and ${rest.svgs} svgs, so it did not examine the fixture`);
    await page.evaluate(() => document.querySelectorAll('details').forEach((d) => { d.open = true; }));
    await run(page, `${name} (details open)`, known);

    // 2. Hover pass (desktop only: a phone has no hover). Each target is hovered, then the audit runs again.
    if (width >= 1024) {
      const targets = await page.evaluate(() => {
        const sel = ['.toon-btn', '.toon-card', '.toon-row', '.toon-link', '.toon-strip-cell', '.toon-step', '.toon-badge', '.toon-chip', '.toon-table tbody tr', '.toon-toggle', '.toon-switch-card-side', '.toon-tab', 'summary', 'a[href]'];
        const out: string[] = [];
        const done = new Set<Element>(); // one probe per element: a card and its link would otherwise overwrite each other
        sel.forEach((s, i) => document.querySelectorAll(s).forEach((e, j) => {
          if (j >= 3 || done.has(e) || !e.getClientRects().length) return;
          done.add(e);
          e.setAttribute('data-hover-probe', `${i}-${j}`);
          out.push(`[data-hover-probe="${i}-${j}"]`);
        }));
        return out;
      });
      for (const t of targets) {
        const el = page.locator(t);
        await el.scrollIntoViewIfNeeded({ timeout: 2000 }).catch(() => undefined);
        await el.hover({ timeout: 2000, trial: false }).catch(() => undefined);
        await page.waitForTimeout(60);
        hovers++; checks++;
        await run(page, `${name} hover ${t}`, known);
      }
      await page.mouse.move(0, 0);
      await page.evaluate(() => document.querySelectorAll('[data-hover-probe]').forEach((e) => e.removeAttribute('data-hover-probe')));
      await page.evaluate(() => document.querySelectorAll('details').forEach((d) => { d.open = d.hasAttribute('open'); }));
    }

    // 3. Snapshots: one image per fixture section.
    const ids = await page.evaluate(() => [...document.querySelectorAll('main > section[id], main > header, main > .toon-masthead')].map((e, i) => e.id || `top${i}`));
    for (const id of ids) {
      const loc = page.locator(`#${id}`).first();
      if (!(await loc.count())) continue;
      shots++;
      await loc.scrollIntoViewIfNeeded();
      await compare(await loc.screenshot({ animations: 'disabled', caret: 'hide' }), `${id}-${width}.png`, `${name}: section #${id}`);
    }
    await ctx.close();
  }
  await diffPage.context().close();
} finally {
  await browser.close();
  server.stop(true);
}

if (fail.length) {
  console.error(`layout check FAILED, ${fail.length} problems in ${checks} checks:\n- ${fail.join('\n- ')}`);
  process.exit(1);
}
if (shots < 20) { console.error(`layout check read only ${shots} snapshots; the fixture sections were not found`); process.exit(1); }
console.log(`layout check passed: ${checks} checks, ${textBoxes} text boxes and ${svgs} svgs read for clipping and overlap, ${hovers} hover states, ${shots} section snapshots ${update ? 'WRITTEN' : 'compared'} at 1280 px and 390 px`);
