import { expect, test } from 'bun:test';
import { group } from '../src/tokens.ts';
import { HEX, badge, bars, burst, chip, esc, figure, fitSize, letters, row, shot, speedLines, stat, kicker, strip, steps, sfx } from '../src/markup.ts';

test('esc escapes the five HTML characters', () => {
  expect(esc(`<a href="x">&'`)).toBe('&lt;a href=&quot;x&quot;&gt;&amp;&#39;');
});

test('letters wraps each character in a span and escapes it', () => {
  const html = letters('a<b c', 'blue');
  expect(html).toContain('<span>a</span><span>&lt;</span><span>b</span>');
  expect(html).toContain('--toon-fill:#5f8dff; --toon-shade:#f2c94c');
  expect(html.match(/class="toon-word"/g)).toHaveLength(2);
  expect(html).not.toContain('<b');
});

test('letters adds the comic and flat modifiers and a size only when asked', () => {
  expect(letters('x', 'red', { live: true })).toContain('toon-type-comic');
  expect(letters('x', 'red', { flat: true })).toContain('toon-type-flat');
  expect(letters('x', 'red')).not.toContain('font-size');
  expect(letters('x', 'red', { size: 40 })).toContain('font-size:40px');
});

test('fitSize shrinks with the longest word, never below 18 or above max', () => {
  expect(fitSize('214', 52, 200)).toBe(52);
  expect(fitSize('60 min', 52, 200)).toBe(52);
  expect(fitSize('abcdefghijklmnop', 52, 200)).toBe(20);
  expect(fitSize('a'.repeat(100), 52, 200)).toBe(18);
  expect(fitSize('', 52, 200)).toBe(52);
});

test('burst draws 24 points in the accent colour', () => {
  const svg = burst('violet', 'x');
  expect(svg.match(/points="([^"]+)"/)![1]!.split(' ')).toHaveLength(24);
  expect(svg).toContain('fill="#a995f0"');
});

test('figure sizes the flat type from the value', () => {
  expect(figure('~70%', 'violet', 52, 200)).toContain('font-size:52px');
});

test('class names are escaped in every helper', () => {
  const evil = '"><img src=x onerror=alert(1)>';
  for (const html of [burst('red', evil), letters('x', 'blue', { cls: evil }), speedLines(evil)]) {
    expect(html.includes('<img')).toBe(false);
  }
  expect(burst('red', evil)).toContain('&quot;&gt;&lt;img');
  expect(letters('x', 'blue', { cls: evil })).toContain('&quot;&gt;&lt;img');
});

test('an unknown accent throws instead of writing a bad style value', () => {
  expect(() => letters('x', 'constructor' as never)).toThrow('unknown accent');
  expect(() => burst('nope' as never)).toThrow('unknown accent');
});

test('shot renders a figure with alt text, caption, badge and transcript', () => {
  const html = shot({ src: '/a.png', alt: 'A chat', width: 800, height: 400, caption: 'Real exchange', badge: 'Real', transcript: 'You: hi\nBot: hello\n\n' });
  expect(html).toContain('<figure class="toon-shot">');
  expect(html).toContain('alt="A chat" width="800" height="400"');
  expect(html).toContain('loading="lazy"');
  expect(html).toContain('<figcaption class="toon-shot-cap"><span class="toon-caption">Real exchange</span>');
  expect(html).toContain('toon-shot-badge');
  expect(html.match(/<p>/g)?.length).toBe(2);
  expect(html).not.toContain(' open');
});

test('shot omits optional parts and honours eager and open', () => {
  const html = shot({ src: '/a.png', alt: 'x', width: 1, height: 1, eager: true });
  expect(html).not.toContain('loading=');
  expect(html).not.toContain('figcaption');
  expect(html).not.toContain('details');
  expect(shot({ src: '/a.png', alt: 'x', width: 1, height: 1, transcript: 'a', open: true })).toContain('<details class="toon-shot-text" open>');
});

test('shot escapes every string and rejects missing alt and bad sizes', () => {
  const evil = '"><img src=x onerror=alert(1)>';
  const html = shot({ src: evil, alt: evil, width: 1, height: 1, caption: evil, badge: evil, transcript: evil, cls: evil });
  expect(html.match(/<img/g)?.length).toBe(1);
  expect(html).not.toContain('onerror=alert(1)>');
  expect(() => shot({ src: '/a', alt: '  ', width: 1, height: 1 })).toThrow('alt text');
  expect(() => shot({ src: '/a', alt: 'x', width: 0, height: 1 })).toThrow('positive integers');
  expect(() => shot({ src: '/a', alt: 'x', width: 1, height: 1, accent: 'nope' as never })).toThrow('unknown accent');
});

