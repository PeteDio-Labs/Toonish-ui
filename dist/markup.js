// src/markup.ts
var ENT = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
var esc = (s) => s.replace(/[&<>"']/g, (c) => ENT[c]);
var HEX = { blue: "#5f8dff", red: "#f2706a", yellow: "#f2c94c", violet: "#a995f0" };
var PAIR = { blue: "yellow", red: "yellow", yellow: "blue", violet: "red" };
var BADGE = { blue: "toon-badge-blue", red: "", yellow: "toon-badge-yellow", violet: "toon-badge-violet" };
var accentOf = (accent) => {
  if (!Object.hasOwn(HEX, accent))
    throw new Error(`unknown accent "${accent}": use one of ${Object.keys(HEX).join(", ")}`);
  return accent;
};
var burst = (accent, cls = "") => {
  accentOf(accent);
  const pts = [];
  for (let i = 0;i < 24; i++) {
    const r = i % 2 ? 44 : 60;
    const a = i / 24 * Math.PI * 2;
    pts.push(`${(60 + r * Math.cos(a)).toFixed(1)},${(60 + r * Math.sin(a)).toFixed(1)}`);
  }
  return `<svg class="toon-burst ${esc(cls)}" viewBox="0 0 120 120" aria-hidden="true" focusable="false"><polygon points="${pts.join(" ")}" fill="${HEX[accent]}" stroke="#0a0a1f" stroke-width="5" stroke-linejoin="round"/></svg>`;
};
var speedLines = (cls = "") => `<svg class="toon-speed ${esc(cls)}" viewBox="0 0 200 120" aria-hidden="true" focusable="false" preserveAspectRatio="none"><g stroke="#f2c94c" stroke-width="5" stroke-linecap="round" vector-effect="non-scaling-stroke">${[8, 26, 44, 62, 80, 98, 116].map((y, i) => `<line class="toon-speed-line" style="--i:${i}" x1="4" y1="${y}" x2="${120 + i % 3 * 30}" y2="${y}" pathLength="100" vector-effect="non-scaling-stroke"/>`).join("")}</g></svg>`;
var letters = (text, accent = "blue", opts = {}) => {
  accentOf(accent);
  return `<span class="toon-type${opts.live ? " toon-type-comic" : ""}${opts.flat ? " toon-type-flat" : ""} ${esc(opts.cls ?? "")}" style="--toon-fill:${HEX[accent]}; --toon-shade:${HEX[PAIR[accent]]}${opts.size !== undefined ? `; font-size:${Number(opts.size)}px` : ""}">${text.split(" ").map((word) => `<span class="toon-word">${[...word].map((c) => `<span>${esc(c)}</span>`).join("")}</span>`).join(" ")}</span>`;
};
var fitSize = (value, max, avail) => {
  const longest = Math.max(...value.split(" ").map((w) => w.length), 1);
  return Math.max(18, Math.min(max, Math.floor(avail / (longest * 0.6))));
};
var figure = (value, accent, max, avail) => letters(value, accent, { flat: true, cls: "block max-w-full leading-none", size: fitSize(value, max, avail) });
var shot = (o) => {
  if (!o.alt.trim())
    throw new Error("shot: alt text is required");
  if (!Number.isInteger(o.width) || !Number.isInteger(o.height) || o.width <= 0 || o.height <= 0)
    throw new Error("shot: width and height must be positive integers");
  const accent = accentOf(o.accent ?? "red");
  if (o.href !== undefined && !o.hrefLabel?.trim())
    throw new Error("shot: hrefLabel is required with href");
  const badge = o.badge ? `<span class="toon-badge ${BADGE[accent]} toon-shot-badge">${esc(o.badge)}</span>` : "";
  const corner = o.corner ? `<span class="toon-badge toon-badge-paper toon-shot-badge toon-shot-badge-end">${esc(o.corner)}</span>` : "";
  const hint = o.hint ? `<span class="toon-badge toon-badge-paper toon-shot-hint" aria-hidden="true">${esc(o.hint)}</span>` : "";
  const img0 = `<img src="${esc(o.src)}" alt="${esc(o.alt)}" width="${o.width}" height="${o.height}" decoding="async"${o.eager ? "" : ' loading="lazy"'}>`;
  const img = o.href !== undefined ? `<a class="toon-shot-link" href="${esc(o.href)}" target="_blank" rel="noopener" aria-label="${esc(o.hrefLabel)}">${img0}</a>` : img0;
  const cap = o.caption ? `<figcaption class="toon-shot-cap"><span class="toon-caption">${esc(o.caption)}</span></figcaption>` : "";
  const lines = (o.transcript ?? "").split(`
`).map((l) => l.trim()).filter(Boolean);
  const text = lines.length ? `<details class="toon-shot-text"${o.open ? " open" : ""}><summary>Transcript</summary>${lines.map((l) => `<p>${esc(l)}</p>`).join("")}</details>` : "";
  return `<figure class="toon-shot${o.cls ? " " + esc(o.cls) : ""}"><div class="toon-shot-panel">${img}${badge}${corner}${hint}</div>${cap}${text}</figure>`;
};
var TONE_CLASS = { ...BADGE, paper: "toon-badge-paper", mist: "toon-badge-mist" };
var toneOf = (tone) => {
  if (!Object.hasOwn(TONE_CLASS, tone))
    throw new Error(`unknown tone "${tone}": use one of ${Object.keys(TONE_CLASS).join(", ")}`);
  return tone;
};
var badge = (text, tone = "red", count) => `<span class="${["toon-badge", TONE_CLASS[toneOf(tone)]].filter(Boolean).join(" ")}">${esc(text)}${count === undefined ? "" : `<span class="toon-badge-count">${Number(count)}</span>`}</span>`;
var chip = (text) => `<span class="toon-chip">${esc(text)}</span>`;
var stat = (label, value, detail = "") => `<div class="toon-stat"><span class="toon-stat-label">${esc(label)}</span><span class="toon-stat-value">${esc(value)}</span>${detail ? `<span class="toon-stat-detail">${esc(detail)}</span>` : ""}</div>`;
var row = (o) => {
  const dot = o.dot ? `<i style="--toon-dot:${TONE_HEX[toneOf(o.dot)]}"></i>` : "";
  return `<div class="toon-row">${o.lead ? `<span class="toon-row-lead">${esc(o.lead)}</span>` : ""}<span class="toon-row-body"><b>${esc(o.title)}</b>${o.sub ? ` <small>${esc(o.sub)}</small>` : ""}</span>${o.aside ? `<span class="toon-row-aside">${dot}${esc(o.aside)}</span>` : ""}</div>`;
};
var TONE_HEX = { ...HEX, paper: "#eceff3", mist: "#b9bde0" };
var SEG_CLASS = { blue: "", red: "toon-bar-seg-red", yellow: "toon-bar-seg-yellow", violet: "toon-bar-seg-violet", paper: "toon-bar-seg-paper", mist: "toon-bar-seg-mist", hatch: "toon-bar-seg-hatch" };
var bars = (o) => {
  if (!o.label.trim())
    throw new Error("bars: label is required");
  if (!o.columns.length)
    throw new Error("bars: at least one column is required");
  for (const c of o.columns)
    for (const g of c.segments) {
      if (!Number.isFinite(g.value) || g.value < 0)
        throw new Error(`bars: segment "${g.label}" needs a value of 0 or more`);
      if (g.tone !== "hatch")
        toneOf(g.tone);
    }
  const stack = (c) => Number(c.segments.reduce((a, g) => a + g.value, 0).toFixed(2));
  const max = o.max ?? Math.max(...o.columns.map(stack), o.target ?? 0);
  if (!(max > 0))
    throw new Error("bars: max must be above 0: every column is empty and no target is set");
  const pct = (v) => (v / max * 100).toFixed(2);
  const line = o.target === undefined ? "" : `<div class="toon-bars-target" style="--at:${pct(o.target)}" aria-hidden="true"></div>`;
  const cols = o.columns.map((c) => {
    const said = c.segments.filter((g) => g.value > 0).map((g) => `${g.label} ${Number(g.value.toFixed(2))}`).join(", ") || "none";
    const segs = c.segments.filter((g) => g.value > 0).map((g) => `<div class="toon-bar-seg ${SEG_CLASS[g.tone]}" style="--h:${pct(g.value)}"></div>`).join("");
    return `<div class="toon-bar" role="listitem" aria-label="${esc(`${c.label}${c.sub ? " " + c.sub : ""}: ${said}`)}"${c.current ? ' aria-current="date"' : ""}><span class="toon-bar-total">${stack(c) || ""}</span><div class="toon-bar-plot">${line}<div class="toon-bar-stack">${segs}</div></div><span class="toon-bar-label"><b>${esc(c.label)}</b>${c.sub ? esc(c.sub) : ""}</span></div>`;
  }).join("");
  return `<div class="toon-bars" role="list" aria-label="${esc(o.label)}" style="--toon-cols:${o.columns.length}">${cols}</div>`;
};
var kicker = (num, label, o = {}) => {
  if (!num.trim() || !label.trim())
    throw new Error("kicker: num and label are required");
  const link = o.link ? `<a class="toon-link toon-kicker-link${o.link.cls ? " " + esc(o.link.cls) : ""}" href="${esc(o.link.href)}">${esc(o.link.text)}</a>` : "";
  return `<div class="toon-kicker${o.cls ? " " + esc(o.cls) : ""}"><span class="toon-kicker-num">${esc(num)}</span><span class="toon-kicker-label">${esc(label)}</span><span class="toon-kicker-rule" aria-hidden="true"></span>${link}</div>`;
};
var strip = (cells, o = {}) => {
  if (!cells.length)
    throw new Error("strip: at least one cell is required");
  const items = cells.map((c) => {
    if (!c.value.trim() || !c.label.trim())
      throw new Error("strip: every cell needs a value and a label");
    const fill = c.accent ? ` style="--toon-fill:${HEX[accentOf(c.accent)]}"` : "";
    const inner = `<span class="toon-strip-value"${fill}>${esc(c.value)}</span><span class="toon-strip-label">${esc(c.label)}</span>`;
    return `<li class="toon-strip-cell">${c.href ? `<a class="toon-strip-item" href="${esc(c.href)}">${inner}</a>` : `<div class="toon-strip-item">${inner}</div>`}</li>`;
  }).join("");
  return `<ul class="toon-strip${o.cls ? " " + esc(o.cls) : ""}" role="list"${o.label ? ` aria-label="${esc(o.label)}"` : ""} style="--toon-cols:${cells.length}">${items}</ul>`;
};
var ARROW = '<span class="toon-step-arrow" aria-hidden="true"><svg viewBox="0 0 16 16" width="16" height="16" focusable="false"><path d="M2 8h10M8.5 3.5 13 8l-4.5 4.5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';
var steps = (items, o = {}) => {
  if (!items.length)
    throw new Error("steps: at least one step is required");
  const lis = items.map((s, i) => {
    if (!s.title.trim() || !s.body.trim())
      throw new Error("steps: every step needs a title and a body");
    return `<li class="toon-step"><span class="toon-step-num" aria-hidden="true">${i + 1}</span><strong class="toon-step-title">${esc(s.title)}</strong><p class="toon-step-body">${esc(s.body)}</p>${i < items.length - 1 ? ARROW : ""}</li>`;
  }).join("");
  return `<ol class="toon-steps${o.cls ? " " + esc(o.cls) : ""}" role="list"${o.label ? ` aria-label="${esc(o.label)}"` : ""} style="--toon-cols:${items.length}">${lis}</ol>`;
};
var SFX_TURN = [-7, 4, -3, 8, -5, 2];
var SFX_RISE = [0, -0.08, 0.06, -0.04, 0.1, -0.02];
var SFX_SIZE = [1, 1.12, 0.92, 1.06, 0.96, 1.1];
var sfx = (text, accent = "red", opts = {}) => {
  accentOf(accent);
  if (!text.trim())
    throw new Error("sfx: text is required");
  if (opts.size !== undefined && opts.size !== "sm" && opts.size !== "lg")
    throw new Error(`unknown sfx size "${String(opts.size)}": use sm or lg`);
  const cls = ["toon-sfx", opts.size ? `toon-sfx-${opts.size}` : "", opts.ghost ? "toon-sfx-ghost" : "", opts.corner ? "toon-sfx-corner" : "", opts.cls ? esc(opts.cls) : ""].filter(Boolean).join(" ");
  const spans = [...text].map((c, i) => `<span style="--n:${i};--r:${SFX_TURN[i % 6]}deg;--y:${SFX_RISE[i * 5 % 6]}em;--s:${SFX_SIZE[i * 7 % 6]}">${esc(c)}</span>`).join("");
  return `<span class="${cls}" style="--toon-fill:${HEX[accent]}; --toon-shade:${HEX[PAIR[accent]]}" aria-hidden="true">${spans}</span>`;
};
var CHEVRON = (d) => `<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false"><path d="${d}" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
var deck = (cards, o) => {
  if (!o.label?.trim())
    throw new Error("deck: label is required");
  if (!cards.length)
    throw new Error("deck: at least one card is required");
  const cols = o.cols ?? 3;
  if (!Number.isInteger(cols) || cols < 1 || cols > 6)
    throw new Error("deck: cols must be a whole number from 1 to 6");
  const items = cards.map((c, i) => `<div class="toon-deck-card" role="group" aria-label="${i + 1} of ${cards.length}">${c}</div>`).join("");
  const prev = o.prevLabel ?? "Previous";
  const next = o.nextLabel ?? "Next";
  const controls = `<div class="toon-deck-controls"><button type="button" class="toon-btn toon-btn-paper toon-deck-btn" data-toon-deck-prev>${CHEVRON("M10 3 5 8l5 5")}${esc(prev)}</button><span class="toon-deck-count" role="status" aria-live="polite" aria-atomic="true">1 / ${cards.length}</span><button type="button" class="toon-btn toon-btn-yellow toon-deck-btn" data-toon-deck-next>${esc(next)}${CHEVRON("m6 3 5 5-5 5")}</button></div>`;
  return `<div class="toon-deck${o.cls ? " " + esc(o.cls) : ""}" data-toon-deck="${o.always ? "always" : "phone"}" style="--toon-cols:${cols}"><div class="toon-deck-pile" role="group" aria-roledescription="carousel" aria-label="${esc(o.label)}">${items}</div>${controls}</div>`;
};
var BACKDROPS = { slate: { a: "#6d7281", b: "#383c49", dot: 0.22 }, paper: { a: "#f6f8fa", b: "#d3d8e0", dot: 0.4 } };
var portrait = (o) => {
  if (!o.alt.trim())
    throw new Error("portrait: alt text is required");
  if (!Number.isInteger(o.width) || !Number.isInteger(o.height) || o.width <= 0 || o.height <= 0)
    throw new Error("portrait: width and height must be positive integers");
  const tone = o.backdrop ?? "slate";
  if (!Object.hasOwn(BACKDROPS, tone))
    throw new Error(`unknown portrait backdrop "${String(o.backdrop)}": use slate or paper`);
  const bg = BACKDROPS[tone];
  const accent = accentOf(o.accent ?? "blue");
  const dots = [];
  for (let row = 0;row < 6; row++)
    for (let col = 0;col < 6 - row; col++) {
      dots.push(`<circle cx="${(94 - col * 8).toFixed(1)}" cy="${(6 + row * 8).toFixed(1)}" r="${(2.6 - row * 0.3).toFixed(2)}"/>`);
    }
  const id = `toon-portrait-${tone}`;
  const svg = `<svg class="toon-portrait-bg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">` + `<defs><radialGradient id="${id}" cx="50%" cy="38%" r="75%"><stop offset="0" stop-color="${bg.a}"/><stop offset="1" stop-color="${bg.b}"/></radialGradient></defs>` + `<rect width="100" height="100" fill="url(#${id})"/>` + `<circle cx="6" cy="96" r="30" fill="none" stroke="${HEX[accent]}" stroke-width="2.5" opacity="0.55"/>` + `<g fill="${HEX[accent]}" opacity="${bg.dot}">${dots.join("")}</g></svg>`;
  const img = `<img src="${esc(o.src)}" alt="${esc(o.alt)}" width="${o.width}" height="${o.height}" decoding="async"${o.eager ? "" : ' loading="lazy"'}>`;
  return `<div class="toon-portrait${o.cls ? " " + esc(o.cls) : ""}" data-backdrop="${tone}">${svg}${img}</div>`;
};
var pager = (o) => {
  if (!o.label?.trim())
    throw new Error("pager: label is required");
  if (!o.prev && !o.next)
    throw new Error("pager: pass prev, next or both");
  const link = (l, kind) => {
    const dir = l.dir ?? (kind === "prev" ? "Previous" : "Next");
    if (!l.href.trim() || !l.title.trim() || !dir.trim())
      throw new Error("pager: a link needs an href, a title and a direction");
    return `<a class="toon-pager-link toon-pager-${kind}" href="${esc(l.href)}"><span class="toon-pager-arrow" aria-hidden="true">${CHEVRON(kind === "prev" ? "M10 3 5 8l5 5" : "M6 3l5 5-5 5")}</span><span class="toon-pager-text"><span class="toon-pager-dir">${esc(dir)}<span class="toon-pager-sep">: </span></span><span class="toon-pager-title">${esc(l.title)}</span></span></a>`;
  };
  return `<nav class="toon-pager${o.cls ? " " + esc(o.cls) : ""}" aria-label="${esc(o.label)}">${o.prev ? link(o.prev, "prev") : ""}${o.next ? link(o.next, "next") : ""}</nav>`;
};
export {
  BADGE,
  HEX,
  PAIR,
  badge,
  bars,
  burst,
  chip,
  deck,
  esc,
  figure,
  fitSize,
  kicker,
  letters,
  pager,
  portrait,
  row,
  sfx,
  shot,
  speedLines,
  stat,
  steps,
  strip
};
