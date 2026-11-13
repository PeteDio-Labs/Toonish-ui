// A test page that shows every component once. It is a fixture for the browser test, not documentation:
// the kit's documentation page is /ui.html on pdlab.dev.
import { badge, bars, burst, chip, esc, figure, letters, row, shot, speedLines, stat } from '../src/markup.ts';

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
<section id="shot">${shot({ src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect width='400' height='200' fill='%23ccc'/%3E%3C/svg%3E", alt: 'A grey placeholder', width: 400, height: 200, caption: 'Real exchange, names redacted', badge: 'Real', accent: 'yellow', transcript: 'You: hello\nBot: hi', open: true })}</section>
<section id="data"><div class="toon-stats">${stat('Total', '42', 'this week')}${stat('Rate', '71%')}${stat('Best', 'Tue')}</div>
<p>${badge('Open', 'blue', 12)} ${badge('Done', 'mist', 3)} ${badge('Hold', 'paper')} ${chip('Remote')}</p>
<div class="toon-list">${row({ lead: 'Nov 12', title: 'Acme', sub: 'Analyst', aside: 'Email', dot: 'blue' })}${row({ lead: 'Nov 11', title: 'Globex', aside: 'Site', dot: 'red' })}</div>
<div class="toon-empty">Nothing yet.</div>
<div class="toon-table-wrap"><table class="toon-table toon-table-text"><thead><tr><th>Name</th><th>What it does</th></tr></thead><tbody><tr><td>Alpha</td><td>A longer sentence of words that is allowed to wrap onto a second line on a narrow screen without scrolling.</td></tr></tbody></table></div>
<div class="toon-card">${bars({ label: 'Week', target: 1, columns: [{ label: 'Mon', sub: '9', segments: [{ value: 0.6, tone: 'blue', label: 'Email' }, { value: 0.2, tone: 'hatch', label: 'Dropped' }] }, { label: 'Tue', sub: '10', current: true, segments: [{ value: 1.1, tone: 'red', label: 'Site' }] }, { label: 'Wed', sub: '11', segments: [] }] })}
<ul class="toon-bars-key"><li><i></i>Email</li><li><i style="--toon-dot:#f2706a"></i>Site</li></ul></div>
<div class="toon-table-wrap"><table class="toon-table"><thead><tr><th>Day</th><th>Email</th><th>Site</th></tr></thead><tbody><tr><td>Mon</td><td>3</td><td>0</td></tr><tr aria-current="date"><td>Tue</td><td>1</td><td>2</td></tr></tbody><tfoot><tr><td>Week</td><td>4</td><td>2</td></tr></tfoot></table></div></section>
<section id="nav"><div class="toon-nav" role="group" aria-label="Sample" data-toon-toggle><button type="button" aria-pressed="true">One</button><button type="button" aria-pressed="false">Two</button></div></section>
<section id="modal"><button id="open" class="toon-btn toon-btn-yellow" type="button" data-toon-modal-open="demo">Open</button>
<dialog id="demo" class="toon-modal" aria-modal="true" aria-labelledby="demo-title"><div class="toon-modal-box">
<div class="toon-modal-head"><h2 id="demo-title" class="toon-heading">POW!</h2><button type="button" class="toon-btn toon-btn-red toon-modal-x" data-toon-modal-close>Close</button></div>
<div class="toon-modal-body"><p>Modal body.</p><a id="more" class="toon-link" href="/page?v=2" data-toon-modal>More</a></div></div></dialog></section>
</main><footer class="toon-footer"><p>Footer</p></footer></div>
<script src="/dist/toonish.js"></script></body></html>`;
