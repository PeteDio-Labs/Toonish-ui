import { expect, test } from 'bun:test';
import { group } from '../src/tokens.ts';
import { HEX, badge, bars, burst, chip, esc, figure, fitSize, letters, row, shot, speedLines, stat, kicker, strip, list, skipLink, steps, sfx, deck, portrait, pager, delta, scale, scaleAxis, meter, meters, tabbar, tabpanel, disclosure, spark } from '../src/markup.ts';

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
  expect(badge('Open', 'blue', 3)).toBe('<span class="toon-badge toon-badge-blue">Open<span class="toon-badge-count"> 3</span></span>');
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
  expect(row({ title: 't' })).toBe('<div class="toon-row" role="listitem"><span class="toon-row-body"><b>t</b></span></div>');
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
  expect(html).toContain('<div class="toon-strip-item"><span class="toon-strip-value" style="--toon-fill:#c8322b">~594</span>');
  expect(html.match(/<li class="toon-strip-cell">/g)).toHaveLength(2);
  // A space separates the figure from its label, so the link's name reads "21 studies" and not "21studies".
  expect(html).toContain('>21</span> <span class="toon-strip-label">studies</span>');
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
  expect(sfx('x', 'blue', { size: 'sm', corner: true })).toContain('class="toon-sfx toon-sfx-sm toon-sfx-corner"');
});

test('sfx escapes its text and class and rejects bad input', () => {
  const html = sfx('<img src=x onerror=alert(1)>', 'blue', { cls: evil });
  expect(html.includes('<img')).toBe(false);
  expect(html).toContain('&lt;');
  expect(() => sfx('  ')).toThrow('required');
  expect(() => sfx('x', 'nope' as never)).toThrow('unknown accent');
  expect(() => sfx('x', 'red', { size: 'huge' as never })).toThrow('unknown sfx size');
});

test('deck wraps each card in a labelled group and leaves card HTML as written', () => {
  const html = deck(['<p>one</p>', '<p>two</p>', '<p>three</p>'], { label: 'Recent work' });
  expect(html.match(/class="toon-deck-card"/g)).toHaveLength(3);
  expect(html).toContain('aria-label="1 of 3"');
  expect(html).toContain('aria-label="3 of 3"');
  expect(html).toContain('<p>two</p>');
  expect(html).toContain('role="group" aria-roledescription="carousel" aria-label="Recent work"');
  expect(html).toContain('data-toon-deck="phone"');
  expect(html).toContain('--toon-cols:3');
});

test('deck writes two real buttons and a polite counter, and an option keeps it on at every width', () => {
  const html = deck(['a', 'b'], { label: 'x', always: true, cols: 2, prevLabel: 'Back', nextLabel: 'Forward' });
  expect(html.match(/<button type="button"/g)).toHaveLength(2);
  expect(html).toContain('data-toon-deck-prev');
  expect(html).toContain('data-toon-deck-next');
  expect(html).toContain('aria-live="polite"');
  expect(html).toContain('>1 / 2<');
  expect(html).toContain('data-toon-deck="always"');
  expect(html).toContain('--toon-cols:2');
  expect(html).toContain('Back');
  expect(html).toContain('Forward');
});

test('deck escapes its label, button text and class, and throws on an empty pile or a blank label', () => {
  const evil = '"><img src=x onerror=alert(1)>';
  const html = deck(['a'], { label: evil, prevLabel: evil, nextLabel: evil, cls: evil });
  expect(html.includes('<img')).toBe(false);
  expect(html).toContain('&quot;&gt;&lt;img');
  expect(() => deck([], { label: 'x' })).toThrow('at least one card');
  expect(() => deck(['a'], { label: '  ' })).toThrow('label is required');
  expect(() => deck(['a'], { label: 'x', cols: 0 })).toThrow('cols');
});

