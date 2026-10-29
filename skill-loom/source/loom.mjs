// Geometry of the skill loom. makeLoom(k, P, M) is used by the build for the static parts and by the page
// for everything that moves, so there is one drawing of each part.

export const LAYOUT = {
  PLATE: { x: -172, y: -92, w: 296, d: 156, r: 8 },
  PLATE_H: 12,
  FOOT_H: 5,
  AZIMUTH: 68,
  ELEVATION: 31,
  CAB: { x: -160, y: -68, w: 60, d: 54, r: 3 },
  CAB_Z: 3,
  CAB_TOP: 66,
  DR_Z0: 6,
  DR_PITCH: 11.8,
  DR_H: 10,
  DR_X: [-156, -104],
  SLIDE: 14,
  Y_COLS: [-54, -47, -40, -33, -26],
  RIB_Z: 52,
  RIB_T: 1.2,
  RIB_Y: [-60, -20],
  RIB_CUT: -100,
  LEADIN: 17,
  ROW_PITCH: 7,
  TAIL: 30,
  NEEDLE_X: -83.3,
  FRAME_X: [-84.4, 106.4],
  FRAME_Z: [12, 42],
  THREAD_Z: 26,
  LIFT: 4,
  WARP_Y: -76,
  FELL_Y: -8,
  CELL: 5,
  TILE: 4.4,
  CLOTH_Z: 25,
  ROW_COUNT: 8,
  CENTER_X: 24,
  SHUTTLE_Y: -17,
};

