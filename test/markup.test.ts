import { expect, test } from 'bun:test';
import { burst, esc, figure, fitSize, letters, shot, speedLines } from '../src/markup.ts';

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
