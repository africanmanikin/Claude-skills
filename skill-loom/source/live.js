const P = __P__;
const k = { iso, depthOf, pathOf, slabOf, cylinder, solidSvg, lineSvg, dotsSvg, faceTextSvg, ring, planOutline, lineOnTop, rise, sideSeam, sideMatrix, topMatrix, translateAlong, insetPlan, pointsAt, haloOf, corners, topTicks, knurl };
const M = { COLUMNS, GLYPH, SHOP, SCOPES, ROWS, WIDTH_CELLS, holesIn, raisedCells, readoutOf };
const LOOM = makeLoom(k, P, M);
const Lc = LAYOUT;

const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const readout = document.querySelector("[data-readout]");
const live = document.querySelector("[data-live]");
const infoBox = document.querySelector("[data-info]");
const buttons = [...document.querySelectorAll("[data-scope]")];
const still = matchMedia("(prefers-reduced-motion: reduce)");

const drawerEl = [...svg.querySelectorAll("[data-drawer]")];
const cardsEl = svg.querySelector('[data-part="cards"]');
const frameEl = [...svg.querySelectorAll("[data-frame]")];
const tipEl = [...svg.querySelectorAll("[data-tip]")];
const threadEl = [...svg.querySelectorAll("[data-thread]")];
const rowEl = new Map([...svg.querySelectorAll("[data-row]")].map((node) => [Number(node.dataset.row), node]));
const ribbonEl = svg.querySelector('[data-part="ribbon"]');
const shuttleEl = svg.querySelector('[data-part="shuttle"]');
const weftEl = svg.querySelector('[data-part="weft"]');

const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const follow = (cur, target, dt, tau) => cur + (target - cur) * (1 - Math.exp(-dt / tau));

const CYCLE = 1.5;
const T = { step: 0.3, shed: 0.32, throwFrom: 0.62, throwTo: 1.06, beat: 1.06, release: 1.22 };
const DWELL = 1.8;
const SHUTTLE_LEFT = -66;
const SHUTTLE_RIGHT = 100;

const state = {
  scope: SCOPES.findIndex((s) => s.id === "__START__"),
  hands: 0,
  pick: 0,
  tPick: 0,
  p: 0,
  lifts: [0, 0, 0, 0, 0],
  liftVel: [0, 0, 0, 0, 0],
  adv: 0,
  woven: 0,
  slides: SCOPES.map(() => 0),
  shuttleX: SHUTTLE_LEFT,
  shuttleDir: 1,
  threw: false,
  phase: "ready",
  wait: 0.6,
  user: false,
  idleTimer: 0,
  touring: true,
};
state.hands = SCOPES[state.scope].hands;

const rowsDone = () => state.woven >= ROWS;
const xLeadAt = (p) => Lc.NEEDLE_X + Lc.LEADIN + (p - 0.5) * Lc.ROW_PITCH;

function buildScope() {
  const hands = state.hands;
  frameEl.forEach((node, c) => { node.innerHTML = LOOM.frame(c, hands); });
  rowEl.forEach((node, r) => { node.innerHTML = LOOM.clothRow(hands, r); });
}

function drawThreads() {
  const paths = LOOM.threads(state.hands, state.lifts);
  threadEl.forEach((node, i) => {
    node.setAttribute("d", paths[i]);
    node.setAttribute("data-tone", i < 5 && state.lifts[i] > 1.6 ? "hi" : "lo");
  });
}

let lastDrawer = SCOPES.map(() => -1);
function drawDrawers() {
  let cards = "";
  drawerEl.forEach((node, i) => {
    const slide = Math.round(state.slides[i] * 10) / 10;
    const chosen = i === state.scope;
    if (lastDrawer[i] !== slide + (chosen ? 1000 : 0)) {
      node.innerHTML = LOOM.drawer(i, slide, chosen);
      lastDrawer[i] = slide + (chosen ? 1000 : 0);
    }
    if (slide > 4) cards += LOOM.cards(i, slide);
  });
  if (cardsEl.dataset.key !== cards) { cardsEl.innerHTML = cards; cardsEl.dataset.key = cards; }
}

