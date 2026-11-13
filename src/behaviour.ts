// Browser behaviour for the kit: toggle groups, modals and scroll reveal. No framework, no dependencies.
// dist/toonish.js runs it on load. Import `initToonish` from the package instead to run it yourself.
//
// Modals: a native <dialog> gives the focus trap, Esc and an inert page. This adds opening, backdrop taps, scroll lock,
// and a shared dialog that shows another page's <article>. If <dialog> is missing or the fetch fails, a link keeps
// working as a plain link.

const started = new WeakSet<Document>();

/** Drops inline event handlers and javascript: URLs from markup fetched into the shared modal. */
function clean(node: Node): Node {
  if (node instanceof Element) {
    for (const el of [node, ...node.querySelectorAll('*')]) {
      for (const a of [...el.attributes]) {
        if (/^on/i.test(a.name) || (/^(href|src|action|formaction|xlink:href)$/i.test(a.name) && /^\s*javascript:/i.test(a.value))) el.removeAttribute(a.name);
      }
    }
  }
  return node;
}

export function initToonish(root: Document = document): void {
  if (started.has(root)) return;
  started.add(root);
  const html = root.documentElement;

  // Scroll reveal: blocks rise into view the first time they appear. Blocks already in view at load stay put.
  if ('IntersectionObserver' in window) {
    html.classList.add('toon-js');
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('toon-in');
            io.unobserve(en.target);
          }
        }),
      { rootMargin: '0px 0px -8% 0px' },
    );
    root.querySelectorAll('main h2, main .toon-callout, main .toon-frame, main .toon-bubble, .toon-footer').forEach((n) => {
      if (n.getBoundingClientRect().top < innerHeight) return;
      n.classList.add('toon-reveal');
      io.observe(n);
    });
  }

  // Toggle groups: one pressed button at a time, with a bounce on the newly pressed one.
  root.querySelectorAll<HTMLElement>('[data-toon-toggle]').forEach((group) => {
    group.addEventListener('click', (e) => {
      const b = (e.target as Element).closest('button');
      if (!b || !group.contains(b)) return;
      group.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      b.classList.remove('toon-boing');
      void b.offsetWidth; // restart the animation on a repeat tap
      b.classList.add('toon-boing');
    });
  });

  const lock = (on: boolean) => html.classList.toggle('toon-modal-open', on);
  const open = (d: HTMLDialogElement) => {
    d.showModal();
    lock(true);
  };
  root.addEventListener(
    'close',
    (e) => {
      const t = e.target as Element;
      // Keep the lock while another modal is still open.
      if (t.classList && t.classList.contains('toon-modal')) lock(root.querySelector('dialog.toon-modal[open]') !== null);
    },
    true,
  );
  root.addEventListener('click', (e) => {
    const t = e.target as HTMLDialogElement;
    if (t.classList && t.classList.contains('toon-modal')) t.close(); // a tap on the backdrop
  });
  if (typeof HTMLDialogElement !== 'function') return;

  const el = (tag: string, cls?: string, text?: string) => {
    const n = root.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  };
  const cache = new Map<string, { title: string; nodes: Element[] }>();
  let shared: HTMLDialogElement | undefined;
  const sharedDialog = () => {
    if (shared) return shared;
    const d = el('dialog', 'toon-modal') as HTMLDialogElement;
    d.setAttribute('aria-modal', 'true');
    d.setAttribute('aria-labelledby', 'toon-modal-title');
    const box = el('div', 'toon-modal-box');
    const head = el('div', 'toon-modal-head');
    const title = el('h2', 'toon-heading m-0 text-display2');
    title.id = 'toon-modal-title';
    const x = el('button', 'toon-btn toon-btn-red toon-modal-x', 'Close') as HTMLButtonElement;
    x.type = 'button';
    x.dataset.toonModalClose = '';
    head.append(title, x);
    box.append(head, el('div', 'toon-modal-body'));
    d.append(box);
    root.body.append(d);
    return (shared = d);
  };
  const showPage = async (link: HTMLAnchorElement) => {
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin) throw new Error('cross-origin');
    const key = url.pathname + url.search;
    if (!cache.has(key)) {
      const res = await fetch(key, { headers: { Accept: 'text/html' } });
      if (!res.ok) throw new Error(String(res.status));
      const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
      const article = doc.querySelector('article');
      const h1 = article?.querySelector('h1');
      if (!article || !h1) throw new Error('no article');
      cache.set(key, { title: (h1.textContent ?? '').trim(), nodes: [...article.children].filter((n) => n !== h1) });
    }
    const page = cache.get(key)!;
    const d = sharedDialog();
    d.querySelector('#toon-modal-title')!.textContent = page.title;
    const body = d.querySelector('.toon-modal-body')!;
    body.replaceChildren(...page.nodes.map((n) => clean(root.importNode(n, true))));
    const more = el('p', 'mb-0 mt-s6 text-footnote');
    const a = el('a', 'toon-link', 'Open as a full page') as HTMLAnchorElement;
    a.href = key;
    more.append(a);
    body.append(more);
    body.scrollTop = 0;
    open(d);
  };
  root.addEventListener('click', (e) => {
    const t = e.target as Element;
    const closer = t.closest('[data-toon-modal-close]');
    if (closer) {
      closer.closest('dialog')?.close();
      return;
    }
    const opener = t.closest<HTMLElement>('[data-toon-modal-open]');
    if (opener) {
      const d = root.getElementById(opener.dataset.toonModalOpen ?? '') as HTMLDialogElement | null;
      if (d) open(d);
      return;
    }
    const link = t.closest<HTMLAnchorElement>('a[data-toon-modal]');
    const m = e as MouseEvent;
    if (!link || e.defaultPrevented || m.button !== 0 || m.metaKey || m.ctrlKey || m.shiftKey || m.altKey) return;
    e.preventDefault();
    showPage(link).catch(() => {
      location.href = link.href;
    });
  });
}
