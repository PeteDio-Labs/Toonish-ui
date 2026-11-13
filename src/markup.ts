// Markup helpers for the kit's SVG and lettered display type. They return HTML strings, so any server-side
// templating works. Every interpolated string goes through esc().
export type Accent = 'blue' | 'red' | 'yellow' | 'violet';

const ENT: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s: string): string => s.replace(/[&<>"']/g, (c) => ENT[c]!);

export const HEX: Record<Accent, string> = { blue: '#5f8dff', red: '#f2706a', yellow: '#f2c94c', violet: '#a995f0' };
/** Shadow paired with each accent: never a complementary clash, never the fill's own colour. */
export const PAIR: Record<Accent, Accent> = { blue: 'yellow', red: 'yellow', yellow: 'blue', violet: 'red' };
/** The badge class for an accent. Red is the base badge and has no modifier. */
export const BADGE: Record<Accent, string> = { blue: 'toon-badge-blue', red: '', yellow: 'toon-badge-yellow', violet: 'toon-badge-violet' };

/** A comic starburst, drawn once per accent: the shape behind a hero word or a figure. */
export const burst = (accent: Accent, cls = ''): string => {
  const pts: string[] = [];
  for (let i = 0; i < 24; i++) {
    const r = i % 2 ? 44 : 60;
    const a = (i / 24) * Math.PI * 2;
    pts.push(`${(60 + r * Math.cos(a)).toFixed(1)},${(60 + r * Math.sin(a)).toFixed(1)}`);
  }
  return `<svg class="toon-burst ${cls}" viewBox="0 0 120 120" aria-hidden="true" focusable="false"><polygon points="${pts.join(' ')}" fill="${HEX[accent]}" stroke="#0a0a1f" stroke-width="5" stroke-linejoin="round"/></svg>`;
};

/** Speed lines: a fan of yellow strokes behind a panel. Ink would vanish on the navy ground. */
export const speedLines = (cls = ''): string =>
  `<svg class="toon-speed ${cls}" viewBox="0 0 200 120" aria-hidden="true" focusable="false" preserveAspectRatio="none"><g stroke="#f2c94c" stroke-width="5" stroke-linecap="round" vector-effect="non-scaling-stroke">${[8, 26, 44, 62, 80, 98, 116].map((y, i) => `<line class="toon-speed-line" style="--i:${i}" x1="4" y1="${y}" x2="${120 + (i % 3) * 30}" y2="${y}" pathLength="100" vector-effect="non-scaling-stroke"/>`).join('')}</g></svg>`;

export interface LettersOptions { live?: boolean; flat?: boolean; cls?: string; size?: number }

/**
 * Display type: a heavy sans in the accent colour. With `live`, the comic face with an ink outline and a short shadow in
 * the paired colour, for the logo and the hero. Each letter is its own span, so the kit's CSS can tilt them in turn.
 * The text stays real text, so readers and search see it as written.
 */
export const letters = (text: string, accent: Accent = 'blue', opts: LettersOptions = {}): string =>
  `<span class="toon-type${opts.live ? ' toon-type-comic' : ''}${opts.flat ? ' toon-type-flat' : ''} ${opts.cls ?? ''}" style="--toon-fill:${HEX[accent]}; --toon-shade:${HEX[PAIR[accent]]}${opts.size ? `; font-size:${opts.size}px` : ''}">${text
    .split(' ')
    .map((word) => `<span class="toon-word">${[...word].map((c) => `<span>${esc(c)}</span>`).join('')}</span>`)
    .join(' ')}</span>`;

/**
 * The largest font size, in px and at most `max`, at which the longest word of `value` fits in `avail` px.
 * Words wrap between spaces, so the longest word sets the width. The display face runs about 0.6em per character.
 */
export const fitSize = (value: string, max: number, avail: number): number => {
  const longest = Math.max(...value.split(' ').map((w) => w.length), 1);
  return Math.max(18, Math.min(max, Math.floor(avail / (longest * 0.6))));
};

/** A figure on a paper card: the display type, flat and heavy. It shrinks as the value gets longer, so it stays inside the card. */
export const figure = (value: string, accent: Accent, max: number, avail: number): string =>
  letters(value, accent, { flat: true, cls: 'block max-w-full leading-none', size: fitSize(value, max, avail) });