test('shot can link its picture and add a corner number and a hint, and requires a name for the link', () => {
  const base = { src: '/a.png', alt: 'A', width: 10, height: 10, caption: 'c' };
  const html = shot({ ...base, href: '/a.png', hrefLabel: 'Open the full-size picture', corner: '1 / 4', hint: 'Tap to enlarge' });
  expect(html).toContain('<a class="toon-shot-link" href="/a.png" target="_blank" rel="noopener" aria-label="Open the full-size picture"><img');
  expect(html).toContain('toon-shot-badge-end">1 / 4<');
  expect(html).toContain('toon-shot-hint" aria-hidden="true">Tap to enlarge<');
  expect(() => shot({ ...base, href: '/a.png' })).toThrow('hrefLabel');
  expect(shot(base)).not.toContain('toon-shot-link');
});

test('portrait draws a vector backdrop behind the cut-out and escapes its input', () => {
  const html = portrait({ src: '/p.webp?a="b"', alt: 'A <person>', width: 400, height: 500, backdrop: 'paper', accent: 'red' });
  expect(html).toContain('<div class="toon-portrait" data-backdrop="paper">');
  expect(html).toContain('<svg class="toon-portrait-bg"');
  expect(html).toContain('stop-color="#f6f8fa"');
  expect(html).toContain(HEX.red);
  expect(html).toContain('alt="A &lt;person&gt;"');
  expect(html).toContain('src="/p.webp?a=&quot;b&quot;"');
  expect(html).toContain('width="400" height="500"');
  expect(html).toContain('loading="lazy"');
  expect(portrait({ src: '/p.png', alt: 'x', width: 1, height: 1, eager: true })).not.toContain('loading=');
  expect(portrait({ src: '/p.png', alt: 'x', width: 1, height: 1 })).toContain('data-backdrop="slate"');
});

test('portrait rejects a missing alt, a bad size, an unknown backdrop and an unknown accent', () => {
  const base = { src: '/p.png', alt: 'x', width: 10, height: 10 };
  expect(() => portrait({ ...base, alt: ' ' })).toThrow('alt text');
  expect(() => portrait({ ...base, width: 0 })).toThrow('positive integers');
  expect(() => portrait({ ...base, backdrop: 'neon' as 'slate' })).toThrow('unknown portrait backdrop');
  expect(() => portrait({ ...base, accent: 'pink' as 'red' })).toThrow('unknown accent');
});

test('pager writes a labelled nav of two links, each with an arrow, a direction and a title', () => {
  const html = pager({ label: 'Case studies', prev: { href: '/a.html', title: 'Study A' }, next: { href: '/b.html', title: 'Study B' } });
  expect(html.startsWith('<nav class="toon-pager" aria-label="Case studies">')).toBe(true);
  expect(html).toContain('<a class="toon-pager-link toon-pager-prev" href="/a.html">');
  expect(html).toContain('<a class="toon-pager-link toon-pager-next" href="/b.html">');
  expect(html.match(/class="toon-pager-arrow" aria-hidden="true"><svg/g)?.length).toBe(2);
  expect(html).toContain('<span class="toon-pager-dir">Previous<span class="toon-pager-sep">: </span></span><span class="toon-pager-title">Study A</span>');
  expect(html).toContain('<span class="toon-pager-dir">Next<span class="toon-pager-sep">: </span></span><span class="toon-pager-title">Study B</span>');
  expect(html.indexOf('toon-pager-prev')).toBeLessThan(html.indexOf('toon-pager-next'));
});

test('pager escapes every string, takes one link alone, and throws with no link or a blank label', () => {
  const html = pager({ label: 'A & B', cls: 'x"y', next: { href: '/b.html?a=1&b=2', title: '<b>Bold</b>', dir: 'Newer <i>' } });
  expect(html).toContain('aria-label="A &amp; B"');
  expect(html).toContain('class="toon-pager x&quot;y"');
  expect(html).toContain('href="/b.html?a=1&amp;b=2"');
  expect(html).toContain('&lt;b&gt;Bold&lt;/b&gt;');
  expect(html).toContain('Newer &lt;i&gt;');
  expect(html).not.toContain('toon-pager-prev');
  expect(() => pager({ label: 'Pages' })).toThrow('pager');
  expect(() => pager({ label: ' ', next: { href: '/b', title: 'B' } })).toThrow('label');
  expect(() => pager({ label: 'Pages', next: { href: '/b', title: ' ' } })).toThrow('pager');
});

