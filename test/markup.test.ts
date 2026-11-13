import { expect, test } from 'bun:test';
import { burst, esc, figure, fitSize, letters } from '../src/markup.ts';

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
