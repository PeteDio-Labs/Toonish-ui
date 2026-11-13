(() => {
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

  // src/auto.ts
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", () => initToonish());
  else
    initToonish();
})();
