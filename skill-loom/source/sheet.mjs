import { SCOPES, SHOP, COLUMNS, ROWS, GLYPH, raisedCells } from "./model.mjs";

const part = (id) => `[data-part="${id}"]`;
const pick = (i) => [["eval", `(document.querySelector('[data-scope="${i}"]').click(), null)`], ["wait", 500]];
const view = (i) => ({ actions: pick(i), reset: [] });
const team = SCOPES.find((s) => s.id === "team");
const org = SCOPES.find((s) => s.id === "org");
const raised = GLYPH.flat().reduce((a, b) => a + b, 0);

export default {
  page: "skill-loom-light.html",
  out: "skill-loom",
  reduced: true,
  views: { person: view(0), task: view(1), family: view(2), team: view(3), org: view(4) },

  name: "Skill loom",
  title: "Skill loom: how one skill reaches a whole team",
  number: "AN-001",
  tagline: "One card, as many hands as read it",
  question: "How does one written skill turn into the same good work for many people?",
  lead: `A skill is a card with ${COLUMNS.length} columns of holes: ${COLUMNS.join(", ").toLowerCase()}. Each of its ${ROWS} rows is one step of the work. Where the card has a hole, a needle rises and lifts the threads of that column, so the loom weaves the same small picture every time. The harness is tied up in repeats, so a bigger scope does not need a bigger card: ${SHOP.label} gets 1 picture at the Person scope and ${org.hands} at the Org scope from the same card.`,
  quote: "Same card, same cloth",
  numbers: [
    [String(COLUMNS.length), "columns", "name, trigger, steps, rules, checks"],
    [String(ROWS), "rows", "one per step of the work"],
    [String(raised), "holes", "per card, per picture"],
    [String(raisedCells(org.hands)), "raised cells", `at Org scope, all alike`],
  ],
  spec: [
    ["Columns", COLUMNS.join(", ")],
    ["Rows", `${ROWS}, one step each`],
    ["Scopes", SCOPES.map((s) => s.name).join(", ")],
    ["Readers", SCOPES.map((s) => s.hands).join(", ") + ` of ${SHOP.people}`],
    ["Example shop", SHOP.label],
  ],
  why: {
    title: "Why a card, not a prompt?",
    text: "A prompt is typed fresh each time, so each person gets a slightly different result. A card is made once, owned by someone, and read the same way by every hand. When the work changes, the owner fixes the card and everyone gets the fix.",
  },

  parts: [
    { id: "cabinet", name: "Card cabinet", say: "Five drawers, one per scope. The open drawer is the scope in use.", select: part("cabinet") },
    { id: "ribbon", name: "The card", say: "Five columns of holes; each row is one step of the work.", select: part("ribbon") },
    { id: "reader", name: "Read head", say: "Holds the card over the needles.", select: part("reader") },
    { id: "frames", name: "Harness frames", say: "One frame per column. A needle through a hole lifts its frame.", select: part("frames") },
    { id: "threads", name: "Warp threads", say: "Each thread rides on one frame, repeated once per reader.", select: part("threads") },
    { id: "reed", name: "Reed", say: "A comb that keeps the threads evenly spaced at the fell.", select: part("reed") },
    { id: "cloth", name: "Cloth", say: "The result: raised cells where the card had holes, the same for every hand.", select: part("cloth") },
    { id: "warp", name: "Warp beam", say: "Holds the threads before they are woven.", select: part("warp") },
    { id: "takeup", name: "Take-up beam", say: "Draws the finished cloth forward one row at a time.", select: part("takeup") },
  ],

  main: { view: "team" },
  inset: { label: "Person scope", view: "person" },
  steps: [
    { view: "team", title: "Pick a scope", text: `Each drawer is a scope. At Team, ${team.hands} of ${SHOP.people} people read the card. It is owned by ${team.owner.toLowerCase()} and reviewed ${team.review.toLowerCase()}.`, focus: ["cabinet"] },
    { view: "team", title: "The card feeds in", text: "The card leaves its drawer and passes under the read head, one row at a time.", focus: ["ribbon", "reader"] },
    { view: "team", title: "Holes lift frames", text: "Where a row has a hole, that column's needle rises and lifts its frame.", focus: ["frames"] },
    { view: "team", title: "Threads follow", text: `Each frame carries the threads of one column, repeated ${team.hands} times for ${team.hands} hands.`, focus: ["threads", "reed"] },
    { view: "team", title: "Same picture each", text: `${raisedCells(team.hands)} raised cells, ${raised} per hand, all alike.`, focus: ["cloth", "takeup"] },
    { view: "person", title: "Or just one hand", text: "At Person scope the same card makes one picture: your own habits, only yours.", focus: ["cloth"] },
    { view: "org", title: "Or the whole shop", text: `At Org scope, ${org.hands} of ${SHOP.people}. Same card, ${org.hands} identical pictures. It is reviewed ${org.review.toLowerCase()}.`, focus: ["cloth", "cabinet"] },
  ],
  details: [
    { view: "team", title: "The card", text: "Five columns, eight rows, printed with the column names.", around: ["ribbon"], focus: ["ribbon"] },
    { view: "team", title: "The drawers", text: SCOPES.map((s) => s.name).join(", ") + ".", around: ["cabinet"], focus: ["cabinet"] },
    { view: "org", title: "The cloth", text: `${raisedCells(org.hands)} raised cells at Org scope.`, around: ["cloth"], focus: ["cloth"] },
  ],
};
