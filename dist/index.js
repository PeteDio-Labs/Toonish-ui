// src/behaviour.ts
var started = false;
function initToonish(root = document) {
  if (started)
    return;
  started = true;
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
      lock(false);
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
    if (!cache.has(url.pathname)) {
      const res = await fetch(url.pathname, { headers: { Accept: "text/html" } });
      if (!res.ok)
        throw new Error(String(res.status));
      const doc = new DOMParser().parseFromString(await res.text(), "text/html");
      const article = doc.querySelector("article");
      const h1 = article?.querySelector("h1");
      if (!article || !h1)
        throw new Error("no article");
      cache.set(url.pathname, { title: (h1.textContent ?? "").trim(), nodes: [...article.children].filter((n) => n !== h1) });
    }
    const page = cache.get(url.pathname);
    const d = sharedDialog();
    d.querySelector("#toon-modal-title").textContent = page.title;
    const body = d.querySelector(".toon-modal-body");
    body.replaceChildren(...page.nodes.map((n) => root.importNode(n, true)));
    const more = el("p", "mb-0 mt-s6 text-footnote");
    const a = el("a", "toon-link", "Open as a full page");
    a.href = url.pathname;
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
var burst = (accent, cls = "") => {
  const pts = [];
  for (let i = 0;i < 24; i++) {
    const r = i % 2 ? 44 : 60;
    const a = i / 24 * Math.PI * 2;
    pts.push(`${(60 + r * Math.cos(a)).toFixed(1)},${(60 + r * Math.sin(a)).toFixed(1)}`);
  }
  return `<svg class="toon-burst ${cls}" viewBox="0 0 120 120" aria-hidden="true" focusable="false"><polygon points="${pts.join(" ")}" fill="${HEX[accent]}" stroke="#0a0a1f" stroke-width="5" stroke-linejoin="round"/></svg>`;
};
var speedLines = (cls = "") => `<svg class="toon-speed ${cls}" viewBox="0 0 200 120" aria-hidden="true" focusable="false" preserveAspectRatio="none"><g stroke="#f2c94c" stroke-width="5" stroke-linecap="round" vector-effect="non-scaling-stroke">${[8, 26, 44, 62, 80, 98, 116].map((y, i) => `<line class="toon-speed-line" style="--i:${i}" x1="4" y1="${y}" x2="${120 + i % 3 * 30}" y2="${y}" pathLength="100" vector-effect="non-scaling-stroke"/>`).join("")}</g></svg>`;
var letters = (text, accent = "blue", opts = {}) => `<span class="toon-type${opts.live ? " toon-type-comic" : ""}${opts.flat ? " toon-type-flat" : ""} ${opts.cls ?? ""}" style="--toon-fill:${HEX[accent]}; --toon-shade:${HEX[PAIR[accent]]}${opts.size ? `; font-size:${opts.size}px` : ""}">${text.split(" ").map((word) => `<span class="toon-word">${[...word].map((c) => `<span>${esc(c)}</span>`).join("")}</span>`).join(" ")}</span>`;
var fitSize = (value, max, avail) => {
  const longest = Math.max(...value.split(" ").map((w) => w.length), 1);
  return Math.max(18, Math.min(max, Math.floor(avail / (longest * 0.6))));
};
var figure = (value, accent, max, avail) => letters(value, accent, { flat: true, cls: "block max-w-full leading-none", size: fitSize(value, max, avail) });
// tokens/toonish.tokens.json
var toonish_tokens_default = {
  $description: "Toonish design tokens in the W3C Design Tokens format (2025.10). Structure comes from the PeteDio house tokens; colour is the deliberate break from that set. Every fill carries ink text, which keeps contrast at 5.1:1 or better.",
  color: {
    $type: "color",
    ground: { $value: "#0c1240", $description: "Page background, deep navy." },
    ink: { $value: "#0a0a1f", $description: "Outlines, and text on every fill." },
    paper: { $value: "#f3efe6", $description: "Panels and bubbles; text on the ground." },
    blue: { $value: "#5f8dff" },
    red: { $value: "#f2706a" },
    yellow: { $value: "#f2c94c" },
    violet: { $value: "#a995f0" }
  },
  font: {
    family: {
      $type: "fontFamily",
      display: { $value: ["Space Grotesk", "system-ui", "sans-serif"] },
      comic: { $value: ["Bangers", "Arial Black", "Impact", "sans-serif"] },
      body: { $value: ["DM Sans", "system-ui", "sans-serif"] }
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
  burst,
  esc,
  figure,
  fitSize,
  initToonish,
  letters,
  preset_default as preset,
  speedLines
};
