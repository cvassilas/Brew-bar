'use strict';
/* Brew Bar — coffee recipes for the Timemore 064S, Bookoo Themis Ultra over Web Bluetooth, and GitHub-gist sync. */

/* ---------- Icons ---------- */
const ICON = {
  espresso:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 20h22v8a11 11 0 0 1-22 0z"/><path d="M32 22h3a4 4 0 0 1 0 8h-3"/><path d="M6 42h32"/><path d="M17 8c0 3 2 3 2 6M24 8c0 3 2 3 2 6"/></svg>',
  moka:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"><path d="M15 6h18l-3 16H18z"/><path d="M14 22h20M18 22l-4 20h20l-4-20"/><path d="M33 9h4l-2 9"/><path d="M15 6l-3 4"/></svg>',
  briki:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"><path d="M12 16h18l-2 4v14a6 6 0 0 1-6 6h-2a6 6 0 0 1-6-6V20z"/><path d="M30 18l14-6"/><path d="M12 16l-4-2"/></svg>',
  v60:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"><path d="M8 10h32L26 32h-4z"/><path d="M18 32h12v4H18z"/><path d="M14 40h20"/><path d="M40 12h3a3 3 0 0 1 0 6h-6"/><path d="M19 16l5 10 5-10"/></svg>',
  cafetiere:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"><path d="M13 12h20v28H13z"/><path d="M23 4v14M17 18h12"/><path d="M33 16h4v18h-4"/><path d="M13 28h20"/></svg>',
  aeropress:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"><path d="M16 4h16M18 4v14M30 4v14"/><path d="M14 16h20v20H14z"/><path d="M12 36h24"/><path d="M16 40h16"/></svg>'
};

