// Checks the committed dist/. Run `bun run build` first; CI also rebuilds and fails if dist/ differs from the commit.
import { expect, test } from 'bun:test';
import { readdirSync } from 'node:fs';
import pkg from '../package.json' with { type: 'json' };

const read = (f: string) => Bun.file(`dist/${f}`).text();

test('toonish.css carries the components and not the reset', async () => {
  const css = await read('toonish.css');
  const classes = new Set([...css.matchAll(/\.(toon-[a-z0-9-]+)/g)].map((m) => m[1]));
  for (const c of ['toon-btn', 'toon-card', 'toon-modal', 'toon-type', 'toon-nav', 'toon-burst', 'toon-speed', 'toon-callout', 'toon-footer']) expect(classes.has(c)).toBe(true);
  expect(classes.size).toBeGreaterThan(40);
  expect(css).not.toMatch(/box-sizing:\s*border-box;\s*border-width:\s*0/);
});

test('every font the CSS names ships in dist/fonts', async () => {
  const css = await read('toonish.css');
  const named = [...css.matchAll(/url\(\.\/fonts\/([^)]+)\)/g)].map((m) => m[1]!);
  expect(named).toHaveLength(4);
  const have = readdirSync('dist/fonts');
  for (const f of named) expect(have).toContain(f);
});

test('tokens.css and theme.css carry the colours', async () => {
  expect(await read('tokens.css')).toContain('--toon-color-blue: #5f8dff;');
  expect(await read('theme.css')).toContain('--color-toon-blue: #5f8dff;');
});

test('every path in package.json exports exists', () => {
  const targets: string[] = [];
  const walk = (v: unknown) => (typeof v === 'string' ? targets.push(v) : v && typeof v === 'object' && Object.values(v).forEach(walk));
  walk(pkg.exports);
  walk(pkg.main);
  walk(pkg.types);
  const real = targets.filter((t) => !t.includes('*'));
  expect(real.length).toBeGreaterThan(6);
  for (const t of real) expect(Bun.file(t).size, t).toBeGreaterThan(0);
});
