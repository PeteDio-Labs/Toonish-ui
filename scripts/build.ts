// Builds dist/ from the sources. dist/ is committed, because Bun does not run a git dependency's build scripts, so
// the tagged commit has to carry the files a consumer installs. CI rebuilds and fails when dist/ differs.
// Exits non-zero when a step fails or an output is missing, and prints what it checked.
import { cp, mkdir, rm } from 'node:fs/promises';
import StyleDictionary from 'style-dictionary';
import { group } from '../src/tokens.ts';

const dist = 'dist';
const run = (cmd: string[]) => {
  const p = Bun.spawnSync(cmd, { stdout: 'pipe', stderr: 'pipe' });
  if (p.exitCode !== 0) throw new Error(`${cmd.join(' ')} exited ${p.exitCode}\n${p.stderr.toString()}${p.stdout.toString()}`);
};

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

// 1. Tokens: CSS variables and a nested JSON file, through Style Dictionary.
const sd = new StyleDictionary({
  source: ['tokens/toonish.tokens.json'],
  usesDtcg: true,
  log: { verbosity: 'silent' },
  platforms: {
    css: { transformGroup: 'css', prefix: 'toon', buildPath: `${dist}/`, files: [{ destination: 'tokens.css', format: 'css/variables', options: { showFileHeader: false } }] },
    json: { transformGroup: 'css', prefix: 'toon', buildPath: `${dist}/`, files: [{ destination: 'tokens.json', format: 'json/nested' }] },
  },
});
await sd.buildAllPlatforms();

// 2. Tailwind v4 theme: the same tokens in the namespaces v4 reads.
const theme: string[] = [];
const emit = (prefix: string, tokens: Record<string, string>) => {
  for (const [name, value] of Object.entries(tokens)) theme.push(`  --${prefix}-${name}: ${value};`);
};
emit('color-toon', group('color'));
emit('font', group('font.family'));
emit('text', { ...group('font.size'), ...group('font.fluid') });
emit('spacing', group('space'));
emit('radius', group('radius'));
emit('shadow-toon', group('shadow'));
emit('ease', group('ease'));
await Bun.write(`${dist}/theme.css`, `/* Generated from tokens/toonish.tokens.json. For Tailwind v4: @import "tailwindcss"; @import "toonish-ui/theme.css"; */\n@theme {\n${theme.join('\n')}\n}\n`);

// 3. Component CSS: base rules and components, with Tailwind v3 and the package's own preset.
run(['bunx', 'tailwindcss', '-c', 'tailwind.config.ts', '-i', 'src/dist.css', '-o', `${dist}/toonish.css`]);
run(['bunx', 'tailwindcss', '-c', 'tailwind.config.ts', '-i', 'src/dist.css', '-o', `${dist}/toonish.min.css`, '--minify']);

// 4. JavaScript: an auto-running script for <script src>, and ES modules for imports.
for (const [entry, out, format] of [
  ['src/auto.ts', 'toonish.js', 'iife'],
  ['src/index.ts', 'index.js', 'esm'],
  ['src/preset.ts', 'preset.js', 'esm'],
  ['src/markup.ts', 'markup.js', 'esm'],
] as const) {
  const r = await Bun.build({ entrypoints: [entry], target: 'browser', format, naming: out });
  if (!r.success) throw new Error(`bun build ${entry} failed:\n${r.logs.join('\n')}`);
  await Bun.write(`${dist}/${out}`, r.outputs[0]!);
}
run(['bunx', 'tsc', '-p', 'tsconfig.build.json']);

// 5. Fonts: the five woff2 files that src/fonts.css names.
await mkdir(`${dist}/fonts`, { recursive: true });
for (const [pkg, file] of [['bangers', 'bangers-latin-400'], ['dm-sans', 'dm-sans-latin-400'], ['dm-sans', 'dm-sans-latin-700'], ['space-grotesk', 'space-grotesk-latin-500'], ['space-grotesk', 'space-grotesk-latin-700']] as const) {
  await cp(`node_modules/@fontsource/${pkg}/files/${file}-normal.woff2`, `${dist}/fonts/${file}-normal.woff2`);
}

// 6. Checks. Each one names what it read, so a pass is not an empty read.
const css = await Bun.file(`${dist}/toonish.css`).text();
const must = ['.toon-btn', '.toon-card', '.toon-modal', '.toon-badge', '.toon-nav', '.toon-type', '@font-face', 'url(./fonts/'];
const missing = must.filter((s) => !css.includes(s));
if (missing.length) throw new Error(`dist/toonish.css is missing ${missing.join(', ')}: the safelist or the entry matched nothing`);
if (/box-sizing:\s*border-box;\s*border-width:\s*0/.test(css)) throw new Error('dist/toonish.css carries the preflight reset, which would reset a consumer page');
for (const f of ['tokens.css', 'tokens.json', 'theme.css', 'toonish.min.css', 'toonish.js', 'index.js', 'preset.js', 'markup.js', 'types/src/index.d.ts']) {
  if (Bun.file(`${dist}/${f}`).size === 0) throw new Error(`dist/${f} is missing or empty`);
}
const fontUrls = [...css.matchAll(/url\(\.\/fonts\/([^)]+)\)/g)].map((m) => m[1]!);
for (const f of fontUrls) if (Bun.file(`${dist}/fonts/${f}`).size === 0) throw new Error(`dist/fonts/${f} is named in the CSS but missing`);
const classes = new Set([...css.matchAll(/\.(toon-[a-z0-9-]+)/g)].map((m) => m[1]));
console.log(`built dist/: toonish.css ${css.length} bytes, ${classes.size} toon-* classes, ${fontUrls.length} font files checked`);