const $ = id => document.getElementById(id);
const mmss = s => { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
const r0 = n => Math.round(n), r1 = n => Math.round(n * 10) / 10;
const clamp = (v, mn, mx) => Math.min(mx, Math.max(mn, v));
const microns = g => Math.round(235 + g * 50);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------- Recipes ----------
   Grind = Timemore Sculptor 064S dial (0–16, stepless). Steps: [seconds, text, targetWeight?] */
const BREWERS = {
  espresso: { name: 'Espresso', gear: 'Ascaso Uno PID · Timemore 064S', kind: 'espresso',
    p: { dose: [14, 22, .1, 18], grind: [0, 16, .1, 2.2], temp: [86, 96, 1, 93], out: [20, 60, .5, 38], time: [15, 45, 1, 28] },
    taste: [['Sour / salty', 'Under-extracted. Grind finer to slow the shot, and nudge the temperature up.', { grind: -.2, temp: 1 }],
      ['Bitter / burnt', 'Over-extracted. Grind coarser and drop the temperature a degree.', { grind: .2, temp: -1 }],
      ['Thin / watery', 'Too much water for the dose. Pull a shorter, more concentrated shot.', { out: -4 }],
      ['Too intense', 'Lengthen the ratio to open it up and soften the edges.', { out: 4 }],
      ['Dry / astringent', 'Usually channelling. Go a touch coarser and take more care distributing.', { grind: .1 }],
      ['Hollow / flat', 'Brighten it with a hotter shot and slightly longer ratio.', { temp: 1, out: 2 }]],
    tip: 'Fast and sour: grind finer. Slow and bitter: grind coarser. Light roasts like George Street like 94–95°C and a longer 1:2.3–2.5 ratio; Assembly blend is happier around 92°C at 1:2.',
    steps: s => [
      [0, `Grind ${s.dose} g at ${s.grind}. Distribute and tamp level.`],
      [0, `Set the PID to ${s.temp}°C and flush the group for a couple of seconds.`],
      [0, `Cup on the scale. Lock in, start the shot and the timer together.`],
      [Math.max(0, s.time - 5), `Watch for blonding. Get ready to stop.`],
      [s.time, `Stop at ${s.out} g in the cup. Target ${mmss(s.time)}.`, s.out]] },
  moka: { name: 'Moka pot', gear: 'Stovetop · Timemore 064S', kind: 'water',
    p: { dose: [10, 22, .5, 16], grind: [0, 16, .1, 3.8], temp: [60, 100, 1, 90], water: [100, 300, 5, 170], time: [90, 360, 10, 180] },
    taste: [['Sour / thin', 'Under-extracted. Grind finer.', { grind: -.3 }],
      ['Bitter / burnt', 'Grind coarser and start with hotter water so it spends less time on the heat.', { grind: .3, temp: 5, time: -20 }],
      ['Metallic / cooked', 'Too long on the stove. Hotter water in the base and pull it off sooner.', { temp: 5, time: -20 }],
      ['Weak', 'Fill the basket fuller: more coffee.', { dose: 1 }],
      ['Too strong', 'Use a little less coffee.', { dose: -1 }]],
    tip: 'Starting with just-off-the-boil water shortens the time the grounds sit on the heat and avoids a cooked, metallic taste. Fill the basket level without tamping.',
    steps: s => [
      [0, `Boil the kettle and let it settle to ${s.temp}°C. Weigh ${s.water} g into the base, just under the valve.`, s.water],
      [0, `Grind ${s.dose} g at ${s.grind}. Fill the basket and level it with a finger. Don't tamp.`],
      [0, `Screw it together with a tea towel (it's hot) and put it on medium-low heat, lid open.`],
      [r0(s.time * .55), `Coffee starts to flow. It should run like warm honey.`],
      [s.time, `As soon as it turns pale and starts to gurgle, take it off and cool the base under a cold tap.`]] },
  briki: { name: 'Greek coffee', gear: 'Briki · Timemore 064S', kind: 'water', sugar: true, cups: [1, 2, 1],
    p: { dose: [5, 22, .5, 7], grind: [0, 16, .1, 0], temp: [5, 40, 1, 18], water: [50, 250, 5, 75], time: [120, 360, 10, 210] },
    taste: [['Bitter / burnt', 'Heating too fast or it boiled. Slower, gentler heat.', { time: 30 }],
      ['Little kaimaki', 'Grind as fine as possible and heat more slowly so the foam builds.', { grind: -.5, time: 30 }],
      ['Weak', 'A heaped spoon more coffee.', { dose: 1 }],
      ['Too strong / muddy', 'Less coffee for the same water.', { dose: -1 }]],
    tip: 'The 064S can\'t quite reach true Greek/Turkish powder (its finest is around 235 µm), so run it at zero and expect a little less kaimaki than with pre-ground Greek coffee.',
    steps: s => [
      [0, `Grind ${s.dose} g at ${s.grind} (finest).`],
      [0, `Weigh ${s.water} g of cold water (${s.temp}°C) into the briki${s.sugarTxt}. Stir in the coffee until no dry clumps remain.`, s.water],
      [0, `Low heat. Don't stir again from here.`],
      [r0(s.time * .75), `Foam (kaimaki) rises and the surface starts to crack at the edges.`],
      [s.time, `Just before it boils over, take it off. Spoon the foam into the cup${s.cups > 1 ? 's' : ''} first, then pour slowly.`]] },
  v60: { name: 'V60', gear: 'Hario V60 02 · Timemore 064S', kind: 'ratio', cups: [1, 2, 1],
    /* Planned pour curve for pace coaching: bloom, then two pours at a steady ~6 g/s from a centred spiral. */
    pourPlan: s => { const rate = 6, b = r0(s.dose * 2.5), h = r0(s.water * .6);
      let t = 0, from = 0; const pours = [];
      for (const [st, to] of [[0, b], [45, h], [75, s.water]]) {
        const start = pours.length ? Math.max(st, t + 5) : 0, end = start + (to - from) / rate;
        pours.push({ start, end, from, to }); t = end; from = to; }
      return { rate, pours }; },
    p: { dose: [10, 30, .5, 15], grind: [0, 16, .1, 5], temp: [85, 100, 1, 94], ratio: [13, 18, .5, 16], time: [150, 270, 5, 210] },
    taste: [['Sour / sharp', 'Under-extracted. Grind finer and brew hotter.', { grind: -.5, temp: 2 }],
      ['Bitter / harsh', 'Over-extracted. Grind coarser and cool the water slightly.', { grind: .5, temp: -2 }],
      ['Weak / watery', 'Tighten the ratio for a stronger cup.', { ratio: -1 }],
      ['Heavy / too strong', 'Loosen the ratio.', { ratio: 1 }],
      ['Dry / astringent', 'Fines clogging the bed. Go coarser and pour more gently.', { grind: .5 }],
      ['Flat / muted', 'Light roasts need heat. Hotter and a touch finer.', { temp: 2, grind: -.3 }]],
    tip: 'Drawdown long and flat-tasting: grind coarser. Fast and thin: grind finer. London tap water mutes light roasts; filtered or remineralised water makes a bigger difference here than anywhere else.',
    steps: s => { const b = r0(s.dose * 2.5), h = r0(s.water * .6); return [
      [0, `Rinse the paper and dump the water. Grind ${s.dose} g at ${s.grind}. Water at ${s.temp}°C. Tare with the coffee in.`],
      [0, `Bloom: pour to ${b} g, swirl to wet all the grounds.`, b],
      [45, `Pour steadily to ${h} g in slow circles.`, h],
      [75, `Pour to ${s.water} g. Give a gentle swirl to flatten the bed.`, s.water],
      [s.time, `Drawdown finished around ${mmss(s.time)}.`]]; } },
  cafetiere: { name: 'Cafetière', gear: 'French press · Timemore 064S', kind: 'ratio', cups: [1, 4, 2],
    p: { dose: [15, 60, 1, 30], grind: [0, 16, .1, 12], temp: [88, 100, 1, 96], ratio: [12, 18, .5, 16], time: [240, 600, 15, 480] },
    taste: [['Sour / thin', 'Grind finer and give it longer.', { grind: -.5, time: 60 }],
      ['Bitter / harsh', 'Grind coarser.', { grind: .5 }],
      ['Muddy / silty', 'Coarser grind and pour more slowly at the end.', { grind: .7 }],
      ['Weak', 'Tighten the ratio.', { ratio: -1 }],
      ['Too strong', 'Loosen the ratio.', { ratio: 1 }]],
    tip: 'The long-steep method gives a clean cup without sludge: don\'t plunge to the bottom, just push the mesh to the surface and pour gently.',
    steps: s => [
      [0, `Grind ${s.dose} g at ${s.grind}. Water at ${s.temp}°C. Tare with the coffee in.`],
      [0, `Pour all ${s.water} g, and leave it.`, s.water],
      [240, `Break the crust, stir gently and skim off the foam and floating bits.`],
      [s.time, `Press the plunger just to the surface and pour slowly.`]] },
  aeropress: { name: 'AeroPress', gear: 'Inverted or standard · Timemore 064S', kind: 'ratio',
    p: { dose: [11, 20, .5, 15], grind: [0, 16, .1, 5.5], temp: [80, 100, 1, 92], ratio: [11, 17, .5, 15], time: [90, 240, 5, 150] },
    taste: [['Sour / sharp', 'Grind finer, hotter water, steep a little longer.', { grind: -.5, temp: 2, time: 15 }],
      ['Bitter / harsh', 'Grind coarser, cooler water, shorter steep.', { grind: .5, temp: -3, time: -15 }],
      ['Weak', 'Tighten the ratio.', { ratio: -1 }],
      ['Too strong', 'Loosen the ratio, or dilute after pressing.', { ratio: 1 }],
      ['Dry / astringent', 'Go coarser and press more gently.', { grind: .5 }]],
    tip: 'Lower temperatures (80–88°C) tame darker roasts; light roasts want 92°C+. The AeroPress holds about 250 g of water, so stay under that.',
    steps: s => [
      [0, `Rinse the paper. Grind ${s.dose} g at ${s.grind}. Water at ${s.temp}°C. Tare with the coffee in.`],
      [0, `Pour ${s.water} g${s.water > 250 ? ' (that\'s over capacity, reduce it)' : ''}, stir three times.`, s.water],
      [10, `Put the plunger in an inch to make a seal and stop the drip.`],
      [Math.max(10, s.time - 30), `Swirl gently, then press slowly for about 30 s.`],
      [s.time, `Stop at the hiss. Dilute to taste if you like.`]] }
};
const LABELS = { dose: ['Bean weight', 'g'], grind: ['Grind (064S dial)', ''], out: ['Espresso out', 'g'],
  water: ['Water', 'g'], ratio: ['Ratio', '1 :'], time: ['Time', ''],
  temp: { espresso: ['Machine temp', '°C'], briki: ['Starting water', '°C'], moka: ['Kettle water', '°C'], _: ['Water temp', '°C'] } };
const SUGAR = [['Sketos', 'no sugar', 0], ['Metrios', '1 tsp', 1], ['Glykos', '2 tsp', 2]];
const recKeys = id => Object.keys(BREWERS[id].p).concat(BREWERS[id].sugar ? ['sugar'] : [], BREWERS[id].cups ? ['cups'] : []);
const sameRec = (id, a, b) => !!a && !!b && recKeys(id).every(k => a[k] === b[k]);

/* ---------- Local store ---------- */
const LS = {
  get(k, d) { try { const v = JSON.parse(localStorage.getItem('brewbar:' + k)); return v ?? d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('brewbar:' + k, JSON.stringify(v)); } catch (e) {} }
};
let DATA = LS.get('data', { recipes: {} });
if (!DATA.recipes) DATA = { recipes: {} };

function stateFor(id) {
  const b = BREWERS[id], saved = DATA.recipes[id] || {}, s = {};
  for (const k in b.p) { const [mn, mx, , d] = b.p[k]; const v = saved[k]; s[k] = (typeof v === 'number' && v >= mn && v <= mx) ? v : d; }
  if (b.sugar) s.sugar = typeof saved.sugar === 'number' ? saved.sugar : 1;
  if (b.cups) { const [mn, mx, d] = b.cups; s.cups = (typeof saved.cups === 'number' && saved.cups >= mn && saved.cups <= mx) ? saved.cups : d; }
  return s;
}
function saveRecipe(id, s) {
  if (sameRec(id, DATA.recipes[id], s)) return;
  const rec = {}; recKeys(id).forEach(k => rec[k] = s[k]); rec.updatedAt = Date.now();
  DATA.recipes[id] = rec; LS.set('data', DATA); Sync.schedule();
}
function derive(id, s) {
  const b = BREWERS[id], d = { ...s };
  d.dose = r1(s.dose); d.grind = s.grind.toFixed(1);
  if (b.kind === 'ratio') { d.water = r0(s.dose * s.ratio); d.r = s.ratio; }
  if (b.kind === 'water') d.r = r1(s.water / s.dose);
  if (b.kind === 'espresso') d.r = r1(s.out / s.dose);
  if (b.sugar) d.sugarTxt = s.sugar ? ` with ${s.sugar * (s.cups || 1)} tsp sugar` : '';
  return d;
}

/* ---------- Gist sync ---------- */
const Sync = {
  cfg: LS.get('sync', { token: '', gistId: '' }),
  state: 'off', msg: '', last: 0, timer: null, busy: false, FILE: 'brewbar.json',
  get on() { return !!this.cfg.gistId; },
  get canWrite() { return !!(this.cfg.token && this.cfg.gistId); },
  async api(path, opts = {}) {
    const h = { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
    if (this.cfg.token) h.Authorization = 'Bearer ' + this.cfg.token;
    if (opts.body) h['Content-Type'] = 'application/json';
    const r = await fetch('https://api.github.com' + path, { ...opts, headers: h, cache: 'no-store' });
    if (!r.ok) {
      const why = r.status === 401 ? 'The token was rejected. Check it has the gist scope.'
        : r.status === 404 ? 'Gist not found. Check the ID (and the token, if the gist is private to it).'
        : r.status === 403 ? 'GitHub rate limit reached. It will retry shortly.' : `GitHub error ${r.status}.`;
      throw new Error(why);
    }
    return r.json();
  },
  merge(remote) {
    let changed = false, localNewer = false;
    const rr = (remote && remote.recipes) || {};
    for (const id of Object.keys(BREWERS)) {
      const a = DATA.recipes[id], b = rr[id];
      if (b && (!a || (b.updatedAt || 0) > (a.updatedAt || 0))) { DATA.recipes[id] = b; changed = true; }
      else if (a && (!b || (a.updatedAt || 0) > (b.updatedAt || 0))) localNewer = true;
    }
    if (changed) LS.set('data', DATA);
    return { changed, localNewer };
  },
  async pull() {
    const g = await this.api('/gists/' + this.cfg.gistId);
    const f = g.files && g.files[this.FILE];
    if (!f) return {};
    let txt = f.content;
    if (f.truncated) txt = await (await fetch(f.raw_url, { cache: 'no-store' })).text();
    try { return JSON.parse(txt); } catch (e) { return {}; }
  },
  async run(pushToo) {
    if (!this.on || this.busy) return;
    this.busy = true; this.setState('busy');
    try {
      const { changed, localNewer } = this.merge(await this.pull());
      if (changed) onRemoteData();
      if ((localNewer || pushToo) && this.canWrite) {
        await this.api('/gists/' + this.cfg.gistId, { method: 'PATCH',
          body: JSON.stringify({ files: { [this.FILE]: { content: JSON.stringify({ app: 'brew-bar', v: 1, recipes: DATA.recipes }, null, 1) } } }) });
      }
      this.last = Date.now(); this.msg = ''; this.setState(this.canWrite ? 'on' : 'ro');
    } catch (e) { this.msg = e.message; this.setState('err'); }
    this.busy = false;
  },
  schedule() { if (!this.canWrite) return; clearTimeout(this.timer); this.timer = setTimeout(() => this.run(true), 1500); },
  async create() {
    const g = await this.api('/gists', { method: 'POST', body: JSON.stringify({ description: 'Brew Bar settings', public: false,
      files: { [this.FILE]: { content: JSON.stringify({ app: 'brew-bar', v: 1, recipes: DATA.recipes }, null, 1) } } }) });
    return g.id;
  },
  setState(st) {
    this.state = st;
    const dot = $('sync-dot'), lab = $('sync-label');
    dot.className = 'dot' + (st === 'on' || st === 'ro' ? ' on' : st === 'busy' ? ' busy' : st === 'err' ? ' err' : '');
    lab.textContent = st === 'off' ? 'Sync off' : st === 'busy' ? 'Syncing…' : st === 'err' ? 'Sync problem'
      : st === 'ro' ? 'Synced (read only)' : 'Synced';
  }
};
setInterval(() => { if (Sync.on && document.visibilityState === 'visible' && !pendingEdit()) Sync.run(false); }, 45000);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && Sync.on) Sync.run(false); });

