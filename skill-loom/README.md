# Skill loom

An isometric explainer built with the `anatomy` skill (https://github.com/wheresryan22/anatomy).
It shows how one skill (a punched card) serves a person, a task, a job family, a team and an org.

| File | What it is |
|---|---|
| `skill-loom-light.html` | Interactive figure, light theme. Open in a browser. |
| `skill-loom.html` | Same figure, dark theme. |
| `skill-loom-poster-a4.pdf`, `-drawing-a4.pdf`, `-detailed-a4.pdf` | Printable handouts. |
| `preview/` | PNG previews. |
| `source/` | Build files. |

Edit the words and numbers in `source/model.mjs` (the `SCOPES` table, `SHOP`, `GLYPH`).
To rebuild, copy `source/` into `anatomy/examples/skill-loom/` and run `node build.mjs --light`, `node build.mjs`,
then `node scripts/print.mjs examples/skill-loom/sheet.mjs --format all`.
