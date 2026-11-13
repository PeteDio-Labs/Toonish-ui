// src/behaviour.ts
var started = new WeakSet;
function clean(node) {
  if (node instanceof Element) {
    for (const el of [node, ...node.querySelectorAll("*")]) {
      for (const a of [...el.attributes]) {
        if (/^on/i.test(a.name) || /^(href|src|action|formaction|xlink:href)$/i.test(a.name) && /^\s*javascript:/i.test(a.value))
          el.removeAttribute(a.name);
      }
    }
  }
  return node;
}
function initToonish(root = document) {
  if (started.has(root))
    return;
  started.add(root);
  const html = root.documentElement;
  if ("IntersectionObserver" in window) {
    html.classList.add("toon-js");
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add("toon-in");
        io.unobserve(en.target);
      }
    }), { rootMargin: "0px 0px -8% 0px" });
    root.querySelectorAll("main h2, main .toon-callout, main .toon-frame, main .toon-bubble, .toon-footer").forEach((n) => {
      if (n.getBoundingClientRect().top < innerHeight)
        return;
      n.classList.add("toon-reveal");
      io.observe(n);
    });
  }
  root.querySelectorAll("[data-toon-toggle]").forEach((group) => {
    group.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b || !group.contains(b))
        return;
      group.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      b.classList.remove("toon-boing");
      b.offsetWidth;
      b.classList.add("toon-boing");
    });
  });
  const lock = (on) => html.classList.toggle("toon-modal-open", on);
  const open = (d) => {
    d.showModal();
    lock(true);
  };
  root.addEventListener("close", (e) => {
    const t = e.target;
    if (t.classList && t.classList.contains("toon-modal"))
      lock(root.querySelector("dialog.toon-modal[open]") !== null);
  }, true);
  root.addEventListener("click", (e) => {
    const t = e.target;
    if (t.classList && t.classList.contains("toon-modal"))
      t.close();
  });
  if (typeof HTMLDialogElement !== "function")
    return;
  const el = (tag, cls, text) => {
    const n = root.createElement(tag);
    if (cls)
      n.className = cls;
    if (text)
      n.textContent = text;
    return n;
  };
  const cache = new Map;
  let shared;
  const sharedDialog = () => {
    if (shared)
      return shared;
    const d = el("dialog", "toon-modal");
    d.setAttribute("aria-modal", "true");
    d.setAttribute("aria-labelledby", "toon-modal-title");
    const box = el("div", "toon-modal-box");
    const head = el("div", "toon-modal-head");
    const title = el("h2", "toon-heading m-0 text-display2");
    title.id = "toon-modal-title";
    const x = el("button", "toon-btn toon-btn-red toon-modal-x", "Close");
    x.type = "button";
    x.dataset.toonModalClose = "";
    head.append(title, x);
    box.append(head, el("div", "toon-modal-body"));
    d.append(box);
    root.body.append(d);
    return shared = d;
  };
  const showPage = async (link) => {
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin)
      throw new Error("cross-origin");
    const key = url.pathname + url.search;
    if (!cache.has(key)) {
      const res = await fetch(key, { headers: { Accept: "text/html" } });
      if (!res.ok)
        throw new Error(String(res.status));
      const doc = new DOMParser().parseFromString(await res.text(), "text/html");
      const article = doc.querySelector("article");
      const h1 = article?.querySelector("h1");
      if (!article || !h1)
        throw new Error("no article");
      cache.set(key, { title: (h1.textContent ?? "").trim(), nodes: [...article.children].filter((n) => n !== h1) });
    }
    const page = cache.get(key);
    const d = sharedDialog();
    d.querySelector("#toon-modal-title").textContent = page.title;
    const body = d.querySelector(".toon-modal-body");
    body.replaceChildren(...page.nodes.map((n) => clean(root.importNode(n, true))));
    const more = el("p", "mb-0 mt-s6 text-footnote");
    const a = el("a", "toon-link", "Open as a full page");
    a.href = key;
    more.append(a);
    body.append(more);
    body.scrollTop = 0;
    open(d);
  };
  root.addEventListener("click", (e) => {
    const t = e.target;
    const closer = t.closest("[data-toon-modal-close]");
    if (closer) {
      closer.closest("dialog")?.close();
      return;
    }
    const opener = t.closest("[data-toon-modal-open]");
    if (opener) {
      const d = root.getElementById(opener.dataset.toonModalOpen ?? "");
      if (d)
        open(d);
      return;
    }
    const link = t.closest("a[data-toon-modal]");
    const m = e;
    if (!link || e.defaultPrevented || m.button !== 0 || m.metaKey || m.ctrlKey || m.shiftKey || m.altKey)
      return;
    e.preventDefault();
    showPage(link).catch(() => {
      location.href = link.href;
    });
  });
}
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
  const cls = ["toon-sfx", opts.size ? `toon-sfx-${opts.size}` : "", opts.ghost ? "toon-sfx-ghost" : "", opts.cls ? esc(opts.cls) : ""].filter(Boolean).join(" ");
  const spans = [...text].map((c, i) => `<span style="--n:${i};--r:${SFX_TURN[i % 6]}deg;--y:${SFX_RISE[i * 5 % 6]}em;--s:${SFX_SIZE[i * 7 % 6]}">${esc(c)}</span>`).join("");
  return `<span class="${cls}" style="--toon-fill:${HEX[accent]}; --toon-shade:${HEX[PAIR[accent]]}" aria-hidden="true">${spans}</span>`;
};
// tokens/toonish.tokens.json
var toonish_tokens_default = {
  $description: "Toonish design tokens in the W3C Design Tokens format (2025.10). Structure comes from the PeteDio house tokens; colour is the deliberate break from that set. Every fill carries ink text, which keeps contrast at 5.1:1 or better.",
  color: {
    $type: "color",
    ground: { $value: "#0c1240", $description: "Page background, deep navy." },
    ink: { $value: "#0a0a1f", $description: "Outlines, and text on every fill." },
    paper: { $value: "#eceff3", $description: "Panels and bubbles; text on the ground." },
    blue: { $value: "#5f8dff" },
    red: { $value: "#f2706a" },
    yellow: { $value: "#f2c94c" },
    violet: { $value: "#a995f0" },
    muted: { $value: "#4a4d78", $description: "Secondary text on paper." },
    mist: { $value: "#b9bde0", $description: "Secondary text on the ground, and the quiet fill for a closed or inactive state." },
    rule: { $value: "#d3d8e0", $description: "Grid lines and the current-row fill on paper." }
  },
  font: {
    family: {
      $type: "fontFamily",
      display: { $value: ["IBM Plex Sans", "system-ui", "sans-serif"] },
      comic: { $value: ["Bangers", "Arial Black", "Impact", "sans-serif"] },
      body: { $value: ["IBM Plex Sans", "system-ui", "sans-serif"] },
      mono: { $value: ["IBM Plex Mono", "ui-monospace", "monospace"], $description: "Labels: badges, chips, stat labels and captions." }
    },
    size: {
      $type: "dimension",
      caption2: { $value: { value: 11, unit: "px" } },
      caption1: { $value: { value: 12, unit: "px" } },
      footnote: { $value: { value: 13, unit: "px" } },
      subhead: { $value: { value: 15, unit: "px" } },
      body: { $value: { value: 17, unit: "px" } },
      title3: { $value: { value: 20, unit: "px" } },
      title2: { $value: { value: 22, unit: "px" } },
      title1: { $value: { value: 28, unit: "px" } }
    },
    fluid: {
      $description: "Fluid display sizes. CSS clamp() has no DTCG type, so these are plain strings.",
      display2: { $value: "clamp(32px,5.5vw,52px)" },
      display1: { $value: "clamp(44px,10vw,104px)" },
      hero: { $value: "clamp(52px,10vw,144px)" }
    }
  },
  space: {
    $type: "dimension",
    s1: { $value: { value: 4, unit: "px" } },
    s2: { $value: { value: 8, unit: "px" } },
    s3: { $value: { value: 12, unit: "px" } },
    s4: { $value: { value: 16, unit: "px" } },
    s5: { $value: { value: 20, unit: "px" } },
    s6: { $value: { value: 24, unit: "px" } },
    s8: { $value: { value: 32, unit: "px" } }
  },
  radius: {
    $type: "dimension",
    group: { $value: { value: 12, unit: "px" } },
    card: { $value: { value: 16, unit: "px" } },
    hero: { $value: { value: 24, unit: "px" } },
    sheet: { $value: { value: 28, unit: "px" } },
    toon: { $value: { value: 10, unit: "px" } }
  },
  border: {
    $type: "dimension",
    toon: { $value: { value: 2, unit: "px" } }
  },
  shadow: {
    $description: "Hard offset shadows. They are plain CSS strings: the DTCG shadow type has no way to say 'a var() colour'.",
    blue: { $value: "4px 4px 0 #5f8dff" },
    red: { $value: "4px 4px 0 #f2706a" },
    yellow: { $value: "4px 4px 0 #f2c94c" },
    violet: { $value: "4px 4px 0 #a995f0" },
    lift: { $value: "6px 7px 0 var(--toon-shadow, #f2706a)" },
    press: { $value: "0 0 0 var(--toon-shadow, #f2706a)" }
  },
  ease: {
    $type: "cubicBezier",
    spring: { $value: [0.175, 0.885, 0.32, 1.275], $description: "House spring." },
    bounce: { $value: [0.34, 1.8, 0.5, 1], $description: "Toon overshoot." }
  },
  duration: {
    $type: "duration",
    fast: { $value: { value: 200, unit: "ms" } },
    normal: { $value: { value: 300, unit: "ms" } },
    slow: { $value: { value: 500, unit: "ms" } }
  }
};