test('a11y contract: list is a labelled list of listitems, skipLink points at an id, deck cards are slides', () => {
  const html = list([row({ title: 'a' }), row({ title: 'b' })], { label: 'Facts' });
  expect(html).toContain('role="list" aria-label="Facts"');
  expect(html.match(/role="listitem"/g)).toHaveLength(2);
  expect(() => list([], { label: 'x' })).toThrow('at least one row');
  expect(() => list([row({ title: 'a' })], { label: ' ' })).toThrow('label is required');
  expect(skipLink()).toBe('<a class="toon-skip" href="#main">Skip to content</a>');
  expect(() => skipLink('a b')).toThrow('not a valid id');
  expect(deck(['a', 'b'], { label: 'L' })).toContain('role="group" aria-roledescription="slide" aria-label="1 of 2"');
  expect(figure('214', 'blue', 52, 200)).toContain('--toon-fill:#2a57d6');
});

const EVIL = '"><img src=x onerror=alert(1)>';

test('delta writes the glyph, a signed number and the spoken form', () => {
  expect(delta(4)).toContain('toon-delta-up');
  expect(delta(4)).toContain('role="img" aria-label="up 4 points">▲ 4<');
  expect(delta(-32, { unit: '%' })).toContain('aria-label="down 32 percent">▼ 32%<');
  expect(delta(0)).toContain('toon-delta-flat');
  expect(delta(0)).toContain('aria-label="no change">· 0<');
  expect(delta(-0)).toContain('· 0<');
  expect(delta(2, { invert: true, ground: true })).toContain('toon-delta-invert toon-delta-ground');
  expect(delta(0.1 + 0.2)).toContain('▲ 0.3<');
});

test('delta escapes its unit and throws on NaN', () => {
  expect(delta(1, { unit: EVIL }).includes('<img')).toBe(false);
  expect(() => delta(NaN)).toThrow('finite number');
  expect(() => delta(Infinity)).toThrow('finite number');
});

test('scale writes role img with its label, a marker, past dots and the move', () => {
  const up = scale({ value: 82, history: [70, 78], label: 'P-01 scores 82, up 4 from 78' });
  expect(up).toContain('role="img" aria-label="P-01 scores 82, up 4 from 78"');
  expect(up).toContain('--v:82;--p:78');
  expect(up.match(/toon-scale-past/g)).toHaveLength(2);
  expect(up.match(/toon-scale-tick/g)).toHaveLength(3);
  expect(up).toContain('toon-scale-move-up" style="--lo:78;--hi:82"');
  expect(up).toContain('toon-scale-mark toon-owner-a');
  expect(scale({ value: 10, history: [30], label: 'x', owner: 'b', ticks: false })).toContain('toon-scale-move-down" style="--lo:10;--hi:30"');
  expect(scale({ value: 10, history: [30], label: 'x', owner: 'b', ticks: false })).toContain('toon-owner-b');
  expect(scale({ value: 5, history: [5], label: 'x' })).not.toContain('toon-scale-move');
  expect(scale({ value: 5, label: 'x', ticks: false })).not.toContain('tick');
});

test('scale draws an empty track for null and escapes the label', () => {
  expect(scale({ value: null, label: 'P-05 has no score' })).toContain('toon-scale-empty');
  expect(scale({ value: 1, label: EVIL }).includes('<img')).toBe(false);
});