test('badge, chip and stat render and escape', () => {
  expect(badge('Open', 'blue', 3)).toBe('<span class="toon-badge toon-badge-blue">Open<span class="toon-badge-count">3</span></span>');
  expect(badge('Done', 'mist')).toContain('toon-badge-mist');
  expect(badge('Hi')).toBe('<span class="toon-badge">Hi</span>');
  expect(() => badge('x', 'nope' as never)).toThrow('unknown tone');
  expect(chip('<b>')).toBe('<span class="toon-chip">&lt;b&gt;</span>');
  expect(stat('A', '1')).not.toContain('toon-stat-detail');
  expect(stat('<', '&', '"')).toContain('&lt;');
});

test('row renders its parts, omits the empty ones and escapes', () => {
  const html = row({ lead: 'Nov 1', title: '<x>', sub: 's', aside: 'a', dot: 'red' });
  expect(html).toContain('toon-row-lead');
  expect(html).toContain('&lt;x&gt;');
  expect(html).toContain('--toon-dot:#f2706a');
  expect(row({ title: 't' })).toBe('<div class="toon-row"><span class="toon-row-body"><b>t</b></span></div>');
});

test('bars scales heights to the largest stack or the target and names each column', () => {
  const html = bars({ label: 'Week', target: 2, columns: [{ label: 'Mon', segments: [{ value: 1, tone: 'blue', label: 'A' }, { value: 0.5, tone: 'hatch', label: 'B' }] }, { label: 'Tue', current: true, segments: [] }] });
  expect(html).toContain('--h:50.00');
  expect(html).toContain('--h:25.00');
  expect(html).toContain('--at:100.00');
  expect(html).toContain('toon-bar-seg-hatch');
  expect(html).toContain('aria-label="Mon: A 1, B 0.5"');
  expect(html).toContain('aria-label="Tue: none"');
  expect(html).toContain('aria-current="date"');
  expect(html).toContain('--toon-cols:2');
});

test('bars rejects bad input instead of drawing an empty chart', () => {
  expect(() => bars({ label: ' ', columns: [{ label: 'a', segments: [] }] })).toThrow('label');
  expect(() => bars({ label: 'x', columns: [] })).toThrow('at least one');
  expect(() => bars({ label: 'x', columns: [{ label: 'a', segments: [] }] })).toThrow('above 0');
  expect(() => bars({ label: 'x', columns: [{ label: 'a', segments: [{ value: -1, tone: 'blue', label: 'n' }] }] })).toThrow('0 or more');
  expect(() => bars({ label: 'x', columns: [{ label: 'a', segments: [{ value: 1, tone: 'nope' as never, label: 'n' }] }] })).toThrow('unknown tone');
  expect(bars({ label: 'x', target: 1, columns: [{ label: '<', segments: [] }] })).toContain('&lt;');
});

test('bars sums without float noise and gives paper its own fill', () => {
  const html = bars({ label: 'x', columns: [{ label: 'a', segments: [{ value: 0.1, tone: 'paper', label: 'p' }, { value: 0.2, tone: 'blue', label: 'q' }] }] });
  expect(html).toContain('<span class="toon-bar-total">0.3</span>');
  expect(html).toContain('toon-bar-seg-paper');
});

test('a row without a lead renders no lead element', () => {
  expect(row({ title: 't', aside: 'a' })).not.toContain('toon-row-lead');
});

test('the hex colours in the markup helpers match the tokens', () => {
  const c = group('color');
  for (const k of ['blue', 'red', 'yellow', 'violet'] as const) expect(HEX[k]).toBe(c[k]!);
  expect(row({ title: 't', aside: 'a', dot: 'paper' })).toContain(c.paper!);
  expect(row({ title: 't', aside: 'a', dot: 'mist' })).toContain(c.mist!);
});

const evil = '"><img src=x onerror=alert(1)>';