function openSync() {
  const d = $('sync-dlg');
  $('sync-token').value = Sync.cfg.token; $('sync-gist').value = Sync.cfg.gistId;
  $('sync-msg').textContent = Sync.msg || (Sync.on ? (Sync.canWrite ? 'Syncing with edit access.' : 'Read only: add your token on this phone to make changes that sync.') : '');
  d.showModal();
}
$('sync-btn').onclick = openSync;
$('sync-cancel').onclick = () => $('sync-dlg').close();
$('sync-copy').onclick = async () => {
  const v = $('sync-gist').value.trim(); if (!v) return;
  try { await navigator.clipboard.writeText(v); $('sync-msg').textContent = 'Gist ID copied.'; } catch (e) { $('sync-gist').select(); }
};
$('sync-off').onclick = () => { Sync.cfg = { token: '', gistId: '' }; LS.set('sync', Sync.cfg); Sync.setState('off'); $('sync-dlg').close(); };
$('sync-save').onclick = async () => {
  const token = $('sync-token').value.trim();
  let gistId = $('sync-gist').value.trim().replace(/^.*gist\.github\.com\/(?:[^/]+\/)?/, '').replace(/[^0-9a-f]/gi, '');
  const msg = $('sync-msg');
  if (!token && !gistId) { msg.textContent = 'Add your token to create a sync gist, or a gist ID to follow one.'; return; }
  Sync.cfg = { token, gistId }; LS.set('sync', Sync.cfg);
  try {
    if (!gistId) { msg.textContent = 'Creating the sync gist…'; gistId = await Sync.create(); Sync.cfg.gistId = gistId; LS.set('sync', Sync.cfg); $('sync-gist').value = gistId; }
    msg.textContent = 'Syncing…';
    await Sync.run(true);
    msg.textContent = Sync.state === 'err' ? Sync.msg : `Synced. On another phone, enter this gist ID${token ? ' (and your token to allow edits)' : ''}.`;
  } catch (e) { msg.textContent = e.message; Sync.setState('err'); }
};