test('scale throws on a blank label, NaN, a bad owner and a value out of range unless clamped', () => {
  expect(() => scale({ value: 1, label: '  ' })).toThrow('label is required');
  expect(() => scale({ value: NaN, label: 'x' })).toThrow('finite number');
  expect(() => scale({ value: 101, label: 'x' })).toThrow('outside 0 to 100');
  expect(() => scale({ value: 50, history: [-1], label: 'x' })).toThrow('history[0]');
  expect(() => scale({ value: 1, label: 'x', owner: 'c' as never })).toThrow('unknown owner');
  expect(scale({ value: 140, history: [-5], label: 'x', clamp: true })).toContain('--v:100;--p:0');
});

test('scaleAxis is decoration with five labels', () => {
  const a = scaleAxis();
  expect(a).toContain('aria-hidden="true"');
  expect(a.match(/<span style=/g)).toHaveLength(5);
});

test('meter names the bar by its label and writes the value attributes', () => {
  const m = meter({ label: 'Evidence', value: 70, id: 'ev', sub: 'vs US, was 42' });
  expect(m).toContain('role="meter" aria-labelledby="ev-label" aria-describedby="ev-sub" aria-valuemin="0" aria-valuenow="70" aria-valuemax="100" aria-valuetext="70 of 100"');
  expect(m).toContain('id="ev-label">Evidence<');
  expect(m).toContain('--w:70');
  const big = meter({ label: 'Likelihood', value: 7, size: 'lg', tone: 'red', valueText: '~7%', scaleLabels: ['0 · coincidence', '100 · confirmed'], id: 'g' });
  expect(big).toContain('toon-meter toon-meter-lg');
  expect(big).toContain('toon-meter-fill-red');
  expect(big).toContain('aria-valuetext="~7%"');
  expect(big).toContain('<span class="toon-meter-value" aria-hidden="true">~7%</span>');
  expect(big.match(/<span>0 · coincidence<\/span>/g)).toHaveLength(1);
  expect(meter({ label: 'x', value: 3, max: 5, id: 'm' })).toContain('--w:60');
  expect(meter({ label: 'x', value: 0, id: 'm' })).not.toContain('toon-meter-fill');
  expect(meter({ label: 'a', value: 1 })).not.toBe(meter({ label: 'a', value: 1 }));
});

test('meter escapes every string and throws on bad input', () => {
  const html = meter({ label: EVIL, value: 1, sub: EVIL, valueText: EVIL, scaleLabels: [EVIL], id: 'e' });
  expect(html.includes('<img')).toBe(false);
  expect(() => meter({ label: ' ', value: 1 })).toThrow('label is required');
  expect(() => meter({ label: 'x', value: NaN })).toThrow('finite number');
  expect(() => meter({ label: 'x', value: 101 })).toThrow('outside 0 to 100');
  expect(meter({ label: 'x', value: 101, clamp: true, id: 'c' })).toContain('aria-valuenow="100"');
  expect(() => meter({ label: 'x', value: 1, max: 0 })).toThrow('max must be above 0');
  expect(() => meter({ label: 'x', value: 1, tone: 'pink' as never })).toThrow('unknown meter tone');
  expect(() => meter({ label: 'x', value: 1, size: 'xl' as never })).toThrow('unknown meter size');
  expect(() => meter({ label: 'x', value: 1, id: '1 bad' })).toThrow('not a valid id');
});

test('meters is a labelled list of list items', () => {
  const html = meters([{ label: 'A', value: 1, id: 'a' }, meter({ label: 'B', value: 2, id: 'b' })], { label: 'Vectors' });
  expect(html).toContain('role="list" aria-label="Vectors"');
  expect(html.match(/role="listitem"/g)).toHaveLength(2);
  expect(() => meters([], { label: 'x' })).toThrow('at least one');
  expect(() => meters([{ label: 'A', value: 1 }], { label: ' ' })).toThrow('label is required');
});

