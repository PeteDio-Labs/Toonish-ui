// Layout audit: finds the visual bugs a reader spots by eye and an axe run cannot. It runs inside the page and returns
// a list of findings, each naming the element. It reads geometry only, so it costs no tokens and no screenshots.
//
//   svg-clipped   a drawing (fill or stroke) reaches past its svg viewport, so the svg's own overflow cuts it off
//   text-cut      a line of text is cut off by an ancestor with overflow hidden or clip
//   text-overlap  two lines of text from unrelated elements share pixels
//
// To allow a deliberate overlap or cut, put data-layout="ok" on the element or an ancestor. Keep a reason beside it.
// pdlabs-portfolio keeps a copy of this file (test/layout-audit.ts). Change it here first.

export type Finding = { rule: 'svg-clipped' | 'text-cut' | 'text-overlap'; what: string; detail: string };
export type AuditResult = { findings: Finding[]; svgs: number; textBoxes: number; clippers: number };

// Serialised into the page, so it uses nothing from this module.
export const audit = (): AuditResult => {
  const findings: { rule: 'svg-clipped' | 'text-cut' | 'text-overlap'; what: string; detail: string }[] = [];
  const name = (e: Element): string => {
    const id = e.id ? `#${e.id}` : '';
    const cls = typeof (e as HTMLElement).className === 'string' && (e as HTMLElement).className ? `.${(e as HTMLElement).className.trim().split(/\s+/).slice(0, 2).join('.')}` : '';
    const text = (e.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 30);
    return `${e.tagName.toLowerCase()}${id}${cls}${text ? ` "${text}"` : ''}`;
  };
  const allowed = (e: Element) => !!e.closest('[data-layout="ok"]');
  const shown = (e: Element) => {
    if (!e.getClientRects().length) return false;
    for (let n: Element | null = e; n; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) return false;
      if (n.hasAttribute('hidden') || (n.tagName === 'DETAILS' && !(n as HTMLDetailsElement).open && n !== e)) {
        // A closed details shows only its summary.
        if (n.hasAttribute('hidden')) return false;
        if (!e.closest('summary') && e !== n) return false;
      }
    }
    return true;
  };
  // Text kept for screen readers (sr-only, clip-path inset) is not drawn, so it cannot overlap or be cut.
  const hiddenInk = (e: Element) => {
    for (let n: Element | null = e; n && n !== document.body; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if ((cs.position === 'absolute' || cs.position === 'fixed') && ((parseFloat(cs.width) <= 1 && parseFloat(cs.height) <= 1) || cs.clipPath.startsWith('inset(50%') || (cs.clip !== 'auto' && cs.clip !== ''))) return true;
    }
    return false;
  };
  // Fixed and sticky bars sit over whatever scrolls beneath them, so their overlap depends on the scroll position.
  const pinned = (e: Element) => { for (let n: Element | null = e; n && n !== document.body; n = n.parentElement) { const p = getComputedStyle(n).position; if (p === 'fixed' || p === 'sticky') return true; } return false; };
  const clipsX = (cs: CSSStyleDeclaration) => cs.overflowX === 'hidden' || cs.overflowX === 'clip';
  const clipsY = (cs: CSSStyleDeclaration) => cs.overflowY === 'hidden' || cs.overflowY === 'clip';

  // 1. SVG drawings that reach past their viewport.
  let svgs = 0;
  for (const svg of document.querySelectorAll<SVGSVGElement>('svg')) {
    if (svg.parentElement?.closest('svg') || !shown(svg) || allowed(svg)) continue;
    // Speed lines, bursts and portrait backdrops bleed past their frame on purpose.
    if (svg.matches('.toon-speed, .toon-burst, .toon-portrait-bg') || svg.closest('.toon-burst')) continue;
    const box = svg.getBoundingClientRect();
    if (!box.width || !box.height) continue;
    const cs = getComputedStyle(svg);
    if (cs.overflow === 'visible') continue;
    svgs++;
    const out: string[] = [];
    for (const el of svg.querySelectorAll<SVGGraphicsElement>('path, rect, circle, ellipse, line, polyline, polygon, text, use, image')) {
      if (el.closest('defs, clipPath, mask, symbol, pattern, marker')) continue;
      const ecs = getComputedStyle(el);
      if (ecs.display === 'none' || ecs.visibility === 'hidden') continue;
      const r = el.getBoundingClientRect();
      if (!r.width && !r.height) continue;
      // getBoundingClientRect on svg shapes leaves the stroke out, so add half of it back.
      const vb = svg.viewBox.baseVal;
      const scale = vb && vb.width ? box.width / vb.width : 1;
      const half = ecs.stroke !== 'none' ? (parseFloat(ecs.strokeWidth) || 0) * scale / 2 : 0;
      const over = Math.max(box.left - (r.left - half), box.top - (r.top - half), (r.right + half) - box.right, (r.bottom + half) - box.bottom);
      if (over > 0.75) out.push(`${el.tagName.toLowerCase()} past the viewport by ${over.toFixed(1)}px`);
    }
    if (out.length) findings.push({ rule: 'svg-clipped', what: name(svg.parentElement ?? svg), detail: [...new Set(out)].slice(0, 3).join('; ') });
  }

  // 2 and 3. Collect every line box of visible text, in page coordinates.
  type Box = { el: Element; l: number; t: number; r: number; b: number };
  const boxes: Box[] = [];
  const clippers = new Set<Element>();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    let el = n.parentElement;
    // Comic lettering sets each letter in its own overlapping span, so it counts as one box.
    el = el?.closest('.toon-type, .toon-sfx') ?? el;
    // A deck stacks its cards on purpose; only the front card is read.
    const pos = el?.closest('.toon-deck-card');
    if (pos && el?.closest('.toon-deck[data-toon-deck-on]') && pos.getAttribute('data-pos') !== '0') continue;
    if (!el || !(n.textContent ?? '').trim() || el.closest('svg, script, style, noscript, template, .sr-only, .toon-masthead-sr, .toon-sr') || !shown(el) || hiddenInk(el) || pinned(el) || allowed(el)) continue;
    const range = document.createRange();
    range.selectNodeContents(n);
    for (const q of range.getClientRects()) {
      if (q.width < 1 || q.height < 1) continue;
      // Lettering is rotated and raised, so its line box is taller than its ink. Count the middle 70% of its height.
      const trim = el.matches('.toon-type, .toon-sfx') ? q.height * 0.15 : 0;
      const box = { el, l: q.left + scrollX, t: q.top + scrollY + trim, r: q.right + scrollX, b: q.bottom + scrollY - trim };
      boxes.push(box);
      // text-cut: walk up to the first ancestors that clip, and compare the line box with their padding box.
      for (let a: Element | null = el; a && a !== document.documentElement; a = a.parentElement) {
        const cs = getComputedStyle(a);
        // Content inside a scroller is reachable by scrolling, so a box beyond its edge is not cut.
        if (/auto|scroll/.test(cs.overflowX + cs.overflowY)) break;
        if (!clipsX(cs) && !clipsY(cs)) continue;
        // A native scroll container with text-overflow is cut on purpose.
        if (cs.textOverflow === 'ellipsis' || cs.getPropertyValue('-webkit-line-clamp') !== 'none') continue;
        // Lettering is rotated and raised on purpose, so its line boxes reach past the ink.
        if (el.matches('.toon-type, .toon-sfx')) continue;
        const c = a.getBoundingClientRect();
        const bw = (s: string) => parseFloat(s) || 0;
        const left = c.left + bw(cs.borderLeftWidth), right = c.right - bw(cs.borderRightWidth), top = c.top + bw(cs.borderTopWidth), bottom = c.bottom - bw(cs.borderBottomWidth);
        // The kit's page wrapper clips the horizontal axis at the viewport on purpose; the overflow check covers that case.
        const cutX = clipsX(cs) && (q.right > right + 1 || q.left < left - 1);
        const cutY = clipsY(cs) && (q.bottom > bottom + 1 || q.top < top - 1);
        if (cutX || cutY) {
          clippers.add(a);
          if (!allowed(a)) findings.push({ rule: 'text-cut', what: name(el), detail: `cut by ${name(a)} on the ${cutX ? 'x' : 'y'} axis` });
          break;
        }
      }
    }
  }

  // text-overlap: two line boxes from unrelated elements. An ancestor and its own text share pixels by design.
  const seen = new Set<string>();
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i]!, b = boxes[j]!;
      if (a.el === b.el || a.el.contains(b.el) || b.el.contains(a.el)) continue;
      const w = Math.min(a.r, b.r) - Math.max(a.l, b.l), h = Math.min(a.b, b.b) - Math.max(a.t, b.t);
      // 3 px of slack: line boxes of tight type touch by a pixel or two without overlapping the glyphs.
      if (w <= 3 || h <= 3) continue;
      const key = `${name(a.el)}|${name(b.el)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      findings.push({ rule: 'text-overlap', what: name(a.el), detail: `overlaps ${name(b.el)} by ${Math.round(w)}x${Math.round(h)}px` });
    }
  }
  return { findings, svgs, textBoxes: boxes.length, clippers: clippers.size };
};

// Compares two PNGs in the browser, so the check needs no image library. Returns the share of pixels that differ
// by more than `tolerance` in any channel, or null when the sizes differ.
export const diffPngs = ({ a, b, tolerance }: { a: string; b: string; tolerance: number }): Promise<{ ratio: number; w: number; h: number; sizeMismatch: boolean; diff: string }> => {
  const load = (src: string) => new Promise<HTMLImageElement>((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('image failed to load')); i.src = src; });
  return Promise.all([load(a), load(b)]).then(([x, y]) => {
    const w = Math.max(x.width, y.width), h = Math.max(x.height, y.height);
    const px = (img: HTMLImageElement) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d')!; g.drawImage(img, 0, 0); return g.getImageData(0, 0, w, h); };
    const da = px(x), db = px(y);
    const out = document.createElement('canvas'); out.width = w; out.height = h;
    const og = out.getContext('2d')!; const od = og.createImageData(w, h);
    let bad = 0;
    for (let i = 0; i < da.data.length; i += 4) {
      const d = Math.max(Math.abs(da.data[i]! - db.data[i]!), Math.abs(da.data[i + 1]! - db.data[i + 1]!), Math.abs(da.data[i + 2]! - db.data[i + 2]!), Math.abs(da.data[i + 3]! - db.data[i + 3]!));
      if (d > tolerance) { bad++; od.data[i] = 255; od.data[i + 1] = 0; od.data[i + 2] = 80; od.data[i + 3] = 255; }
      else { od.data[i] = da.data[i]!; od.data[i + 1] = da.data[i + 1]!; od.data[i + 2] = da.data[i + 2]!; od.data[i + 3] = 60; }
    }
    og.putImageData(od, 0, 0);
    return { ratio: bad / (w * h), w, h, sizeMismatch: x.width !== y.width || x.height !== y.height, diff: out.toDataURL('image/png') };
  });
};
