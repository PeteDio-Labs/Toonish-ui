// A test page that shows every component once. It is a fixture for the browser test, not documentation:
// the kit's documentation page is /ui.html on pdlab.dev.
import { burst, esc, figure, letters, speedLines } from '../src/markup.ts';

export const fixture = (): string => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc('toonish-ui fixture')}</title>
<link rel="icon" href="data:,"><link rel="stylesheet" href="/dist/toonish.css"></head>
<body><div class="toon-page"><main>
<h1>${letters('toonish-ui', 'yellow', { live: true })}</h1>
<section id="buttons"><h2 class="toon-heading">Buttons</h2>
<button class="toon-btn" type="button">Blue</button> <button class="toon-btn toon-btn-red" type="button">Red</button>
<button class="toon-btn toon-btn-yellow" type="button">Yellow</button> <button class="toon-btn toon-btn-paper toon-wiggle" type="button">Paper</button></section>
<section id="cards"><div class="toon-card"><span class="toon-badge">Badge</span><p>A card.</p><a class="toon-link" href="#cards">A link</a></div>
<div class="toon-card">${figure('214', 'blue', 52, 200)}</div></section>
<section id="comic"><div style="position:relative">${speedLines('toon-speed-hero')}<div class="toon-frame"><span class="toon-caption">Caption</span><p>A panel.</p></div></div><div style="position:relative;width:160px;height:160px">${burst('red', 'toon-burst-spin')}</div>
<div class="toon-bubble">A bubble.</div><div class="toon-callout">A callout.</div></section>
<section id="nav"><div class="toon-nav" role="group" aria-label="Sample" data-toon-toggle><button type="button" aria-pressed="true">One</button><button type="button" aria-pressed="false">Two</button></div></section>
<section id="modal"><button id="open" class="toon-btn toon-btn-yellow" type="button" data-toon-modal-open="demo">Open</button>
<dialog id="demo" class="toon-modal" aria-modal="true" aria-labelledby="demo-title"><div class="toon-modal-box">
<div class="toon-modal-head"><h2 id="demo-title" class="toon-heading">POW!</h2><button type="button" class="toon-btn toon-btn-red toon-modal-x" data-toon-modal-close>Close</button></div>
<div class="toon-modal-body"><p>Modal body.</p></div></div></dialog></section>
</main><footer class="toon-footer"><p>Footer</p></footer></div>
<script src="/dist/toonish.js"></script></body></html>`;