let lastLead = null;
function drawRibbon() {
  const lead = Math.round(xLeadAt(state.p) * 20) / 20;
  if (lead !== lastLead) { ribbonEl.innerHTML = LOOM.ribbon(lead); lastLead = lead; }
}

function drawFrames() {
  frameEl.forEach((node, c) => {
    const lift = state.lifts[c];
    node.setAttribute("transform", lift > 0.02 ? translateAlong(P, [0, 0, lift]) : "");
    const tip = tipEl[c];
    const up = smooth(0.55, 0.95, lift / Lc.LIFT);
    tip.setAttribute("opacity", up.toFixed(2));
    tip.setAttribute("transform", translateAlong(P, [0, 0, lift - Lc.LIFT]));
  });
}

function drawCloth() {
  rowEl.forEach((node, r) => {
    const shown = smooth(0, 0.7, state.adv - r);
    if (shown < 0.01) { node.setAttribute("display", "none"); return; }
    node.removeAttribute("display");
    node.setAttribute("opacity", shown.toFixed(2));
    const kk = clamp(state.adv - 1 - r, 0, ROWS);
    node.setAttribute("transform", translateAlong(P, [0, kk * Lc.CELL, 0]));
  });
}

function drawShuttle(active) {
  if (!active) { shuttleEl.setAttribute("display", "none"); weftEl.setAttribute("d", ""); return; }
  shuttleEl.removeAttribute("display");
  shuttleEl.setAttribute("transform", translateAlong(P, [state.shuttleX, 0, 0]));
  const from = state.shuttleDir > 0 ? SHUTTLE_LEFT : SHUTTLE_RIGHT;
  weftEl.setAttribute("d", LOOM.weftPath(from, state.shuttleX - state.shuttleDir * 6));
}

function say() {
  const text = readoutOf(state.scope, state.phase === "ready" ? 0 : state.pick, rowsDone());
  if (readout.textContent !== text) readout.textContent = text;
}

function describe() {
  const s = SCOPES[state.scope];
  infoBox.querySelector("[data-f=name]").textContent = s.name;
  infoBox.querySelector("[data-f=hands]").textContent = `${s.hands} of ${SHOP.people} people`;
  infoBox.querySelector("[data-f=owner]").textContent = s.owner;
  infoBox.querySelector("[data-f=review]").textContent = s.review;
  infoBox.querySelector("[data-f=encodes]").textContent = s.encodes;
  infoBox.querySelector("[data-f=example]").textContent = s.example;
  buttons.forEach((button, i) => button.setAttribute("aria-pressed", String(i === state.scope)));
  live.textContent = `${s.name} scope. ${s.hands} of ${SHOP.people} people read this card. Owner: ${s.owner}. Reviewed: ${s.review}.`;
}

function rewind() {
  state.pick = 0; state.tPick = 0; state.woven = 0; state.threw = false;
  state.phase = "ready"; state.wait = 0.5;
}

function setScope(index, { user = false } = {}) {
  if (index < 0 || index >= SCOPES.length) return;
  const changed = index !== state.scope;
  state.scope = index;
  state.hands = SCOPES[index].hands;
  if (user) { state.touring = false; clearTimeout(state.idleTimer); state.idleTimer = setTimeout(() => { state.touring = !still.matches; run(); }, 3600); }
  state.lifts = [0, 0, 0, 0, 0]; state.liftVel = [0, 0, 0, 0, 0];
  state.adv = 0; state.lastWoven = 0;
  buildScope();
  rewind();
  lastLead = null;
  describe();
  if (still.matches) finishNow();
  if (changed || user) run();
}

function finishNow() {
  state.pick = ROWS; state.woven = ROWS; state.adv = ROWS; state.p = ROWS;
  state.phase = "dwell"; state.lifts = [0, 0, 0, 0, 0];
  state.slides = SCOPES.map((_, i) => (i === state.scope ? Lc.SLIDE : 0));
  lastLead = null;
  frame();
}

