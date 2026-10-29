import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../kit/iso-kit.mjs";
import { kitScript } from "../../scripts/inline-kit.mjs";
import * as M from "./model.mjs";
import { LAYOUT, makeLoom } from "./loom.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";
const WIDTH = 700;
const HEIGHT = 400;
const Lc = LAYOUT;
const START = 3;

const P = k.fitProjection(
  [
    ...k.boxCorners(Lc.PLATE, -Lc.PLATE_H - Lc.FOOT_H, 0),
    [-83, -62, Lc.RIB_Z + 26],
    [-130, -41, Lc.CAB_TOP + 4],
    [124, -83, 28],
    [124, 46, 34],
  ],
  WIDTH,
  HEIGHT,
  { pad: 22, azimuth: Lc.AZIMUTH, elevation: Lc.ELEVATION },
);

const loom = makeLoom(k, P, M);
const hands = M.SCOPES[START].hands;

const drawers = M.SCOPES.map((scope, i) => `<g data-drawer="${i}">${loom.drawer(i, i === START ? Lc.SLIDE : 0, i === START)}</g>`).join("");
const frames = Lc.Y_COLS.map((_, c) => `<g data-frame="${c}">${loom.frame(c, hands)}</g>`).join("");
const tips = Lc.Y_COLS.map((_, c) => `<g data-tip="${c}" opacity="0">${loom.tip(c)}</g>`).join("");
const threadPaths = loom.threads(hands, [0, 0, 0, 0, 0]);
const threadSvg = threadPaths.map((d, i) => `<path data-thread="${i}" class="iso-line" data-tone="lo" data-free="end" d="${d}"/>`).join("");
const rows = Array.from({ length: M.ROWS }, (_, i) => M.ROWS - 1 - i);
const clothSvg = rows.map((r) => `<g data-row="${r}" display="none">${loom.clothRow(hands, r)}</g>`).join("");

const startX = Lc.NEEDLE_X + Lc.LEADIN - Lc.ROW_PITCH / 2;
const part = (name, content) => `<g data-part="${name}">${content}</g>`;
const shapes = [
  `<defs>${loom.cellDef()}</defs>`,
  part("base", loom.plate()),
  part("cabinet", loom.cabinet() + `<g data-part="drawers">${drawers}</g>` + `<g data-part="cards">${loom.cards(START, Lc.SLIDE)}</g>`),
  part("reader", loom.railsBack()),
  part("warp", loom.warp()),
  part("stands", loom.pedestals()),
  `<g data-part="threads">${threadSvg}</g>`,
  `<g data-part="frames">${frames}</g>`,
  part("reed", loom.reed()),
  part("bed", loom.deck()),
  `<g data-part="cloth">${clothSvg}</g>`,
  `<path data-part="weft" class="iso-line" data-tone="hi" d=""/>`,
  `<g data-part="shuttle" display="none" transform="${k.translateAlong(P, [-66, 0, 0])}">${loom.shuttle()}</g>`,
  part("takeup", loom.breast()),
  part("rails", loom.railsFront()),
  `<g data-part="ribbon">${loom.ribbon(startX)}</g>`,
  `<g data-part="tips">${tips}</g>`,
];

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label:
    "A card-driven loom. A punched card leaves a cabinet of five drawers, one for each scope: person, task, job family, team and org. It passes under five needles, one for each column of the card: name, trigger, steps, rules and checks. Where the card has a hole, a needle rises, lifts its harness frame and raises the threads of that column. The loom weaves the same small picture once for every person who reads the card.",
  body: shapes,
});

const strip = (file) => readFileSync(join(HERE, file), "utf8").replace(/^export /gm, "");
const live = readFileSync(join(HERE, "live.js"), "utf8").replace("__P__", JSON.stringify(P)).replace("__START__", M.SCOPES[START].id);
const CSS = readFileSync(join(HERE, "skill-loom.css"), "utf8");

const s0 = M.SCOPES[START];
const bar =
  `<div class="sl-bar" role="group" aria-label="Scope: who reads the card">${M.SCOPES.map((s, i) => `<button type="button" data-scope="${i}" aria-pressed="${i === START}">${s.name}</button>`).join("")}</div>` +
  `<dl class="sl-info" data-info>` +
  `<div><dt>Scope</dt><dd data-f="name">${s0.name}</dd></div>` +
  `<div><dt>Reads the card</dt><dd data-f="hands">${s0.hands} of ${M.SHOP.people} people</dd></div>` +
  `<div><dt>Owned by</dt><dd data-f="owner">${s0.owner}</dd></div>` +
  `<div><dt>Reviewed</dt><dd data-f="review">${s0.review}</dd></div>` +
  `<div><dt>Encodes</dt><dd data-f="encodes">${s0.encodes}</dd></div>` +
  `<div><dt>For example</dt><dd data-f="example">${s0.example}</dd></div>` +
  `</dl><p class="sl-live" data-live aria-live="polite"></p>`;

const pageBody =
  `<style>${CSS}</style>` +
  k.plateHtml({
    fig: "Fig 1",
    title: "Skill loom",
    hint: "Pick a scope, or click a drawer",
    readout: M.readoutOf(START, 0, false),
    keys: [
      { mark: "lit", label: "Needles: a hole in the card lets one rise" },
      { mark: "raised", label: "Raised cloth: every cell that had a hole" },
      { mark: "edge", label: "The drawer that is open: the scope in use" },
    ],
    caption:
      `A skill is a punched card with five columns: name, trigger, steps, rules and checks. Each row is one step of the work. Where the card has a hole, that column's needle rises, lifts its harness frame, and raises the threads it controls. The harness is tied up in repeats, so one card weaves the same picture once for every person who reads it, however many that is: 1 for a person, ${M.SCOPES.map((s) => s.hands).join(", ")} for the five scopes in ${M.SHOP.label}.`,
    body: `<div class="iso-stage sl-stage" tabindex="0" role="group" aria-label="Skill loom. Arrow keys move between scopes.">${svg}</div>${bar}`,
  });

const page = k.pageHtml({ title: "Skill loom", theme, body: pageBody, script: kitScript() + "\n" + strip("model.mjs") + "\n" + strip("loom.mjs") + "\n" + live, width: 760 });
const name = theme === "light" ? "skill-loom-light.html" : "skill-loom.html";
writeFileSync(join(HERE, name), page);
console.log("wrote", name, Math.round(page.length / 1024) + " KB");
