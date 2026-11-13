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

const accentOf = (accent: string): Accent => {
  if (!Object.hasOwn(HEX, accent)) throw new Error(`unknown accent "${accent}": use one of ${Object.keys(HEX).join(', ')}`);
  return accent as Accent;
};

/** A comic starburst, drawn once per accent: the shape behind a hero word or a figure. */
export const burst = (accent: Accent, cls = ''): string => {
  accentOf(accent);
  const pts: string[] = [];
  for (let i = 0; i < 24; i++) {
    const r = i % 2 ? 44 : 60;
    const a = (i / 24) * Math.PI * 2;
    pts.push(`${(60 + r * Math.cos(a)).toFixed(1)},${(60 + r * Math.sin(a)).toFixed(1)}`);
  }
  return `<svg class="toon-burst ${esc(cls)}" viewBox="0 0 120 120" aria-hidden="true" focusable="false"><polygon points="${pts.join(' ')}" fill="${HEX[accent]}" stroke="#0a0a1f" stroke-width="5" stroke-linejoin="round"/></svg>`;
};

/** Speed lines: a fan of yellow strokes behind a panel. Ink would vanish on the navy ground. */
export const speedLines = (cls = ''): string =>
  `<svg class="toon-speed ${esc(cls)}" viewBox="0 0 200 120" aria-hidden="true" focusable="false" preserveAspectRatio="none"><g stroke="#f2c94c" stroke-width="5" stroke-linecap="round" vector-effect="non-scaling-stroke">${[8, 26, 44, 62, 80, 98, 116].map((y, i) => `<line class="toon-speed-line" style="--i:${i}" x1="4" y1="${y}" x2="${120 + (i % 3) * 30}" y2="${y}" pathLength="100" vector-effect="non-scaling-stroke"/>`).join('')}</g></svg>`;

export interface LettersOptions { live?: boolean; flat?: boolean; cls?: string; size?: number }

/**
 * Display type: a heavy sans in the accent colour. With `live`, the comic face with an ink outline and a short shadow in
 * the paired colour, for the logo and the hero. Each letter is its own span, so the kit's CSS can tilt them in turn.
 * The text stays real text, so readers and search see it as written.
 */
export const letters = (text: string, accent: Accent = 'blue', opts: LettersOptions = {}): string => {
  accentOf(accent);
  return `<span class="toon-type${opts.live ? ' toon-type-comic' : ''}${opts.flat ? ' toon-type-flat' : ''} ${esc(opts.cls ?? '')}" style="--toon-fill:${HEX[accent]}; --toon-shade:${HEX[PAIR[accent]]}${opts.size !== undefined ? `; font-size:${Number(opts.size)}px` : ''}">${text
    .split(' ')
    .map((word) => `<span class="toon-word">${[...word].map((c) => `<span>${esc(c)}</span>`).join('')}</span>`)
    .join(' ')}</span>`;
};

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

export interface ShotOptions {
  src: string;
  /** What the image shows, for people who cannot see it. Required: an empty alt would hide the picture. */
  alt: string;
  width: number;
  height: number;
  caption?: string;
  badge?: string;
  accent?: Accent;
  /** The text of the image, one line per message. Rendered below the image in a disclosure. */
  transcript?: string;
  /** Show the transcript expanded. */
  open?: boolean;
  /** Load the image at once. Use it for a shot above the fold; the default is lazy. */
  eager?: boolean;
  cls?: string;
}