test('tabbar writes a nav around a tablist of tabs wired to their panels', () => {
  const html = tabbar([{ id: 'board', label: 'Board', icon: '<svg></svg>' }, { id: 'brief', label: 'Brief' }], { label: 'Sections', selected: 'brief' });
  expect(html).toContain('<nav class="toon-tabbar" aria-label="Sections" data-toon-tabs>');
  expect(html).toContain('role="tablist"');
  expect(html).toContain('id="board-tab" href="#board" aria-selected="false" aria-controls="board"');
  expect(html).toContain('id="brief-tab" href="#brief" aria-selected="true" aria-controls="brief"');
  expect(html).toContain('<span class="toon-tab-icon" aria-hidden="true"><svg></svg></span>');
  expect(tabbar([{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }], { label: 'x', top: true })).toContain('toon-tabbar toon-tabbar-top');
  expect(tabbar([{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }], { label: 'x' })).toContain('id="a-tab" href="#a" aria-selected="true"');
});

test('tabbar escapes labels and throws on bad input', () => {
  const two = [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }];
  expect(tabbar([{ id: 'a', label: EVIL }, two[1]!], { label: EVIL }).includes('<img')).toBe(false);
  expect(() => tabbar(two, { label: ' ' })).toThrow('label is required');
  expect(() => tabbar([two[0]!], { label: 'x' })).toThrow('2 to 5');
  expect(() => tabbar([...two, ...two, ...two].map((t, i) => ({ ...t, id: `t${i}` })), { label: 'x' })).toThrow('2 to 5');
  expect(() => tabbar([{ id: 'a', label: 'A' }, { id: 'a', label: 'B' }], { label: 'x' })).toThrow('used twice');
  expect(() => tabbar([{ id: 'a b', label: 'A' }, two[1]!], { label: 'x' })).toThrow('not a valid id');
  expect(() => tabbar([{ id: 'a', label: ' ' }, two[1]!], { label: 'x' })).toThrow('needs a label');
  expect(() => tabbar(two, { label: 'x', selected: 'zz' })).toThrow('not one of the tabs');
});

test('tabpanel is labelled by its tab', () => {
  expect(tabpanel('board', '<p>x</p>')).toBe('<div class="toon-tabpanel" role="tabpanel" tabindex="0" id="board" aria-labelledby="board-tab"><p>x</p></div>');
  expect(() => tabpanel('1x', '')).toThrow('not a valid id');
});

test('disclosure writes a button with aria-expanded and aria-controls, and a hidden panel', () => {
  const html = disclosure({ id: 'p-01', lead: 'P-01', title: 'A call', badge: 'Hold', value: 82, delta: 4, below: '<i>scale</i>', panel: '<p>Detail</p>' });
  expect(html).toContain('<div class="toon-disclosure" role="listitem">');
  expect(html).toContain('<button type="button" class="toon-disclosure-btn" id="p-01-btn" aria-expanded="false" aria-controls="p-01">');
  expect(html).toContain('<div class="toon-disclosure-panel" id="p-01" hidden><p>Detail</p></div>');
  expect(html).toContain('toon-disclosure-lead toon-owner-a');
  expect(html).toContain('toon-badge-yellow');
  expect(html).toContain('<span class="toon-disclosure-value">82</span>');
  expect(html).toContain('aria-label="up 4 points"');
  expect(html).toContain('<span class="toon-disclosure-below"><i>scale</i></span>');
});

test('disclosure supports open, owner, heading and the native version', () => {
  const open = disclosure({ id: 'x', lead: 'X', title: 'T', panel: 'p', open: true, owner: 'b', ownerLabel: 'Claude', heading: 3, delta: { value: -2, unit: '%', invert: true }, badge: { text: 'Lean', tone: 'violet' } });
  expect(open).toContain('aria-expanded="true"');
  expect(open).not.toContain('hidden');
  expect(open).toContain('toon-owner-b');
  expect(open).toContain('Owner: Claude. ');
  expect(open).toContain('<h3 class="toon-disclosure-h"><button');
  expect(open).toContain('toon-delta-invert');
  expect(open).toContain('toon-badge-violet');
  const native = disclosure({ id: 'n', lead: 'N', title: 'T', panel: 'p', native: true });
  expect(native).toContain('<details class="toon-disclosure-details"><summary class="toon-disclosure-btn" id="n-btn">');
  expect(native).not.toContain('hidden');
  expect(native).not.toContain('<button');
  expect(disclosure({ id: 'n', lead: 'N', title: 'T', panel: 'p', native: true, open: true })).toContain('<details class="toon-disclosure-details" open>');
});