/* ---------- Bookoo Themis Ultra (Web Bluetooth) ----------
   Official protocol: github.com/BooKooCode/OpenSource/bookoo_ultra_scale/protocols.md
   Service 0x0FFE · weight notify 0xFF11 · command write 0xFF12 · XOR checksum. */
const Scale = {
  dev: null, cmd: null, connected: false, connecting: false,
  w: 0, flow: 0, ms: 0, batt: null, lastPacket: 0, keep: null, subs: new Set(),
  supported: 'bluetooth' in navigator,
  xor(bytes) { return bytes.reduce((a, b) => a ^ b, 0); },
  async connect() {
    if (!this.supported) throw new Error('This browser has no Bluetooth. Use Chrome on Android, Windows, Mac or ChromeOS.');
    this.dev = await navigator.bluetooth.requestDevice({ filters: [{ namePrefix: 'BOOKOO' }, { services: [0x0ffe] }], optionalServices: [0x0ffe] });
    this.dev.addEventListener('gattserverdisconnected', () => this.onDisconnect());
    await this.attach();
  },
  async attach() {
    this.connecting = true; this.emit();
    try {
      const server = await this.dev.gatt.connect();
      const svc = await server.getPrimaryService(0x0ffe);
      const wc = await svc.getCharacteristic(0xff11);
      this.cmd = await svc.getCharacteristic(0xff12);
      wc.addEventListener('characteristicvaluechanged', e => this.parse(e.target.value));
      await wc.startNotifications();
      this.connected = true;
      clearInterval(this.keep); this.keep = setInterval(() => this.send(0x25).catch(() => {}), 60000);
      this.send(0x25).catch(() => {});
    } finally { this.connecting = false; this.emit(); }
  },
  async onDisconnect() {
    this.connected = false; clearInterval(this.keep); this.emit();
    for (let i = 0; i < 3 && this.dev && !this.connected; i++) {
      await new Promise(r => setTimeout(r, 1500));
      try { await this.attach(); } catch (e) {}
    }
  },
  disconnect() { const d = this.dev; this.dev = null; if (d && d.gatt.connected) d.gatt.disconnect(); this.connected = false; this.emit(); },
  async send(code, d4 = 0, d5 = 0) {
    if (!this.cmd) return;
    const b = [0x03, 0x0a, code, d4, d5]; b.push(this.xor(b));
    const buf = new Uint8Array(b);
    if (this.cmd.writeValueWithoutResponse) { try { await this.cmd.writeValueWithoutResponse(buf); return; } catch (e) {} }
    await this.cmd.writeValue(buf);
  },
  tare() { return this.send(0x01); },
  parse(dv) {
    const b = new Uint8Array(dv.buffer, dv.byteOffset, dv.byteLength);
    if (b.length < 20 || b[0] !== 0x03 || b[1] !== 0x0b) return;
    if (this.xor(Array.from(b.slice(0, 19))) !== b[19]) return;
    this.ms = (b[2] << 16) | (b[3] << 8) | b[4];
    const neg = c => c === 0x2d;                     /* sign bytes are ASCII '+' / '-' */
    this.w = (neg(b[6]) ? -1 : 1) * (((b[7] << 16) | (b[8] << 8) | b[9]) / 100);
    this.flow = (neg(b[10]) ? -1 : 1) * (((b[11] << 8) | b[12]) / 100);
    this.batt = b[13];
    this.lastPacket = Date.now();
    this.emit();
  },
  on(fn) { this.subs.add(fn); return () => this.subs.delete(fn); },
  emit() { renderScalePill(); this.subs.forEach(fn => { try { fn(); } catch (e) { console.error(e); } }); }
};
function renderScalePill() {
  const dot = $('scale-dot'), lab = $('scale-label');
  dot.className = 'dot' + (Scale.connected ? ' on' : Scale.connecting ? ' busy' : '');
  lab.textContent = Scale.connected ? `Themis${Scale.batt != null ? ' · ' + Scale.batt + '%' : ''}` : Scale.connecting ? 'Connecting…' : 'Connect scale';
}
async function connectScale() {
  try { await Scale.connect(); }
  catch (e) { if (e && e.name !== 'NotFoundError') toast(e.message || 'Could not connect to the scale.'); }
}
$('scale-btn').onclick = async () => {
  unlockAudio();
  if (Scale.connected) { if (await confirmInline('Disconnect the scale?')) Scale.disconnect(); return; }
  if (Scale.connecting) return;
  if (LS.get('skipScaleHelp', false)) return connectScale();
  $('scale-skip').checked = false;
  $('scale-dlg').showModal();
};
$('scale-cancel').onclick = () => $('scale-dlg').close();
/* Opening the Bluetooth chooser straight from this tap keeps the user gesture Chrome requires. */
$('scale-go').onclick = () => {
  if ($('scale-skip').checked) LS.set('skipScaleHelp', true);
  $('scale-dlg').close();
  connectScale();
};
function confirmInline(q) { return Promise.resolve(window.confirm(q)); }

