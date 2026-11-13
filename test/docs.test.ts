// Fails when the docs fall behind the code: every class in dist/toonish.css and every markup helper must appear in docs/components.md.
import { expect, test } from 'bun:test';

const docs = await Bun.file('docs/components.md').text();

test('docs/components.md names every class in dist/toonish.css', async () => {
  const css = await Bun.file('dist/toonish.css').text();
  const classes = [...new Set([...css.matchAll(/\.(toon-[a-z0-9-]+)/g)].map((m) => m[1]!))];
  const missing = classes.filter((c) => !new RegExp(`${c}(?![a-z0-9-])`).test(docs));
  console.log(`docs check: compared ${classes.length} classes, ${missing.length} missing`);
  expect(classes.length).toBeGreaterThan(40);
  expect(missing).toEqual([]);
});

test('docs/components.md names every markup helper', async () => {
  const src = await Bun.file('src/markup.ts').text();
  const skip = new Set(['esc', 'accentOf']);
  const helpers = [...src.matchAll(/^export const (\w+) = \(/gm)].map((m) => m[1]!).filter((h) => !skip.has(h));
  const missing = helpers.filter((h) => !docs.includes(`${h}(`));
  console.log(`docs check: compared ${helpers.length} helpers, ${missing.length} missing`);
  expect(helpers.length).toBeGreaterThan(10);
  expect(missing).toEqual([]);
});
