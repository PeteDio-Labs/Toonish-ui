// A test page that shows every component once. It is a fixture for the browser test, not documentation:
// the kit's documentation is docs/components.md. The portfolio's kit page was removed on 2026-11-14.
import { badge, bars, burst, chip, esc, figure, deck, kicker, letters, list, row, button, skipLink, shot, speedLines, stat, steps, strip, sfx, portrait, pager, delta, scale, scaleAxis, meter, meters, tabbar, tabpanel, disclosure, spark, uptime, line, statusTile, switchRow, verdict, readout, barsKey, chartTable, masthead, toggle, switchCard, settingsMenu } from '../src/markup.ts';

const icon = (d: string) => `<svg viewBox="0 0 20 20" focusable="false"><path d="${d}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const panelBody = (k: string): string => `${chip('Watching')}<p>Body text for the call.</p>` +
  meters([{ label: 'Evidence', value: 70, id: `${k}-evidence` }, { label: 'Reach', value: 35, tone: 'red', sub: 'vs US, was 42', id: `${k}-reach` }, { label: 'Spread', value: 0, tone: 'mist', id: `${k}-spread` }], { label: 'Vectors' }) +
  '<dl class="toon-kv"><dt>Basis</dt><dd>Two filings.</dd><dt class="toon-kv-warn">Risk</dt><dd>A source may retract.</dd></dl>' +
  '<div class="toon-note"><b>16 Nov:</b> Raised from 78 to 82.</div><p class="toon-meta">Last revised 16 Nov</p>';

export const fixture = (): string => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc('toonish-ui fixture')}</title>
<link rel="icon" href="data:,"><link rel="stylesheet" href="/dist/toonish.css"></head>
<body class="toon-dots">${skipLink('main')}<div class="toon-page" style="padding-bottom:var(--toon-tabbar-h)"><main id="main">
${masthead({ title: 'toonish-ui', eyebrow: 'Fixture', lede: 'Every component once, for the browser test.' })}
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
${list([row({ lead: 'Nov 12', title: 'Acme', sub: 'Analyst', aside: 'Email', dot: 'blue', leadTone: 'red' }), row({ lead: 'Nov 11', title: 'Globex', aside: 'Site', dot: 'red' })], { label: 'Applications' })}
${list([row({ lead: 'Compute', title: 'Proxmox', sub: 'three nodes' })], { label: 'Hosts', cls: 'toon-list-stack' }).replace('<div class="toon-list', '<div id="list-stack" class="toon-list')}
${list([row({ lead: 'Secrets', title: 'Vault', sub: 'short-lived credentials for CI and agents', aside: 'No stored CI secrets', icon: "<svg viewBox='0 0 48 48' focusable='false'><rect x='6' y='6' width='36' height='36' rx='6' fill='#f2c94c' stroke='#0a0a1f' stroke-width='2.5'/></svg>" }), row({ title: 'No lead, no aside', icon: "<svg viewBox='0 0 48 48' focusable='false'><circle cx='24' cy='24' r='16' fill='#5f8dff' stroke='#0a0a1f' stroke-width='2.5'/></svg>" })], { label: 'Services with icons' }).replace('<div class="toon-list', '<div id="list-icons" class="toon-list')}
<p id="btn-demo" class="flex flex-wrap gap-s4">${button({ label: 'Back to dashboard', href: '#top', kind: 'accent', direction: 'back' })}${button({ label: 'Next step', kind: 'primary', direction: 'next' })}${button({ label: 'Add service', kind: 'secondary', icon: 'plus' })}${button({ label: 'Delete', kind: 'danger', icon: 'check', attrs: { 'aria-disabled': 'true' } })}</p>
<div class="toon-empty">Nothing yet.</div>
<div class="toon-table-wrap"><table class="toon-table toon-table-text"><thead><tr><th>Name</th><th>What it does</th></tr></thead><tbody><tr><td>Alpha</td><td>A longer sentence of words that is allowed to wrap onto a second line on a narrow screen without scrolling.</td></tr></tbody></table></div>
<div class="toon-card" id="dividers">${bars({ label: 'Divider cases', columns: [
  { label: 'Bot', segments: [{ value: 1, tone: 'hatch', label: 'h' }, { value: 1, tone: 'blue', label: 'b' }] },
  { label: 'Mid', current: true, segments: [{ value: 1, tone: 'blue', label: 'b' }, { value: 1, tone: 'hatch', label: 'h' }, { value: 1, tone: 'red', label: 'r' }] },
  { label: 'Two', segments: [{ value: 1, tone: 'hatch', label: 'h' }, { value: 1, tone: 'hatch', label: 'h' }] },
  { label: 'Plain', segments: [{ value: 1, tone: 'blue', label: 'b' }, { value: 1, tone: 'red', label: 'r' }] },
  { label: 'Empty', segments: [] }] })}</div>
<div class="toon-card">${bars({ label: 'Week', target: 1, columns: [{ label: 'Mon', sub: '9', segments: [{ value: 0.6, tone: 'blue', label: 'Email' }, { value: 0.2, tone: 'hatch', label: 'Dropped' }] }, { label: 'Tue', sub: '10', current: true, segments: [{ value: 1.1, tone: 'red', label: 'Site' }] }, { label: 'Wed', sub: '11', segments: [] }] })}
<ul class="toon-bars-key"><li><i></i>Email</li><li><i style="--toon-dot:#f2706a"></i>Site</li></ul></div>
<div class="toon-table-wrap"><table class="toon-table"><thead><tr><th>Day</th><th>Email</th><th>Site</th></tr></thead><tbody><tr><td>Mon</td><td>3</td><td>0</td></tr><tr aria-current="date"><td>Tue</td><td>1</td><td>2</td></tr></tbody><tfoot><tr><td>Week</td><td>4</td><td>2</td></tr></tfoot></table></div></section>
<section id="nav"><div class="toon-nav" role="group" aria-label="Sample" data-toon-toggle><button type="button" aria-pressed="true">One</button><button type="button" aria-pressed="false">Two</button></div></section>
<section id="modal"><button id="open" class="toon-btn toon-btn-yellow" type="button" data-toon-modal-open="demo">Open</button>
<dialog id="demo" class="toon-modal" aria-modal="true" aria-labelledby="demo-title"><div class="toon-modal-box">
<div class="toon-modal-head"><h2 id="demo-title" class="toon-heading">POW!</h2><button type="button" class="toon-btn toon-btn-red toon-modal-x" data-toon-modal-close>Close</button></div>
<div class="toon-modal-body"><p>Modal body.</p><a id="more" class="toon-link" href="/page?v=2" data-toon-modal>More</a></div></div></dialog></section>
<section id="flow">
${kicker('01', 'The work', { link: { href: '#flow', text: 'All case studies' } })}
${strip([{ value: '1,200+', label: 'pull requests merged through the gate', href: '#flow' }, { value: 'Same day', label: 'platform rebuilt from code after a rack loss', href: '#flow' }, { value: '~594', label: 'packages patched across 21 guests in one run', href: '#flow' }, { value: '21', label: 'case studies, all with numbers', href: '#flow' }], { label: 'Proof' })}
${steps([{ title: 'One task, one session, one branch.', body: 'Each task gets its own session and its own branch.' }, { title: 'Nothing merges unreviewed.', body: 'Every pull request gets a review, and no session approves its own work.' }, { title: 'Declared, not hand-run.', body: 'Terraform builds it, and a repair is a config change before it is ever a script.' }], { label: 'How I work' })}
<div style="width:240px" id="portrait-box">${portrait({ src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="240" height="300"><ellipse cx="120" cy="300" rx="110" ry="120" fill="%23111"/><circle cx="120" cy="110" r="60" fill="%23111"/></svg>', alt: 'A sample cut-out', width: 240, height: 300, eager: true })}</div>
<div style="position:relative;height:120px" id="sfx-box">${sfx('MERGE!', 'red', { cls: 'left-0 top-0' })}${sfx('click', 'yellow', { size: 'sm', corner: true })}${sfx('SHIP!', 'blue', { size: 'lg', ghost: true })}</div>
<div class="toon-panel" id="panel">${kicker('03', 'About')}<div class="toon-bubble toon-bubble-left" id="bubble-left">Left tail.</div><div class="toon-bubble toon-bubble-up" id="bubble-up">Up tail.</div>
<img class="toon-tilt-l" id="tilt-l" alt="A tilted placeholder" width="120" height="120" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Crect width='120' height='120' fill='%23ccc'/%3E%3C/svg%3E"><div class="toon-frame toon-tilt-r" id="tilt-r" style="width:120px">Tilt right</div></div>
</section>
<section id="deck-demo">
${deck([
  '<article class="toon-card"><h3 class="m-0">Card one</h3><p>Short card.</p><a class="toon-link" id="deck-link" href="#tapped">Read one</a></article>',
  '<article class="toon-card"><h3 class="m-0">Card two</h3><p>A longer card with more words so the pile has a tallest card that sets the height of every other card in the stack.</p><a class="toon-link" href="#two">Read two</a></article>',
  '<article class="toon-card"><h3 class="m-0">Card three</h3><p>Third card.</p></article>',
], { label: 'Sample cards' })}
<p>Text after the deck.</p>
${deck(['<div class="toon-card">Always one</div>', '<div class="toon-card">Always two</div>'], { label: 'Always on', always: true, cols: 2, cls: 'deck-always' })}
${pager({ label: 'Sample pages', cls: 'pager-demo', prev: { href: '#prev', title: 'Recovering a burnt server from backups and config in git' }, next: { href: '#next', title: 'How this site is built and deployed: a private bucket, a strict policy and a deploy that checks itself, with a title long enough to be cut at two lines on a phone' } })}
</section>
<section id="desk"><h2 class="toon-heading">Desk</h2>
<p id="ground-deltas">${delta(4, { ground: true })} ${delta(-32, { ground: true })} ${delta(0, { ground: true })} ${delta(6, { ground: true, invert: true, unit: '%' })}</p>
<div class="toon-card" id="desk-card"><p>${delta(4)} ${delta(-32)} ${delta(0)} ${delta(1.5, { unit: '%', invert: true })}</p>
${scaleAxis()}
${scale({ value: 82, history: [70, 74, 78], label: 'P-01 scores 82, up 4 from 78' })}
${scale({ value: 12, history: [40, 30], owner: 'b', ticks: false, label: 'P-02 scores 12, down 18 from 30' })}
${scale({ value: 100, label: 'P-03 scores 100' })}
${scale({ value: 0, label: 'P-04 scores 0' })}
${scale({ value: null, label: 'P-05 has no score' })}
${meter({ label: 'Likelihood', value: 7, size: 'lg', tone: 'red', valueText: '~7%', scaleLabels: ['0 · coincidence', '50 · coin flip', '100 · confirmed op'], id: 'gauge' })}
${meter({ label: 'Of five', value: 3, max: 5, tone: 'violet', id: 'of-five' })}
<p>Trend ${spark([73, 75, 71, 78, 80, 79, 81, 82], { label: 'P-01', target: 50 })} and ${spark([10, 30, 20, 60], { label: 'P-02', size: 'lg', accent: 'red' })}</p>
<div class="toon-stats"><div class="toon-stat"><span class="toon-stat-label">Score</span><span class="toon-stat-value">82</span><span class="toon-stat-detail">${delta(4)} ${spark([73, 78, 82], { label: 'Score', accent: 'yellow' })}</span></div></div></div>
<h3 class="toon-heading">Calls</h3>
${list([
  disclosure({ id: 'p-01', lead: 'P-01', title: 'Ceasefire holds through March, with a title long enough to wrap onto a second line on a phone', badge: 'Hold', value: 82, delta: 4, tone: 'blue', owner: 'a', ownerLabel: 'Pedro', open: true, heading: 4, below: scale({ value: 82, history: [70, 74, 78], label: 'P-01 scores 82, up 4 from 78' }), panel: panelBody('a') }),
  disclosure({ id: 'p-02', lead: 'P-02', title: 'Grid outage ends by Friday', badge: { text: 'Lean', tone: 'violet' }, value: 12, delta: { value: -32, unit: '%' }, owner: 'b', ownerLabel: 'Claude', below: scale({ value: 12, history: [44], owner: 'b', label: 'P-02 scores 12, down 32 from 44' }), panel: panelBody('b') }),
  disclosure({ id: 'p-03', lead: 'P-03', title: 'No move this week', value: 50, delta: 0, native: true, panel: panelBody('c') }),
], { label: 'Calls' })}
</section>
<section id="dash"><h2 class="toon-heading">Dashboard</h2>
<div class="toon-card" id="dash-card">
${uptime({ label: 'Plex uptime', windowLabel: 'last 24 hours', cells: Array.from({ length: 96 }, (_, i) => ({ at: `2026-11-16T${String(Math.floor(i / 4)).padStart(2, '0')}:${String((i % 4) * 15).padStart(2, '0')}:00Z`, state: (i === 40 ? 'down' : i > 90 ? 'unknown' : 'ok') as 'ok' | 'down' | 'unknown', detail: i === 40 ? 'timeout after 5 s' : undefined })) })}
${line({ label: 'CVEs open', yUnit: 'CVEs', target: 5, series: [{ name: 'Critical', points: [3, 4, 4, 2, 3, 1, 0, 1].map((y, i) => ({ x: `2026-11-0${i + 1}`, y })) }, { name: 'High', points: [9, 8, 10, 7, 6, 6, 4, 3].map((y, i) => ({ x: `2026-11-0${i + 1}`, y })) }, { name: 'Medium', points: [12, 13, 11, 11, 9, 8, 8, 7].map((y, i) => ({ x: `2026-11-0${i + 1}`, y })) }] })}
${line({ label: 'Latency today', yUnit: 'ms', series: [{ name: 'p95', points: Array.from({ length: 30 }, (_, i) => ({ x: `2026-11-16T${String(Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}:00Z`, y: 120 + ((i * 37) % 80) })) }] })}
</div>
<div class="toon-tiles" id="tiles">${statusTile({ label: 'Services', value: '41 of 42', state: 'warn', delta: -1, readAt: '2026-11-16T14:02:00Z', detail: 'Vault sealed' })}${statusTile({ label: 'Plex', value: '12 ms', state: 'ok', readAt: '2026-11-16T14:02:00Z', extra: spark([10, 12, 11, 14], { label: 'Plex latency', min: 0, max: 20 }) })}${statusTile({ label: 'Backups', value: '2 failed', state: 'down', readAtText: '4 min ago' })}${statusTile({ label: 'Prometheus', state: 'unknown', readAt: '2026-11-16T09:00:00Z' })}</div>
<div id="switches" style="display:grid;gap:12px;margin-top:12px">${switchRow({ name: 'Authentik', hostname: 'auth.pdlab.dev', active: 'lab', labState: 'ok', cloudState: 'unknown', labAge: '4 min ago', cloudAge: '3 h ago', dataClass: 'stateless', canSwitch: false, reason: 'Cloud copy has not answered for 3 hours.', id: 'sw-a' })}${switchRow({ name: 'Dashboard', hostname: 'lab.pdlab.dev', active: 'cloud', labState: 'down', cloudState: 'ok', labAge: '1 min ago', cloudAge: '1 min ago', pinned: true, canSwitch: true, id: 'sw-b' })}</div>
</section>
<section id="answers"><h2 class="toon-heading">Answer first</h2>
${kicker('01', 'Is anything wrong?', { heading: 3 })}
<div id="verdicts" style="display:grid;gap:16px;margin:12px 0">${verdict({ state: 'ok', title: 'Nothing needs you', body: 'Every item was read and none asks for a step.', stateText: 'All clear' })}${verdict({ state: 'warn', title: '1 item needs you', id: 'v-warn' })}${verdict({ state: 'down', title: '2 services are down', body: 'Authentik and Plex do not answer on either side.' })}${verdict({ state: 'unknown', title: 'It is unknown whether anything needs you', body: 'The list was not read in full, or it is out of date.', heading: 4 })}</div>
${readout('Read 3 alerts, 4 services and 1 item that needs you, 30 hours ago. Source: fixture.').replace('<p class="toon-readout', '<p id="readout-ground" class="toon-readout')}
<div class="toon-card" id="answers-card" style="margin-top:16px">${bars({ label: 'Alerts per day', columns: [{ label: '11-15', segments: [{ value: 2, tone: 'red', label: 'needs you' }, { value: 3, tone: 'hatch', label: 'unreadable' }] }, { label: '11-16', segments: [{ value: 1, tone: 'mist', label: 'no action' }] }] })}
${barsKey([{ label: 'Needs you', tone: 'red' }, { label: 'No action', tone: 'mist' }, { label: 'Unreadable', tone: 'hatch' }])}
${chartTable({ caption: 'alerts per day', head: ['Day', 'Needs you', 'No action', 'Unreadable'], rows: [['2026-11-15', '2', '0', '3'], ['2026-11-16', '0', '1', '0']] })}
${readout('Read 2 days and 6 alerts.', { onPaper: true, label: 'Source' })}
${meter({ label: 'Probes healthy', value: 6, max: 8, tone: 'green', valueText: '6 of 8', id: 'm-green' })}
<p style="margin-top:12px">${toggle({ label: 'Motion: on', checked: true, off: 'Off', on: 'On', id: 'tg-free' })}</p></div>
<div id="settings-demo" style="display:flex;justify-content:flex-end;min-height:160px;margin-top:16px">${settingsMenu({ id: 'st-demo', items: [{ label: 'Secrets', href: '#secrets' }] })}</div>
<div id="toggles" style="display:grid;gap:12px;margin-top:16px">${switchRow({ name: 'Tracerr', hostname: 'trace.pdlab.dev', active: 'lab', labState: 'ok', cloudState: 'unknown', labAge: '1 min ago', dataClass: 'snapshot', canSwitch: false, reason: 'The cloud side is unknown. A switch needs it healthy first.', control: 'toggle', labels: { lab: 'Lab' }, id: 'tg-a' })}${switchRow({ name: 'Dashboard API', active: 'cloud', labState: 'ok', cloudState: 'ok', labAge: '1 min ago', cloudAge: '1 min ago', canSwitch: true, reason: 'Waits for your tap on lab-write.', control: 'toggle', labels: { lab: 'Lab' }, id: 'tg-b' })}</div>
<div id="switch-cards" style="display:grid;gap:12px;margin:16px 0">${switchCard({ name: 'tracerr', active: 'lab', labState: 'ok', cloudState: 'unknown', dataClass: 'snapshot', canSwitch: false, reason: 'The cloud side is unknown. A switch needs it healthy first.', labels: { lab: 'Lab' }, id: 'sc-a' })}${switchCard({ name: 'dashboard-api', active: 'cloud', labState: 'ok', cloudState: 'ok', canSwitch: true, reason: 'Waits for your tap on lab-write.', labels: { lab: 'Lab' }, id: 'sc-b' })}${switchCard({ name: 'plex', active: 'lab', labState: 'down', cloudState: 'unknown', pinned: true, canSwitch: false, reason: 'Pinned in the Lab. This service does not move.', id: 'sc-c' })}</div>
${list([disclosure({ id: 'n-01', lead: '01', title: 'Plex backup on pve03 failed', sub: 'The nightly job ended with an error, so no good copy exists from the last day.', note: '15 hours ago', tone: 'red', native: true, panel: '<p>Detail.</p><a class="toon-btn" href="#">Open</a>' })], { label: 'Notes' })}
</section>
<section id="tabs-demo"><h2 class="toon-heading">Tabs</h2>
${tabpanel('tab-board', '<p>Board panel.</p>')}${tabpanel('tab-brief', '<p>Brief panel.</p>')}${tabpanel('tab-record', '<p>Record panel.</p>')}
</section>
</main>${tabbar([{ id: 'tab-board', label: 'Board', icon: icon('M3 15V9M10 15V4M17 15v-8') }, { id: 'tab-brief', label: 'Brief', icon: icon('M4 5h12M4 10h12M4 15h8') }, { id: 'tab-record', label: 'Record' }], { label: 'Desk sections' })}<footer class="toon-footer"><p>Footer</p></footer></div>
<script src="/dist/toonish.js"></script></body></html>`;