// src/tokens.ts
var isLeaf = (n) => typeof n === "object" && n !== null && ("$value" in n);
function group(path) {
  let node = toonish_tokens_default;
  for (const part of path.split("."))
    node = node?.[part];
  if (!node || typeof node !== "object")
    throw new Error(`token group "${path}" does not exist`);
  const out = {};
  for (const [name, leaf] of Object.entries(node)) {
    if (name.startsWith("$"))
      continue;
    if (!isLeaf(leaf))
      throw new Error(`token "${path}.${name}" is not a token`);
    out[name] = css(leaf.$value, path, name);
  }
  return out;
}
var quote = (family) => /[\s]/.test(family) ? `"${family}"` : family;
function css(value, path, name) {
  if (typeof value === "string")
    return value;
  if (Array.isArray(value)) {
    if (value.every((v) => typeof v === "number"))
      return `cubic-bezier(${value.join(",")})`;
    return value.map((v) => quote(String(v))).join(", ");
  }
  if (typeof value === "object" && value !== null && "value" in value && "unit" in value) {
    return `${value.value}${value.unit}`;
  }
  throw new Error(`token "${path}.${name}" has a value this reader does not know`);
}

// src/preset.ts
var bob = { "0%,60%,100%": { transform: "translateY(0)" }, "30%": { transform: "translateY(-.12em) rotate(-3deg)" } };
var squash = {
  "0%,100%": { transform: "scale(1,1)" },
  "20%": { transform: "scale(1.06,.92)" },
  "45%": { transform: "translateY(-10px) scale(.96,1.06)" }
};
var pop = { "0%": { transform: "scale(.6)", opacity: "0" }, "70%": { transform: "scale(1.08)" }, "100%": { transform: "scale(1)", opacity: "1" } };
var shadows = group("shadow");
var fonts = { ...group("font.size"), ...group("font.fluid") };
var preset = {
  theme: {
    extend: {
      colors: { toon: group("color") },
      fontFamily: Object.fromEntries(Object.entries(group("font.family")).map(([k, v]) => [k, v.split(", ")])),
      fontSize: fonts,
      spacing: group("space"),
      borderRadius: group("radius"),
      borderWidth: group("border"),
      boxShadow: Object.fromEntries(Object.entries(shadows).map(([k, v]) => [`toon-${k}`, v])),
      transitionTimingFunction: group("ease"),
      transitionDuration: group("duration"),
      keyframes: { bob, squash, pop },
      animation: {
        bob: "bob 2.4s cubic-bezier(.34,1.8,.5,1) infinite",
        squash: "squash 2.2s cubic-bezier(.34,1.8,.5,1) infinite",
        pop: "pop .5s cubic-bezier(.34,1.8,.5,1) both"
      }
    }
  }
};
var preset_default = preset;
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
  initToonish,
  kicker,
  letters,
  preset_default as preset,
  row,
  sfx,
  shot,
  speedLines,
  stat,
  steps,
  strip
};
