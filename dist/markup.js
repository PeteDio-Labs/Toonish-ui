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
  const badge = o.badge ? `<span class="toon-badge ${BADGE[accent]} toon-shot-badge">${esc(o.badge)}</span>` : "";
  const img = `<img src="${esc(o.src)}" alt="${esc(o.alt)}" width="${o.width}" height="${o.height}" decoding="async"${o.eager ? "" : ' loading="lazy"'}>`;
  const cap = o.caption ? `<figcaption class="toon-shot-cap"><span class="toon-caption">${esc(o.caption)}</span></figcaption>` : "";
  const lines = (o.transcript ?? "").split(`
`).map((l) => l.trim()).filter(Boolean);
  const text = lines.length ? `<details class="toon-shot-text"${o.open ? " open" : ""}><summary>Transcript</summary>${lines.map((l) => `<p>${esc(l)}</p>`).join("")}</details>` : "";
  return `<figure class="toon-shot${o.cls ? " " + esc(o.cls) : ""}"><div class="toon-shot-panel">${img}${badge}</div>${cap}${text}</figure>`;
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
var TONE_HEX = { ...HEX, paper: "#f3efe6", mist: "#b9bde0" };
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
export {
  BADGE,
  HEX,
  PAIR,
  badge,
  bars,
  burst,
  chip,
  esc,
  figure,
  fitSize,
  letters,
  row,
  shot,
  speedLines,
  stat
};
