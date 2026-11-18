import { expect, test } from 'bun:test';
import { group } from '../src/tokens.ts';
import { HEX, badge, bars, burst, chip, esc, figure, fitSize, letters, row, button, shot, speedLines, stat, kicker, strip, list, skipLink, steps, sfx, deck, portrait, pager, delta, scale, scaleAxis, meter, meters, tabbar, tabpanel, disclosure, spark, uptime, line, statusTile, switchRow, verdict, readout, barsKey, chartTable, masthead, toggle, switchCard, gears, settingsMenu, buildBadge } from '../src/markup.ts';

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

test('button writes a link or a button, takes a kind, an icon and a direction, and refuses what is unsafe', () => {
  const back = button({ label: 'Back to dashboard', href: '#now', kind: 'accent', direction: 'back' });
  expect(back).toContain('<a class="toon-btn toon-btn-yellow toon-btn-icon toon-btn-back" href="#now">');
  // The arrow comes before the label for back, after it for next, and is hidden from readers.
  expect(back.indexOf('<span class="toon-btn-ico"')).toBeLessThan(back.indexOf('toon-btn-label'));
  expect(back).toContain('<span class="toon-btn-ico" aria-hidden="true">');
  const next = button({ label: 'Next', direction: 'next' });
  expect(next.indexOf('toon-btn-label')).toBeLessThan(next.indexOf('<span class="toon-btn-ico"'));
  expect(next).toContain('<button type="button" class="toon-btn toon-btn-icon toon-btn-next">');
  expect(button({ label: 'Save', type: 'submit', kind: 'danger', full: true, attrs: { 'data-x': 'a"b' } })).toBe('<button type="submit" class="toon-btn toon-btn-red toon-btn-full" data-x="a&quot;b"><span class="toon-btn-label">Save</span></button>');
  expect(button({ label: 'Add', icon: 'plus', iconPosition: 'end' })).toMatch(/toon-btn-label">Add<\/span><span class="toon-btn-ico"/);
  expect(button({ label: 'x', icon: '<svg viewBox="0 0 8 8"></svg>' })).toContain('<svg viewBox="0 0 8 8"></svg>');
  expect(() => button({ label: ' ' })).toThrow('label');
  expect(() => button({ label: 'x', kind: 'nope' as never })).toThrow('kind');
  expect(() => button({ label: 'x', direction: 'up' as never })).toThrow('direction');
  expect(() => button({ label: 'x', href: 'javascript:alert(1)' })).toThrow('href');
  expect(() => button({ label: 'x', attrs: { onclick: 'x()' } })).toThrow('not allowed');
  expect(() => button({ label: 'x', attrs: { class: 'y' } })).toThrow('not allowed');
  expect(() => button({ label: 'x', icon: '<svg onload="x()"></svg>' })).toThrow('icon');
});

test('row takes an optional icon, hides it from readers, and refuses markup that is not one clean svg', () => {
  const svg = '<svg viewBox="0 0 48 48" focusable="false"><circle cx="24" cy="24" r="10"/></svg>';
  const html = row({ lead: 'Secrets', title: 'Vault', aside: 'No stored CI secrets', icon: svg });
  expect(html).toContain(`<span class="toon-row-icon" aria-hidden="true">${svg}</span>`);
  // The icon comes first, before the lead, so it is the first grid item.
  expect(html.indexOf('toon-row-icon')).toBeLessThan(html.indexOf('toon-row-lead'));
  expect(row({ title: 't' })).not.toContain('toon-row-icon');
  for (const bad of ['<img src=x>', 'x<svg></svg>', '<svg><script>1</script></svg>', '<svg onload="x()"></svg>', '<svg><foreignObject/></svg>', '<svg><a href="javascript:x"/></svg>', '<svg></svg><p>']) {
    expect(() => row({ title: 't', icon: bad })).toThrow('icon');
  }
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

const cells = (states: ('ok' | 'down' | 'unknown')[]) => states.map((state, i) => ({ at: `2026-11-16T0${i}:00:00Z`, state }));

test('uptime counts every state, so unknown never reads as ok', () => {
  const u = uptime({ label: 'Plex', windowLabel: 'last 24 hours', cells: cells(['ok', 'ok', 'down', 'unknown']) });
  expect(u).toContain('2 of 4 intervals ok, 1 down, 1 unknown');
  expect(u.match(/role="listitem"/g)).toHaveLength(4);
  expect(u).toContain('aria-label="Nov 16 02:00 UTC: down"');
  expect(u).toContain('toon-uptime-unknown');
  expect(uptime({ label: 'x', cells: cells(['ok']) })).toContain('1 of 1 intervals ok<');
});

test('uptime escapes and throws on bad input', () => {
  expect(uptime({ label: EVIL, cells: [{ at: EVIL, state: 'ok', detail: EVIL }] }).includes('<img')).toBe(false);
  expect(() => uptime({ label: ' ', cells: cells(['ok']) })).toThrow('label is required');
  expect(() => uptime({ label: 'x', cells: [] })).toThrow('at least one cell');
  expect(() => uptime({ label: 'x', cells: cells(Array(151).fill('ok')) })).toThrow('at most 150');
  expect(() => uptime({ label: 'x', cells: [{ at: 'a', state: 'up' as never }] })).toThrow('unknown state');
  expect(() => uptime({ label: 'x', cells: [{ at: ' ', state: 'ok' }] })).toThrow('at is required');
});

test('line writes a labelled chart, a key with end values and a table of the same numbers', () => {
  const l = line({ label: 'CVEs', yUnit: 'CVEs', target: 5, series: [{ name: 'High', points: [{ x: '2026-11-01', y: 9 }, { x: '2026-11-02', y: 3 }] }, { name: 'Low', points: [{ x: '2026-11-01', y: 1 }, { x: '2026-11-02', y: 2 }] }] });
  expect(l).toContain('role="img" aria-label="CVEs. High: 9 to 3 CVEs');
  expect(l).toContain('Target 5 CVEs');
  expect(l).toContain('<b class="toon-chart-end">3 CVEs</b>');
  expect(l).toContain('<th scope="row">Nov 1</th><td>9</td><td>1</td>');
  expect(l).toContain('stroke-dasharray="7 3"'); // the second series is dashed
  expect(l).toContain('<summary>Show as table</summary>');
});

test('line breaks a series at a missing x and throws on bad input', () => {
  const l = line({ label: 'x', series: [{ name: 'A', points: [{ x: '1', y: 1 }, { x: '3', y: 2 }] }, { name: 'B', points: [{ x: '1', y: 1 }, { x: '2', y: 2 }, { x: '3', y: 3 }] }] });
  expect(l).toContain('<td>–</td>');
  const one = (pts: { x: string; y: number }[]) => line({ label: 'x', series: [{ name: 'A', points: pts }] });
  expect(() => one([{ x: '1', y: 1 }])).toThrow('at least 2 distinct');
  expect(() => one([{ x: '1', y: NaN }, { x: '2', y: 1 }])).toThrow('finite number');
  expect(() => one([{ x: '1', y: -1 }, { x: '2', y: 1 }])).toThrow('below min');
  expect(() => one([{ x: '1', y: 1 }, { x: '1', y: 2 }])).toThrow('two points at 1');
  expect(() => line({ label: ' ', series: [] })).toThrow('label is required');
  expect(() => line({ label: 'x', series: [] })).toThrow('at least one series');
  expect(() => line({ label: 'x', series: Array.from({ length: 5 }, (_, i) => ({ name: `s${i}`, points: [] })) })).toThrow('at most 4');
  expect(line({ label: EVIL, series: [{ name: EVIL, points: [{ x: EVIL, y: 1 }, { x: 'b', y: 2 }] }] }).includes('<img')).toBe(false);
});

test('statusTile shows a glyph and a word, and unknown is its own state', () => {
  const t = statusTile({ label: 'Plex', value: '12 ms', state: 'ok', readAt: '2026-11-16T14:02:00Z', delta: -2 });
  expect(t).toContain('toon-tile toon-tile-ok');
  expect(t).toContain('✓</span> Ok');
  expect(t).toContain('<time class="toon-tile-read" datetime="2026-11-16T14:02:00Z">Read Nov 16 14:02 UTC</time>');
  expect(t).toContain('toon-delta-down');
  const u = statusTile({ label: 'Vault', state: 'unknown' });
  expect(u).toContain('no reading');
  expect(u).toContain('?</span> Unknown');
  expect(() => statusTile({ label: 'x', state: 'down' })).toThrow('needs a value');
  expect(() => statusTile({ label: 'x', state: 'fine' as never, value: '1' })).toThrow('unknown state');
  expect(() => statusTile({ label: ' ', state: 'ok', value: '1' })).toThrow('label is required');
  expect(statusTile({ label: EVIL, value: EVIL, state: 'ok', detail: EVIL, readAtText: EVIL }).includes('<img')).toBe(false);
});

test('switchRow shows both sides, marks the active one, and explains a disabled switch', () => {
  const s = switchRow({ name: 'Auth', active: 'lab', labState: 'ok', cloudState: 'unknown', labAge: '4 min ago', canSwitch: false, reason: 'Cloud is stale.', id: 'a' });
  expect(s.match(/toon-switch-side"|toon-switch-side /g)).toHaveLength(2);
  expect(s.match(/Serving/g)).toHaveLength(1);
  expect(s).toContain('data-toon-switch-to="cloud" aria-disabled="true" aria-describedby="a-reason"');
  expect(s).toContain('<p class="toon-switch-reason" id="a-reason">Cloud is stale.</p>');
  const on = switchRow({ name: 'Auth', active: 'cloud', labState: 'down', cloudState: 'ok', canSwitch: true, pinned: true, id: 'b' });
  expect(on).toContain('data-toon-switch-to="lab"');
  expect(on).not.toContain('aria-disabled');
  expect(on).toContain('Pinned');
  expect(switchRow({ name: 'x', active: 'lab', labState: 'ok', cloudState: 'ok', canSwitch: true, action: '<b id="mine"></b>' })).toContain('<b id="mine">');
  expect(() => switchRow({ name: 'x', active: 'lab', labState: 'ok', cloudState: 'ok', canSwitch: false })).toThrow('reason is required');
  expect(() => switchRow({ name: 'x', active: 'moon' as never, labState: 'ok', cloudState: 'ok', canSwitch: true })).toThrow('unknown active');
  expect(switchRow({ name: EVIL, hostname: EVIL, active: 'lab', labState: 'ok', cloudState: 'ok', canSwitch: false, reason: EVIL, dataClass: EVIL, buttonLabel: EVIL, labAge: EVIL }).includes('<img')).toBe(false);
});

test('line orders ISO times by instant, keeps other labels in order, marks a lone point and rejects a target below min', () => {
  const l = line({ label: 'x', series: [{ name: 'A', points: [{ x: 'Mar', y: 1 }, { x: 'Jan', y: 2 }, { x: 'Feb', y: 3 }] }] });
  expect(l.indexOf('<th scope="row">Mar')).toBeLessThan(l.indexOf('<th scope="row">Jan'));
  const z = line({ label: 'x', series: [{ name: 'A', points: [{ x: '2026-11-16T01:00:00+05:00', y: 1 }, { x: '2026-11-15T22:00:00Z', y: 2 }] }] });
  expect(z.indexOf('<th scope="row">Nov 15 20:00')).toBeLessThan(z.indexOf('<th scope="row">Nov 15 22:00'));
  const pts = Array.from({ length: 13 }, (_, i) => ({ x: `2026-11-${String(i + 1).padStart(2, '0')}`, y: 1 })).filter((p) => ['2026-11-01', '2026-11-02', '2026-11-05', '2026-11-13'].includes(p.x));
  const wide = line({ label: 'x', series: [{ name: 'A', points: pts }, { name: 'B', points: Array.from({ length: 13 }, (_, i) => ({ x: `2026-11-${String(i + 1).padStart(2, '0')}`, y: 2 })) }] });
  expect(wide).toContain('<circle'); // the lone point at Nov 5 and the last point both carry a marker
  expect(() => line({ label: 'x', target: -5, series: [{ name: 'A', points: [{ x: 'a', y: 1 }, { x: 'b', y: 2 }] }] })).toThrow('target');
});

test('verdict leads with a glyph, a word and the answer, and unknown is its own state', () => {
  const v = verdict({ state: 'warn', title: '1 item needs you', body: 'Open it below.', stateText: 'Needs you', id: 'v' });
  expect(v).toContain('class="toon-verdict toon-verdict-warn" id="v"');
  expect(v).toContain('<span aria-hidden="true">!</span> Needs you');
  expect(v).toContain('<p class="toon-verdict-title">1 item needs you</p>');
  expect(verdict({ state: 'unknown', title: 'Unknown', heading: 3 })).toContain('<h3 class="toon-verdict-title">Unknown</h3>');
  expect(verdict({ state: 'unknown', title: 'x' })).toContain('<span aria-hidden="true">?</span> Unknown');
  expect(() => verdict({ state: 'fine' as never, title: 'x' })).toThrow('unknown state');
  expect(() => verdict({ state: 'ok', title: ' ' })).toThrow('title is required');
  expect(() => verdict({ state: 'ok', title: 'x', heading: 1 as never })).toThrow('heading');
  expect(verdict({ state: 'ok', title: EVIL, body: EVIL, stateText: EVIL, cls: EVIL }).includes('<img')).toBe(false);
});

test('readout labels what was read and has a paper form', () => {
  const r = readout('Read 3 alerts.');
  expect(r).toBe('<p class="toon-readout"><span class="toon-readout-label">What was read</span> <span class="toon-readout-text">Read 3 alerts.</span></p>');
  expect(readout('x', { onPaper: true, label: 'Source' })).toContain('class="toon-readout toon-readout-paper"><span class="toon-readout-label">Source</span>');
  expect(() => readout(' ')).toThrow('text is required');
  expect(readout(EVIL, { label: EVIL, cls: EVIL }).includes('<img')).toBe(false);
});

test('toggle is a labelled switch whose disabled form stays focusable', () => {
  const t = toggle({ label: 'Auth: run on cloud', checked: false, off: 'Lab', on: 'Cloud', disabled: true, describedBy: 'why', id: 't', attrs: { 'data-x': 'a"b' } });
  expect(t).toContain('role="switch" class="toon-toggle" id="t" aria-checked="false" aria-label="Auth: run on cloud" aria-disabled="true" aria-describedby="why" data-x="a&quot;b"');
  expect(t).not.toContain(' disabled');
  expect(t).toContain('<span class="toon-toggle-side toon-toggle-side-on" aria-hidden="true">Lab</span>');
  expect(toggle({ label: 'x', checked: true, off: 'a', on: 'b' })).toContain('<span class="toon-toggle-side toon-toggle-side-on" aria-hidden="true">b</span>');
  expect(() => toggle({ label: '', checked: true, off: 'a', on: 'b' })).toThrow('required');
  expect(() => toggle({ label: 'x', checked: true, off: 'a', on: 'b', attrs: { onclick: 'x' } })).toThrow('not a data-* attribute');
  expect(() => toggle({ label: 'x', checked: true, off: 'a', on: 'b', describedBy: 'a b' })).toThrow('describedBy');
  expect(toggle({ label: EVIL, checked: true, off: EVIL, on: EVIL }).includes('<img')).toBe(false);
});

test('switchRow can draw a toggle, name its sides and show a reason while a switch is allowed', () => {
  const s = switchRow({ name: 'Auth', active: 'lab', labState: 'ok', cloudState: 'ok', canSwitch: true, reason: 'Waits for your tap.', control: 'toggle', labels: { lab: 'Lab' }, id: 'a' });
  expect(s).toContain('role="switch" class="toon-toggle" id="a-toggle" aria-checked="false" aria-label="Auth: run on cloud" aria-describedby="a-reason" data-toon-switch="Auth" data-toon-switch-to="cloud"');
  expect(s).toContain('<span class="toon-switch-where">Lab</span>');
  expect(s).toContain('<p class="toon-switch-reason" id="a-reason">Waits for your tap.</p>');
  const off = switchRow({ name: 'Auth', active: 'cloud', labState: 'unknown', cloudState: 'ok', canSwitch: false, reason: 'Lab is unknown.', control: 'toggle', id: 'b' });
  expect(off).toContain('aria-checked="true"');
  expect(off).toContain('aria-disabled="true" aria-describedby="b-reason"');
  expect(switchRow({ name: 'x', active: 'lab', labState: 'ok', cloudState: 'ok', canSwitch: true, labels: { lab: 'Lab' } })).toContain('>Switch to cloud<');
  expect(switchRow({ name: 'x', active: 'cloud', labState: 'ok', cloudState: 'ok', canSwitch: true, labels: { lab: 'Lab' } })).toContain('>Switch to lab<');
  expect(() => switchRow({ name: 'x', active: 'lab', labState: 'ok', cloudState: 'ok', canSwitch: true, control: 'dial' as never })).toThrow('unknown control');
});

test('barsKey names each tone and draws a hatch entry as a hatch', () => {
  const k = barsKey([{ label: 'Needs you', tone: 'red' }, { label: 'Low', tone: 'hatch' }]);
  expect(k).toContain('<ul class="toon-bars-key" role="list" aria-label="Chart key">');
  expect(k).toContain('style="--toon-dot:var(--color-toon-red)"');
  expect(k).toContain('<i class="toon-bars-key-hatch" aria-hidden="true"></i>Low');
  expect(() => barsKey([])).toThrow('at least one');
  expect(() => barsKey([{ label: 'x', tone: 'pink' as never }])).toThrow('unknown tone');
  expect(barsKey([{ label: EVIL, tone: 'red' }], { label: EVIL }).includes('<img')).toBe(false);
});

test('chartTable writes a table with row and column headings in a region a keyboard can scroll', () => {
  const t = chartTable({ caption: 'alerts per day', head: ['Day', 'Act'], rows: [['11-15', '2']] });
  expect(t).toContain('<summary>Show alerts per day as a table</summary>');
  expect(t).toContain('<div class="toon-table-wrap" tabindex="0" role="region" aria-label="alerts per day">');
  expect(t).toContain('<th scope="col">Day</th><th scope="col">Act</th>');
  expect(t).toContain('<tr><th scope="row">11-15</th><td>2</td></tr>');
  expect(() => chartTable({ caption: 'x', head: ['a', 'b'], rows: [['1']] })).toThrow('1 cells');
  expect(() => chartTable({ caption: ' ', head: ['a'], rows: [] })).toThrow('caption is required');
  expect(chartTable({ caption: EVIL, head: [EVIL], rows: [[EVIL]], summary: EVIL }).includes('<img')).toBe(false);
});

test('masthead keeps the title as real h1 text and hides the lettering', () => {
  const m = masthead({ title: 'Lab dashboard', eyebrow: 'PeteDio Labs', lede: 'One page.' });
  expect(m).toContain('<h1 class="toon-masthead-title"><span class="toon-masthead-sr">Lab dashboard</span><span aria-hidden="true"><span class="toon-type toon-type-comic');
  expect(m).toContain('<span class="toon-caption">PeteDio Labs</span>');
  expect(m).toContain('<p class="toon-masthead-lede">One page.</p>');
  expect(() => masthead({ title: '' })).toThrow('title is required');
  expect(masthead({ title: EVIL, eyebrow: EVIL, lede: EVIL }).includes('<img')).toBe(false);
});

test('kicker can make its label a heading, and a disclosure can end in a note', () => {
  const k = kicker('01', 'Open alerts', { heading: 3 });
  expect(k).toContain('<span class="toon-kicker-num" aria-hidden="true">01</span><h3 class="toon-kicker-label">Open alerts</h3>');
  expect(kicker('01', 'x')).toContain('<span class="toon-kicker-label">x</span>');
  expect(() => kicker('01', 'x', { heading: 1 as never })).toThrow('heading');
  const d = disclosure({ id: 'a', lead: '01', title: 't', note: '15 hours ago', native: true, panel: '' });
  expect(d).toContain('<span class="toon-disclosure-value toon-disclosure-note">15 hours ago</span>');
  expect(() => disclosure({ id: 'a', lead: '01', title: 't', note: 'x', value: 1, panel: '' })).toThrow('not both');
  expect(disclosure({ id: 'a', lead: '01', title: 't', note: EVIL, panel: '' }).includes('<img')).toBe(false);
});

test('switchCard is two buttons: the serving side is pressed and the other asks for the switch or says why not', () => {
  const c = switchCard({ name: 'auth', active: 'lab', labState: 'ok', cloudState: 'unknown', canSwitch: false, reason: 'Cloud is unknown.', labels: { lab: 'Lab' }, id: 'a' });
  expect(c).toContain('<button type="button" class="toon-switch-card-side toon-switch-card-ok" id="a-lab" aria-pressed="true" data-toon-switch="auth">');
  expect(c).toContain('id="a-cloud" aria-pressed="false" data-toon-switch="auth" data-toon-switch-to="cloud" aria-disabled="true" aria-describedby="a-reason">');
  expect(c).toContain('<span class="toon-switch-card-where">Lab</span><span class="toon-switch-card-state"><span aria-hidden="true">✓</span> Up</span><span class="toon-switch-card-serving">Serving</span>');
  expect(c.match(/Serving/g)).toHaveLength(1);
  expect(c).toContain('<p class="toon-switch-card-reason" id="a-reason">Cloud is unknown.</p>');
  const go = switchCard({ name: 'auth', active: 'cloud', labState: 'ok', cloudState: 'down', canSwitch: true, pinned: true, dataClass: 'replicated', id: 'b' });
  expect(go).toContain('id="b-lab" aria-pressed="false" data-toon-switch="auth" data-toon-switch-to="lab">');
  expect(go).not.toContain('aria-disabled');
  expect(go).toContain('toon-switch-card-down" id="b-cloud" aria-pressed="true"');
  expect(go).toContain('Pinned');
  expect(() => switchCard({ name: 'x', active: 'lab', labState: 'ok', cloudState: 'ok', canSwitch: false })).toThrow('reason is required');
  expect(() => switchCard({ name: 'x', active: 'moon' as never, labState: 'ok', cloudState: 'ok', canSwitch: true })).toThrow('unknown active');
  expect(() => switchCard({ name: 'x', active: 'lab', labState: 'fine' as never, cloudState: 'ok', canSwitch: true })).toThrow('unknown state');
  expect(switchCard({ name: EVIL, active: 'lab', labState: 'ok', cloudState: 'ok', canSwitch: false, reason: EVIL, dataClass: EVIL, labels: { lab: EVIL, cloud: EVIL } }).includes('<img')).toBe(false);
});

test('settingsMenu draws a details with two gears and escapes its items', () => {
  const h = settingsMenu({ id: 'st', items: [{ label: 'Secrets <x>', href: '#secrets', current: true }] });
  expect(h).toContain('<details class="toon-settings" id="st">');
  expect(h).toContain('aria-label="Settings"');
  expect(h).toContain('Secrets &lt;x&gt;');
  expect(h).toContain('aria-current="page"');
  expect((h.match(/class="toon-gear /g) ?? []).length).toBe(2);
  expect(h).toContain('aria-hidden="true"');
  expect(() => settingsMenu({ id: 'st', items: [] })).toThrow('at least one');
  expect(() => settingsMenu({ id: '1x', items: [{ label: 'a', href: '#a' }] })).toThrow('valid id');
  for (const bad of ['javascript:alert(1)', 'java\tscript:alert(1)', '\u0001javascript:alert(1)', ' JaVaScRiPt:1', 'data:text/html,x', 'vbscript:x']) {
    expect(() => settingsMenu({ id: 'st', items: [{ label: 'a', href: bad }] })).toThrow('href must be');
  }
  for (const good of ['#secrets', '/x', '?a=1', './x', '../x', 'https://a.example', 'mailto:a@b.c']) expect(settingsMenu({ id: 'st', items: [{ label: 'a', href: good }] })).toContain('toon-settings-item');
  expect(() => settingsMenu({ id: 'st', items: [{ label: '', href: '#a' }] })).toThrow('label and an href');
});

test('gears turn only when asked to, and reject an unknown spin', () => {
  expect(gears()).not.toContain('toon-gears-always');
  expect(gears({ spin: 'always' })).toContain('toon-gears-always');
  expect(() => gears({ spin: 'sometimes' as never })).toThrow('unknown spin');
  expect(gears()).not.toContain('NaN');
});

test('icons and button attributes refuse the markup an attacker would use', () => {
  for (const bad of ['<svg><img/src=x/onerror=alert(1)></svg>', '<svg><animate/onbegin=alert(1)/></svg>', '<svg><a href="jav&#x61;script:x"></a></svg>', '<svg></svg><iframe srcdoc="x"></iframe><svg></svg>', '<svg><path onclick="x"/></svg>']) expect(() => row({ title: 'a', icon: bad })).toThrow('icon');
  expect(() => button({ label: 'Go', attrs: { formaction: 'javascript:alert(1)' } })).toThrow('not allowed');
  expect(() => button({ label: 'Go', attrs: { role: 'x' } })).toThrow('not allowed');
  expect(() => button({ label: 'Go', href: '//evil.example' })).toThrow('href');
  expect(button({ label: 'Go', attrs: { 'data-x': '1', 'aria-pressed': 'false' } })).toContain('data-x="1"');
});

test('buildBadge draws only for a non-production environment and names the short hash', () => {
  expect(buildBadge()).toBe('');
  expect(buildBadge({ env: '', sha: 'abcdef1234567' })).toBe('');
  expect(buildBadge({ env: 'production', sha: 'abcdef1234567' })).toBe('');
  expect(buildBadge({ env: 'Prod' })).toBe('');
  const html = buildBadge({ env: 'staging', sha: 'ABCDEF1234567890' });
  expect(html).toContain('aria-label="Build"');
  expect(html).toContain('<code>abcdef1</code>');
  expect(buildBadge({ env: 'pr_123', sha: 'abcdef1' })).toContain('pr_123 build');
  expect(buildBadge({ env: 'staging' })).toContain('commit not named');
});

test('buildBadge refuses a malformed environment or hash', () => {
  expect(() => buildBadge({ env: 'stag ing<', sha: 'abcdef1' })).toThrow('env');
  expect(() => buildBadge({ env: 'staging', sha: 'not-a-hash' })).toThrow('sha');
});
