# Prompt Audit: Claude-skills

Run: 2026-09-23, `/claude-api prompt-audit`. Deliverables: this report and `proposed.diff` (7 files, +66/-89). No skill file was edited; apply with `git apply audits/2026-09-23-prompt-audit/proposed.diff` or take hunks selectively.

## Stated assumptions

| Assumption | Value | How it was chosen |
|---|---|---|
| Scope | Whole repo prompt surface: 16 `SKILL.md` files, their reference `.md` files, and `mcp-builder/scripts/evaluation.py` (the only code that calls the Claude API) | Request named no path |
| Target model | `claude-opus-5` | The only model the repo names is `claude-3-7-sonnet-20250219` (retired), so the audit falls back to the current flagship default. Findings that matter only on Claude Opus 5.5 / Claude Fable 5.1 are marked as such |
| Provenance | 13 of 16 skills are the upstream Anthropic example set (Oct 2025); `perplexity-training-generator` is locally authored (2025-10-29) | `git log` |
| Non-Anthropic providers | None found | grep for openai / langchain / gemini / mistral / cohere / ollama |

## Summary

| Group | Findings | In diff |
|---|---|---|
| 1a Pressure language | 3 | 3 |
| 1b Scaffolds replaced by features | 1 | 1 |
| 1c Over-specification / contradictions | 2 | 2 |
| 1d Fossils | 2 | 2 |
| 2 Brittle skill files | 3 | 1 |
| 4 Request config / harness | 3 | 2 |
| Flags (no edit) | 5 | 0 |

Highest impact:

1. **`evaluation.py` sends only the first `tool_result` when Claude makes parallel tool calls** (F1). Parallel tool use is on by default, so any turn with 2+ calls returns a 400 and kills the eval run.
2. **Retired model pinned as the default** (F2): `claude-3-7-sonnet-20250219` in the script, its `--help`, and `reference/evaluation.md`.
3. **canvas-design / algorithmic-art tell the model to repeat itself and invent a user complaint** (F4, F5). "Emphasize craftsmanship REPEATEDLY" sits directly under "Avoid redundancy", and "The user ALREADY said 'It isn't perfect enough'" is a fabricated quote used as pressure.

## Findings (ordered by confidence)

| ID | Location | Evidence | Pattern | Why obsolete for target | Conf. | Action |
|---|---|---|---|---|---|---|
| F1 | `mcp-builder/scripts/evaluation.py:110-135` | `tool_use = next(block ... if block.type == "tool_use")` then one `tool_result` | G4 harness | Current models emit parallel `tool_use` blocks by default; every one needs a `tool_result` in a single user message or the API returns 400 | High | rewrite: loop over all `tool_use` blocks, return all results in one message (verified with a stub client) |
| F2 | `evaluation.py:223, 318, 324`; `reference/evaluation.md:488, 599` | `claude-3-7-sonnet-20250219`, `claude-3-5-sonnet-20241022` | 1d fossil / G4 API fossil | Retired model IDs; requests fail | High | rewrite to `claude-opus-5` (epilog example: `claude-sonnet-5`); timeout tip reworded |
| F3 | `evaluation.py:99, 141` | `max_tokens=4096` | G4 thinking/max_tokens sizing | Opus 5 runs adaptive thinking by default and thinking counts toward `max_tokens`; 4096 can cut the answer before `<response>`, scoring a correct run as 0. Also `next(... hasattr(block,"text"))` returned `None` on such cuts and crashed `re.findall` | High | rewrite: 16000 (non-streaming default); join text blocks so result is never `None` |
| F4 | `canvas-design/SKILL.md:46-48, 83`; `algorithmic-art/SKILL.md:47-49` | "Emphasize craftsmanship REPEATEDLY ... MUST stress multiple times ... repeat phrases like..." | 1c repetition as reinforcement; duplicates disagree | Directly contradicts the "Avoid redundancy" bullet above it; current models apply every instruction literally, so the philosophy .md gets padded with stock phrases | Medium | rewrite: state the bar once |
| F5 | `canvas-design/SKILL.md:122` | `IMPORTANT: The user ALREADY said "It isn't perfect enough..."` | 1a pressure (anxious register) | A fabricated user quote as a motivator; current models respond to a plainly stated bar, and the invented complaint can leak into replies | Medium | rewrite: "The first draft is not the finished piece: the bar is pristine, museum-ready work, so take a refinement pass." Keeps line 124's refine-don't-add guidance |
| F6 | `canvas-design/SKILL.md:46, 91, 96, 104, 114`; `algorithmic-art/SKILL.md:47, 92, 97` | 10 caps markers in 129 lines (`CRITICAL STEP`, `VERY IMPORTANT`, ...) | 1a marker inflation | When every section is critical, the markers carry no signal and push over-application | Medium | rewrite: drop markers, keep all content |
| F7 | `canvas-design/SKILL.md:102`; `algorithmic-art/SKILL.md:103` | "Take a moment to gather thoughts and clear the mind" / "Pause to gather thoughts" | 1b think-step idiom | Opus 5 thinks adaptively by default; prose incantation does nothing | Medium | remove |
| F8 | `docx/SKILL.md:59, 68, 116`; `pptx/SKILL.md:151, 176` | `MANDATORY - READ ENTIRE FILE ... NEVER set any range limits` | 1a pressure + 2 volatile specifics | A partial-read workaround; files are 349-624 lines, under the Read tool's default window. Stated sizes are wrong (`docx-js.md` "~500" is 349; pptx `ooxml.md` "~500" is 426) | Medium | rewrite: "Read X in full before writing code" + the reason (invalid-file prevention); drop line counts |
| F9 | `perplexity-training-generator/SKILL.md:131` vs `:174` | "Include placeholders like [Company Name]" vs "No generic placeholder text remains" | 1c duplicates disagree | The model must reconcile a direct contradiction on every run | Medium | rewrite line 174 to scope the check |
| F10 | `evaluation.py:21-53` | `You are an AI assistant with access to tools. When given a task, you MUST:` + bullet walls | 1d identity stub; 1a; 1c bullet walls | The role line was the only context: the model was never told it is testing an MCP server for its developers | Medium | rewrite: one context sentence, the three tagged sections in plain prose; format pinned (kept - exact-match extraction is format-sensitive). Drops "how you arrived at the response" (reasoning reproduction, see Flag X3) |
| F11 | `perplexity-training-generator/SKILL.md` (whole) | "focuses on **Perplexity Spaces** as the core capability" | 2 volatile specifics | Your deployed version of this skill describes "Projects (formerly Spaces)", Comet, and Computer as co-equal. This repo copy is v1.1.0 and stale | Medium | sync: replace with the deployed version (not in the repo, so no hunk) |
| F12 | `evaluation.py` (whole) | no `response.usage` capture | G4 no token accounting | Without per-run token counts you cannot price eval runs or measure prompt cleanups | Medium | add: sum `response.usage.input_tokens` / `output_tokens` per task into the report (recommended, not in diff to keep F1 reviewable) |