/** A screenshot in a comic panel: `<figure>` with the image, an optional corner badge, a caption and a transcript. */
export const shot = (o: ShotOptions): string => {
  if (!o.alt.trim()) throw new Error('shot: alt text is required');
  if (!Number.isInteger(o.width) || !Number.isInteger(o.height) || o.width <= 0 || o.height <= 0)
    throw new Error('shot: width and height must be positive integers');
  const accent = accentOf(o.accent ?? 'red');
  const badge = o.badge ? `<span class="toon-badge ${BADGE[accent]} toon-shot-badge">${esc(o.badge)}</span>` : '';
  const img = `<img src="${esc(o.src)}" alt="${esc(o.alt)}" width="${o.width}" height="${o.height}" decoding="async"${o.eager ? '' : ' loading="lazy"'}>`;
  const cap = o.caption ? `<figcaption class="toon-shot-cap"><span class="toon-caption">${esc(o.caption)}</span></figcaption>` : '';
  const lines = (o.transcript ?? '').split('\n').map((l) => l.trim()).filter(Boolean);
  const text = lines.length
    ? `<details class="toon-shot-text"${o.open ? ' open' : ''}><summary>Transcript</summary>${lines.map((l) => `<p>${esc(l)}</p>`).join('')}</details>`
    : '';
  return `<figure class="toon-shot${o.cls ? ' ' + esc(o.cls) : ''}"><div class="toon-shot-panel">${img}${badge}</div>${cap}${text}</figure>`;
};

/** A badge colour: an accent, or `paper` or `mist` for a neutral. */
export type Tone = Accent | 'paper' | 'mist';
const TONE_CLASS: Record<Tone, string> = { ...BADGE, paper: 'toon-badge-paper', mist: 'toon-badge-mist' };
const toneOf = (tone: string): Tone => {
  if (!Object.hasOwn(TONE_CLASS, tone)) throw new Error(`unknown tone "${tone}": use one of ${Object.keys(TONE_CLASS).join(', ')}`);
  return tone as Tone;
};

/** A badge with an optional count, such as a status and how many items have it. */
export const badge = (text: string, tone: Tone = 'red', count?: number): string =>
  `<span class="${['toon-badge', TONE_CLASS[toneOf(tone)]].filter(Boolean).join(' ')}">${esc(text)}${count === undefined ? '' : `<span class="toon-badge-count">${Number(count)}</span>`}</span>`;

/** A small tag. */
export const chip = (text: string): string => `<span class="toon-chip">${esc(text)}</span>`;

/** A figure tile: label, value and an optional line of detail. Put tiles inside `<div class="toon-stats">`. */
export const stat = (label: string, value: string, detail = ''): string =>
  `<div class="toon-stat"><span class="toon-stat-label">${esc(label)}</span><span class="toon-stat-value">${esc(value)}</span>${detail ? `<span class="toon-stat-detail">${esc(detail)}</span>` : ''}</div>`;

export interface RowOptions {
  /** The lead: a date or a tag. */
  lead?: string;
  title: string;
  /** Quieter text after the title. */
  sub?: string;
  /** Text at the end of the row. */
  aside?: string;
  /** A colour dot before the aside. */
  dot?: Tone;
}

/** A row for `<div class="toon-list">`. */
export const row = (o: RowOptions): string => {
  const dot = o.dot ? `<i style="--toon-dot:${TONE_HEX[toneOf(o.dot)]}"></i>` : '';
  return `<div class="toon-row">${o.lead ? `<span class="toon-row-lead">${esc(o.lead)}</span>` : ''}<span class="toon-row-body"><b>${esc(o.title)}</b>${o.sub ? ` <small>${esc(o.sub)}</small>` : ''}</span>${o.aside ? `<span class="toon-row-aside">${dot}${esc(o.aside)}</span>` : ''}</div>`;
};
const TONE_HEX: Record<Tone, string> = { ...HEX, paper: '#eceff3', mist: '#b9bde0' };

export interface BarSegment {
  value: number;
  tone: Tone | 'hatch';
  /** Names the segment for a screen reader. */
  label: string;
}
export interface BarColumn {
  label: string;
  /** A second line under the label, such as a date. */
  sub?: string;
  segments: BarSegment[];
  /** Marks the column that stands for now. */
  current?: boolean;
}
export interface BarsOptions {
  columns: BarColumn[];
  /** The value that fills the plot. Defaults to the largest stack, and never less than `target`. */
  max?: number;
  /** Draws a dashed reference line at this value. */
  target?: number;
  /** Names the chart for a screen reader. */
  label: string;
}