export function makeLoom(k, P, M) {
  const Lc = LAYOUT;
  const at = (p) => k.iso(p, P);
  const S = (paths, style) => k.solidSvg(paths, style);
  const Ln = (d, style) => k.lineSvg(d, style);
  const Dt = (points, style) => k.dotsSvg(points, style);
  const byDepth = (points) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
  const CABF = Lc.CAB.y + Lc.CAB.d;
  const ribLen = Lc.LEADIN + M.ROWS * Lc.ROW_PITCH + Lc.TAIL;
  const pitchOf = (hands) => Lc.CELL * (M.WIDTH_CELLS + 1);
  const x0Of = (hands) => Lc.CENTER_X - (hands * pitchOf(hands) - Lc.CELL) / 2;
  const cellX = (hands, motif, col) => x0Of(hands) + (motif * (M.WIDTH_CELLS + 1) + col) * Lc.CELL;
  const heddleX = (hands, motif, col) => cellX(hands, motif, col) + Lc.CELL / 2;
  const threadXs = (hands) => {
    const out = [];
    for (let m = 0; m < hands; m++) for (let c = 0; c < M.WIDTH_CELLS + (m < hands - 1 ? 1 : 0); c++) out.push({ x: heddleX(hands, m, c), col: c < M.WIDTH_CELLS ? c : -1 });
    return out;
  };

  function plate() {
    const { PLATE, PLATE_H, FOOT_H } = Lc;
    const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
    for (const [x, y] of byDepth(k.corners(PLATE, 22))) {
      out.push(S(k.cylinder(x, y, 7, -PLATE_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
      out.push(S(k.cylinder(x, y, 5.4, -PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
    }
    out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.6), { tone: "mid" }));
    out.push(Ln(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "lo" }));
    const screws = k.corners(PLATE, 10);
    out.push(Ln(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
    out.push(Dt(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
    const strip = { x: -150, y: PLATE.y + PLATE.d - 15, w: 280, d: 7, r: 1 };
    out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
    const ticks = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 5, strip.y + 0.8, 0.6, [2, 3.6], P);
    out.push(Ln(ticks.minor, { tone: "lo" }), Ln(ticks.major, { tone: "mid" }));
    out.push(Dt([at([strip.x + 2, strip.y + 3.5, 0.6]), at([strip.x + strip.w - 2, strip.y + 3.5, 0.6])], { size: 0.45 }));
    return out.join("");
  }

  // ---- card cabinet --------------------------------------------------------------------------------
  function cabinet() {
    const { CAB, CAB_Z, CAB_TOP, RIB_Z, RIB_Y } = Lc;
    const out = [`<path class="iso-halo" d="${k.haloOf(CAB, 0, CAB_TOP, P)}" style="filter:blur(6px)"/>`];
    const plinth = { x: CAB.x - 2, y: CAB.y - 2, w: CAB.w + 4, d: CAB.d + 4, r: 4 };
    out.push(S(k.slabOf(plinth, 0, CAB_Z, P, 5, 0.5), { tone: "lo" }));
    out.push(S(k.slabOf(CAB, CAB_Z, CAB_TOP - CAB_Z, P, 5, 0.8), { tone: "mid", inner: Ln(k.sideSeam(CAB, CAB_Z + 3, P, 5), { tone: "faint" }) }));
    out.push(S(k.slabOf(plinth, CAB_TOP, 3, P, 5, 0.6), { tone: "mid" }));
    out.push(Ln(k.planOutline(k.insetPlan(plinth, 4), CAB_TOP + 3, P), { tone: "faint" }));
    // the slot the card leaves by, on the +x face
    const xs = CAB.x + CAB.w;
    const slot = [[xs, RIB_Y[0] - 1.5, RIB_Z - 1.4], [xs, RIB_Y[1] + 1.5, RIB_Z - 1.4], [xs, RIB_Y[1] + 1.5, RIB_Z + Lc.RIB_T + 1.6], [xs, RIB_Y[0] - 1.5, RIB_Z + Lc.RIB_T + 1.6]];
    out.push(`<path class="iso-fill" d="${k.pathOf(slot.map(at), true)}"/>`);
    out.push(Ln(k.pathOf(slot.map(at), true), { tone: "mid" }));
    const screws = [[xs, CAB.y + 6, CAB_TOP - 6], [xs, CAB.y + CAB.d - 6, CAB_TOP - 6], [xs, CAB.y + 6, 12], [xs, CAB.y + CAB.d - 6, 12]];
    out.push(Dt(screws.map(at), { size: 0.45 }));
    return out.join("");
  }

  const drawerZ = (i) => Lc.DR_Z0 + i * Lc.DR_PITCH;

  // One drawer front, sliding out of the cabinet face. Only the part outside the cabinet is drawn.
  function drawer(i, slide, chosen) {
    const z = drawerZ(i);
    const [xa, xb] = Lc.DR_X;
    const depth = 1.5 + slide;
    const face = CABF + depth;
    const out = [];
    out.push(S(k.slabOf({ x: xa, y: CABF, w: xb - xa, d: depth, r: 1 }, z, Lc.DR_H, P, 2, 0.5), { tone: chosen ? "hi" : "mid", crease: "faint" }));
    const holder = [[xa + 5, face, z + 2.2], [xa + 25, face, z + 2.2], [xa + 25, face, z + Lc.DR_H - 2.2], [xa + 5, face, z + Lc.DR_H - 2.2]];
    out.push(Ln(k.pathOf(holder.map(at), true), { tone: chosen ? "mid" : "lo" }));
    out.push(Dt([[xa + 3, face, z + Lc.DR_H / 2], [xa + 27, face, z + Lc.DR_H / 2]].map(at), { size: 0.45 }));
    const label = M.SCOPES[i].short;
    out.push(k.faceTextSvg(k.sideMatrix([xa + 15, face], z + Lc.DR_H / 2 - 1, P, "left"), label, { size: 2.3, tone: chosen ? "hi" : "mid", anchor: "middle" }));
    out.push(S(k.slabOf({ x: xb - 21, y: face, w: 14, d: 2.4, r: 1.1 }, z + 3.4, 3.2, P, 2, 0), { tone: chosen ? "hi" : "mid", crease: "none" }));
    out.push(Dt([at([xb - 19, face + 0.2, z + 5]), at([xb - 9, face + 0.2, z + 5])], { size: 0.4 }));
    return out.join("");
  }

  // The cards standing in a drawer that is open. Drawn after all the fronts, because they stand proud of them.
  function cards(i, slide) {
    const z = drawerZ(i) + Lc.DR_H;
    const [xa, xb] = Lc.DR_X;
    const out = [];
    const face = CABF + 1.5 + slide;
    for (let j = 0; j < 4; j++) {
      const back = 3.4 + j * 3.1;
      const alpha = Math.min(1, Math.max(0, (slide - 1.5 - back) / 1.6));
      if (alpha <= 0) continue;
      const y = face - back - 0.9;
      out.push(`<g opacity="${alpha.toFixed(2)}">${S(k.slabOf({ x: xa + 4, y, w: xb - xa - 8, d: 0.9, r: 0.3 }, z, 6.4 + (j === 0 ? 2 : 0), P, 1, 0), { tone: "hi", crease: "faint" })}</g>`);
    }
    return out.join("");
  }

  // ---- card table, reader and rails ----------------------------------------------------------------------
  const RAIL_A = { x: -100, y: -63, w: 92, d: 4, r: 0.6 };
  const RAIL_B = { x: -100, y: -21, w: 92, d: 4, r: 0.6 };
  const POST_A = [-12, -61];
  const POST_B = [-12, -19];
  function railsBack() {
    const out = [];
    out.push(S(k.cylinder(POST_A[0], POST_A[1], 2.2, 0, Lc.RIB_Z - 3, P, 20), { tone: "mid" }));
    out.push(S(k.slabOf(RAIL_A, Lc.RIB_Z - 3, 3, P, 2, 0.3), { tone: "mid" }));
    out.push(Dt([at([-94, -61, Lc.RIB_Z]), at([-52, -61, Lc.RIB_Z]), at([-16, -61, Lc.RIB_Z])], { size: 0.4 }));
    // the reader's backboard
    const BB = { x: -95, y: -63, w: 24, d: 3.6, r: 1 };
    out.push(S(k.slabOf(BB, Lc.RIB_Z, 24, P, 2, 0.5), { tone: "mid" }));
    out.push(Dt([at([-92, -59.4, Lc.RIB_Z + 20]), at([-74, -59.4, Lc.RIB_Z + 20])], { size: 0.45 }));
    out.push(k.faceTextSvg(k.sideMatrix([-83, -59.4], Lc.RIB_Z + 9, P, "left"), "READ HEAD", { size: 2.3, tone: "mid", anchor: "middle" }));
    return out.join("");
  }
  function railsFront() {
    const out = [];
    out.push(S(k.cylinder(POST_B[0], POST_B[1], 2.2, 0, Lc.RIB_Z - 3, P, 20), { tone: "mid" }));
    out.push(S(k.slabOf(RAIL_B, Lc.RIB_Z - 3, 3, P, 2, 0.3), { tone: "mid" }));
    out.push(Dt([at([-94, -19, Lc.RIB_Z]), at([-52, -19, Lc.RIB_Z]), at([-16, -19, Lc.RIB_Z])], { size: 0.4 }));
    return out.join("");
  }

  // ---- warp side ------------------------------------------------------------------------------------------
  function warp() {
    const out = [];
    const beam = { x: -56, y: -88, w: 160, d: 10, r: 2 };
    const BEAM_H = 18;
    for (const x of [-56, 94]) out.push(S(k.slabOf({ x, y: -88, w: 10, d: 10, r: 1.5 }, 0, 14, P, 3, 0.4), { tone: "lo" }));
    out.push(S(k.slabOf(beam, 14, BEAM_H, P, 4, 0.8), { tone: "mid" }));
    out.push(Ln(k.sideSeam(beam, 20, P, 4), { tone: "faint" }));
    const ys = k.pointsAt([[-50, beam.y + beam.d, 19], [98, beam.y + beam.d, 19]], P);
    out.push(Dt(ys, { size: 0.45 }));
    // ratchet knob on the right end
    out.push(S(k.cylinder(118, -83, 6, 20, 5, P, 32), { tone: "mid" }));
    out.push(Ln(k.knurl(118, -83, 6, 20, 25, 30, P), { tone: "lo" }));
    out.push(Ln(k.lineOnTop([118, -83], [124, -83], 25, P), { tone: "hi" }));
    out.push(Dt([at([118, -83, 25])], { size: 0.5, tone: "hi" }));
    out.push(S(k.slabOf({ x: 104, y: -85, w: 8, d: 4, r: 1 }, 22, 3, P, 2, 0), { tone: "mid", crease: "none" }));
    return out.join("");
  }
  function pedestals() {
    const out = [];
    for (const x of [-89, 101]) {
      const plan = { x, y: -59, w: 9, d: 38, r: 1.5 };
      out.push(S(k.slabOf(plan, 0, 12, P, 3, 0.5), { tone: "lo" }));
      out.push(Dt([at([x + 4.5, -55, 12]), at([x + 4.5, -25, 12])], { size: 0.42 }));
    }
    return out.join("");
  }

  // ---- harness frames: one per card column --------------------------------------------------------------
  const FRAME_BAR = 2.4;
  function frame(c, hands) {
    const y = Lc.Y_COLS[c];
    const [xa, xb] = Lc.FRAME_X;
    const [za, zb] = Lc.FRAME_Z;
    const out = [];
    const eyeZ = Lc.THREAD_Z;
    const xs = [];
    for (let m = 0; m < hands; m++) xs.push(heddleX(hands, m, c));
    const rises = xs.map((x) => k.rise([x, y], za + FRAME_BAR, zb - FRAME_BAR, P)).join("");
    out.push(Ln(rises, { tone: "lo" }));
    out.push(Dt(xs.map((x) => at([x, y, eyeZ])), { size: 0.7, tone: "hi" }));
    const bar = (z) => S(k.slabOf({ x: xa, y: y - 1.2, w: xb - xa, d: 2.4, r: 0.5 }, z, FRAME_BAR, P, 1, 0), { tone: "mid", crease: "faint" });
    out.push(bar(za));
    out.push(bar(zb - FRAME_BAR));
    out.push(S(k.slabOf({ x: xb - 2.2, y: y - 1.1, w: 2.2, d: 2.2, r: 0.5 }, za, zb - za, P, 1, 0), { tone: "mid" }));
    out.push(S(k.slabOf({ x: Lc.NEEDLE_X - 1.1, y: y - 1.1, w: 2.2, d: 2.2, r: 0.5 }, za, Lc.RIB_Z - za, P, 1, 0), { tone: "mid" }));
    return out.join("");
  }
  function tip(c) {
    return S(k.cylinder(Lc.NEEDLE_X, Lc.Y_COLS[c], 1.2, Lc.RIB_Z + Lc.RIB_T, 3, P, 14), { tone: "hi", lit: true });
  }

  // A thread of column c runs from the warp beam, bends at its frame's eye, and ends at the fell of the cloth.
  function threads(hands, lifts) {
    const z = Lc.THREAD_Z;
    const cols = [[], [], [], [], [], []];
    for (const { x, col } of threadXs(hands)) {
      const y = col < 0 ? null : Lc.Y_COLS[col];
      const lift = col < 0 ? 0 : lifts[col];
      const pts = [[x, Lc.WARP_Y, z]];
      if (y !== null) pts.push([x, y, z + lift]);
      pts.push([x, Lc.FELL_Y - 4.6, z], [x, Lc.FELL_Y, z]);
      cols[col < 0 ? 5 : col].push(k.pathOf(pts.map(at)));
    }
    return cols.map((list) => list.join(""));
  }

  // ---- reed, deck and take-up ----------------------------------------------------------------------------
  function reed() {
    const out = [];
    for (const x of [-60, 104]) out.push(S(k.slabOf({ x, y: -15, w: 4, d: 6, r: 1 }, 0, 36, P, 2, 0.4), { tone: "lo" }));
    const rail = (z) => ({ plan: { x: -56, y: -13.6, w: 160, d: 2.4, r: 0.5 }, z });
    const dents = [];
    for (let x = -56 + Lc.CELL / 2; x < 104; x += Lc.CELL) dents.push(k.rise([x, -11.2], 20.4, 33.6, P));
    out.push(Ln(dents.join(""), { tone: "lo" }));
    for (const z of [18, 33.6]) out.push(S(k.slabOf(rail(z).plan, z, 2.4, P, 1, 0.3), { tone: "mid" }));
    return out.join("");
  }
  function deck() {
    const out = [];
    const plan = { x: -56, y: -8, w: 160, d: 58, r: 2 };
    for (const [x, y] of byDepth([[-48, 2], [96, 2], [-48, 40], [96, 40]])) out.push(S(k.cylinder(x, y, 3, 0, 20, P, 22), { tone: "lo" }));
    out.push(S(k.slabOf(plan, 20, 5, P, 4, 0.6), { tone: "mid" }));
    out.push(Ln(k.planOutline(k.insetPlan(plan, 3), 25, P), { tone: "faint" }));
    return out.join("");
  }
  function breast() {
    const out = [];
    const plan = { x: -56, y: 42, w: 160, d: 8, r: 2 };
    out.push(S(k.slabOf(plan, 25, 8, P, 3, 0.6), { tone: "mid" }));
    const dots = [];
    for (let x = -46; x <= 98; x += 24) dots.push(at([x, plan.y + plan.d, 29]));
    out.push(Dt(dots, { size: 0.42 }));
    out.push(S(k.cylinder(118, 46, 6, 25, 6, P, 32), { tone: "mid" }));
    out.push(Ln(k.knurl(118, 46, 6, 25, 31, 30, P), { tone: "lo" }));
    out.push(Ln(k.lineOnTop([118, 46], [124, 46], 31, P), { tone: "hi" }));
    out.push(Dt([at([118, 46, 31])], { size: 0.5, tone: "hi" }));
    out.push(S(k.slabOf({ x: 104, y: 44, w: 8, d: 4, r: 1 }, 27, 3, P, 2, 0), { tone: "mid", crease: "none" }));
    return out.join("");
  }

  // ---- cloth ---------------------------------------------------------------------------------------------
  const cellPlan = (x, y) => ({ x: x + (Lc.CELL - Lc.TILE) / 2, y: y + (Lc.CELL - Lc.TILE) / 2, w: Lc.TILE, d: Lc.TILE, r: 0.6 });
  function cellDef() {
    return `<g id="loom-cell">${S(k.slabOf(cellPlan(0, 0), Lc.CLOTH_Z, 2.8, P, 2, 0.3), { tone: "hi", crease: "lo" })}</g>`;
  }
  // Row r at the fell (k = 0): the cloth base, the outline of every cell, and a copy of the raised cell where the card had a hole.
  function clothRow(hands, r) {
    const width = hands * pitchOf(hands) - Lc.CELL;
    const out = [];
    const base = { x: x0Of(hands), y: Lc.FELL_Y, w: width, d: Lc.CELL, r: 0.4 };
    out.push(S(k.slabOf(base, Lc.CLOTH_Z, 1.2, P, 1, 0), { tone: "mid", crease: "faint" }));
    const outlines = [];
    const uses = [];
    for (let m = 0; m < hands; m++) {
      for (let c = 0; c < M.WIDTH_CELLS; c++) {
        const x = cellX(hands, m, c);
        outlines.push(k.planOutline(cellPlan(x, Lc.FELL_Y), Lc.CLOTH_Z + 1.2, P, 2));
        if (M.GLYPH[r][c]) uses.push(`<use href="#loom-cell" transform="${k.translateAlong(P, [x, Lc.FELL_Y, 0])}"/>`);
      }
    }
    out.push(Ln(outlines.join(""), { tone: "faint" }));
    out.push(uses.join(""));
    return out.join("");
  }

  // ---- shuttle and weft ---------------------------------------------------------------------------------
  function shuttle() {
    const out = [];
    out.push(S(k.slabOf({ x: -7, y: Lc.SHUTTLE_Y - 2, w: 14, d: 4, r: 2 }, 23, 4, P, 4, 0.4), { tone: "hi", crease: "faint" }));
    out.push(Ln(k.lineOnTop([-4, Lc.SHUTTLE_Y], [4, Lc.SHUTTLE_Y], 27, P), { tone: "lo", free: true }));
    return out.join("");
  }
  const weftPath = (from, to) => k.pathOf([at([from, Lc.SHUTTLE_Y, Lc.THREAD_Z]), at([to, Lc.SHUTTLE_Y, Lc.THREAD_Z])]);

  // ---- the card -----------------------------------------------------------------------------------------
  // xLead is the world x of the card's leading end. Row r is u = LEADIN + (r + .5) * ROW_PITCH back from it.
  const rowU = (r) => Lc.LEADIN + (r + 0.5) * Lc.ROW_PITCH;
  function ribbon(xLead) {
    const { RIB_Z, RIB_T, RIB_Y, RIB_CUT } = Lc;
    const xa = Math.max(xLead - ribLen, RIB_CUT);
    const top = RIB_Z + RIB_T;
    const out = [];
    out.push(S(k.slabOf({ x: xa, y: RIB_Y[0], w: xLead - xa, d: RIB_Y[1] - RIB_Y[0], r: 0.8 }, RIB_Z, RIB_T, P, 2, 0.3), { tone: "hi", crease: "faint" }));
    const rules = [];
    const sprockets = [];
    for (let r = 0; r <= M.ROWS; r++) {
      const x = xLead - (Lc.LEADIN + r * Lc.ROW_PITCH);
      if (x < xa + 0.5) continue;
      rules.push(k.lineOnTop([x, RIB_Y[0]], [x, RIB_Y[1]], top, P));
      sprockets.push(at([x, RIB_Y[0] + 2.2, top]), at([x, RIB_Y[1] - 2.2, top]));
    }
    out.push(Ln(rules.join(""), { tone: "faint" }));
    out.push(Dt(sprockets, { size: 0.4 }));
    const holes = [];
    const inner = [];
    for (let r = 0; r < M.ROWS; r++) {
      const x = xLead - rowU(r);
      if (x < xa + 2.5) continue;
      for (let c = 0; c < M.WIDTH_CELLS; c++) {
        if (!M.GLYPH[r][c]) continue;
        holes.push(k.ring(x, Lc.Y_COLS[c], 2, top, P, 14));
        inner.push(k.ring(x, Lc.Y_COLS[c], 1.1, top, P, 10));
      }
    }
    out.push(Ln(holes.join(""), { tone: "hi" }), Ln(inner.join(""), { tone: "lo" }));
    for (let c = 0; c < M.WIDTH_CELLS; c++) {
      const x = xLead - Lc.LEADIN + 2;
      if (x > xa) out.push(k.faceTextSvg(k.topMatrix([x, Lc.Y_COLS[c] + 0.9], top, P, "x"), M.COLUMNS[c].toUpperCase(), { size: 2.2, tone: "mid" }));
    }
    return out.join("");
  }

  return {
    ribLen, rowU, pitchOf, x0Of, cellX, heddleX, threadXs, drawerZ, CABF,
    plate, cabinet, drawer, cards, railsBack, railsFront, warp, pedestals, frame, tip, threads, reed, deck, breast,
    cellDef, clothRow, shuttle, weftPath, ribbon,
  };
}
