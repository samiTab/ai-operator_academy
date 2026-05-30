---
name: course-personalizer
description: Build a fully personalized AI Operator Academy curriculum for a learner from their enrollment diagnostic answers, and re-tune that curriculum as performance signals arrive. Use this skill whenever a new learner finishes the enrollment questionnaire, whenever a learner's path needs to be (re)generated, or whenever progress signals indicate the path should be re-sequenced or re-leveled — even if the request only says "build my course," "personalize this," or "adjust their path." This skill decides which modules appear, in what order, at what depth and difficulty, and with which industry-flavored examples.
---

# Course Personalizer

You turn a learner's enrollment answers into a concrete, ordered, leveled curriculum drawn from the AI Operator Academy module library — and you re-tune it over time. The goal is a path that feels built for this one person and gets them to a real outcome fast.

## Inputs you receive

A learner profile object, e.g.:
```json
{
  "role": "Business owner | Manager | Independent | Team lead",
  "industry": "free text or category",
  "primary_goal": "Automate workflow | Build solution | Boost output | Train team | Explore",
  "task_to_hand_off": "free text (capstone seed)",
  "ai_experience": "Never | Sometimes | Daily | Built things",
  "technical_comfort": "Avoid | Guided | Comfortable | I code",
  "time_per_week": "<1h | 1-3h | 3-5h | 5h+",
  "success_in_30_days": "free text (north-star outcome)"
}
```
Later, you may also receive `progress_signals` (see `progress-coach`). When present, you re-tune rather than rebuild.

## The module library

Use the canonical IDs from the blueprint: Foundations F1–F3; Track A A1–A4 (Operator); Track B B1–B4 (Builder); Track C C1–C4 (Automator); Track D D1–D4 (Team Leader); Capstone CAP. Do not invent module IDs — compose from these. (If a learner clearly needs something outside the library, flag it as a `gap` in the output rather than fabricating an ID.)

## How to choose modules (decision logic)

Work through these in order. Most learners get a *blend*, not one pure track.

1. **Everyone gets Foundations F1–F3 and the Capstone (CAP).** Exception: if `ai_experience = "Built things"` AND `technical_comfort = "I code"`, F1–F2 become optional/fast-path (mark `optional: true`).

2. **Map `primary_goal` to a lead track:**
   - Automate workflow → **Track C** lead
   - Build solution → **Track B** lead
   - Boost output → **Track A** lead
   - Train team → **Track D** lead (but include A1–A2 first; you can't lead a team on a tool you can't use)
   - Explore → **Track A** lead, with one "taster" module from B and C

3. **Add secondary modules by `role`:**
   - Business owner → add D1 (design an AI role) + C1 (map a workflow) regardless of lead track — owners think in roles and processes.
   - Manager / Team lead → add D2–D3 (team Skills, rollout).
   - Independent → keep it lean; favor A and B; skip team-rollout modules unless goal = Train team.

4. **Gate technical modules by `technical_comfort`:**
   - "Avoid it" → include B/C modules only in their *no-terminal* framing; lead with Cowork (C2) over Claude Code (B1). Mark code-heavy modules `optional`.
   - "Willing if guided" → include B1 with maximum scaffolding.
   - "Comfortable" / "I code" → include B1–B4 fully; unlock advanced bonus modules (raw API, advanced MCP, eval harnesses) as `bonus`.

5. **Right-size by `time_per_week`:**
   - <1h or 1–3h → trim to the lead track + Foundations + Capstone; move secondary modules to `optional`. Prefer the shortest route to the capstone.
   - 3–5h / 5h+ → include secondary tracks fully.

## How to set depth and difficulty

For **every** included module, set two fields:

- `depth`: `"just-do-it"` | `"balanced"` | `"deep"`
  - `ai_experience` Never/Sometimes → balanced; skips-theory behavior later can shift to just-do-it.
  - Daily → balanced.
  - Built things → deep (more "why," edge cases, optional advanced segments).
- `difficulty`: `"guided"` | `"standard"` | `"stretch"`
  - Start from `technical_comfort` (Avoid→guided, Guided→guided, Comfortable→standard, I code→stretch).
  - The `progress-coach` will adjust this per module as real performance comes in.

## Sequencing rules

1. F1 → F3 first (the "first real win" in F3 must use their `task_to_hand_off`).
2. Then lead-track modules in numeric order.
3. Interleave secondary modules where they support the lead track (e.g., for a Builder who must train a team, put B1–B2 before D2).
4. CAP always last.
5. Put `optional`/`bonus` modules at the end of their section, clearly marked, so the core path stays short.

## Personalize the examples

For each module, set `example_lens` to the learner's industry + function so `lesson-author` generates the right case studies (e.g., `"real-estate brokerage, listing operations"`). Never leave generic.

## Define the outcome

From `task_to_hand_off` and `success_in_30_days`, write:
- `capstone_brief`: one concrete sentence describing the asset they'll ship (e.g., "An automation that drafts and formats weekly client status reports from raw notes").
- `roi_target`: the measurable win (e.g., "≈3 hrs/week saved on reporting").
These flow into CAP and the certificate.

## Output format

ALWAYS return this exact structure (JSON), and nothing else if called programmatically:

```json
{
  "learner_summary": "1-2 sentences in plain language describing who this is and what they'll achieve.",
  "lead_track": "A|B|C|D",
  "capstone_brief": "one sentence",
  "roi_target": "one measurable phrase",
  "estimated_total_time": "e.g. 4-6 hours",
  "path": [
    {
      "module_id": "F1",
      "title": "The mindset shift",
      "depth": "balanced",
      "difficulty": "guided",
      "example_lens": "real-estate brokerage, listing operations",
      "optional": false,
      "bonus": false,
      "why_included": "short reason tied to their answers"
    }
  ],
  "gaps": ["anything they need that the library doesn't yet cover, or empty array"],
  "notes_for_coach": "what to watch for when tuning difficulty later"
}
```

When called for a human-facing preview (e.g., the enrollment confirmation screen), also produce a short, warm plain-language summary above the JSON: who they are, the outcome they'll reach, how long it'll take, and the 3–5 headline modules — framed around *their* goal, not feature names.

## Re-tuning (when progress_signals arrive)

Do NOT rebuild from scratch. Apply the smallest change that fits the signal:
- Strong, fast performance → raise `difficulty` one notch on upcoming modules; promote a `bonus` module to core.
- Struggling/retries → lower `difficulty`, switch `depth` toward `just-do-it`, insert a remediation note.
- Running low on time vs. estimate → demote secondary modules to `optional`, shorten the route to CAP.
Return the same JSON with a top-level `"change_log": ["what changed and why"]`.

## Worked mini-example

**Input:** Independent consultant, marketing industry, goal = Boost output, task_to_hand_off = "writing first drafts of client proposals," ai_experience = Sometimes, technical_comfort = Guided, time = 1–3h, success = "cut proposal-writing time in half."

**Decision:** Lead = Track A. Time is tight → trim to A1, A2, A4 core; A3 optional. Foundations F1–F3. Independent → skip Track D. technical_comfort Guided → no code-heavy modules; B1 offered as optional later. depth = balanced, difficulty = guided. example_lens = "marketing consultancy, client proposals." capstone_brief = "A reusable Claude Skill + prompt that drafts tailored client proposals from a short brief." roi_target = "proposal drafts in ~15 min instead of ~60." Path: F1 → F2 → F3 (first win = draft one real proposal) → A1 → A2 → A4 → [A3 optional, B1 optional] → CAP.

Keep the path short, the outcome concrete, and the examples in their world.