test('disclosure escapes its text and throws on bad input', () => {
  const html = disclosure({ id: 'e', lead: EVIL, title: EVIL, badge: EVIL, value: EVIL, ownerLabel: EVIL, panel: 'ok' });
  expect(html.includes('<img')).toBe(false);
  expect(() => disclosure({ id: '1', lead: 'L', title: 'T', panel: '' })).toThrow('not a valid id');
  expect(() => disclosure({ id: 'a', lead: ' ', title: 'T', panel: '' })).toThrow('lead and title');
  expect(() => disclosure({ id: 'a', lead: 'L', title: '', panel: '' })).toThrow('lead and title');
  expect(() => disclosure({ id: 'a', lead: 'L', title: 'T', panel: '', owner: 'z' as never })).toThrow('unknown owner');
  expect(() => disclosure({ id: 'a', lead: 'L', title: 'T', panel: '', native: true, heading: 3 })).toThrow('heading');
  expect(() => disclosure({ id: 'a', lead: 'L', title: 'T', panel: '', heading: 9 as never })).toThrow('heading');
  expect(() => disclosure({ id: 'a', lead: 'L', title: 'T', panel: '', delta: NaN })).toThrow('finite number');
});

test('spark writes role img with the generated trend label, and one dot per reading', () => {
  const s = spark([73, 75, 71, 78, 80, 79, 81, 82], { label: 'P-01' });
  expect(s).toContain('role="img" aria-label="P-01. Trend from 73 to 82 over 8 readings"');
  expect(s).toContain('toon-spark toon-spark-sm');
  expect(s).toContain('viewBox="0 0 64 20"');
  expect(s.match(/<circle/g)).toHaveLength(8);
  expect(s).toContain('r="3" fill="#5f8dff"');
  expect(s).not.toContain('toon-spark-target');
  const lg = spark([0, 100], { label: 'x', size: 'lg', accent: 'red', target: 50 });
  expect(lg).toContain('viewBox="0 0 120 32"');
  expect(lg).toContain('toon-spark-target');
  expect(lg).toContain('fill="#f2706a"');
});

test('spark escapes the label and throws on bad input', () => {
  expect(spark([1, 2], { label: EVIL }).includes('<img')).toBe(false);
  expect(() => spark([1], { label: 'x' })).toThrow('at least 2');
  expect(() => spark([1, 2], { label: ' ' })).toThrow('label is required');
  expect(() => spark([1, NaN], { label: 'x' })).toThrow('finite number');
  expect(() => spark([1, 200], { label: 'x' })).toThrow('outside 0 to 100');
  expect(() => spark([1, 2], { label: 'x', target: 500 })).toThrow('target');
  expect(() => spark([1, 2], { label: 'x', min: 5, max: 5 })).toThrow('max must be above min');
  expect(() => spark([1, 2], { label: 'x', accent: 'pink' as never })).toThrow('unknown accent');
  expect(() => spark([1, 2], { label: 'x', size: 'xl' as never })).toThrow('unknown spark size');
  expect(spark([-5, 200], { label: 'x', clamp: true })).toContain('from 0 to 100');
});

test('delta reads a change that rounds to zero as flat, and meter treats an empty valueText as unset', () => {
  expect(delta(0.004)).toContain('aria-label="no change">· 0<');
  expect(delta(-0.004)).toContain('toon-delta-flat');
  const m = meter({ label: 'x', value: 5, valueText: '  ', id: 'z' });
  expect(m).toContain('aria-valuetext="5 of 100"');
  expect(m).toContain('aria-hidden="true">5<');
});
