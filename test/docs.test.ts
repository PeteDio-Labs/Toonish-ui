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

test('docs/components.md names every option of every markup helper', async () => {
  const src = await Bun.file('src/markup.ts').text();
  const keys = new Set<string>();
  for (const m of src.matchAll(/export interface \w+(?:Options|Cell|Step|Link|Segment|Column|Seg)\w* \{([\s\S]*?)\n\}/g)) {
    for (const k of m[1]!.matchAll(/^\s+(\w+)\??:/gm)) keys.add(k[1]!);
  }
  const missing = [...keys].filter((k) => !new RegExp(`\\b${k}\\b`).test(docs));
  console.log(`docs check: compared ${keys.size} option names, ${missing.length} missing`);
  expect(keys.size).toBeGreaterThan(20);
  expect(missing).toEqual([]);
});

test('docs/tokens.md agrees with the tokens', async () => {
  const tokens = await Bun.file('docs/tokens.md').text();
  const json = JSON.parse(await Bun.file('dist/tokens.json').text());
  const flat = JSON.stringify(json).toLowerCase();
  const hexes = [...new Set([...tokens.matchAll(/`(#[0-9a-f]{6})`/gi)].map((m) => m[1]!.toLowerCase()))];
  const missing = hexes.filter((h) => !flat.includes(h));
  const colours = [...flat.matchAll(/#[0-9a-f]{6}/g)].map((m) => m[0]);
  const undocumented = [...new Set(colours)].filter((h) => !tokens.toLowerCase().includes(h));
  console.log(`docs check: tokens.md names ${hexes.length} hex values, ${missing.length} absent from tokens.json; ${undocumented.length} token colours undocumented`);
  expect(hexes.length).toBeGreaterThan(8);
  expect(missing).toEqual([]);
  expect(undocumented).toEqual([]);
});
