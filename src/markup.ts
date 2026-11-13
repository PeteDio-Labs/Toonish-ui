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
  const items = cards.map((c, i) => `<div class="toon-deck-card" role="group" aria-label="${i + 1} of ${cards.length}">${c}</div>`).join('');
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