### Flags (no edit proposed)

| ID | Location | Note |
|---|---|---|
| X1 | `perplexity-training-generator/SKILL.md:2` | `name: "Perplexity Enterprise Pro Training Guide Generator"` breaks `agent_skills_spec.md:26-28` (hyphen-case, must match folder). Spec issue, not cruft |
| X2 | `perplexity-training-generator/SKILL.md:214-217` | "Do NOT use for" lives in the body, which is only read after triggering. Moving it into `description` would make it a routing signal |
| X3 | `evaluation.py` prompt | Asking for "how you arrived at the response" is reasoning reproduction. Harmless on Opus 5; on Claude Opus 5.5 / Fable 5.1 it can draw a `reasoning_extraction` refusal. F10 already removes it |
| X4 | `evaluation.py` | No `stop_reason == "refusal"` / `"max_tokens"` handling. Server-side `fallbacks` deliberately **not** proposed: a silent switch to another model would contaminate eval scores |
| X5 | `artifacts-builder/SKILL.md:20` | `VERY IMPORTANT` on the anti-"AI slop" list. It is the file's only emphasis and names specific defaults (the form that works), so it stays |

## Reviewed and kept (keep list)

| Location | Why it stays |
|---|---|
| `docx/docx-js.md` (32 caps markers), `pptx/html2pptx.md` | Tool contract with reasons: "creates invalid XML Word cannot open", "causes file corruption", "black backgrounds". Keep list #3/#4. The bullet rule is stated 4 times but consistently (working redundancy, #8) |
| `pdf/forms.md:1` "complete these steps in order" | Fragile sequence: scripts depend on prior outputs (#3) |
| `xlsx/SKILL.md` "ZERO formula errors" | Quality bar (#1) |
| `webapp-testing/SKILL.md:14` "DO NOT read the source" | Carries its reason (context pollution) |
| `mcp-builder/reference/evaluation.md:47-51` "MUST be independent / non-destructive" | Real constraints on eval design |
| Perplexity skill: fixed counts (3-4 tabs, 5-day plan), branding palette, 3 examples | Author's product spec; examples are brief and varied |
| Skill `description` fields | Routing text may carry urgency (Group 3 split) |

## Verification done

- `python3 -m py_compile evaluation.py` passes with the patch.
- Stub-client test: a turn with two parallel `tool_use` blocks now yields one user message with both `tool_result`s (ids `a`,`b`), score 1.
- `git apply --check proposed.diff` clean against `5d63935`.
- `grep -rn claude-3` returns nothing after the patch.

## Not done (Step 7)

No live model runs. Suggested probe before merging the skill hunks: generate 3 canvas-design pieces on the old and new SKILL.md and compare the philosophy .md for stock-phrase repetition.
