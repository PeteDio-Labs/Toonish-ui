// Markup helpers for the kit's SVG and lettered display type. They return HTML strings, so any server-side
// templating works. Every interpolated string goes through esc().
export type Accent = 'blue' | 'red' | 'yellow' | 'violet';

const ENT: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s: string): string => s.replace(/[&<>"']/g, (c) => ENT[c]!);

export const HEX: Record<Accent, string> = { blue: '#5f8dff', red: '#f2706a', yellow: '#f2c94c', violet: '#a995f0' };
/** The accent at a depth that reads on paper: 3:1 or better for large text. The fills in HEX are 1.4 to 2.7:1 on paper. */
export const HEX_TEXT: Record<Accent, string> = { blue: '#2a57d6', red: '#c8322b', yellow: '#7a5c00', violet: '#6b4fd6' };
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

export interface LettersOptions { live?: boolean; flat?: boolean; /** Use the deeper accent, which reads on paper. Default is the fill for the navy ground. */ onPaper?: boolean; cls?: string; size?: number }

/**
 * Display type: a heavy sans in the accent colour. With `live`, the comic face with an ink outline and a short shadow in
 * the paired colour, for the logo and the hero. Each letter is its own span, so the kit's CSS can tilt them in turn.
 * The text stays real text, so readers and search see it as written.
 */
export const letters = (text: string, accent: Accent = 'blue', opts: LettersOptions = {}): string => {
  accentOf(accent);
  return `<span class="toon-type${opts.live ? ' toon-type-comic' : ''}${opts.flat ? ' toon-type-flat' : ''} ${esc(opts.cls ?? '')}" style="--toon-fill:${(opts.onPaper ? HEX_TEXT : HEX)[accent]}; --toon-shade:${HEX[PAIR[accent]]}${opts.size !== undefined ? `; font-size:${Number(opts.size)}px` : ''}">${text
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
  letters(value, accent, { flat: true, onPaper: true, cls: 'block max-w-full leading-none', size: fitSize(value, max, avail) });

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
  /** Makes the whole picture a link to this URL (the full-size file), opened in a new tab. Needs `hrefLabel`. */
  href?: string;
  /** The link's accessible name, such as "Open the full-size picture". Required with `href`. */
  hrefLabel?: string;
  /** A short second badge on the top right corner, such as "1 / 4" for a picture in a sequence. */
  corner?: string;
  /** A "Tap to enlarge" style hint on the bottom right corner. It hides from `lg`. Use it with `href`. */
  hint?: string;
  /** Load the image at once. Use it for a shot above the fold; the default is lazy. */
  eager?: boolean;
  cls?: string;
}

/** A screenshot in a comic panel: `<figure>` with the image, optional corner badges, a caption and a transcript. With `href`, the image is a link. */
export const shot = (o: ShotOptions): string => {
  if (!o.alt.trim()) throw new Error('shot: alt text is required');
  if (!Number.isInteger(o.width) || !Number.isInteger(o.height) || o.width <= 0 || o.height <= 0)
    throw new Error('shot: width and height must be positive integers');
  const accent = accentOf(o.accent ?? 'red');
  if (o.href !== undefined && !o.hrefLabel?.trim()) throw new Error('shot: hrefLabel is required with href');
  const badge = o.badge ? `<span class="toon-badge ${BADGE[accent]} toon-shot-badge">${esc(o.badge)}</span>` : '';
  const corner = o.corner ? `<span class="toon-badge toon-badge-paper toon-shot-badge toon-shot-badge-end">${esc(o.corner)}</span>` : '';
  const hint = o.hint ? `<span class="toon-badge toon-badge-paper toon-shot-hint" aria-hidden="true">${esc(o.hint)}</span>` : '';
  const img0 = `<img src="${esc(o.src)}" alt="${esc(o.alt)}" width="${o.width}" height="${o.height}" decoding="async"${o.eager ? '' : ' loading="lazy"'}>`;
  const img = o.href !== undefined ? `<a class="toon-shot-link" href="${esc(o.href)}" target="_blank" rel="noopener" aria-label="${esc(o.hrefLabel!)}">${img0}</a>` : img0;
  const cap = o.caption ? `<figcaption class="toon-shot-cap"><span class="toon-caption">${esc(o.caption)}</span></figcaption>` : '';
  const lines = (o.transcript ?? '').split('\n').map((l) => l.trim()).filter(Boolean);
  const text = lines.length
    ? `<details class="toon-shot-text"${o.open ? ' open' : ''}><summary>Transcript</summary>${lines.map((l) => `<p>${esc(l)}</p>`).join('')}</details>`
    : '';
  return `<figure class="toon-shot${o.cls ? ' ' + esc(o.cls) : ''}"><div class="toon-shot-panel">${img}${badge}${corner}${hint}</div>${cap}${text}</figure>`;
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
  `<span class="${['toon-badge', TONE_CLASS[toneOf(tone)]].filter(Boolean).join(' ')}">${esc(text)}${count === undefined ? '' : `<span class="toon-badge-count"> ${Number(count)}</span>`}</span>`;

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

/** A row for `list()`. It is a `listitem`, so the container must be `role="list"`. */
export const row = (o: RowOptions): string => {
  const dot = o.dot ? `<i style="--toon-dot:${TONE_HEX[toneOf(o.dot)]}"></i>` : '';
  return `<div class="toon-row" role="listitem">${o.lead ? `<span class="toon-row-lead">${esc(o.lead)}</span>` : ''}<span class="toon-row-body"><b>${esc(o.title)}</b>${o.sub ? ` <small>${esc(o.sub)}</small>` : ''}</span>${o.aside ? `<span class="toon-row-aside">${dot}${esc(o.aside)}</span>` : ''}</div>`;
};
export interface ListOptions {
  /** Names the list for a screen reader. Required. */
  label: string;
  cls?: string;
}

/** A panel of rows. A `div` with grid layout loses its list semantics in some readers, so the helper sets `role="list"`. Pass rows from `row()`. */
export const list = (rows: string[], o: ListOptions): string => {
  if (!o.label?.trim()) throw new Error('list: label is required');
  if (!rows.length) throw new Error('list: at least one row is required');
  return `<div class="toon-list${o.cls ? ' ' + esc(o.cls) : ''}" role="list" aria-label="${esc(o.label)}">${rows.join('')}</div>`;
};

/** A skip link: the first focusable element on the page, hidden until it takes focus. Point it at the id of `<main>`. */
export const skipLink = (target = 'main', text = 'Skip to content'): string => {
  if (!/^[A-Za-z][\w-]*$/.test(target)) throw new Error(`skipLink: target "${target}" is not a valid id`);
  return `<a class="toon-skip" href="#${target}">${esc(text)}</a>`;
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

/** A row of figure cells in one bordered panel: four across, two by two on a phone. A space sits between the figure and its label, so a linked cell is named "22 case studies", not "22case studies". */
export const strip = (cells: StripCell[], o: StripOptions = {}): string => {
  if (!cells.length) throw new Error('strip: at least one cell is required');
  const items = cells.map((c) => {
    if (!c.value.trim() || !c.label.trim()) throw new Error('strip: every cell needs a value and a label');
    const fill = c.accent ? ` style="--toon-fill:${HEX_TEXT[accentOf(c.accent)]}"` : '';
    const inner = `<span class="toon-strip-value"${fill}>${esc(c.value)}</span> <span class="toon-strip-label">${esc(c.label)}</span>`;
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
  /** A sticker on the top right corner of a `relative` parent, at every width. */
  corner?: boolean;
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
  const cls = ['toon-sfx', opts.size ? `toon-sfx-${opts.size}` : '', opts.ghost ? 'toon-sfx-ghost' : '', opts.corner ? 'toon-sfx-corner' : '', opts.cls ? esc(opts.cls) : ''].filter(Boolean).join(' ');
  const spans = [...text].map((c, i) => `<span style="--n:${i};--r:${SFX_TURN[i % 6]}deg;--y:${SFX_RISE[(i * 5) % 6]}em;--s:${SFX_SIZE[(i * 7) % 6]}">${esc(c)}</span>`).join('');
  return `<span class="${cls}" style="--toon-fill:${HEX[accent]}; --toon-shade:${HEX[PAIR[accent]]}" aria-hidden="true">${spans}</span>`;
};

export interface DeckOptions {
  /** Names the pile for a screen reader, such as "More recent case studies". Required. */
  label: string;
  /** Keep the pile at every width. By default it turns off from `md`, and the cards lay out as a grid. */
  always?: boolean;
  /** Columns of the grid from `md` up. Defaults to 3. */
  cols?: number;
  /** Text of the previous and next buttons. Default "Previous" and "Next". */
  prevLabel?: string;
  nextLabel?: string;
  cls?: string;
}

const CHEVRON = (d: string) => `<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false"><path d="${d}" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/**
 * A pile of cards you flip through on a phone, and a grid from `md` up. Pass each card as HTML: the helper wraps it and
 * does NOT escape it, because a card is markup you wrote, so escape any text you put in a card yourself. It does escape
 * `label` and every other string option. `initToonish` (dist/toonish.js) builds the pile; without script the cards
 * are a plain list and the controls stay hidden. Each card is a group labelled "1 of 3" and every card but the top one
 * is `inert` while the pile is on.
 */
export const deck = (cards: string[], o: DeckOptions): string => {
  if (!o.label?.trim()) throw new Error('deck: label is required');
  if (!cards.length) throw new Error('deck: at least one card is required');
  const cols = o.cols ?? 3;
  if (!Number.isInteger(cols) || cols < 1 || cols > 6) throw new Error('deck: cols must be a whole number from 1 to 6');
  const items = cards.map((c, i) => `<div class="toon-deck-card" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${cards.length}">${c}</div>`).join('');
  const prev = o.prevLabel ?? 'Previous';
  const next = o.nextLabel ?? 'Next';
  const controls = `<div class="toon-deck-controls"><button type="button" class="toon-btn toon-btn-paper toon-deck-btn" data-toon-deck-prev>${CHEVRON('M10 3 5 8l5 5')}${esc(prev)}</button><span class="toon-deck-count" role="status" aria-live="polite" aria-atomic="true">1 / ${cards.length}</span><button type="button" class="toon-btn toon-btn-yellow toon-deck-btn" data-toon-deck-next>${esc(next)}${CHEVRON('m6 3 5 5-5 5')}</button></div>`;
  return `<div class="toon-deck${o.cls ? ' ' + esc(o.cls) : ''}" data-toon-deck="${o.always ? 'always' : 'phone'}" style="--toon-cols:${cols}"><div class="toon-deck-pile" role="group" aria-roledescription="carousel" aria-label="${esc(o.label)}">${items}</div>${controls}</div>`;
};

export interface PortraitOptions {
  /** A cut-out portrait with a transparent background (PNG or WebP). The kit draws the backdrop behind it. */
  src: string;
  /** Who is shown and how, for people who cannot see it. Required: an empty alt would hide the picture. */
  alt: string;
  width: number;
  height: number;
  /** `slate` is a dark studio grey. `paper` is the kit's cool grey. */
  backdrop?: 'slate' | 'paper';
  /** The colour of the halftone dots and ring in the corner. */
  accent?: Accent;
  eager?: boolean;
  cls?: string;
}

const BACKDROPS = { slate: { a: '#6d7281', b: '#383c49', dot: 0.22 }, paper: { a: '#f6f8fa', b: '#d3d8e0', dot: 0.4 } } as const;

/**
 * A portrait on a themed vector backdrop. Pass any cut-out of a person (transparent PNG or WebP) and the kit draws a soft
 * radial gradient, a halftone corner and a ring behind it, so every portrait on a site shares one studio look.
 * The backdrop is SVG, so it stays sharp at any size and costs no image bytes. Size the figure with `cls` or its parent.
 */
export const portrait = (o: PortraitOptions): string => {
  if (!o.alt.trim()) throw new Error('portrait: alt text is required');
  if (!Number.isInteger(o.width) || !Number.isInteger(o.height) || o.width <= 0 || o.height <= 0)
    throw new Error('portrait: width and height must be positive integers');
  const tone = o.backdrop ?? 'slate';
  if (!Object.hasOwn(BACKDROPS, tone)) throw new Error(`unknown portrait backdrop "${String(o.backdrop)}": use slate or paper`);
  const bg = BACKDROPS[tone];
  const accent = accentOf(o.accent ?? 'blue');
  const dots: string[] = [];
  for (let row = 0; row < 6; row++) for (let col = 0; col < 6 - row; col++) {
    dots.push(`<circle cx="${(94 - col * 8).toFixed(1)}" cy="${(6 + row * 8).toFixed(1)}" r="${(2.6 - row * 0.3).toFixed(2)}"/>`);
  }
  const id = `toon-portrait-${tone}`;
  const svg = `<svg class="toon-portrait-bg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">` +
    `<defs><radialGradient id="${id}" cx="50%" cy="38%" r="75%"><stop offset="0" stop-color="${bg.a}"/><stop offset="1" stop-color="${bg.b}"/></radialGradient></defs>` +
    `<rect width="100" height="100" fill="url(#${id})"/>` +
    `<circle cx="6" cy="96" r="30" fill="none" stroke="${HEX[accent]}" stroke-width="2.5" opacity="0.55"/>` +
    `<g fill="${HEX[accent]}" opacity="${bg.dot}">${dots.join('')}</g></svg>`;
  const img = `<img src="${esc(o.src)}" alt="${esc(o.alt)}" width="${o.width}" height="${o.height}" decoding="async"${o.eager ? '' : ' loading="lazy"'}>`;
  return `<div class="toon-portrait${o.cls ? ' ' + esc(o.cls) : ''}" data-backdrop="${tone}">${svg}${img}</div>`;
};

export interface PagerLink {
  href: string;
  /** The title of the page the link opens. Shown as plain text under the direction. */
  title: string;
  /** The direction word. "Previous" or "Next" unless you set it. */
  dir?: string;
}
export interface PagerOptions {
  prev?: PagerLink;
  next?: PagerLink;
  /** Names the nav for a screen reader. */
  label: string;
  cls?: string;
}

/**
 * Previous and next links in the shape of the deck's switcher: an arrow in a disc, the direction in bold and the
 * destination's title under it. Pass either link or both. Every string is escaped.
 */
export const pager = (o: PagerOptions): string => {
  if (!o.label?.trim()) throw new Error('pager: label is required');
  if (!o.prev && !o.next) throw new Error('pager: pass prev, next or both');
  const link = (l: PagerLink, kind: 'prev' | 'next') => {
    const dir = l.dir ?? (kind === 'prev' ? 'Previous' : 'Next');
    if (!l.href.trim() || !l.title.trim() || !dir.trim()) throw new Error('pager: a link needs an href, a title and a direction');
    return `<a class="toon-pager-link toon-pager-${kind}" href="${esc(l.href)}"><span class="toon-pager-arrow" aria-hidden="true">${CHEVRON(kind === 'prev' ? 'M10 3 5 8l5 5' : 'M6 3l5 5-5 5')}</span><span class="toon-pager-text"><span class="toon-pager-dir">${esc(dir)}<span class="toon-pager-sep">: </span></span><span class="toon-pager-title">${esc(l.title)}</span></span></a>`;
  };
  return `<nav class="toon-pager${o.cls ? ' ' + esc(o.cls) : ''}" aria-label="${esc(o.label)}">${o.prev ? link(o.prev, 'prev') : ''}${o.next ? link(o.next, 'next') : ''}</nav>`;
};

// ---- Desk components: delta, scale, meter, tab bar, disclosure and spark. -------------------------------------------------

const INK = '#0a0a1f';
const num = (n: number): string => String(Number(n.toFixed(2)) + 0); // trims float noise, and "-0" becomes "0"

/** A number the helper can draw: it throws on NaN and on infinity, and on a value outside `lo`..`hi` unless `clamp` is set. */
const bound = (who: string, what: string, v: number, lo: number, hi: number, clamp?: boolean): number => {
  if (typeof v !== 'number' || !Number.isFinite(v)) throw new Error(`${who}: ${what} must be a finite number, got ${String(v)}`);
  if (v >= lo && v <= hi) return v;
  if (!clamp) throw new Error(`${who}: ${what} ${v} is outside ${lo} to ${hi}; pass clamp: true to clamp it`);
  return Math.min(hi, Math.max(lo, v));
};

/** Who owns an item. `a` is ink with a solid dot; `b` is violet with a ringed dot, so the shape changes as well as the colour. */
export type Owner = 'a' | 'b';
const ownerOf = (who: string, owner: string): Owner => {
  if (owner !== 'a' && owner !== 'b') throw new Error(`${who}: unknown owner "${owner}": use a or b`);
  return owner;
};

export interface DeltaOptions {
  /** Text after the number, such as "%". The spoken form says "points" when you give none. */
  unit?: string;
  /** Swap the colours for a measure where down is good. The glyph still says which way it moved. */
  invert?: boolean;
  /** Use the colours that read on the navy ground. The default reads on paper. */
  ground?: boolean;
}

/** A signed change such as "▲ 4", "▼ 32" or "· 0". The glyph is visible text, and `aria-label` says it aloud. Direction is never colour alone. */
export const delta = (n: number, o: DeltaOptions = {}): string => {
  if (typeof n !== 'number' || !Number.isFinite(n)) throw new Error(`delta: n must be a finite number, got ${String(n)}`);
  const dir = n > 0 ? 'up' : n < 0 ? 'down' : 'flat';
  const unit = o.unit ?? '';
  const spoken = unit.trim() === '%' ? 'percent' : unit.trim() || 'points';
  const text = `${dir === 'up' ? '▲' : dir === 'down' ? '▼' : '·'} ${num(Math.abs(n))}${unit}`;
  const label = dir === 'flat' ? 'no change' : `${dir} ${num(Math.abs(n))} ${spoken}`;
  const cls = ['toon-delta', `toon-delta-${dir}`, o.invert ? 'toon-delta-invert' : '', o.ground ? 'toon-delta-ground' : ''].filter(Boolean).join(' ');
  return `<span class="${cls}" role="img" aria-label="${esc(label)}">${esc(text)}</span>`;
};

export interface ScaleOptions {
  /** The current value from 0 to 100, or `null` for an item with no score. */
  value: number | null;
  /** Past values, oldest first. The last one is the previous value, and the move segment runs from it to `value`. */
  history?: number[];
  owner?: Owner;
  /** Draw ticks at 25, 50 and 75. Default true. */
  ticks?: boolean;
  /** Says the score and the move for a screen reader, such as "P-01 scores 82, up 4 from 78". Required. */
  label: string;
  /** Clamp a value outside 0 to 100 instead of throwing. */
  clamp?: boolean;
}

/** A 0 to 100 track with one current marker, faint dots for past values and a segment for the latest move. Every part is a span, so it can sit inside a button. */
export const scale = (o: ScaleOptions): string => {
  if (!o.label?.trim()) throw new Error('scale: label is required');
  const owner = ownerOf('scale', o.owner ?? 'a');
  if (o.value === null) return `<span class="toon-scale toon-scale-empty" role="img" aria-label="${esc(o.label)}"></span>`;
  const value = bound('scale', 'value', o.value, 0, 100, o.clamp);
  const history = (o.history ?? []).map((h, i) => bound('scale', `history[${i}]`, h, 0, 100, o.clamp));
  const prev = history.at(-1);
  const ticks = o.ticks === false ? '' : [25, 50, 75].map((t) => `<span class="toon-scale-tick" style="--at:${t}"></span>`).join('');
  const past = history.map((h) => `<span class="toon-scale-past" style="--at:${num(h)}"></span>`).join('');
  const move = prev === undefined || prev === value
    ? ''
    : `<span class="toon-scale-move toon-scale-move-${value > prev ? 'up' : 'down'}" style="--lo:${num(Math.min(prev, value))};--hi:${num(Math.max(prev, value))}"></span>`;
  return `<span class="toon-scale" role="img" aria-label="${esc(o.label)}" style="--v:${num(value)};--p:${num(prev ?? value)}">${ticks}${past}${move}<span class="toon-scale-mark toon-owner-${owner}"></span></span>`;
};

/** The axis row for a column of scales: 0, 25, 50, 75 and 100. It repeats what the page says, so it is hidden from a screen reader. */
export const scaleAxis = (): string =>
  `<span class="toon-scale-axis" aria-hidden="true">${[0, 25, 50, 75, 100].map((t) => `<span style="--at:${t}">${t}</span>`).join('')}</span>`;

export type MeterTone = 'blue' | 'red' | 'yellow' | 'violet' | 'mist';
const METER_FILL: Record<MeterTone, string> = { blue: '', red: 'toon-meter-fill-red', yellow: 'toon-meter-fill-yellow', violet: 'toon-meter-fill-violet', mist: 'toon-meter-fill-mist' };

export interface MeterOptions {
  /** Names the bar for a screen reader, and shows above it. Required. */
  label: string;
  value: number;
  /** The value that fills the bar. Default 100. */
  max?: number;
  tone?: MeterTone;
  /** `lg` makes the bar 16 px tall and the number larger. Default `md`. */
  size?: 'md' | 'lg';
  /** A second line under the label, such as "vs US, was 42". */
  sub?: string;
  /** Labels under a large meter, left to right, such as "0 · coincidence". */
  scaleLabels?: string[];
  /** Replaces the printed number and the spoken value, such as "~7%". */
  valueText?: string;
  /** Clamp a value outside 0 to `max` instead of throwing. */
  clamp?: boolean;
  /** The id prefix for the label. Default is generated, so pass one for stable output. */
  id?: string;
}

let uid = 0;

/** One value out of a maximum. The bar is `role="meter"`, named by the visible label. */
export const meter = (o: MeterOptions): string => {
  if (!o.label?.trim()) throw new Error('meter: label is required');
  const max = o.max ?? 100;
  if (typeof max !== 'number' || !Number.isFinite(max) || max <= 0) throw new Error(`meter: max must be above 0, got ${String(max)}`);
  const value = bound('meter', 'value', o.value, 0, max, o.clamp);
  const tone = o.tone ?? 'blue';
  if (!Object.hasOwn(METER_FILL, tone)) throw new Error(`unknown meter tone "${tone}": use one of ${Object.keys(METER_FILL).join(', ')}`);
  const size = o.size ?? 'md';
  if (size !== 'md' && size !== 'lg') throw new Error(`unknown meter size "${String(size)}": use md or lg`);
  if (o.id !== undefined && !/^[A-Za-z][\w-]*$/.test(o.id)) throw new Error(`meter: id "${o.id}" is not a valid id`);
  const id = o.id ?? `toon-meter-${++uid}`;
  const text = o.valueText ?? num(value);
  const fill = value > 0 ? `<span class="toon-meter-fill${METER_FILL[tone] ? ' ' + METER_FILL[tone] : ''}" style="--w:${num((value / max) * 100)}"></span>` : '';
  const sub = o.sub ? `<span class="toon-meter-sub" id="${id}-sub">${esc(o.sub)}</span>` : '';
  const labels = (o.scaleLabels ?? []).filter((l) => l.trim());
  const scaleRow = labels.length ? `<span class="toon-meter-scale">${labels.map((l) => `<span>${esc(l)}</span>`).join('')}</span>` : '';
  return `<div class="toon-meter${size === 'lg' ? ' toon-meter-lg' : ''}"><span class="toon-meter-name"><span class="toon-meter-label" id="${id}-label">${esc(o.label)}</span>${sub}</span>` +
    `<span class="toon-meter-bar" role="meter" aria-labelledby="${id}-label"${sub ? ` aria-describedby="${id}-sub"` : ''} aria-valuemin="0" aria-valuenow="${num(value)}" aria-valuemax="${num(max)}" aria-valuetext="${esc(o.valueText ?? `${num(value)} of ${num(max)}`)}">${fill}</span>` +
    `<span class="toon-meter-value" aria-hidden="true">${esc(text)}</span>${scaleRow}</div>`;
};

export interface MetersOptions {
  /** Names the list for a screen reader. Required. */
  label: string;
  cls?: string;
}

/** A list of meters with ink dividers, for use inside a card. Pass options, or markup from `meter()`. */
export const meters = (items: (MeterOptions | string)[], o: MetersOptions): string => {
  if (!o.label?.trim()) throw new Error('meters: label is required');
  if (!items.length) throw new Error('meters: at least one meter is required');
  return `<div class="toon-meters${o.cls ? ' ' + esc(o.cls) : ''}" role="list" aria-label="${esc(o.label)}">${items.map((m) => `<div class="toon-meters-item" role="listitem">${typeof m === 'string' ? m : meter(m)}</div>`).join('')}</div>`;
};

export interface TabSpec {
  /** The id of the panel this tab opens. The hash holds it, so `#board` opens the tab for `board`. */
  id: string;
  label: string;
  /** An SVG you trust. The helper hides it from a screen reader. */
  icon?: string;
}
export interface TabbarOptions {
  /** Names the nav for a screen reader. Required. */
  label: string;
  /** The id of the selected tab. Default is the first. */
  selected?: string;
  /** From md, show the bar as a row of pills at the top of the page. */
  top?: boolean;
  cls?: string;
}

const ID_RE = /^[A-Za-z][\w-]*$/;

/**
 * A tab bar for a single-page app with up to five sections. `initToonish` wires it: a click switches panels, the arrow keys,
 * Home and End move between tabs, and the hash keeps the selected tab. Without script every panel shows and each tab is an in-page link.
 * Pair each tab with `tabpanel(id, html)`.
 */
export const tabbar = (tabs: TabSpec[], o: TabbarOptions): string => {
  if (!o.label?.trim()) throw new Error('tabbar: label is required');
  if (tabs.length < 2 || tabs.length > 5) throw new Error(`tabbar: needs 2 to 5 tabs, got ${tabs.length}`);
  const ids = new Set<string>();
  for (const t of tabs) {
    if (!ID_RE.test(t.id)) throw new Error(`tabbar: tab id "${t.id}" is not a valid id`);
    if (!t.label.trim()) throw new Error(`tabbar: tab "${t.id}" needs a label`);
    if (ids.has(t.id)) throw new Error(`tabbar: tab id "${t.id}" is used twice`);
    ids.add(t.id);
  }
  const selected = o.selected ?? tabs[0]!.id;
  if (!ids.has(selected)) throw new Error(`tabbar: selected tab "${selected}" is not one of the tabs`);
  const items = tabs.map((t) => `<a class="toon-tab" role="tab" id="${t.id}-tab" href="#${t.id}" aria-selected="${t.id === selected}" aria-controls="${t.id}">${t.icon ? `<span class="toon-tab-icon" aria-hidden="true">${t.icon}</span>` : ''}<span class="toon-tab-label">${esc(t.label)}</span></a>`).join('');
  return `<nav class="toon-tabbar${o.top ? ' toon-tabbar-top' : ''}${o.cls ? ' ' + esc(o.cls) : ''}" aria-label="${esc(o.label)}" data-toon-tabs><div class="toon-tablist" role="tablist" aria-label="${esc(o.label)}">${items}</div></nav>`;
};

/** The panel for a tab made by `tabbar()`. It is labelled by that tab. `html` is markup you wrote and is not escaped. */
export const tabpanel = (id: string, html: string, cls = ''): string => {
  if (!ID_RE.test(id)) throw new Error(`tabpanel: id "${id}" is not a valid id`);
  return `<div class="toon-tabpanel${cls ? ' ' + esc(cls) : ''}" role="tabpanel" id="${id}" aria-labelledby="${id}-tab">${html}</div>`;
};

export interface DisclosureOptions {
  /** Prefix for the ids. The panel takes it, and the button takes `<id>-btn`. Required. */
  id: string;
  /** A mono id for the row, such as "P-01". Required. */
  lead: string;
  title: string;
  /** A badge after the title. Text, or text with a tone (default yellow). */
  badge?: string | { text: string; tone?: Tone };
  /** A large figure at the end of the line. */
  value?: string | number;
  /** The signed change after the value. */
  delta?: number | (DeltaOptions & { value: number });
  /** A full-width slot under the line, such as a `scale()`. Markup you trust, not escaped. */
  below?: string;
  /** The detail. Markup you trust, not escaped. */
  panel: string;
  open?: boolean;
  owner?: Owner;
  /** Says the owner aloud, such as "Pedro". The dot and colour show it to the eye. */
  ownerLabel?: string;
  /** Use `<details>` and `<summary>`, which work without script. */
  native?: boolean;
  /** Wrap the button in a heading of this level. Not for `native`. */
  heading?: 2 | 3 | 4 | 5 | 6;
}

/**
 * A list row that opens to show detail. It is a `listitem`, so put it in `list()`. By default the row is a `<button>` with
 * `aria-expanded` and `aria-controls` that `initToonish` toggles. With `native`, it is `<details>` and needs no script.
 */
export const disclosure = (o: DisclosureOptions): string => {
  if (!ID_RE.test(o.id)) throw new Error(`disclosure: id "${o.id}" is not a valid id`);
  if (!o.lead?.trim() || !o.title?.trim()) throw new Error('disclosure: lead and title are required');
  const owner = ownerOf('disclosure', o.owner ?? 'a');
  if (o.heading !== undefined && (o.native || ![2, 3, 4, 5, 6].includes(o.heading))) throw new Error('disclosure: heading is a level from 2 to 6, and not for native');
  const b = typeof o.badge === 'string' ? { text: o.badge, tone: 'yellow' as Tone } : o.badge ? { text: o.badge.text, tone: o.badge.tone ?? 'yellow' } : undefined;
  const d = o.delta === undefined ? '' : typeof o.delta === 'number' ? delta(o.delta) : delta(o.delta.value, o.delta);
  const inner = `<span class="toon-disclosure-lead toon-owner-${owner}">${o.ownerLabel?.trim() ? `<span class="toon-disclosure-owner">Owner: ${esc(o.ownerLabel)}. </span>` : ''}${esc(o.lead)}</span>` +
    `<span class="toon-disclosure-title">${esc(o.title)}${b ? ' ' + badge(b.text, b.tone) : ''}</span>` +
    `${o.value === undefined ? '' : `<span class="toon-disclosure-value">${esc(String(o.value))}</span>`}${d}` +
    `${o.below ? `<span class="toon-disclosure-below">${o.below}</span>` : ''}`;
  const panel = `<div class="toon-disclosure-panel" id="${o.id}"${o.native || o.open ? '' : ' hidden'}>${o.panel}</div>`;
  if (o.native) return `<div class="toon-disclosure" role="listitem"><details class="toon-disclosure-details"${o.open ? ' open' : ''}><summary class="toon-disclosure-btn" id="${o.id}-btn">${inner}</summary>${panel}</details></div>`;
  const btn = `<button type="button" class="toon-disclosure-btn" id="${o.id}-btn" aria-expanded="${o.open ? 'true' : 'false'}" aria-controls="${o.id}">${inner}</button>`;
  return `<div class="toon-disclosure" role="listitem">${o.heading ? `<h${o.heading} class="toon-disclosure-h">${btn}</h${o.heading}>` : btn}${panel}</div>`;
};

export interface SparkOptions {
  min?: number;
  max?: number;
  accent?: Accent;
  /** Draws a dashed baseline at this value. */
  target?: number;
  /** Names what the trend measures. The helper adds "Trend from 73 to 82 over 8 readings". Required. */
  label: string;
  /** `sm` is 64 by 20. `lg` is 120 by 32. Default `sm`. */
  size?: 'sm' | 'lg';
  /** Clamp a value outside `min` to `max` instead of throwing. */
  clamp?: boolean;
}

const SPARK_SIZE = { sm: { w: 64, h: 20 }, lg: { w: 120, h: 32 } } as const;

/** A small inline trend: an ink line, a dot per reading and a ringed last dot in the accent. Drawn for paper. */
export const spark = (values: number[], o: SparkOptions): string => {
  if (!o.label?.trim()) throw new Error('spark: label is required');
  if (!Array.isArray(values) || values.length < 2) throw new Error('spark: at least 2 values are required');
  const min = o.min ?? 0;
  const max = o.max ?? 100;
  if (!Number.isFinite(min) || !Number.isFinite(max) || !(max > min)) throw new Error(`spark: max must be above min, got ${min} and ${max}`);
  const accent = accentOf(o.accent ?? 'blue');
  const size = o.size ?? 'sm';
  if (!Object.hasOwn(SPARK_SIZE, size)) throw new Error(`unknown spark size "${String(size)}": use sm or lg`);
  const vs = values.map((v, i) => bound('spark', `values[${i}]`, v, min, max, o.clamp));
  const { w, h } = SPARK_SIZE[size];
  const pad = 5; // room for the last dot (r 3) and its ring
  const x = (i: number) => pad + (i / (vs.length - 1)) * (w - pad * 2);
  const y = (v: number) => h - pad - ((v - min) / (max - min)) * (h - pad * 2);
  const pts = vs.map((v, i) => [x(i), y(v)] as const);
  const line = `<polyline points="${pts.map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`).join(' ')}" fill="none" stroke="${INK}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
  const dots = pts.slice(0, -1).map(([px, py]) => `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="1.5" fill="${INK}"/>`).join('');
  const [lx, ly] = pts.at(-1)!;
  const last = `<circle cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" r="3" fill="${HEX[accent]}" stroke="${INK}" stroke-width="1.5"/>`;
  const ty = o.target === undefined ? undefined : y(bound('spark', 'target', o.target, min, max, o.clamp)).toFixed(1);
  const base = ty === undefined ? '' : `<line class="toon-spark-target" x1="0" x2="${w}" y1="${ty}" y2="${ty}" stroke="#4a4d78" stroke-width="1" stroke-dasharray="3 3"/>`;
  const label = `${o.label}. Trend from ${num(vs[0]!)} to ${num(vs.at(-1)!)} over ${vs.length} readings`;
  return `<svg class="toon-spark toon-spark-${size}" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(label)}" focusable="false">${base}${line}${dots}${last}</svg>`;
};
