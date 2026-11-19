import { expect, test } from 'bun:test';
import preset from '../src/preset.ts';
import { group } from '../src/tokens.ts';

const ext = preset.theme.extend;

// The values below are the ones tailwind.config.js held in pdlabs-portfolio before the extraction. A change to a
// token must change this file on purpose.
test('the preset keeps every value the portfolio config held', () => {
  expect(ext.colors.toon).toEqual({ ground: '#0c1240', ink: '#0a0a1f', paper: '#eceff3', blue: '#5f8dff', red: '#ff4b3e', yellow: '#ff94c8', violet: '#a995f0', 'blue-text': '#2a57d6', 'red-text': '#b3261b', 'violet-text': '#6b4fd6', 'yellow-text': '#b3236f', green: '#4ccf8f', 'green-text': '#0f6e42', muted: '#4a4d78', mist: '#b9bde0', rule: '#d3d8e0' });
  expect(ext.fontFamily).toEqual({
    display: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
    comic: ['Bangers', '"Arial Black"', 'Impact', 'sans-serif'],
    body: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
    mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
  });
  expect(ext.fontSize).toEqual({
    caption2: '11px', caption1: '12px', footnote: '13px', subhead: '15px', body: '17px', title3: '20px', title2: '22px', title1: '28px',
    display2: 'clamp(32px,5.5vw,52px)', display1: 'clamp(44px,10vw,104px)', hero: 'clamp(52px,10vw,144px)',
  });
  expect(ext.spacing).toEqual({ s1: '4px', s2: '8px', s3: '12px', s4: '16px', s5: '20px', s6: '24px', s8: '32px' });
  expect(ext.borderRadius).toEqual({ group: '12px', card: '16px', hero: '24px', sheet: '28px', toon: '10px' });
  expect(ext.borderWidth).toEqual({ toon: '2px' });
  expect(ext.boxShadow['toon-blue']).toBe('4px 4px 0 #5f8dff');
  expect(ext.boxShadow['toon-lift']).toBe('6px 7px 0 var(--toon-shadow, #ff4b3e)');
  expect(ext.boxShadow['toon-press']).toBe('0 0 0 var(--toon-shadow, #ff4b3e)');
  expect(ext.transitionDuration).toEqual({ fast: '200ms', normal: '300ms', slow: '500ms' });
  expect(Object.keys(ext.keyframes)).toEqual(['bob', 'squash', 'pop']);
});

test('easing curves keep their control points', () => {
  const points = (s: string) => s.match(/cubic-bezier\((.+)\)/)![1]!.split(',').map(Number);
  expect(points(ext.transitionTimingFunction.spring!)).toEqual([0.175, 0.885, 0.32, 1.275]);
  expect(points(ext.transitionTimingFunction.bounce!)).toEqual([0.34, 1.8, 0.5, 1]);
});

test('group() fails loudly on a path that does not exist', () => {
  expect(() => group('colour')).toThrow('does not exist');
});

// WCAG relative luminance and contrast ratio.
const lum = (hex: string) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0]! + 0.7152 * c[1]! + 0.0722 * c[2]!;
};
const contrast = (a: string, b: string) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
};

test('ink on every fill meets the 5.1:1 the README promises', () => {
  const c = group('color');
  const checked: string[] = [];
  for (const fill of ['blue', 'red', 'yellow', 'violet', 'green', 'paper']) {
    expect(contrast(c.ink!, c[fill]!)).toBeGreaterThanOrEqual(5.1);
    checked.push(fill);
  }
  expect(checked).toHaveLength(6);
});

test('paper on the ground meets 15.4:1', () => {
  const c = group('color');
  expect(contrast(c.paper!, c.ground!)).toBeGreaterThanOrEqual(15.4);
});

test('the secondary-text colours meet 4.5:1 on their surfaces', () => {
  const c = group('color');
  expect(contrast(c.muted!, c.paper!)).toBeGreaterThanOrEqual(4.5);
  expect(contrast(c.mist!, c.ground!)).toBeGreaterThanOrEqual(4.5);
  expect(contrast(c.ink!, c.mist!)).toBeGreaterThanOrEqual(5.1);
});

test('the -text accents meet 4.5:1 on paper, where the fills do not', () => {
  const c = group('color');
  for (const a of ['blue', 'red', 'yellow', 'violet', 'green']) {
    expect(contrast(c[`${a}-text`]!, c.paper!)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(c[a]!, c.paper!)).toBeLessThan(3); // the reason the -text tokens exist
  }
});

test('text on the ground meets 7:1, so running text there is comfortable and not only legal', () => {
  const c = group('color');
  const checked: string[] = [];
  for (const text of ['paper', 'mist', 'yellow', 'green']) {
    expect(contrast(c[text]!, c.ground!)).toBeGreaterThanOrEqual(7);
    checked.push(text);
  }
  expect(checked).toHaveLength(4);
});

// The palettes dress one strip of the page. Values are aliases such as {color.ink}, so resolve them first.
test('every palette has six roles, and its text and edge pairs pass WCAG AA', () => {
  const c = group('color');
  const pal = group('palette');
  const resolve = (v: string) => {
    const m = v.match(/^\{color\.([a-z-]+)\}$/);
    if (!m || !c[m[1]!]) throw new Error(`palette value ${v} is not a colour token`);
    return c[m[1]!]!;
  };
  const roles = ['fill', 'text', 'state', 'edge', 'shadow', 'accent'];
  let pairs = 0;
  for (const name of ['ink', 'paper', 'violet', 'blue']) {
    for (const r of roles) expect(pal[`${name}-${r}`]).toBeDefined();
    const [fill, text, state, edge] = ['fill', 'text', 'state', 'edge'].map((r) => resolve(pal[`${name}-${r}`]!));
    expect(contrast(text!, fill!)).toBeGreaterThanOrEqual(4.5); // the sentence on the strip
    expect(contrast(state!, fill!)).toBeGreaterThanOrEqual(4.5); // the state word on the strip
    expect(Math.max(contrast(edge!, c.ground!), contrast(fill!, c.ground!))).toBeGreaterThanOrEqual(3); // the strip is visible on the ground
    pairs += 3;
  }
  expect(Object.keys(pal)).toHaveLength(24);
  expect(pairs).toBe(12);
  console.log(`palette check: 4 palettes, ${Object.keys(pal).length} roles, ${pairs} contrast pairs read`);
});