const SEG_CLASS: Record<Tone | 'hatch', string> = { blue: '', red: 'toon-bar-seg-red', yellow: 'toon-bar-seg-yellow', violet: 'toon-bar-seg-violet', paper: 'toon-bar-seg-paper', mist: 'toon-bar-seg-mist', hatch: 'toon-bar-seg-hatch' };

/**
 * Stacked columns on one scale. Heights are percentages of `max`, so the CSS needs no script. Each column carries
 * an `aria-label` with its numbers, because the shapes alone do not say them.
 */
export const bars = (o: BarsOptions): string => {
  if (!o.label.trim()) throw new Error('bars: label is required');
  if (!o.columns.length) throw new Error('bars: at least one column is required');
  for (const c of o.columns) for (const g of c.segments) {
    if (!Number.isFinite(g.value) || g.value < 0) throw new Error(`bars: segment "${g.label}" needs a value of 0 or more`);
    if (g.tone !== 'hatch') toneOf(g.tone);
  }
  const stack = (c: BarColumn) => Number(c.segments.reduce((a, g) => a + g.value, 0).toFixed(2));
  const max = o.max ?? Math.max(...o.columns.map(stack), o.target ?? 0);
  if (!(max > 0)) throw new Error('bars: max must be above 0: every column is empty and no target is set');
  const pct = (v: number) => ((v / max) * 100).toFixed(2);
  const line = o.target === undefined ? '' : `<div class="toon-bars-target" style="--at:${pct(o.target)}" aria-hidden="true"></div>`;
  const cols = o.columns.map((c) => {
    const said = c.segments.filter((g) => g.value > 0).map((g) => `${g.label} ${Number(g.value.toFixed(2))}`).join(', ') || 'none';
    const segs = c.segments.filter((g) => g.value > 0).map((g) => `<div class="toon-bar-seg ${SEG_CLASS[g.tone]}" style="--h:${pct(g.value)}"></div>`).join('');
    return `<div class="toon-bar" role="listitem" aria-label="${esc(`${c.label}${c.sub ? ' ' + c.sub : ''}: ${said}`)}"${c.current ? ' aria-current="date"' : ''}><span class="toon-bar-total">${stack(c) || ''}</span><div class="toon-bar-plot">${line}<div class="toon-bar-stack">${segs}</div></div><span class="toon-bar-label"><b>${esc(c.label)}</b>${c.sub ? esc(c.sub) : ''}</span></div>`;
  }).join('');
  return `<div class="toon-bars" role="list" aria-label="${esc(o.label)}" style="--toon-cols:${o.columns.length}">${cols}</div>`;
};

export interface KickerOptions {
  /** A short link at the end of the row, such as "All case studies". */
  link?: { href: string; text: string; cls?: string };
  cls?: string;
}

/** A section lead-in: a number chip, a short label, a rule to the right edge and an optional link. */
export const kicker = (num: string, label: string, o: KickerOptions = {}): string => {
  if (!num.trim() || !label.trim()) throw new Error('kicker: num and label are required');
  const link = o.link ? `<a class="toon-link toon-kicker-link${o.link.cls ? ' ' + esc(o.link.cls) : ''}" href="${esc(o.link.href)}">${esc(o.link.text)}</a>` : '';
  return `<div class="toon-kicker${o.cls ? ' ' + esc(o.cls) : ''}"><span class="toon-kicker-num">${esc(num)}</span><span class="toon-kicker-label">${esc(label)}</span><span class="toon-kicker-rule" aria-hidden="true"></span>${link}</div>`;
};

export interface StripCell {
  value: string;
  label: string;
  /** Makes the whole cell a link. */
  href?: string;
  /** The figure's colour. Without it the colour cycles by cell. */
  accent?: Accent;
}
export interface StripOptions {
  /** Names the strip for a screen reader. */
  label?: string;
  cls?: string;
}