function advance(dt) {
  const s = state;
  if (s.phase === "ready") { s.p = follow(s.p, 0, dt, 0.12); if (Math.abs(s.p) < 0.002) s.p = 0; s.wait -= dt; if (s.wait <= 0) { s.phase = "pick"; s.pick = 1; s.tPick = 0; s.threw = false; } return; }
  if (s.phase === "dwell") {
    s.wait -= dt;
    if (s.wait <= 0) {
      if (s.touring) { setScope((s.scope + 1) % SCOPES.length); } else { setScope(s.scope); }
    }
    return;
  }
  s.tPick += dt;
  const t = s.tPick;
  const row = s.pick - 1;
  // the card steps one row under the needles
  s.p = follow(s.p, s.pick, dt, 0.085);
  if (Math.abs(s.p - s.pick) < 0.002) s.p = s.pick;
  // the needles that find a hole let their frame rise
  const open = t > T.shed && t < T.release && Math.abs(s.p - s.pick) < 0.12;
  for (let c = 0; c < WIDTH_CELLS; c++) {
    const want = open && GLYPH[row][c] ? Lc.LIFT : 0;
    const stiff = 520, drag = 34;
    for (let i = 0; i < 4; i++) { s.liftVel[c] += ((want - s.lifts[c]) * stiff - s.liftVel[c] * drag) * dt / 4; s.lifts[c] += s.liftVel[c] * dt / 4; }
    if (Math.abs(want - s.lifts[c]) < 0.004 && Math.abs(s.liftVel[c]) < 0.01) { s.lifts[c] = want; s.liftVel[c] = 0; }
  }
  // the shuttle crosses while the shed is open
  const dir = row % 2 === 0 ? 1 : -1;
  s.shuttleDir = dir;
  const u = smooth(0, 1, (t - T.throwFrom) / (T.throwTo - T.throwFrom));
  s.shuttleX = dir > 0 ? SHUTTLE_LEFT + (SHUTTLE_RIGHT - SHUTTLE_LEFT) * u : SHUTTLE_RIGHT - (SHUTTLE_RIGHT - SHUTTLE_LEFT) * u;
  // beat up: the row joins the cloth and the cloth takes up
  if (t > T.beat && !s.threw) { s.threw = true; s.woven = s.pick; }
  if (t >= CYCLE) {
    if (s.pick >= ROWS) { s.phase = "dwell"; s.wait = DWELL; }
    else { s.pick += 1; s.tPick = 0; s.threw = false; }
  }
}

function frame() {
  drawDrawers();
  drawRibbon();
  drawFrames();
  drawThreads();
  drawCloth();
  const crossing = state.phase === "pick" && state.tPick > T.throwFrom - 0.05 && state.tPick < T.beat + 0.05;
  drawShuttle(crossing);
  say();
}

let raf = 0, last = 0, visible = false;
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  if (still.matches) { finishNow(); raf = 0; return; }
  advance(dt);
  state.adv = follow(state.adv, state.woven, dt, 0.16);
  if (Math.abs(state.adv - state.woven) < 0.003) state.adv = state.woven;
  SCOPES.forEach((_, i) => {
    const target = i === state.scope ? Lc.SLIDE : 0;
    state.slides[i] = follow(state.slides[i], target, dt, 0.18);
    if (Math.abs(state.slides[i] - target) < 0.02) state.slides[i] = target;
  });
  frame();
  raf = visible ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!raf && visible) { last = 0; raf = requestAnimationFrame(tick); } };

new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);

buttons.forEach((button, i) => button.addEventListener("click", () => setScope(i, { user: true })));
drawerEl.forEach((node, i) => node.addEventListener("click", () => setScope(i, { user: true })));
stage.addEventListener("keydown", (event) => {
  let to = null;
  if (event.key === "ArrowRight" || event.key === "ArrowUp") to = Math.min(SCOPES.length - 1, state.scope + 1);
  if (event.key === "ArrowLeft" || event.key === "ArrowDown") to = Math.max(0, state.scope - 1);
  if (event.key === "Home") to = 0;
  if (event.key === "End") to = SCOPES.length - 1;
  if (to === null) return;
  event.preventDefault();
  setScope(to, { user: true });
});

state.slides = SCOPES.map((_, i) => (i === state.scope ? Lc.SLIDE : 0));
buildScope();
describe();
if (still.matches) { state.touring = false; finishNow(); }
frame();