test('kicker renders the chip, label, rule and optional link, and escapes every string', () => {
  const html = kicker('01', 'The work', { link: { href: '/work.html', text: 'All', cls: 'hidden' } });
  expect(html).toContain('<span class="toon-kicker-num">01</span><span class="toon-kicker-label">The work</span><span class="toon-kicker-rule" aria-hidden="true"></span>');
  expect(html).toContain('<a class="toon-link toon-kicker-link hidden" href="/work.html">All</a>');
  expect(kicker('01', 'x')).not.toContain('<a ');
  const bad = kicker(evil, evil, { cls: evil, link: { href: evil, text: evil, cls: evil } });
  expect(bad.includes('<img')).toBe(false);
  expect(bad).toContain('&quot;&gt;&lt;img');
  expect(() => kicker(' ', 'x')).toThrow('required');
  expect(() => kicker('01', '')).toThrow('required');
});

test('strip renders linked and plain cells, sets the column count and escapes', () => {
  const html = strip([{ value: '21', label: 'studies', href: '/work.html' }, { value: '~594', label: 'packages', accent: 'red' }], { label: 'Proof' });
  expect(html).toContain('role="list" aria-label="Proof" style="--toon-cols:2"');
  expect(html).toContain('<a class="toon-strip-item" href="/work.html">');
  expect(html).toContain('<div class="toon-strip-item"><span class="toon-strip-value" style="--toon-fill:#f2706a">~594</span>');
  expect(html.match(/<li class="toon-strip-cell">/g)).toHaveLength(2);
  const bad = strip([{ value: evil, label: evil, href: evil }], { label: evil, cls: evil });
  expect(bad.includes('<img')).toBe(false);
  expect(() => strip([])).toThrow('at least one');
  expect(() => strip([{ value: '1', label: ' ' }])).toThrow('value and a label');
  expect(() => strip([{ value: '1', label: 'x', accent: 'nope' as never }])).toThrow('unknown accent');
});

test('steps numbers the panels and draws an arrow between them but not after the last', () => {
  const html = steps([{ title: 'A', body: 'a' }, { title: 'B', body: 'b' }, { title: 'C', body: 'c' }], { label: 'Process' });
  expect(html).toContain('<ol class="toon-steps" role="list" aria-label="Process" style="--toon-cols:3">');
  expect(html.match(/class="toon-step-num" aria-hidden="true">/g)).toHaveLength(3);
  expect(html.match(/toon-step-arrow/g)).toHaveLength(2);
  expect(html.match(/class="toon-step-arrow" aria-hidden="true"/g)).toHaveLength(2);
  expect(html.lastIndexOf('toon-step-arrow')).toBeLessThan(html.lastIndexOf('<li class="toon-step">'));
  const bad = steps([{ title: evil, body: evil }], { label: evil, cls: evil });
  expect(bad.includes('<img')).toBe(false);
  expect(() => steps([])).toThrow('at least one');
  expect(() => steps([{ title: 'A', body: '' }])).toThrow('title and a body');
});

test('sfx letters each character, is the same every time, and is decoration only', () => {
  const a = sfx('MERGE!', 'red');
  expect(a).toBe(sfx('MERGE!', 'red'));
  expect(a).toContain('aria-hidden="true"');
  expect(a.match(/<span style="--n:/g)).toHaveLength(6);
  expect(a).toContain('--toon-fill:#f2706a; --toon-shade:#f2c94c');
  // Letters differ from one another in turn, rise and size.
  const turns = [...a.matchAll(/--r:(-?\d+)deg/g)].map((m) => m[1]);
  expect(new Set(turns).size).toBeGreaterThan(3);
  expect(new Set([...a.matchAll(/--s:([\d.]+)/g)].map((m) => m[1])).size).toBeGreaterThan(2);
  expect(a).not.toContain('toon-sfx-sm');
  expect(sfx('x', 'blue', { size: 'lg', ghost: true })).toContain('class="toon-sfx toon-sfx-lg toon-sfx-ghost"');
  expect(sfx('x', 'blue', { size: 'sm' })).toContain('toon-sfx-sm');
});

test('sfx escapes its text and class and rejects bad input', () => {
  const html = sfx('<img src=x onerror=alert(1)>', 'blue', { cls: evil });
  expect(html.includes('<img')).toBe(false);
  expect(html).toContain('&lt;');
  expect(() => sfx('  ')).toThrow('required');
  expect(() => sfx('x', 'nope' as never)).toThrow('unknown accent');
  expect(() => sfx('x', 'red', { size: 'huge' as never })).toThrow('unknown sfx size');
});