/* ---------- Audio + haptics ---------- */
let AC = null;
function unlockAudio() { try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); AC.resume(); } catch (e) {} }
function beep(n = 2) {
  try { navigator.vibrate && navigator.vibrate([180, 90, 180]); } catch (e) {}
  if (!AC) return;
  for (let i = 0; i < n; i++) {
    const o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime + i * .22;
    o.frequency.value = 1320; g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.25, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + .16);
    o.connect(g).connect(AC.destination); o.start(t); o.stop(t + .18);
  }
}
function toast(msg) {
  let t = $('global-toast');
  if (!t) { t = document.createElement('p'); t.id = 'global-toast'; t.className = 'toast'; t.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:calc(16px + env(safe-area-inset-bottom,0px));background:var(--surface);border:1px solid var(--line);padding:10px 14px;border-radius:10px;z-index:50;max-width:calc(100vw - 32px)'; document.body.appendChild(t); }
  t.textContent = msg; t.hidden = false; clearTimeout(t._h); t._h = setTimeout(() => t.hidden = true, 3500);
}

/* ---------- Themes ---------- */
const THEMES = [
  ['portafilter', 'Portafilter', 'Steel green and crema', ['#2F4A45', '#A9661B', '#9CC2B9']],
  ['aegean', 'Aegean', 'White and Greek blue', ['#0E3A75', '#1D5FAF', '#6FA8F0']],
  ['oat', 'Oat', 'Soft grey and sage green', ['#3F4B37', '#5E7D4F', '#9BBF86']],
  ['espresso', 'Espresso', 'Roasted brown and caramel', ['#2B1D15', '#9A5B22', '#D9A066']],
  ['night', 'Night shift', 'High contrast black and amber', ['#0A0A0A', '#A86400', '#FFB020']]];
const MODES = [['auto', 'Auto'], ['light', 'Light'], ['dark', 'Dark']];
const darkMQ = matchMedia('(prefers-color-scheme: dark)');
function applyLook() {
  const root = document.documentElement, theme = LS.get('theme', 'portafilter'), mode = LS.get('mode', 'auto');
  if (theme === 'portafilter') delete root.dataset.theme; else root.dataset.theme = theme;
  root.dataset.scheme = mode === 'auto' ? (darkMQ.matches ? 'dark' : 'light') : mode;
  requestAnimationFrame(() => $('meta-theme').setAttribute('content', getComputedStyle(root).getPropertyValue('--bg').trim() || '#2F4A45'));
}
darkMQ.addEventListener?.('change', applyLook);
applyLook();
const themePicker = () => { const curT = LS.get('theme', 'portafilter'), curM = LS.get('mode', 'auto');
  return `<section style="margin-top:28px"><h2 class="label">Appearance</h2>
    <div class="modes" role="group" aria-label="Light or dark">${MODES.map(([id, name]) => `<button class="mode-opt" data-mode-id="${id}" aria-pressed="${id === curM}">${name}</button>`).join('')}</div>
    <div class="themes">${THEMES.map(([id, name, desc, sw]) =>
    `<button class="theme-opt" data-theme-id="${id}" aria-pressed="${id === curT}"><span class="sw">${sw.map(c => `<i style="background:${c}"></i>`).join('')}</span><b>${name}</b><span>${desc}</span></button>`).join('')}</div>
    <p class="small">Auto follows your phone's light and dark setting.</p></section>`; };

/* ---------- Views ---------- */
let cur = null, timer = { id: null, start: 0, elapsed: 0, lock: null };
let unsubScale = null, coachIv = null;
function pendingEdit() { return !!(cur && cur.editing); }
function stopTimer() { clearInterval(timer.id); timer.id = null; try { timer.lock && timer.lock.release(); } catch (e) {} timer.lock = null; }
function onRemoteData() {
  if (cur) { const s = stateFor(cur.id); cur.applyRemote(s); }
  else home();
}

function home() {
  stopTimer(); cur = null; clearInterval(coachIv); if (unsubScale) { unsubScale(); unsubScale = null; }
  const app = $('app');
  app.innerHTML = `<div class="mast"><span class="label">Coffee recipes</span><h1>Brew Bar</h1>
    <p>Six brewers, dialled in for the Timemore 064S. Connect the Themis Ultra for live weight, auto-start and stop-shot alerts.</p></div>
    <div class="rack">${Object.entries(BREWERS).map(([id, b]) => {
      const d = derive(id, stateFor(id));
      const [n, u] = b.kind === 'espresso' ? [d.out, 'g out'] : [d.water, 'g water'];
      return `<button class="tile" data-go="${id}">${ICON[id]}<div><h2>${b.name}</h2><div class="gear">${b.gear}</div></div>
        <div class="stats mono"><span><b>${d.dose}</b> g in</span><span><b>${n}</b> ${u}</span><span>dial <b>${d.grind}</b></span></div></button>`; }).join('')}
    </div>
    <p class="note">${Sync.on ? 'Settings sync through your GitHub gist.' : 'Settings are saved on this phone. Tap “Sync off” to share them across phones.'}
      Grind numbers assume a zero point calibrated to burr touch; if your espresso sits nearer 2.0 or 2.5, shift every brewer by the same amount.</p>
    ${themePicker()}`;
  app.querySelectorAll('[data-theme-id]').forEach(el => el.onclick = () => { LS.set('theme', el.dataset.themeId); applyLook();
    app.querySelectorAll('[data-theme-id]').forEach(c => c.setAttribute('aria-pressed', c === el)); });
  app.querySelectorAll('[data-mode-id]').forEach(el => el.onclick = () => { LS.set('mode', el.dataset.modeId); applyLook();
    app.querySelectorAll('[data-mode-id]').forEach(c => c.setAttribute('aria-pressed', c === el)); });
  app.querySelectorAll('[data-go]').forEach(el => el.onclick = () => { location.hash = el.dataset.go; });
}

function detail(id) {
  stopTimer(); timer.elapsed = 0; clearInterval(coachIv); if (unsubScale) unsubScale();
  const b = BREWERS[id], s = stateFor(id), app = $('app');
  const tl = k => k === 'temp' ? (LABELS.temp[id] || LABELS.temp._) : LABELS[k];
  const fmt = (k, v) => k === 'time' ? mmss(v) : (k === 'grind' || k === 'ratio') ? v.toFixed(1) : String(r1(v));
  const valHtml = k => k === 'ratio' ? `<small>1:</small>${fmt(k, s[k])}` : `${fmt(k, s[k])}<small>${tl(k)[1]}</small>`;
  const dials = Object.keys(b.p).map(k => {
    const [mn, mx, st] = b.p[k], [lab] = tl(k);
    return `<div><div class="dial-top"><label class="label" for="r-${k}">${lab}</label><div class="stepper"><button class="step" data-step="-1" data-sk="${k}" aria-label="Decrease ${lab}">−</button><span class="dial-val" id="v-${k}"></span><button class="step" data-step="1" data-sk="${k}" aria-label="Increase ${lab}">+</button></div></div>
      <input type="range" id="r-${k}" data-k="${k}" min="${mn}" max="${mx}" step="${st}" value="${s[k]}">
      <div class="ticks"><span>${fmt(k, mn)}</span><span>${fmt(k, mx)}</span></div>
      ${k === 'grind' ? `<div class="hint" id="h-grind"></div>` : ''}
      ${k === 'dose' ? `<button class="linkbtn scale-only" id="use-dose" hidden>Use scale reading as bean weight</button>` : ''}
      ${k === 'water' ? `<button class="linkbtn scale-only" id="use-water" hidden>Use scale reading as water</button>` : ''}</div>`; }).join('');
  const cupWord = n => id === 'cafetiere' ? (n > 1 ? 'cups' : 'cup') : (n > 1 ? 'people' : 'person');
  const cupsUI = b.cups ? `<div><span class="label">${id === 'cafetiere' ? 'Cups' : 'People'}</span><div class="chips" style="margin-top:8px">${
    Array.from({ length: b.cups[1] - b.cups[0] + 1 }, (_, i) => b.cups[0] + i).map(n => `<button class="chip" data-cups="${n}">${n} ${cupWord(n)}</button>`).join('')}</div></div>` : '';
  const sugarUI = b.sugar ? `<div><span class="label">Sugar per cup</span><div class="chips" style="margin-top:8px">${SUGAR.map(([n, d, v]) =>
    `<button class="chip" data-sugar="${v}">${n} · ${d}</button>`).join('')}</div></div>` : '';
  const armLabel = b.kind === 'espresso' ? 'Tare · start on first drops' : 'Tare · start on pour';

  app.innerHTML = `<div class="head">${ICON[id]}<div><h1>${b.name}</h1><div class="gear">${b.gear}</div></div></div>
    <div class="grid">
      <section class="panel settings">
        <button class="set-head" id="set-toggle" aria-expanded="true" aria-controls="set-body">
          <span class="label">Settings</span><span class="set-sum mono" id="set-sum"></span><span class="chev" aria-hidden="true"></span></button>
        <div id="set-body"><div class="dials">${cupsUI}${dials}${sugarUI}</div>
        <div class="foot"><span class="hint" id="saved-note"></span><button class="btn ghost sm" id="reset">Reset to defaults</button></div></div></section>
      <section class="panel">
        <div class="live" id="live" hidden>
          <div class="live-row"><div class="weight" id="lw">0.0<small> g</small></div>
            <div class="flow"><b id="lf">0.0</b> g/s<br><span id="lt">scale 0:00</span></div></div>
          <div class="pace" id="pace" hidden><div class="pace-main" id="pace-main"></div><div class="pace-sub mono" id="pace-sub"></div></div>
          <div class="target" id="ltarget"></div>
          <div class="live-actions"><button class="btn sm" id="arm">${armLabel}</button><button class="btn ghost sm" id="tare">Tare</button></div>
          <div class="result" id="result" hidden><span id="result-txt"></span><button class="btn sm" id="result-save">Save to recipe</button></div>
        </div>
        <div class="summary" id="sum"></div>
        <h3 class="label sec">Method</h3><ol class="steps" id="steps"></ol>
        <div class="timer"><div class="clock" id="clock">0:00 <small id="target"></small></div>
          <button class="btn" id="go">Start</button><button class="btn ghost" id="rst">Reset</button>
          <div class="bar"><i id="bar"></i></div></div>
        <div class="shot" id="shot" hidden><p id="shot-txt"></p><ul id="shot-list"></ul>
          <div class="shot-actions"><button class="btn sm" id="shot-apply">Apply grind change</button><button class="btn ghost sm" id="shot-target">Make this shot the target</button></div></div>
        <h3 class="label sec">How did it taste?</h3>
        <div class="chips" id="taste">${b.taste.map((t, i) => `<button class="chip" data-taste="${i}" aria-pressed="false">${t[0]}</button>`).join('')}</div>
        <div class="fix" id="fix" hidden><p id="fix-txt"></p><ul id="fix-list"></ul><button class="btn" id="apply">Apply changes</button></div>
        <p class="toast" id="applied" hidden>Settings updated. Brew again and see.</p>
        <p class="tip">${b.tip}</p>
      </section></div>`;

  let plan = null, lastPhase = '', steps = [], arm = false, alerted = false, stillSince = 0, result = null, pick = -1;
  const elapsed = () => timer.elapsed + (timer.id ? (Date.now() - timer.start) / 1000 : 0);
  const marks = () => {
    app.querySelectorAll('[data-cups]').forEach(c => c.setAttribute('aria-pressed', +c.dataset.cups === s.cups));
    app.querySelectorAll('[data-sugar]').forEach(c => c.setAttribute('aria-pressed', +c.dataset.sugar === s.sugar));
  };
  const setSlider = k => { const el = $('r-' + k); if (el) el.value = s[k]; };

  const paint = (save = true) => {
    const d = derive(id, s);
    for (const k in b.p) { const [mn, mx] = b.p[k]; $('r-' + k).style.setProperty('--p', ((s[k] - mn) / (mx - mn) * 100) + '%'); $('v-' + k).innerHTML = valHtml(k); }
    $('h-grind').textContent = `≈ ${microns(s.grind)} µm`;
    const third = b.kind === 'espresso' ? ['Out', `${d.out} g`] : ['Water', `${d.water} g`];
    $('sum').innerHTML = `<div><div class="label">In</div><div class="v">${d.dose} g</div></div>
       <div><div class="label">${third[0]}</div><div class="v">${third[1]}</div></div>
       <div><div class="label">Ratio</div><div class="v">1:${d.r}</div></div>`;
    steps = b.steps(d); plan = b.pourPlan ? b.pourPlan(d) : null;
    $('steps').innerHTML = steps.map(([t, txt]) => `<li><span class="t">${mmss(t)}</span><span>${esc(txt)}</span></li>`).join('');
    $('target').textContent = '/ ' + mmss(s.time);
    $('saved-note').textContent = Sync.on ? (Sync.canWrite ? 'Syncs to your gist' : 'Read-only sync: changes stay on this phone') : 'Saved on this phone';
    const out = b.kind === 'espresso' ? `${d.out} g out` : b.kind === 'ratio' ? `1:${d.r}` : `${d.water} g water`;
    $('set-sum').textContent = [`${d.dose} g`, `dial ${d.grind}`, `${s.temp}°C`, out, mmss(s.time)].join(' · ');
    marks(); tick(); live();
    if (save) saveRecipe(id, s);
  };

  const tick = () => {
    const e = elapsed();
    $('clock').firstChild.nodeValue = mmss(e) + ' ';
    $('bar').style.width = Math.min(100, e / s.time * 100) + '%';
    const items = [...$('steps').children]; const active = timer.id || timer.elapsed > 0;
    let idx = -1; steps.forEach(([t], i) => { if (t <= e) idx = i; });
    if (Scale.connected && active) steps.forEach(([, , w], i) => { if (w != null && Scale.w >= w - 1) idx = Math.max(idx, Math.min(steps.length - 1, i + 1)); });
    items.forEach((li, i) => { li.classList.toggle('now', !!active && i === idx); li.classList.toggle('done', !!active && i < idx); });
  };

  const startTimer = async () => {
    if (timer.id) return;
    timer.start = Date.now(); timer.id = setInterval(tick, 200); $('go').textContent = 'Pause';
    result = null; $('result').hidden = true; $('shot').hidden = true; alerted = false; stillSince = 0;
    try { timer.lock = await navigator.wakeLock?.request('screen'); } catch (e) {}
  };
  const pauseTimer = () => { timer.elapsed = elapsed(); stopTimer(); $('go').textContent = 'Resume'; tick(); };
  /* Espresso: compare the shot time with the target (scaled to the yield actually reached) and suggest a grind change.
     On the 064S each 0.1 on the dial is ~5 µm; as a starting rule, 0.1 per ~3 s of difference. */
  let shot = null;
  const shotAdvice = (t, w, measured) => {
    const expT = s.time * (w / s.out), dt = t - expT;
    let dg = Math.round(dt / 30 * 10) / 10;
    if (Math.abs(dt) > 2 && dg === 0) dg = dt > 0 ? .1 : -.1;
    dg = clamp(dg, -.5, .5);
    const ng = r1(clamp(s.grind + dg, b.p.grind[0], b.p.grind[1]));
    shot = { t, w, ng };
    const what = `${measured ? '' : 'Assuming '}${r1(w)} g in ${mmss(t)}${measured ? '' : ' (no scale reading)'}`;
    let verdict;
    if (Math.abs(dt) <= 2) verdict = `${what}. Right on your ${mmss(s.time)} target, so keep the grind where it is.`;
    else verdict = `${what}: ${Math.round(Math.abs(dt))} s ${dt < 0 ? 'fast' : 'slow'} for ${r1(w)} g against your ${mmss(s.time)} target. ${dt < 0 ? 'Grind finer to slow it down.' : 'Grind coarser to speed it up.'}`;
    $('shot-txt').textContent = verdict;
    $('shot-list').innerHTML = Math.abs(dt) <= 2 ? '' : `<li><span>Grind (064S dial)</span><span class="mono">${s.grind.toFixed(1)} → <b>${ng.toFixed(1)}</b></span></li>`;
    $('shot-apply').hidden = Math.abs(dt) <= 2 || ng === s.grind;
    $('shot').hidden = false;
  };
  const finish = () => {
    pauseTimer();
    if (b.kind === 'espresso' && timer.elapsed >= 5) {
      const measured = Scale.connected && Scale.w > 1;
      shotAdvice(r0(timer.elapsed), measured ? r1(Scale.w) : s.out, measured);
      return;
    }
    if (Scale.connected && Scale.w > 1) {
      const t = r0(timer.elapsed), w = r1(Scale.w);
      result = { t, w };
      $('result-txt').innerHTML = b.kind === 'espresso'
        ? `<b class="mono">${w} g</b> in <b class="mono">${mmss(t)}</b> · 1:${r1(w / s.dose)}`
        : `<b class="mono">${w} g</b> · <b class="mono">${mmss(t)}</b>`;
      $('result').hidden = false;
    }
  };

  /* live scale panel */
  const live = () => {
    const panel = $('live'); if (!panel) return;
    panel.hidden = !Scale.connected;
    app.querySelectorAll('.scale-only').forEach(el => el.hidden = !Scale.connected);
    if (!Scale.connected) return;
    $('lw').innerHTML = `${Scale.w.toFixed(1)}<small> g</small>`;
    $('lf').textContent = Scale.flow.toFixed(1);
    $('lt').textContent = `scale ${mmss(Scale.ms / 1000)}`;
    const targets = steps.map(x => x[2]).filter(w => w != null);
    const next = targets.find(w => Scale.w < w - 0.5);
    const T = $('ltarget');
    if (!targets.length) T.textContent = '';
    else if (next != null) {
      const prev = [0, ...targets].filter(w => w <= next - 0.5 && w < next).pop() || 0;
      const pct = clamp((Scale.w - prev) / (next - prev) * 100, 0, 100);
      T.innerHTML = `${b.kind === 'espresso' ? 'Stop at' : 'Pour to'} <b class="mono">${next} g</b> · <span class="mono">${Math.max(0, next - Scale.w).toFixed(1)} g</span> to go<div class="bar"><i style="width:${pct}%"></i></div>`;
    } else T.innerHTML = `Target reached <span class="mono">(${targets[targets.length - 1]} g)</span>`;

    coach();
    if (arm && Scale.w >= (b.kind === 'espresso' ? 0.3 : 2)) { arm = false; $('arm').textContent = armLabel; startTimer(); }
    if (b.kind === 'espresso' && timer.id) {
      if (!alerted && Scale.w >= s.out - 1.5) { alerted = true; beep(3); panel.classList.add('alert'); setTimeout(() => panel.classList.remove('alert'), 2500); }
      if (alerted) {
        if (Math.abs(Scale.flow) < 0.15) { stillSince = stillSince || Date.now(); if (Date.now() - stillSince > 2500) finish(); }
        else stillSince = 0;
      }
    }
    tick();
  };
  /* Pour-pace coaching: compares weight with the planned curve and live flow with the target rate. */
  const coach = () => {
    const box = $('pace'); if (!box) return;
    const running = !!timer.id;
    if (!plan || !running) { box.hidden = true; lastPhase = ''; return; }
    const e = elapsed(), w = Scale.w, f = Scale.flow, { rate, pours } = plan;
    let expected = pours[pours.length - 1].to, i = pours.findIndex(p => e < p.end + 3);
    for (const p of pours) { if (e < p.start) { expected = p.from; break; } if (e <= p.end) { expected = p.from + (e - p.start) * rate; break; } }
    let state, main, sub;
    const p = pours[i];
    if (i === -1) {
      state = 'wait'; main = w < pours[pours.length - 1].to - 5 ? `Pour to ${pours[pours.length - 1].to} g` : 'Drawdown · let it drain';
      sub = `target finish ${mmss(s.time)}`;
    } else if (e < p.start) {
      const left = Math.ceil(p.start - e);
      if (f > 1.5 && w >= p.from - 1) { state = 'slow'; main = 'Stop pouring'; sub = `hold at ${p.from} g`; }
      else { state = 'wait'; main = `Wait · ${left} s`; sub = `next: pour to ${p.to} g`; }
    } else if (w >= p.to - 1) {
      state = 'stop'; main = `Stop · ${p.to} g`; sub = i < pours.length - 1 ? `next pour at ${mmss(pours[i + 1].start)}` : 'let it drain';
    } else {
      const diff = w - expected, tol = Math.max(6, p.to * .04);
      if (diff > tol || f > rate * 1.5) { state = 'slow'; main = 'Slow down'; }
      else if (diff < -tol && f < rate * 1.1) { state = 'fast'; main = 'Pour faster'; }
      else { state = 'good'; main = 'Good pace'; }
      sub = `${f.toFixed(1)} g/s · aim ${rate} · ${p.to} g by ${mmss(p.end)}`;
    }
    const phase = i + ':' + (e < (p ? p.start : 0) ? 'w' : 'p');
    if (lastPhase && phase !== lastPhase && phase.endsWith(':p')) beep(1);
    lastPhase = phase;
    box.hidden = false; box.dataset.state = state; $('pace-main').textContent = main; $('pace-sub').textContent = sub;
  };
  coachIv = setInterval(() => { if (timer.id && Scale.connected) coach(); }, 500);
  unsubScale = Scale.on(live);

  /* controls */
  app.querySelectorAll('input[type=range]').forEach(el => {
    el.oninput = () => { s[el.dataset.k] = parseFloat(el.value); cur.editing = true; clearTimeout(cur._e); cur._e = setTimeout(() => cur && (cur.editing = false), 2500); paint(); showFix(); };
  });
  app.querySelectorAll('[data-step]').forEach(el => el.onclick = () => {
    const k = el.dataset.sk, [mn, mx, st] = b.p[k];
    s[k] = r1(clamp(Math.round((s[k] + (+el.dataset.step) * st) / st) * st, mn, mx)); setSlider(k);
    cur.editing = true; clearTimeout(cur._e); cur._e = setTimeout(() => cur && (cur.editing = false), 2500); paint(); showFix();
  });
  app.querySelectorAll('[data-sugar]').forEach(el => el.onclick = () => { s.sugar = +el.dataset.sugar; paint(); });
  app.querySelectorAll('[data-cups]').forEach(el => el.onclick = () => {
    const n = +el.dataset.cups; if (n === s.cups) return; const f = n / s.cups;
    const scale = k => { if (!b.p[k]) return; const [mn, mx, st] = b.p[k]; s[k] = r1(clamp(Math.round(s[k] * f / st) * st, mn, mx)); setSlider(k); };
    scale('dose'); if (b.kind === 'water') scale('water');
    s.cups = n; paint(); showFix();
  });
  $('reset').onclick = () => { for (const k in b.p) { s[k] = b.p[k][3]; setSlider(k); } if (b.cups) s.cups = b.cups[2]; if (b.sugar) s.sugar = 1; paint(); showFix(); };
  const useScale = k => { const [mn, mx, st] = b.p[k]; s[k] = r1(clamp(Math.round(Scale.w / st) * st, mn, mx)); setSlider(k); paint(); };
  $('use-dose').onclick = () => useScale('dose');
  if ($('use-water')) $('use-water').onclick = () => useScale('water');

  $('tare').onclick = () => Scale.tare().catch(e => toast(e.message));
  $('arm').onclick = async () => {
    unlockAudio();
    if (arm) { arm = false; $('arm').textContent = armLabel; return; }
    stopTimer(); timer.elapsed = 0; $('go').textContent = 'Start'; result = null; $('result').hidden = true; tick();
    try { await Scale.tare(); } catch (e) { toast(e.message); return; }
    setTimeout(() => { arm = true; $('arm').textContent = 'Waiting… tap to cancel'; }, 700);
  };
  $('shot-apply').onclick = () => {
    if (!shot) return; s.grind = shot.ng; setSlider('grind'); $('shot').hidden = true; paint(); toast(`Grind set to ${shot.ng.toFixed(1)}. Pull the next shot.`);
  };
  $('shot-target').onclick = () => {
    if (!shot) return;
    s.out = clamp(Math.round(shot.w * 2) / 2, b.p.out[0], b.p.out[1]); setSlider('out');
    s.time = clamp(shot.t, b.p.time[0], b.p.time[1]); setSlider('time');
    $('shot').hidden = true; paint(); toast('This shot is now the target.');
  };
  $('result-save').onclick = () => {
    if (!result) return;
    if (b.kind === 'espresso') { s.out = clamp(Math.round(result.w * 2) / 2, ...b.p.out.slice(0, 2)); setSlider('out'); }
    s.time = clamp(Math.round(result.t / b.p.time[2]) * b.p.time[2], b.p.time[0], b.p.time[1]); setSlider('time');
    $('result').hidden = true; paint(); toast('Saved to the recipe.');
  };

  const showFix = () => {
    const box = $('fix'); if (pick < 0) { box.hidden = true; return; }
    const [, txt, ch] = b.taste[pick]; box.hidden = false; $('fix-txt').textContent = txt;
    $('fix-list').innerHTML = Object.entries(ch).map(([k, dv]) => { const [mn, mx] = b.p[k]; const nv = r1(clamp(s[k] + dv, mn, mx));
      return `<li><span>${tl(k)[0]}</span><span class="mono">${fmt(k, s[k])} → <b>${fmt(k, nv)}</b></span></li>`; }).join('');
  };
  app.querySelectorAll('[data-taste]').forEach(el => el.onclick = () => {
    pick = pick === +el.dataset.taste ? -1 : +el.dataset.taste;
    app.querySelectorAll('[data-taste]').forEach(c => c.setAttribute('aria-pressed', +c.dataset.taste === pick)); showFix();
  });
  $('apply').onclick = () => {
    for (const [k, dv] of Object.entries(b.taste[pick][2])) { const [mn, mx] = b.p[k]; s[k] = r1(clamp(s[k] + dv, mn, mx)); setSlider(k); }
    pick = -1; app.querySelectorAll('[data-taste]').forEach(c => c.setAttribute('aria-pressed', 'false')); showFix(); paint();
    const t = $('applied'); t.hidden = false; clearTimeout(t._h); t._h = setTimeout(() => t.hidden = true, 2200);
  };

  const setCollapsed = c => { $('set-body').hidden = c; $('set-toggle').setAttribute('aria-expanded', String(!c)); };
  setCollapsed(!!LS.get('collapsed', false));
  $('set-toggle').onclick = () => { const c = !$('set-body').hidden; setCollapsed(c); LS.set('collapsed', c); };

  const go = $('go');
  go.onclick = () => { unlockAudio(); if (timer.id) { b.kind === 'espresso' ? finish() : pauseTimer(); } else startTimer(); };
  $('rst').onclick = () => { stopTimer(); timer.elapsed = 0; arm = false; $('arm').textContent = armLabel; go.textContent = 'Start'; $('result').hidden = true; $('shot').hidden = true; tick(); };

  cur = { id, editing: false, applyRemote(rs) {
    if (cur.editing || sameRec(id, rs, s)) return;
    recKeys(id).forEach(k => { s[k] = rs[k]; }); for (const k in b.p) setSlider(k);
    paint(false); showFix();
  } };
  paint(false);
}

function route() { const h = location.hash.slice(1); BREWERS[h] ? detail(h) : home(); window.scrollTo(0, 0); }
$('go-home').onclick = () => { location.hash = ''; };
window.addEventListener('hashchange', route);
renderScalePill();
Sync.setState(Sync.on ? (Sync.canWrite ? 'on' : 'ro') : 'off');
route();
if (Sync.on) Sync.run(false);
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