/** A row of figure cells in one bordered panel: four across, two by two on a phone. */
export const strip = (cells: StripCell[], o: StripOptions = {}): string => {
  if (!cells.length) throw new Error('strip: at least one cell is required');
  const items = cells.map((c) => {
    if (!c.value.trim() || !c.label.trim()) throw new Error('strip: every cell needs a value and a label');
    const fill = c.accent ? ` style="--toon-fill:${HEX[accentOf(c.accent)]}"` : '';
    const inner = `<span class="toon-strip-value"${fill}>${esc(c.value)}</span><span class="toon-strip-label">${esc(c.label)}</span>`;
    return `<li class="toon-strip-cell">${c.href ? `<a class="toon-strip-item" href="${esc(c.href)}">${inner}</a>` : `<div class="toon-strip-item">${inner}</div>`}</li>`;
  }).join('');
  return `<ul class="toon-strip${o.cls ? ' ' + esc(o.cls) : ''}" role="list"${o.label ? ` aria-label="${esc(o.label)}"` : ''} style="--toon-cols:${cells.length}">${items}</ul>`;
};

export interface Step {
  title: string;
  body: string;
}
export interface StepsOptions {
  /** Names the list for a screen reader. */
  label?: string;
  cls?: string;
}

const ARROW = '<span class="toon-step-arrow" aria-hidden="true"><svg viewBox="0 0 16 16" width="16" height="16" focusable="false"><path d="M2 8h10M8.5 3.5 13 8l-4.5 4.5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';

/** Numbered panels read in order, with a decorative arrow between them: right in a row, down when stacked. */
export const steps = (items: Step[], o: StepsOptions = {}): string => {
  if (!items.length) throw new Error('steps: at least one step is required');
  const lis = items.map((s, i) => {
    if (!s.title.trim() || !s.body.trim()) throw new Error('steps: every step needs a title and a body');
    return `<li class="toon-step"><span class="toon-step-num" aria-hidden="true">${i + 1}</span><strong class="toon-step-title">${esc(s.title)}</strong><p class="toon-step-body">${esc(s.body)}</p>${i < items.length - 1 ? ARROW : ''}</li>`;
  }).join('');
  return `<ol class="toon-steps${o.cls ? ' ' + esc(o.cls) : ''}" role="list"${o.label ? ` aria-label="${esc(o.label)}"` : ''} style="--toon-cols:${items.length}">${lis}</ol>`;
};

export interface SfxOptions {
  size?: 'sm' | 'lg';
  /** An outline only, low in contrast, for sitting behind content. */
  ghost?: boolean;
  cls?: string;
}

// Per-letter turn, rise (em) and size, cycled by index. Fixed tables, not Math.random: the same word always letters the same way.
const SFX_TURN = [-7, 4, -3, 8, -5, 2];
const SFX_RISE = [0, -0.08, 0.06, -0.04, 0.1, -0.02];
const SFX_SIZE = [1, 1.12, 0.92, 1.06, 0.96, 1.1];

/**
 * A sound-effect word in the comic face, each letter turned, raised and sized by its index so it looks hand-lettered.
 * Decoration only: it is `aria-hidden`, so put real meaning in text elsewhere. Place it with `absolute` inside a `relative` parent.
 */
export const sfx = (text: string, accent: Accent = 'red', opts: SfxOptions = {}): string => {
  accentOf(accent);
  if (!text.trim()) throw new Error('sfx: text is required');
  if (opts.size !== undefined && opts.size !== 'sm' && opts.size !== 'lg') throw new Error(`unknown sfx size "${String(opts.size)}": use sm or lg`);
  const cls = ['toon-sfx', opts.size ? `toon-sfx-${opts.size}` : '', opts.ghost ? 'toon-sfx-ghost' : '', opts.cls ? esc(opts.cls) : ''].filter(Boolean).join(' ');
  const spans = [...text].map((c, i) => `<span style="--n:${i};--r:${SFX_TURN[i % 6]}deg;--y:${SFX_RISE[(i * 5) % 6]}em;--s:${SFX_SIZE[(i * 7) % 6]}">${esc(c)}</span>`).join('');
  return `<span class="${cls}" style="--toon-fill:${HEX[accent]}; --toon-shade:${HEX[PAIR[accent]]}" aria-hidden="true">${spans}</span>`;
};
