// Browser behaviour for the kit: toggle groups, modals, scroll reveal and the card deck. No framework, no dependencies.
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

const DECK_QUERY = '(min-width: 768px)';

/**
 * A card deck (see `deck()` in markup.ts). The pile is on at phone width, or at every width when the value is `always`.
 * The breakpoint is the one in the CSS, read through matchMedia, so a rotated phone or a resized window updates it.
 * State changes at once on every flip. The slide is a CSS animation that the motion rules cancel, so nothing here waits on
 * `transitionend` or `animationend`.
 */
function initDeck(deck: HTMLElement): void {
  const pile = deck.querySelector<HTMLElement>('.toon-deck-pile');
  const cards = pile ? [...pile.children].filter((c): c is HTMLElement => c instanceof HTMLElement && c.classList.contains('toon-deck-card')) : [];
  const count = deck.querySelector<HTMLElement>('.toon-deck-count');
  if (!pile || cards.length < 2) return;
  const n = cards.length;
  const always = deck.dataset.toonDeck === 'always';
  const mq = window.matchMedia(DECK_QUERY);
  const flies = new Map<HTMLElement, number>();
  let i = 0;

  const on = () => deck.hasAttribute('data-toon-deck-on');
  const render = () => {
    cards.forEach((c, k) => {
      const pos = (k - i + n) % n;
      c.dataset.pos = String(Math.min(pos, 3));
      c.inert = pos !== 0;
    });
    if (count) count.textContent = `${i + 1} / ${n}`;
  };
  const apply = () => {
    if (always || !mq.matches) {
      deck.setAttribute('data-toon-deck-on', '');
      render();
    } else {
      end(false); // the breakpoint changed mid-drag
      deck.removeAttribute('data-toon-deck-on');
      cards.forEach((c) => {
        delete c.dataset.pos;
        delete c.dataset.dragging;
        delete c.dataset.fly;
        c.inert = false;
      });
    }
  };
  const fly = (card: HTMLElement, kind: 'in' | 'out', dir: number) => {
    window.clearTimeout(flies.get(card));
    delete card.dataset.fly;
    void card.offsetWidth; // restart the animation on a quick second flip
    card.style.setProperty('--dir', String(dir));
    card.dataset.fly = kind;
    flies.set(card, window.setTimeout(() => {
      delete card.dataset.fly;
      card.style.removeProperty('--dx');
      card.style.removeProperty('--rot');
    }, 320));
  };
  /** Moves by `d` cards. Forward, the top card leaves toward `dir`. Back, the card that returns arrives from `dir`. */
  const go = (d: 1 | -1, dir: number) => {
    if (!on()) return;
    const top = cards[i]!;
    i = (i + d + n) % n;
    render();
    fly(d === 1 ? top : cards[i]!, d === 1 ? 'out' : 'in', dir);
  };

  deck.addEventListener('click', (e) => {
    const b = (e.target as Element).closest('button');
    if (!b || !deck.contains(b)) return;
    if (b.hasAttribute('data-toon-deck-next')) go(1, -1);
    else if (b.hasAttribute('data-toon-deck-prev')) go(-1, 1);
  });
  deck.addEventListener('keydown', (e) => {
    const t = e.target as Element;
    if (!on() || !t.closest('.toon-deck-controls') || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1, -1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1, 1); }
  });

  // Swipe. A drag is tracked from pointerdown but the pointer is captured only once it is clearly horizontal, so a vertical
  // drag is never touched and the page scrolls (touch-action: pan-y does the rest). A tap on a link still navigates: the
  // click is suppressed only after a drag that flipped.
  let drag: { id: number; x: number; y: number; t: number; card: HTMLElement; horizontal: boolean; dx: number } | null = null;
  let suppress = false;
  let suppressTimer = 0;
  const end = (flip: boolean) => {
    const d = drag;
    drag = null;
    if (!d) return;
    if (d.horizontal) {
      try { pile.releasePointerCapture(d.id); } catch { /* the pointer is already gone */ }
      delete d.card.dataset.dragging;
      if (flip) {
        suppress = true;
        window.clearTimeout(suppressTimer);
        suppressTimer = window.setTimeout(() => { suppress = false; }, 400);
        // Left is next and right is previous, like turning pages. Both wrap, so the pile loops in either direction.
        if (d.dx < 0) {
          // The card leaves from where the finger let go.
          d.card.style.setProperty('--dx', `${d.dx}px`);
          d.card.style.setProperty('--rot', `${d.dx / 20}deg`);
          go(1, -1);
        } else {
          // The card under the finger stays in the pile, so it must not keep the drag offset for a later flip.
          d.card.style.removeProperty('--dx');
          d.card.style.removeProperty('--rot');
          go(-1, 1);
        }
        return;
      }
    }
    d.card.style.removeProperty('--dx');
    d.card.style.removeProperty('--rot');
  };
  pile.addEventListener('pointerdown', (e) => {
    if (!on() || !e.isPrimary || (e.pointerType === 'mouse' && e.button !== 0)) return;
    suppress = false; // a press starts fresh: a swipe that fired no click must not swallow this tap
    if (drag) end(false); // a press released outside the pile sent no pointerup, so drop its stale drag
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, t: e.timeStamp, card: cards[i]!, horizontal: false, dx: 0 };
  });
  pile.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    if (!drag.horizontal) {
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
      if (Math.abs(dx) <= Math.abs(dy) * 1.5) { drag = null; return; } // vertical, or too diagonal: leave it to the page
      drag.horizontal = true;
      pile.setPointerCapture(e.pointerId);
      drag.card.dataset.dragging = '';
    }
    drag.dx = dx;
    drag.card.style.setProperty('--dx', `${dx}px`);
    drag.card.style.setProperty('--rot', `${dx / 20}deg`);
  });
  pile.addEventListener('pointerup', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dt = Math.max(1, e.timeStamp - drag.t);
    const speed = Math.abs(drag.dx) / dt; // px per ms
    end(drag.horizontal && (Math.abs(drag.dx) >= 48 || (Math.abs(drag.dx) >= 20 && speed > 0.5)));
  });
  pile.addEventListener('pointercancel', () => end(false));
  // The event bubbles, and the browser also reports the release of its implicit capture on the card, so only the pile's own counts.
  pile.addEventListener('lostpointercapture', (e) => { if (e.target === pile) end(false); });
  pile.addEventListener('click', (e) => {
    if (!suppress) return;
    suppress = false;
    e.preventDefault();
    e.stopPropagation();
  }, true);
  pile.addEventListener('dragstart', (e) => e.preventDefault()); // a link or picture must not start a native drag

  if (mq.addEventListener) mq.addEventListener('change', apply);
  else mq.addListener(apply);
  apply();
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

  root.querySelectorAll<HTMLElement>('[data-toon-deck]').forEach(initDeck);

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
