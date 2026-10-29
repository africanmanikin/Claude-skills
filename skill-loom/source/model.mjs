// The one place the figure's numbers and words come from.
// Edit SCOPES to describe your own organisation; the machine, the readout and the printed sheet follow.

// A skill is a card with five columns of holes, one per part of a skill file.
export const COLUMNS = ["Name", "Trigger", "Steps", "Rules", "Checks"];

// One row of the card is one step of the work. 1 = a hole: the needle passes, the frame lifts,
// the thread rises and the cell on the cloth is raised. Rows are listed in the order they are woven,
// so the first row ends up nearest the weaver and the picture reads upright from the back.
export const GLYPH = [
  [1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1],
  [1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1],
  [1, 1, 1, 1, 1],
  [0, 1, 1, 1, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 1, 0, 0],
];

// The example shop the "hands" are counted in.
export const SHOP = { people: 5, label: "an example shop of 5 people" };

// Who reads the same card. hands = how many people get the identical result from one card.
export const SCOPES = [
  { id: "person", name: "Person", short: "PERSON", hands: 1, owner: "You", review: "When you feel like it", encodes: "Your own habits and shortcuts", example: "My weekly status format" },
  { id: "task", name: "Task", short: "TASK", hands: 2, owner: "Whoever does the task", review: "After any miss", encodes: "The steps of one repeatable job", example: "Client recap" },
  { id: "family", name: "Job family", short: "JOB FAMILY", hands: 3, owner: "The role lead", review: "Each quarter", encodes: "What good looks like in a craft", example: "Designer handoff checklist" },
  { id: "team", name: "Team", short: "TEAM", hands: 4, owner: "The team lead", review: "Each month", encodes: "Handoffs and approval gates", example: "Sprint kickoff" },
  { id: "org", name: "Org", short: "ORG", hands: 5, owner: "Leadership", review: "Each quarter and after any incident", encodes: "Brand, risk and always-on rules", example: "Brand and data rules" },
];

export const ROWS = GLYPH.length;
export const WIDTH_CELLS = COLUMNS.length;
export const holesIn = (row) => GLYPH[row].reduce((sum, bit) => sum + bit, 0);
export const raisedCells = (hands) => hands * GLYPH.flat().reduce((sum, bit) => sum + bit, 0);
export const totalCells = (hands) => hands * ROWS * WIDTH_CELLS;

// Every number the readout, caption and sheet quote.
export function readoutOf(scope, pick, done) {
  const s = SCOPES[scope];
  const head = `${s.name} · ${s.hands} of ${SHOP.people} hands`;
  if (done) return `${head} · ${raisedCells(s.hands)} raised, all alike`;
  if (!pick) return `${head} · card ready`;
  return `${head} · row ${pick} of ${ROWS} · ${holesIn(pick - 1)} of ${WIDTH_CELLS} open`;
}
