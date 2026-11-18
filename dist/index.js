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
var DECK_QUERY = "(min-width: 768px)";
function initDeck(deck) {
  const pile = deck.querySelector(".toon-deck-pile");
  const cards = pile ? [...pile.children].filter((c) => c instanceof HTMLElement && c.classList.contains("toon-deck-card")) : [];
  const count = deck.querySelector(".toon-deck-count");
  if (!pile || cards.length < 2)
    return;
  const n = cards.length;
  const always = deck.dataset.toonDeck === "always";
  const mq = window.matchMedia(DECK_QUERY);
  const flies = new Map;
  let i = 0;
  const on = () => deck.hasAttribute("data-toon-deck-on");
  const render = () => {
    cards.forEach((c, k) => {
      const pos = (k - i + n) % n;
      c.dataset.pos = String(Math.min(pos, 3));
      c.inert = pos !== 0;
    });
    if (count)
      count.textContent = `${i + 1} / ${n}`;
  };
  const apply = () => {
    if (always || !mq.matches) {
      deck.setAttribute("data-toon-deck-on", "");
      render();
    } else {
      end(false);
      deck.removeAttribute("data-toon-deck-on");
      cards.forEach((c) => {
        delete c.dataset.pos;
        delete c.dataset.dragging;
        delete c.dataset.fly;
        c.inert = false;
      });
    }
  };
  const fly = (card, kind, dir) => {
    window.clearTimeout(flies.get(card));
    delete card.dataset.fly;
    card.offsetWidth;
    card.style.setProperty("--dir", String(dir));
    card.dataset.fly = kind;
    flies.set(card, window.setTimeout(() => {
      delete card.dataset.fly;
      card.style.removeProperty("--dx");
      card.style.removeProperty("--rot");
    }, 320));
  };
  const go = (d, dir) => {
    if (!on())
      return;
    const top = cards[i];
    i = (i + d + n) % n;
    render();
    fly(d === 1 ? top : cards[i], d === 1 ? "out" : "in", dir);
  };
  deck.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b || !deck.contains(b))
      return;
    if (b.hasAttribute("data-toon-deck-next"))
      go(1, -1);
    else if (b.hasAttribute("data-toon-deck-prev"))
      go(-1, 1);
  });
  deck.addEventListener("keydown", (e) => {
    const t = e.target;
    if (!on() || !t.closest(".toon-deck-controls") || e.altKey || e.ctrlKey || e.metaKey)
      return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1, -1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1, 1);
    }
  });
  let drag = null;
  let suppress = false;
  let suppressTimer = 0;
  const end = (flip) => {
    const d = drag;
    drag = null;
    if (!d)
      return;
    if (d.horizontal) {
      try {
        pile.releasePointerCapture(d.id);
      } catch {}
      delete d.card.dataset.dragging;
      if (flip) {
        suppress = true;
        window.clearTimeout(suppressTimer);
        suppressTimer = window.setTimeout(() => {
          suppress = false;
        }, 400);
        if (d.dx < 0) {
          d.card.style.setProperty("--dx", `${d.dx}px`);
          d.card.style.setProperty("--rot", `${d.dx / 20}deg`);
          go(1, -1);
        } else {
          d.card.style.removeProperty("--dx");
          d.card.style.removeProperty("--rot");
          go(-1, 1);
        }
        return;
      }
    }
    d.card.style.removeProperty("--dx");
    d.card.style.removeProperty("--rot");
  };
  pile.addEventListener("pointerdown", (e) => {
    if (!on() || !e.isPrimary || e.pointerType === "mouse" && e.button !== 0)
      return;
    suppress = false;
    if (drag)
      end(false);
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, t: e.timeStamp, card: cards[i], horizontal: false, dx: 0 };
  });
  pile.addEventListener("pointermove", (e) => {
    if (!drag || e.pointerId !== drag.id)
      return;
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    if (!drag.horizontal) {
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10)
        return;
      if (Math.abs(dx) <= Math.abs(dy) * 1.5) {
        drag = null;
        return;
      }
      drag.horizontal = true;
      pile.setPointerCapture(e.pointerId);
      drag.card.dataset.dragging = "";
    }
    drag.dx = dx;
    drag.card.style.setProperty("--dx", `${dx}px`);
    drag.card.style.setProperty("--rot", `${dx / 20}deg`);
  });
  pile.addEventListener("pointerup", (e) => {
    if (!drag || e.pointerId !== drag.id)
      return;
    const dt = Math.max(1, e.timeStamp - drag.t);
    const speed = Math.abs(drag.dx) / dt;
    end(drag.horizontal && (Math.abs(drag.dx) >= 48 || Math.abs(drag.dx) >= 20 && speed > 0.5));
  });
  pile.addEventListener("pointercancel", () => end(false));
  pile.addEventListener("lostpointercapture", (e) => {
    if (e.target === pile)
      end(false);
  });
  pile.addEventListener("click", (e) => {
    if (!suppress)
      return;
    suppress = false;
    e.preventDefault();
    e.stopPropagation();
  }, true);
  pile.addEventListener("dragstart", (e) => e.preventDefault());
  if (mq.addEventListener)
    mq.addEventListener("change", apply);
  else
    mq.addListener(apply);
  apply();
}
function initTabs(nav) {
  const tabs = [...nav.querySelectorAll('[role="tab"]')];
  if (!tabs.length)
    return;
  const panelOf = (t) => document.getElementById(t.getAttribute("aria-controls") ?? "");
  const byHash = (hash) => {
    let id;
    try {
      id = decodeURIComponent(hash.replace(/^#/, ""));
    } catch {
      return;
    }
    return tabs.find((t) => t.getAttribute("aria-controls") === id);
  };
  const select = (tab, bounce) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      const p = panelOf(t);
      if (p)
        p.hidden = !on;
    });
    if (bounce) {
      tab.classList.remove("toon-boing");
      tab.offsetWidth;
      tab.classList.add("toon-boing");
    }
  };
  const record = (tab, push) => {
    const hash = "#" + (tab.getAttribute("aria-controls") ?? "");
    if (location.hash === hash)
      return;
    if (push)
      history.pushState(null, "", hash);
    else
      history.replaceState(null, "", hash);
  };
  const named = byHash(location.hash);
  const namedPanel = named ? panelOf(named) : null;
  if (namedPanel) {
    let touched = false;
    const touch = () => {
      touched = true;
    };
    const off = () => {
      window.removeEventListener("keydown", touch, true);
      window.removeEventListener("pointerdown", touch, true);
      namedPanel.removeEventListener("focus", drop);
    };
    const drop = () => {
      off();
      if (!touched)
        namedPanel.blur();
    };
    window.addEventListener("keydown", touch, true);
    window.addEventListener("pointerdown", touch, true);
    if (document.activeElement === namedPanel)
      namedPanel.blur();
    else
      namedPanel.addEventListener("focus", drop);
    const done = () => setTimeout(off, 500);
    if (document.readyState === "complete")
      done();
    else
      window.addEventListener("load", done, { once: true });
  }
  const home = tabs.find((t) => t.getAttribute("aria-selected") === "true") ?? tabs[0];
  const first = byHash(location.hash);
  select(first ?? home, false);
  if (first) {
    const top = () => window.scrollTo({ top: 0, behavior: "instant" });
    top();
    window.addEventListener("load", top, { once: true });
  }
  nav.addEventListener("click", (e) => {
    const m = e;
    const tab = e.target.closest('[role="tab"]');
    if (!tab || !nav.contains(tab) || m.button !== 0 || m.metaKey || m.ctrlKey || m.shiftKey || m.altKey)
      return;
    e.preventDefault();
    select(tab, true);
    record(tab, true);
    window.scrollTo(0, 0);
  });
  nav.addEventListener("keydown", (e) => {
    const tab = e.target.closest('[role="tab"]');
    if (!tab || e.altKey || e.ctrlKey || e.metaKey)
      return;
    if (e.key === " ") {
      e.preventDefault();
      tab.click();
      return;
    }
    const i = tabs.indexOf(tab);
    const to = e.key === "ArrowRight" ? (i + 1) % tabs.length : e.key === "ArrowLeft" ? (i - 1 + tabs.length) % tabs.length : e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : -1;
    if (to < 0)
      return;
    e.preventDefault();
    const next = tabs[to];
    select(next, true);
    record(next, false);
    next.focus();
  });
  window.addEventListener("hashchange", () => {
    const tab = byHash(location.hash) ?? (location.hash === "" ? home : undefined);
    if (!tab)
      return;
    select(tab, false);
    window.scrollTo(0, 0);
  });
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
  root.querySelectorAll("[data-toon-deck]").forEach(initDeck);
  root.querySelectorAll("[data-toon-tabs]").forEach(initTabs);
  root.addEventListener("click", (e) => {
    const btn = e.target.closest("button.toon-disclosure-btn[aria-controls]");
    if (!btn)
      return;
    const panel = root.getElementById(btn.getAttribute("aria-controls") ?? "");
    if (!panel)
      return;
    const open = btn.getAttribute("aria-expanded") !== "true";
    btn.setAttribute("aria-expanded", String(open));
    panel.hidden = !open;
  });
  root.addEventListener("click", (e) => {
    if (e.target instanceof Element && e.target.closest('[data-toon-switch-to][aria-disabled="true"], .toon-toggle[aria-disabled="true"]')) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }, true);
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
  root.addEventListener("keydown", (e) => {
    if (e.key !== "Escape")
      return;
    const d = e.target?.closest?.("details.toon-settings[open]");
    if (!d)
      return;
    d.open = false;
    d.querySelector("summary")?.focus();
  });
  root.addEventListener("click", (e) => {
    const t = e.target;
    if (!t?.closest)
      return;
    root.querySelectorAll("details.toon-settings[open]").forEach((d) => {
      if (!d.contains(t) || t.closest(".toon-settings-item"))
        d.open = false;
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
var HEX_TEXT = { blue: "#2a57d6", red: "#c8322b", yellow: "#7a5c00", violet: "#6b4fd6" };
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
  return `<span class="toon-type${opts.live ? " toon-type-comic" : ""}${opts.flat ? " toon-type-flat" : ""} ${esc(opts.cls ?? "")}" style="--toon-fill:${(opts.onPaper ? HEX_TEXT : HEX)[accent]}; --toon-shade:${HEX[PAIR[accent]]}${opts.size !== undefined ? `; font-size:${Number(opts.size)}px` : ""}">${text.split(" ").map((word) => `<span class="toon-word">${[...word].map((c) => `<span>${esc(c)}</span>`).join("")}</span>`).join(" ")}</span>`;
};
var fitSize = (value, max, avail) => {
  const longest = Math.max(...value.split(" ").map((w) => w.length), 1);
  return Math.max(18, Math.min(max, Math.floor(avail / (longest * 0.6))));
};
var figure = (value, accent, max, avail) => letters(value, accent, { flat: true, onPaper: true, cls: "block max-w-full leading-none", size: fitSize(value, max, avail) });
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
var badge = (text, tone = "red", count) => `<span class="${["toon-badge", TONE_CLASS[toneOf(tone)]].filter(Boolean).join(" ")}">${esc(text)}${count === undefined ? "" : `<span class="toon-badge-count"> ${Number(count)}</span>`}</span>`;
var chip = (text) => `<span class="toon-chip">${esc(text)}</span>`;
var stat = (label, value, detail = "") => `<div class="toon-stat"><span class="toon-stat-label">${esc(label)}</span><span class="toon-stat-value">${esc(value)}</span>${detail ? `<span class="toon-stat-detail">${esc(detail)}</span>` : ""}</div>`;
var ICON_TAGS = new Set(["svg", "g", "path", "circle", "ellipse", "rect", "line", "polyline", "polygon", "defs", "lineargradient", "radialgradient", "stop", "title"]);
var iconMarkup = (svg) => {
  if (!/^<svg[\s>]/.test(svg) || !/<\/svg>\s*$/.test(svg))
    throw new Error("icon must be one <svg> element");
  for (const m of svg.matchAll(/<\/?([a-zA-Z][a-zA-Z0-9-]*)/g))
    if (!ICON_TAGS.has(m[1].toLowerCase()))
      throw new Error(`icon must hold only drawing elements, not <${m[1]}>`);
  if (svg.indexOf("<svg", 1) !== -1 && (svg.match(/<svg[\s>]/gi) ?? []).length !== 1)
    throw new Error("icon must be one <svg> element");
  if (/&#|javascript:|[\s/"']on[a-z]+\s*=|\s(?:href|xlink:href|style)\s*=/i.test(svg))
    throw new Error("icon must not hold event attributes, links, styles or character references");
  return svg;
};
var row = (o) => {
  const dot = o.dot ? `<i style="--toon-dot:${TONE_HEX[toneOf(o.dot)]}"></i>` : "";
  const leadDot = o.leadTone ? ` style="--toon-lead-dot:${TONE_HEX[toneOf(o.leadTone)]}"` : "";
  const icon = o.icon ? `<span class="toon-row-icon" aria-hidden="true">${iconMarkup(o.icon)}</span>` : "";
  return `<div class="toon-row" role="listitem">${icon}${o.lead ? `<span class="toon-row-lead"${leadDot}>${esc(o.lead)}</span>` : ""}<span class="toon-row-body"><b>${esc(o.title)}</b>${o.sub ? `<small>${esc(o.sub)}</small>` : ""}</span>${o.aside ? `<span class="toon-row-aside">${dot}${esc(o.aside)}</span>` : ""}</div>`;
};
var BUTTON_KIND = { primary: "", secondary: " toon-btn-paper", accent: " toon-btn-yellow", danger: " toon-btn-red" };
var BUTTON_ICON = {
  "arrow-left": "M13 8H3m5-5L3 8l5 5",
  "arrow-right": "M3 8h10M8 3l5 5-5 5",
  plus: "M8 3v10M3 8h10",
  check: "M3 8.5 6.5 12 13 4.5",
  external: "M6 3H3v10h10v-3M9 3h4v4M13 3 7 9"
};
var button = (o) => {
  if (!o.label?.trim())
    throw new Error("button: label is required");
  const kind = o.kind ?? "primary";
  if (!Object.hasOwn(BUTTON_KIND, kind))
    throw new Error(`button: unknown kind "${kind}"`);
  let icon = o.icon;
  let pos = o.iconPosition ?? "start";
  if (o.direction) {
    if (o.direction !== "back" && o.direction !== "next")
      throw new Error("button: direction is back or next");
    icon = icon ?? (o.direction === "back" ? "arrow-left" : "arrow-right");
    pos = o.direction === "back" ? "start" : "end";
  }
  let svg = "";
  if (icon) {
    const path = Object.hasOwn(BUTTON_ICON, icon) ? BUTTON_ICON[icon] : "";
    svg = `<span class="toon-btn-ico" aria-hidden="true">${path ? `<svg viewBox="0 0 16 16" width="16" height="16" focusable="false"><path d="${path}" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>` : iconMarkup(icon)}</span>`;
  }
  const extra = Object.entries(o.attrs ?? {}).map(([k, v]) => {
    if (!/^(?:data|aria)-[a-z0-9-]+$/.test(k))
      throw new Error(`button: attribute "${k}" is not allowed`);
    return ` ${k}="${esc(String(v))}"`;
  }).join("");
  const cls = `toon-btn${BUTTON_KIND[kind]}${svg ? " toon-btn-icon" : ""}${o.direction ? ` toon-btn-${o.direction}` : ""}${o.full ? " toon-btn-full" : ""}${o.cls ? " " + esc(o.cls) : ""}`;
  const inner = `${svg && pos === "start" ? svg : ""}<span class="toon-btn-label">${esc(o.label)}</span>${svg && pos === "end" ? svg : ""}`;
  if (o.href !== undefined) {
    if (!/^(\/(?!\/)|#|\?|https?:|mailto:)/i.test(o.href))
      throw new Error("button: href must start with /, #, ?, https:, http: or mailto:");
    return `<a class="${cls}" href="${esc(o.href)}"${extra}>${inner}</a>`;
  }
  return `<button type="${o.type ?? "button"}" class="${cls}"${extra}>${inner}</button>`;
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
  if (o.heading !== undefined && ![2, 3, 4, 5, 6].includes(o.heading))
    throw new Error("kicker: heading is a level from 2 to 6");
  const tag = o.heading ? `h${o.heading}` : "span";
  return `<div class="toon-kicker${o.cls ? " " + esc(o.cls) : ""}"><span class="toon-kicker-num"${o.heading ? ' aria-hidden="true"' : ""}>${esc(num)}</span><${tag} class="toon-kicker-label">${esc(label)}</${tag}><span class="toon-kicker-rule" aria-hidden="true"></span>${link}</div>`;
};
var strip = (cells, o = {}) => {
  if (!cells.length)
    throw new Error("strip: at least one cell is required");
  const items = cells.map((c) => {
    if (!c.value.trim() || !c.label.trim())
      throw new Error("strip: every cell needs a value and a label");
    const fill = c.accent ? ` style="--toon-fill:${HEX_TEXT[accentOf(c.accent)]}"` : "";
    const inner = `<span class="toon-strip-value"${fill}>${esc(c.value)}</span> <span class="toon-strip-label">${esc(c.label)}</span>`;
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
  const items = cards.map((c, i) => `<div class="toon-deck-card" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${cards.length}">${c}</div>`).join("");
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
var INK = "#0a0a1f";
var num = (n) => String(Number(n.toFixed(2)) + 0);
var bound = (who, what, v, lo, hi, clamp) => {
  if (typeof v !== "number" || !Number.isFinite(v))
    throw new Error(`${who}: ${what} must be a finite number, got ${String(v)}`);
  if (v >= lo && v <= hi)
    return v;
  if (!clamp)
    throw new Error(`${who}: ${what} ${v} is outside ${lo} to ${hi}; pass clamp: true to clamp it`);
  return Math.min(hi, Math.max(lo, v));
};
var ownerOf = (who, owner) => {
  if (owner !== "a" && owner !== "b")
    throw new Error(`${who}: unknown owner "${owner}": use a or b`);
  return owner;
};
var delta = (n, o = {}) => {
  if (typeof n !== "number" || !Number.isFinite(n))
    throw new Error(`delta: n must be a finite number, got ${String(n)}`);
  const dir = Number(n.toFixed(2)) > 0 ? "up" : Number(n.toFixed(2)) < 0 ? "down" : "flat";
  const unit = o.unit ?? "";
  const spoken = unit.trim() === "%" ? "percent" : unit.trim() || "points";
  const text = `${dir === "up" ? "▲" : dir === "down" ? "▼" : "·"} ${num(Math.abs(n))}${unit}`;
  const label = dir === "flat" ? "no change" : `${dir} ${num(Math.abs(n))} ${spoken}`;
  const cls = ["toon-delta", `toon-delta-${dir}`, o.invert ? "toon-delta-invert" : "", o.ground ? "toon-delta-ground" : ""].filter(Boolean).join(" ");
  return `<span class="${cls}" role="img" aria-label="${esc(label)}">${esc(text)}</span>`;
};
var scale = (o) => {
  if (!o.label?.trim())
    throw new Error("scale: label is required");
  const owner = ownerOf("scale", o.owner ?? "a");
  if (o.value === null)
    return `<span class="toon-scale toon-scale-empty" role="img" aria-label="${esc(o.label)}"></span>`;
  const value = bound("scale", "value", o.value, 0, 100, o.clamp);
  const history2 = (o.history ?? []).map((h, i) => bound("scale", `history[${i}]`, h, 0, 100, o.clamp));
  const prev = history2.at(-1);
  const ticks = o.ticks === false ? "" : [25, 50, 75].map((t) => `<span class="toon-scale-tick" style="--at:${t}"></span>`).join("");
  const past = history2.map((h) => `<span class="toon-scale-past" style="--at:${num(h)}"></span>`).join("");
  const move = prev === undefined || prev === value ? "" : `<span class="toon-scale-move toon-scale-move-${value > prev ? "up" : "down"}" style="--lo:${num(Math.min(prev, value))};--hi:${num(Math.max(prev, value))}"></span>`;
  return `<span class="toon-scale" role="img" aria-label="${esc(o.label)}" style="--v:${num(value)};--p:${num(prev ?? value)}">${ticks}${past}${move}<span class="toon-scale-mark toon-owner-${owner}"></span></span>`;
};
var scaleAxis = () => `<span class="toon-scale-axis" aria-hidden="true">${[0, 25, 50, 75, 100].map((t) => `<span style="--at:${t}">${t}</span>`).join("")}</span>`;
var METER_FILL = { blue: "", red: "toon-meter-fill-red", yellow: "toon-meter-fill-yellow", violet: "toon-meter-fill-violet", mist: "toon-meter-fill-mist", green: "toon-meter-fill-green" };
var uid = 0;
var meter = (o) => {
  if (!o.label?.trim())
    throw new Error("meter: label is required");
  const max = o.max ?? 100;
  if (typeof max !== "number" || !Number.isFinite(max) || max <= 0)
    throw new Error(`meter: max must be above 0, got ${String(max)}`);
  const value = bound("meter", "value", o.value, 0, max, o.clamp);
  const tone = o.tone ?? "blue";
  if (!Object.hasOwn(METER_FILL, tone))
    throw new Error(`unknown meter tone "${tone}": use one of ${Object.keys(METER_FILL).join(", ")}`);
  const size = o.size ?? "md";
  if (size !== "md" && size !== "lg")
    throw new Error(`unknown meter size "${String(size)}": use md or lg`);
  if (o.id !== undefined && !/^[A-Za-z][\w-]*$/.test(o.id))
    throw new Error(`meter: id "${o.id}" is not a valid id`);
  const id = o.id ?? `toon-meter-${++uid}`;
  const vt = o.valueText?.trim() || undefined;
  const text = vt ?? num(value);
  const fill = value > 0 ? `<span class="toon-meter-fill${METER_FILL[tone] ? " " + METER_FILL[tone] : ""}" style="--w:${num(value / max * 100)}"></span>` : "";
  const sub = o.sub ? `<span class="toon-meter-sub" id="${id}-sub">${esc(o.sub)}</span>` : "";
  const labels = (o.scaleLabels ?? []).filter((l) => l.trim());
  const scaleRow = labels.length ? `<span class="toon-meter-scale">${labels.map((l) => `<span>${esc(l)}</span>`).join("")}</span>` : "";
  return `<div class="toon-meter${size === "lg" ? " toon-meter-lg" : ""}"><span class="toon-meter-name"><span class="toon-meter-label" id="${id}-label">${esc(o.label)}</span>${sub}</span>` + `<span class="toon-meter-bar" role="meter" aria-labelledby="${id}-label"${sub ? ` aria-describedby="${id}-sub"` : ""} aria-valuemin="0" aria-valuenow="${num(value)}" aria-valuemax="${num(max)}" aria-valuetext="${esc(vt ?? `${num(value)} of ${num(max)}`)}">${fill}</span>` + `<span class="toon-meter-value" aria-hidden="true">${esc(text)}</span>${scaleRow}</div>`;
};
var meters = (items, o) => {
  if (!o.label?.trim())
    throw new Error("meters: label is required");
  if (!items.length)
    throw new Error("meters: at least one meter is required");
  return `<div class="toon-meters${o.cls ? " " + esc(o.cls) : ""}" role="list" aria-label="${esc(o.label)}">${items.map((m) => `<div class="toon-meters-item" role="listitem">${typeof m === "string" ? m : meter(m)}</div>`).join("")}</div>`;
};
var ID_RE = /^[A-Za-z][\w-]*$/;
var tabbar = (tabs, o) => {
  if (!o.label?.trim())
    throw new Error("tabbar: label is required");
  if (tabs.length < 2 || tabs.length > 5)
    throw new Error(`tabbar: needs 2 to 5 tabs, got ${tabs.length}`);
  const ids = new Set;
  for (const t of tabs) {
    if (!ID_RE.test(t.id))
      throw new Error(`tabbar: tab id "${t.id}" is not a valid id`);
    if (!t.label.trim())
      throw new Error(`tabbar: tab "${t.id}" needs a label`);
    if (ids.has(t.id))
      throw new Error(`tabbar: tab id "${t.id}" is used twice`);
    ids.add(t.id);
  }
  const selected = o.selected ?? tabs[0].id;
  if (!ids.has(selected))
    throw new Error(`tabbar: selected tab "${selected}" is not one of the tabs`);
  const items = tabs.map((t) => `<a class="toon-tab" role="tab" id="${t.id}-tab" href="#${t.id}" aria-selected="${t.id === selected}" aria-controls="${t.id}">${t.icon ? `<span class="toon-tab-icon" aria-hidden="true">${t.icon}</span>` : ""}<span class="toon-tab-label">${esc(t.label)}</span></a>`).join("");
  return `<nav class="toon-tabbar${o.top ? " toon-tabbar-top" : ""}${o.cls ? " " + esc(o.cls) : ""}" aria-label="${esc(o.label)}" data-toon-tabs><div class="toon-tablist" role="tablist" aria-label="${esc(o.label)}">${items}</div></nav>`;
};
var tabpanel = (id, html, cls = "") => {
  if (!ID_RE.test(id))
    throw new Error(`tabpanel: id "${id}" is not a valid id`);
  return `<div class="toon-tabpanel${cls ? " " + esc(cls) : ""}" role="tabpanel" tabindex="0" id="${id}" aria-labelledby="${id}-tab">${html}</div>`;
};
var disclosure = (o) => {
  if (!ID_RE.test(o.id))
    throw new Error(`disclosure: id "${o.id}" is not a valid id`);
  if (!o.lead?.trim() || !o.title?.trim())
    throw new Error("disclosure: lead and title are required");
  const owner = ownerOf("disclosure", o.owner ?? "a");
  if (o.value !== undefined && o.note !== undefined)
    throw new Error("disclosure: pass value or note, not both");
  if (o.heading !== undefined && (o.native || ![2, 3, 4, 5, 6].includes(o.heading)))
    throw new Error("disclosure: heading is a level from 2 to 6, and not for native");
  const b = typeof o.badge === "string" ? { text: o.badge, tone: "yellow" } : o.badge ? { text: o.badge.text, tone: o.badge.tone ?? "yellow" } : undefined;
  const d = o.delta === undefined ? "" : typeof o.delta === "number" ? delta(o.delta) : delta(o.delta.value, o.delta);
  const inner = `<span class="toon-disclosure-lead toon-owner-${owner}"${o.tone ? ` style="--toon-lead-dot:${TONE_HEX[toneOf(o.tone)]}"` : ""}>${o.ownerLabel?.trim() ? `<span class="toon-disclosure-owner">Owner: ${esc(o.ownerLabel)}. </span>` : ""}${esc(o.lead)}</span>` + `<span class="toon-disclosure-title">${esc(o.title)}${b ? " " + badge(b.text, b.tone) : ""}</span>` + `${o.sub?.trim() ? `<span class="toon-disclosure-sub">${esc(o.sub.trim())}</span>` : ""}` + `${o.value === undefined ? "" : `<span class="toon-disclosure-value">${esc(String(o.value))}</span>`}${o.note?.trim() ? `<span class="toon-disclosure-value toon-disclosure-note">${esc(o.note.trim())}</span>` : ""}${d}` + `${o.below ? `<span class="toon-disclosure-below">${o.below}</span>` : ""}`;
  const panel = `<div class="toon-disclosure-panel" id="${o.id}"${o.native || o.open ? "" : " hidden"}>${o.panel}</div>`;
  if (o.native)
    return `<div class="toon-disclosure" role="listitem"><details class="toon-disclosure-details"${o.open ? " open" : ""}><summary class="toon-disclosure-btn" id="${o.id}-btn">${inner}</summary>${panel}</details></div>`;
  const btn = `<button type="button" class="toon-disclosure-btn" id="${o.id}-btn" aria-expanded="${o.open ? "true" : "false"}" aria-controls="${o.id}">${inner}</button>`;
  return `<div class="toon-disclosure" role="listitem">${o.heading ? `<h${o.heading} class="toon-disclosure-h">${btn}</h${o.heading}>` : btn}${panel}</div>`;
};
var SPARK_SIZE = { sm: { w: 64, h: 20 }, lg: { w: 120, h: 32 } };
var spark = (values, o) => {
  if (!o.label?.trim())
    throw new Error("spark: label is required");
  if (!Array.isArray(values) || values.length < 2)
    throw new Error("spark: at least 2 values are required");
  const min = o.min ?? 0;
  const max = o.max ?? 100;
  if (!Number.isFinite(min) || !Number.isFinite(max) || !(max > min))
    throw new Error(`spark: max must be above min, got ${min} and ${max}`);
  const accent = accentOf(o.accent ?? "blue");
  const size = o.size ?? "sm";
  if (!Object.hasOwn(SPARK_SIZE, size))
    throw new Error(`unknown spark size "${String(size)}": use sm or lg`);
  const vs = values.map((v, i) => bound("spark", `values[${i}]`, v, min, max, o.clamp));
  const { w, h } = SPARK_SIZE[size];
  const pad = 5;
  const x = (i) => pad + i / (vs.length - 1) * (w - pad * 2);
  const y = (v) => h - pad - (v - min) / (max - min) * (h - pad * 2);
  const pts = vs.map((v, i) => [x(i), y(v)]);
  const line = `<polyline points="${pts.map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`).join(" ")}" fill="none" stroke="${INK}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
  const dots = pts.slice(0, -1).map(([px, py]) => `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="1.5" fill="${INK}"/>`).join("");
  const [lx, ly] = pts.at(-1);
  const last = `<circle cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" r="3" fill="${HEX[accent]}" stroke="${INK}" stroke-width="1.5"/>`;
  const ty = o.target === undefined ? undefined : y(bound("spark", "target", o.target, min, max, o.clamp)).toFixed(1);
  const base = ty === undefined ? "" : `<line class="toon-spark-target" x1="0" x2="${w}" y1="${ty}" y2="${ty}" stroke="#4a4d78" stroke-width="1" stroke-dasharray="3 3"/>`;
  const label = `${o.label}. Trend from ${num(vs[0])} to ${num(vs.at(-1))} over ${vs.length} readings`;
  return `<svg class="toon-spark toon-spark-${size}" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(label)}" focusable="false">${base}${line}${dots}${last}</svg>`;
};
var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var ISO = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/;
var pad2 = (n) => String(n).padStart(2, "0");
var fmtAt = (x, part = "full") => {
  if (!ISO.test(x))
    return x;
  const d = new Date(x.length === 10 ? `${x}T00:00:00Z` : /(Z|[+-]\d{2}:?\d{2})$/.test(x) ? x : `${x}Z`);
  if (Number.isNaN(d.getTime()))
    return x;
  const day = `${MON[d.getUTCMonth()]} ${d.getUTCDate()}`;
  const time = `${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}`;
  if (part === "day" || x.length === 10)
    return day;
  return part === "time" ? time : `${day} ${time} UTC`;
};
var STATE_GLYPH = { ok: "✓", down: "✕", unknown: "?" };
var stateOf = (who, s) => {
  if (s !== "ok" && s !== "down" && s !== "unknown")
    throw new Error(`${who}: unknown state "${s}": use ok, down or unknown`);
  return s;
};
var uptime = (o) => {
  if (!o.label?.trim())
    throw new Error("uptime: label is required");
  if (!Array.isArray(o.cells) || !o.cells.length)
    throw new Error("uptime: at least one cell is required");
  if (o.cells.length > 150)
    throw new Error(`uptime: at most 150 cells fit a phone, got ${o.cells.length}; group the readings into longer intervals`);
  const n = { ok: 0, down: 0, unknown: 0 };
  const cells = o.cells.map((c, i) => {
    const s = stateOf(`uptime: cells[${i}]`, c.state);
    if (typeof c.at !== "string" || !c.at.trim())
      throw new Error(`uptime: cells[${i}].at is required`);
    n[s]++;
    const said = `${fmtAt(c.at)}: ${s}${c.detail?.trim() ? `. ${c.detail.trim()}` : ""}`;
    return `<span class="toon-uptime-cell toon-uptime-${s}" role="listitem" aria-label="${esc(said)}"></span>`;
  }).join("");
  const total = o.cells.length;
  const parts = [`${n.ok} of ${total} intervals ok`, ...n.down ? [`${n.down} down`] : [], ...n.unknown ? [`${n.unknown} unknown`] : []];
  const key = ["ok", "down", "unknown"].map((s) => `<span class="toon-uptime-key toon-uptime-key-${s}"><i aria-hidden="true"></i>${s === "ok" ? "Ok" : s === "down" ? "Down" : "Unknown"}</span>`).join("");
  const first = o.cells[0].at, last = o.cells.at(-1).at;
  return `<figure class="toon-uptime"><figcaption class="toon-chart-title">${esc(o.label)}${o.windowLabel ? `<span class="toon-chart-unit"> · ${esc(o.windowLabel)}</span>` : ""}</figcaption>` + `<div class="toon-uptime-cells" role="list" aria-label="${esc(o.label)}">${cells}</div>` + `<p class="toon-uptime-ends" aria-hidden="true"><span>${esc(fmtAt(first, "day"))}</span><span>${esc(fmtAt(last, "day"))}</span></p>` + `<p class="toon-uptime-summary"><span aria-hidden="true">${n.unknown || n.down ? "! " : "✓ "}</span>${esc(parts.join(", "))}</p><p class="toon-uptime-keys" aria-hidden="true">${key}</p></figure>`;
};
var LINE_TONES = ["blue", "red", "violet", "yellow"];
var DASH = ["", "7 3", "2 3", "8 3 2 3"];
var marker = (shape, x, y, c) => {
  const f = `fill="${c}" stroke="#fff" stroke-width="1"`;
  switch (shape % 4) {
    case 0:
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.5" ${f}/>`;
    case 1:
      return `<rect x="${(x - 3.5).toFixed(1)}" y="${(y - 3.5).toFixed(1)}" width="7" height="7" ${f}/>`;
    case 2:
      return `<polygon points="${x.toFixed(1)},${(y - 4.5).toFixed(1)} ${(x + 4.5).toFixed(1)},${(y + 3.5).toFixed(1)} ${(x - 4.5).toFixed(1)},${(y + 3.5).toFixed(1)}" ${f}/>`;
    default:
      return `<polygon points="${x.toFixed(1)},${(y - 4.5).toFixed(1)} ${(x + 4.5).toFixed(1)},${y.toFixed(1)} ${x.toFixed(1)},${(y + 4.5).toFixed(1)} ${(x - 4.5).toFixed(1)},${y.toFixed(1)}" ${f}/>`;
  }
};
var niceMax = (v) => {
  if (v <= 0)
    return 1;
  const p = 10 ** Math.floor(Math.log10(v));
  return [1, 2, 2.5, 5, 10].map((s) => s * p).find((s) => s >= v) ?? 10 * p;
};
var line = (o) => {
  if (!o.label?.trim())
    throw new Error("line: label is required");
  if (!Array.isArray(o.series) || !o.series.length)
    throw new Error("line: at least one series is required");
  if (o.series.length > LINE_TONES.length)
    throw new Error(`line: at most ${LINE_TONES.length} series, got ${o.series.length}`);
  const min = o.min ?? 0;
  if (!Number.isFinite(min))
    throw new Error("line: min must be a finite number");
  const names = new Set;
  const data = o.series.map((s, i) => {
    if (!s.name?.trim())
      throw new Error(`line: series[${i}].name is required`);
    if (names.has(s.name))
      throw new Error(`line: two series are named "${s.name}"`);
    names.add(s.name);
    if (!Array.isArray(s.points) || !s.points.length)
      throw new Error(`line: series "${s.name}" needs at least one point`);
    const m = new Map;
    s.points.forEach((p, j) => {
      if (typeof p.x !== "string" || !p.x.trim())
        throw new Error(`line: series "${s.name}" points[${j}].x is required`);
      if (typeof p.y !== "number" || !Number.isFinite(p.y))
        throw new Error(`line: series "${s.name}" points[${j}].y must be a finite number, got ${String(p.y)}`);
      if (p.y < min)
        throw new Error(`line: series "${s.name}" points[${j}].y ${p.y} is below min ${min}; pass min`);
      if (m.has(p.x))
        throw new Error(`line: series "${s.name}" has two points at ${p.x}`);
      m.set(p.x, p.y);
    });
    return { name: s.name, m };
  });
  const seen = [...new Set(data.flatMap((s) => [...s.m.keys()]))];
  const ms = (x) => new Date(x.length === 10 ? `${x}T00:00:00Z` : /(Z|[+-]\d{2}:?\d{2})$/.test(x) ? x : `${x}Z`).getTime();
  const allIso = seen.every((x) => ISO.test(x) && !Number.isNaN(ms(x)));
  const xs = allIso ? [...seen].sort((a, b) => ms(a) - ms(b)) : seen;
  if (xs.length < 2)
    throw new Error("line: at least 2 distinct x values are required");
  if (o.target !== undefined && (!Number.isFinite(o.target) || o.target < min))
    throw new Error(`line: target must be a finite number of at least min ${min}, got ${String(o.target)}`);
  const top = Math.max(...data.flatMap((s) => [...s.m.values()]), o.target ?? min);
  const max = o.max ?? niceMax(top);
  if (!Number.isFinite(max) || !(max > min))
    throw new Error(`line: max must be above min, got ${min} and ${max}`);
  if (top > max)
    throw new Error(`line: a value ${top} is above max ${max}`);
  const W = 320, H = 172, L = 46, R = 10, T = 10, B = 28;
  const px = (i) => L + i / (xs.length - 1) * (W - L - R);
  const py = (v) => T + (1 - (v - min) / (max - min)) * (H - T - B);
  const sameDay = allIso && xs.every((x) => x.length > 10 && new Date(ms(x)).toISOString().slice(0, 10) === new Date(ms(xs[0])).toISOString().slice(0, 10));
  const axis = (x) => fmtAt(x, sameDay ? "time" : "day");
  const grid = [0, 1, 2, 3, 4].map((k) => {
    const v = min + (max - min) * k / 4;
    const y = py(v).toFixed(1);
    return `<line x1="${L}" x2="${W - R}" y1="${y}" y2="${y}" stroke="#c9cde0" stroke-width="1"/><text x="${L - 5}" y="${(py(v) + 4.5).toFixed(1)}" text-anchor="end" font-size="14" fill="${INK}">${num(v)}</text>`;
  }).join("");
  const ticks = [...new Set([0, Math.floor((xs.length - 1) / 2), xs.length - 1])];
  const xlabels = ticks.map((i) => `<text x="${px(i).toFixed(1)}" y="${H - 8}" text-anchor="${i === 0 ? "start" : i === xs.length - 1 ? "end" : "middle"}" font-size="14" fill="${INK}">${esc(axis(xs[i]))}</text>`).join("");
  const tgt = o.target === undefined ? "" : `<line x1="${L}" x2="${W - R}" y1="${py(o.target).toFixed(1)}" y2="${py(o.target).toFixed(1)}" stroke="${INK}" stroke-width="1.5" stroke-dasharray="1 4" stroke-linecap="round"/>`;
  const unit = o.yUnit?.trim() ? ` ${o.yUnit.trim()}` : "";
  const drawn = data.map((s, si) => {
    const colour = HEX_TEXT[LINE_TONES[si]];
    let d = "";
    let run = false;
    xs.forEach((x, i) => {
      const v = s.m.get(x);
      if (v === undefined) {
        run = false;
        return;
      }
      d += `${run ? "L" : "M"}${px(i).toFixed(1)},${py(v).toFixed(1)}`;
      run = true;
    });
    const showAll = xs.length <= 12;
    const lastX = [...xs].reverse().find((x) => s.m.has(x));
    const dots = xs.map((x, i) => s.m.has(x) && (showAll || x === lastX || !s.m.has(xs[i - 1]) && !s.m.has(xs[i + 1])) ? marker(si, px(i), py(s.m.get(x)), colour) : "").join("");
    return `<path d="${d}" fill="none" stroke="${colour}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"${DASH[si] ? ` stroke-dasharray="${DASH[si]}"` : ""}/>${dots}`;
  }).join("");
  const end = (s) => {
    const lastX = [...xs].reverse().find((x) => s.m.has(x));
    return { x: lastX, v: s.m.get(lastX) };
  };
  const said = data.map((s) => {
    const f = xs.find((x) => s.m.has(x));
    const e = end(s);
    const vals = [...s.m.values()];
    return `${s.name}: ${num(s.m.get(f))} to ${num(e.v)}${unit}, from ${num(Math.min(...vals))} to ${num(Math.max(...vals))} over ${vals.length} readings`;
  }).join(". ");
  const key = data.map((s, si) => {
    const c = HEX_TEXT[LINE_TONES[si]];
    const e = end(s);
    const sw = `<svg class="toon-chart-swatch" viewBox="0 0 28 10" width="28" height="10" aria-hidden="true" focusable="false"><line x1="1" x2="27" y1="5" y2="5" stroke="${c}" stroke-width="2.5"${DASH[si] ? ` stroke-dasharray="${DASH[si]}"` : ""}/>${marker(si, 14, 5, c)}</svg>`;
    return `<li>${sw}<span class="toon-chart-name">${esc(s.name)}</span><b class="toon-chart-end">${num(e.v)}${esc(unit)}</b><span class="toon-chart-at">${esc(fmtAt(e.x))}</span></li>`;
  }).join("");
  const head = `<tr><th scope="col">Time</th>${data.map((s) => `<th scope="col">${esc(s.name)}${esc(unit ? ` (${unit.trim()})` : "")}</th>`).join("")}</tr>`;
  const rows = xs.map((x) => `<tr><th scope="row">${esc(fmtAt(x))}</th>${data.map((s) => `<td>${s.m.has(x) ? num(s.m.get(x)) : "–"}</td>`).join("")}</tr>`).join("");
  const foot = o.target === undefined ? "" : `<tfoot><tr><th scope="row">Target</th><td colspan="${data.length}">${num(o.target)}${esc(unit)}</td></tr></tfoot>`;
  const tgtSaid = o.target === undefined ? "" : `. Target ${num(o.target)}${unit}`;
  return `<figure class="toon-chart toon-line"><figcaption class="toon-chart-title">${esc(o.label)}${unit ? `<span class="toon-chart-unit"> · ${esc(unit.trim())}</span>` : ""}</figcaption>` + `<svg class="toon-line-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(`${o.label}. ${said}${tgtSaid}`)}" focusable="false">${grid}${tgt}${drawn}${xlabels}</svg>` + `<ul class="toon-chart-key" role="list" aria-label="Latest values">${key}</ul>` + `<details class="toon-chart-table"><summary>${esc(o.tableLabel?.trim() || "Show as table")}</summary><div class="toon-table-wrap"><table class="toon-table"><caption class="toon-chart-cap">${esc(o.label)}</caption><thead>${head}</thead><tbody>${rows}</tbody>${foot}</table></div></details></figure>`;
};
var TILE_WORD = { ok: "Ok", warn: "Warning", down: "Down", unknown: "Unknown" };
var TILE_GLYPH = { ok: "✓", warn: "!", down: "✕", unknown: "?" };
var statusTile = (o) => {
  if (!o.label?.trim())
    throw new Error("statusTile: label is required");
  if (!Object.hasOwn(TILE_WORD, o.state))
    throw new Error(`statusTile: unknown state "${String(o.state)}": use ok, warn, down or unknown`);
  const has = typeof o.value === "string" && o.value.trim() !== "";
  if (!has && o.state !== "unknown")
    throw new Error(`statusTile: a ${o.state} tile needs a value; leave it out only when the state is unknown`);
  const when = o.readAtText?.trim() || (o.readAt?.trim() ? fmtAt(o.readAt) : "");
  const d = o.delta === undefined ? "" : ` ${delta(typeof o.delta === "number" ? o.delta : o.delta.value, typeof o.delta === "number" ? {} : { unit: o.delta.unit, invert: o.delta.invert })}`;
  const read = o.readAt?.trim() && !o.readAtText?.trim() ? `<time class="toon-tile-read" datetime="${esc(o.readAt.trim())}">Read ${esc(when)}</time>` : when ? `<span class="toon-tile-read">Read ${esc(when)}</span>` : "";
  const value = has ? `<span class="toon-tile-value">${esc(o.value)}</span>` : `<span class="toon-tile-value toon-tile-none"><span aria-hidden="true">—</span><span class="toon-tile-sr">no reading</span></span>`;
  return `<div class="toon-tile toon-tile-${o.state}"><span class="toon-tile-label">${esc(o.label)}</span>${value}` + `<span class="toon-tile-state"><span aria-hidden="true">${TILE_GLYPH[o.state]}</span> ${TILE_WORD[o.state]}${d}</span>` + `${o.detail ? `<span class="toon-tile-detail">${esc(o.detail)}</span>` : ""}${read}${o.extra ?? ""}</div>`;
};
var switchRow = (o) => {
  if (!o.name?.trim())
    throw new Error("switchRow: name is required");
  if (o.active !== "lab" && o.active !== "cloud")
    throw new Error(`switchRow: unknown active "${String(o.active)}": use lab or cloud`);
  stateOf("switchRow: labState", o.labState);
  stateOf("switchRow: cloudState", o.cloudState);
  if (!o.canSwitch && !o.reason?.trim())
    throw new Error("switchRow: reason is required when canSwitch is false");
  if (o.id !== undefined && !/^[A-Za-z][\w-]*$/.test(o.id))
    throw new Error(`switchRow: id "${o.id}" is not a valid id`);
  const id = o.id ?? `toon-switch-${++uid}`;
  if (o.control !== undefined && o.control !== "button" && o.control !== "toggle")
    throw new Error(`switchRow: unknown control "${String(o.control)}": use button or toggle`);
  const other = o.active === "lab" ? "cloud" : "lab";
  const word = { lab: o.labels?.lab?.trim() || "Lab", cloud: o.labels?.cloud?.trim() || "Cloud" };
  const side = (p, state, age) => {
    const on = o.active === p;
    return `<div class="toon-switch-side${on ? " toon-switch-side-on" : ""}"><span class="toon-switch-where">${esc(word[p])}</span>` + `<span class="toon-switch-state toon-switch-${state}"><span aria-hidden="true">${STATE_GLYPH[state]}</span> ${state === "ok" ? "Up" : state === "down" ? "Down" : "Unknown"}</span>` + `${age ? `<span class="toon-switch-age">Read ${esc(age)}</span>` : ""}${on ? '<span class="toon-switch-serving"><span aria-hidden="true">●</span> Serving</span>' : ""}</div>`;
  };
  const why = o.reason?.trim() ? ` aria-describedby="${id}-reason"` : "";
  const reason = o.reason?.trim() ? `<p class="toon-switch-reason" id="${id}-reason">${esc(o.reason.trim())}</p>` : "";
  const label = o.buttonLabel?.trim() || (o.control === "toggle" ? `${o.name}: run on ${word.cloud.toLowerCase()}` : `Switch to ${word[other].toLowerCase()}`);
  const button = o.action ?? (o.control === "toggle" ? toggle({ label, checked: o.active === "cloud", off: word.lab, on: word.cloud, disabled: !o.canSwitch, describedBy: o.reason?.trim() ? `${id}-reason` : undefined, id: `${id}-toggle`, attrs: { "data-toon-switch": o.name, "data-toon-switch-to": other } }) : `<button type="button" class="toon-btn toon-btn-yellow toon-switch-btn" data-toon-switch="${esc(o.name)}" data-toon-switch-to="${other}"${o.canSwitch ? "" : ' aria-disabled="true"'}${why}>${esc(label)}</button>`);
  const tags = `${o.dataClass?.trim() ? chip(o.dataClass.trim()) : ""}${o.pinned ? ' <span class="toon-badge toon-badge-violet">Pinned</span>' : ""}`;
  return `<div class="toon-switch-row" role="group" aria-labelledby="${id}-name"><div class="toon-switch-head"><b class="toon-switch-name" id="${id}-name">${esc(o.name)}</b>${o.hostname ? `<span class="toon-switch-host">${esc(o.hostname)}</span>` : ""}${tags ? `<span class="toon-switch-tags">${tags}</span>` : ""}</div>` + `<div class="toon-switch-sides">${side("lab", o.labState, o.labAge)}${side("cloud", o.cloudState, o.cloudAge)}</div>${button}${reason}</div>`;
};
var toggle = (o) => {
  if (!o.label?.trim() || !o.off?.trim() || !o.on?.trim())
    throw new Error("toggle: label, off and on are required");
  if (o.id !== undefined && !ID_RE.test(o.id))
    throw new Error(`toggle: id "${o.id}" is not a valid id`);
  if (o.describedBy !== undefined && !ID_RE.test(o.describedBy))
    throw new Error(`toggle: describedBy "${o.describedBy}" is not a valid id`);
  const attrs = Object.entries(o.attrs ?? {}).map(([k, v]) => {
    if (!/^data-[a-z0-9-]+$/.test(k))
      throw new Error(`toggle: attribute "${k}" is not a data-* attribute`);
    return ` ${k}="${esc(v)}"`;
  }).join("");
  const side = (text, on) => `<span class="toon-toggle-side${on ? " toon-toggle-side-on" : ""}" aria-hidden="true">${esc(text.trim())}</span>`;
  return `<span class="toon-toggle-row">${side(o.off, !o.checked)}<button type="button" role="switch" class="toon-toggle"${o.id ? ` id="${o.id}"` : ""} aria-checked="${o.checked ? "true" : "false"}" aria-label="${esc(o.label.trim())}"` + `${o.disabled ? ' aria-disabled="true"' : ""}${o.describedBy ? ` aria-describedby="${o.describedBy}"` : ""}${attrs}><span class="toon-toggle-thumb" aria-hidden="true"></span></button>${side(o.on, o.checked)}</span>`;
};
var gearPath = (cx, cy, rOut, rIn, teeth, hole) => {
  const step = Math.PI * 2 / teeth;
  const pt = (a, r) => `${(cx + Math.cos(a) * r).toFixed(2)} ${(cy + Math.sin(a) * r).toFixed(2)}`;
  let d = "";
  for (let i = 0;i < teeth; i++) {
    const a = i * step;
    d += `${i === 0 ? "M" : "L"}${pt(a - step * 0.28, rIn)}L${pt(a - step * 0.16, rOut)}L${pt(a + step * 0.16, rOut)}L${pt(a + step * 0.28, rIn)}`;
  }
  return `${d}ZM${(cx + hole).toFixed(2)} ${cy}a${hole} ${hole} 0 1 0 ${-hole * 2} 0a${hole} ${hole} 0 1 0 ${hole * 2} 0Z`;
};
var gears = (o = {}) => {
  if (o.spin !== undefined && o.spin !== "active" && o.spin !== "always")
    throw new Error(`gears: unknown spin "${String(o.spin)}": use active or always`);
  const cls = `toon-gears${o.spin === "always" ? " toon-gears-always" : ""}${o.cls ? ` ${esc(o.cls)}` : ""}`;
  return `<svg class="${cls}" viewBox="0 0 40 40" aria-hidden="true" focusable="false">` + `<path class="toon-gear toon-gear-big" fill-rule="evenodd" d="${gearPath(15, 25, 13, 10, 8, 4)}"/>` + `<path class="toon-gear toon-gear-small" fill-rule="evenodd" d="${gearPath(30, 11, 9, 6.8, 6, 2.8)}"/></svg>`;
};
var settingsMenu = (o) => {
  if (!ID_RE.test(o.id))
    throw new Error(`settingsMenu: id "${o.id}" is not a valid id`);
  if (!Array.isArray(o.items) || o.items.length === 0)
    throw new Error("settingsMenu: pass at least one item");
  const label = esc((o.label ?? "Settings").trim() || "Settings");
  const items = o.items.map((it) => {
    if (!it.label?.trim() || !it.href?.trim())
      throw new Error("settingsMenu: each item needs a label and an href");
    if (!/^(#|\/|\?|\.\.?\/|https?:|mailto:|tel:)/i.test(it.href.replace(/[\u0000-\u0020]/g, "")))
      throw new Error("settingsMenu: an href must be a hash, a path, a query, or an http(s), mailto or tel link");
    return `<li><a class="toon-settings-item" href="${esc(it.href.trim())}"${it.current ? ' aria-current="page"' : ""}>${esc(it.label.trim())}</a></li>`;
  }).join("");
  return `<details class="toon-settings${o.cls ? ` ${esc(o.cls)}` : ""}" id="${o.id}"><summary class="toon-settings-btn" aria-label="${label}">${gears({ spin: o.spin })}</summary>` + `<nav class="toon-settings-panel" aria-label="${label}"><ul>${items}</ul></nav></details>`;
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
    "blue-text": { $value: "#2a57d6", $description: "Blue for large figures on paper. The fill blue is 2.7:1 on paper; this is 5.3:1." },
    "red-text": { $value: "#c8322b", $description: "Red for large figures on paper (4.6:1)." },
    "violet-text": { $value: "#6b4fd6", $description: "Violet for large figures on paper (4.9:1)." },
    "yellow-text": { $value: "#7a5c00", $description: "Yellow for large figures on paper (5.4:1). The fill yellow is 1.4:1 on paper." },
    green: { $value: "#4ccf8f", $description: "The ok state: a fill and a shadow. Not a fifth accent. Green says healthy, clear or serving, and nothing else." },
    "green-text": { $value: "#0f6e42", $description: "Green for an ok state's text on paper (5.5:1). The fill green is 1.7:1 on paper." },
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
  button,
  chip,
  deck,
  delta,
  disclosure,
  esc,
  figure,
  fitSize,
  gears,
  initToonish,
  kicker,
  letters,
  line,
  meter,
  meters,
  pager,
  portrait,
  preset_default as preset,
  row,
  scale,
  scaleAxis,
  settingsMenu,
  sfx,
  shot,
  spark,
  speedLines,
  stat,
  statusTile,
  steps,
  strip,
  switchRow,
  tabbar,
  tabpanel,
  uptime
};
