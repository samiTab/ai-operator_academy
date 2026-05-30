# Agent Orchestration — AI Operator Academy

How the six Agent Skills coordinate into the end-to-end learner journey, plus the subagent patterns for building and maintaining the platform.

There are two "agent" layers:
1. **The Learner Brain** — runs the live experience for each learner (personalize, teach, grade, coach, certify).
2. **The Studio Crew** — internal subagents you (the builders) run to produce and maintain content & marketing at scale.

---

## 1. The Learner Brain — runtime flow

Each box is a skill invocation. State (profile, path, signals, assets, ROI ledger) lives in the data layer and is passed in/out.

```
        ┌─────────────────────────────────────────────────────────┐
        │ ENROLLMENT                                                │
        │  app collects 8 diagnostic answers                        │
        └───────────────┬───────────────────────────────────────────┘
                        ▼
        ┌─────────────────────────────────────────────────────────┐
        │ course-personalizer                                       │
        │  → personalized path (modules, depth, difficulty, lens)   │
        │  → capstone_brief + roi_target                            │
        │  shows learner a warm "here's your custom course" preview │
        └───────────────┬───────────────────────────────────────────┘
                        ▼
        ┌──────────────── for each module in path ─────────────────┐
        │                                                           │
        │  lesson-author  → renders the lesson (8 beats) at the     │
        │                   module's depth/difficulty/lens          │
        │            │                                              │
        │            ▼                                              │
        │  learner does the "Do it" task in the sandbox             │
        │            │                                              │
        │            ▼                                              │
        │  exercise-grader → outcome + feedback + signals           │
        │            │                                              │
        │            ▼                                              │
        │  progress-coach → next_step + difficulty/depth changes    │
        │            │            │                                 │
        │            │            └─ if escalate_to_personalizer ──┐ │
        │            ▼                                            │ │
        │   (advance / adjust / support / re-engage)              │ │
        │            └──────────────◄─────────────────────────────┘ │
        │                 course-personalizer re-tunes path          │
        └───────────────┬───────────────────────────────────────────┘
                        ▼  (after CAP capstone shipped)
        ┌─────────────────────────────────────────────────────────┐
        │ certificate-issuer                                        │
        │  verifies path + capstone + ROI → issues credential       │
        │  writes registry record, returns share copy + render spec │
        └─────────────────────────────────────────────────────────┘
```

### Invocation contract (who calls whom with what)

| Step | Skill | Receives | Returns | Writes to data |
|---|---|---|---|---|
| Enroll | `course-personalizer` | learner profile (8 answers) | path + capstone_brief + roi_target | `learner.path`, `learner.outcome` |
| Each lesson | `lesson-author` | one module spec from path | lesson markdown + grading_rubric | cache lesson |
| Each submission | `exercise-grader` | rubric + submission + attempt# | outcome + feedback + signals | `progress.signals[]`, asset library |
| Between lessons | `progress-coach` | profile + path + recent signals + streak | next_step + tuning + nudge | `progress.tuning` |
| On strong/weak trend | `course-personalizer` (re-tune) | profile + signals | revised path + change_log | `learner.path` |
| On completion | `certificate-issuer` | progress record + capstone asset | credential or "what's left" | `certificate.registry` |

### Key runtime rules
- **Personalizer is called twice-ish:** once at enrollment, then only for *re-tunes* triggered by the coach (not every lesson — that would be wasteful and jarring).
- **The coach is the traffic cop** between lessons; the personalizer is the architect. Keep that separation.
- **Never block completion on optional/bonus modules.**
- **The grader's signals must be honest** — they drive everything downstream.

---

## 2. The Studio Crew — build/maintain subagents

These are internal subagents (run via Claude Code / Cowork with subagents, or sequentially on Claude.ai) that the team uses to produce and maintain the platform at scale. They mostly wrap the same skills but operate in batch.

### Subagent roster

- **`curriculum-builder`** — Given the module library, batch-produces full lesson content for each module across the depth × difficulty matrix you want to pre-bake (or confirms which are generated live). Uses `lesson-author`. Output: a content library keyed by `module_id × depth × difficulty × example_lens-template`.
- **`example-localizer`** — Given a target industry, regenerates each module's case study/examples for that vertical via `lesson-author`'s `example_lens`. This is how you spin up "Real Estate Edition," "Legal Edition," etc., cheaply.
- **`freshness-watcher`** — Periodically checks Anthropic's docs/changelog for new Claude / Claude Code / Cowork / Skills / MCP capabilities. When something material ships, it drafts new/updated lessons via `lesson-author` and flags them for human review. This powers the "living curriculum" selling point.
- **`marketing-studio`** — Batch-produces campaigns via `marketing-generator`: landing page, a social calendar, image briefs, and video scripts. Pulls real capstone outcomes from the ROI ledger as proof (with human approval before any claim ships).
- **`qa-reviewer`** — Reviews generated lessons against the academy quality bar (has a case study? a keepable asset? a common-mistakes callout? an honest limit? accurate product claims?). Rejects and returns notes if any are missing. Run this on everything `curriculum-builder` and `freshness-watcher` produce.

### Suggested subagent task template (for Claude Code / Cowork)
```
Role: <subagent name>
Skill to use: <skill path>
Task: <specific batch task>
Inputs: <files / parameters>
Quality bar: must pass qa-reviewer checklist (case study, keepable asset,
             common-mistakes callout, honest limit, accurate product claims)
Save outputs to: <path>
Then: hand to qa-reviewer before marking done.
```

### Orchestration patterns
- **Fan-out / fan-in:** `curriculum-builder` fans out one subagent per module, then `qa-reviewer` fans in to gate quality. Same for `example-localizer` per industry.
- **Watch → draft → review → publish:** `freshness-watcher` runs on a schedule; anything it drafts goes through `qa-reviewer` and a human before publishing. **No auto-publish of unreviewed content** — accuracy is the brand.
- **Proof loop:** at each capstone, the app logs the asset + ROI to the ledger; `marketing-studio` periodically harvests *approved* ones into fresh social proof.

---

## 3. Data the brain reads/writes (minimum schema)

```json
{
  "learner": {
    "id": "...", "name": "...", "profile": { "8 enrollment answers": "..." },
    "path": [ "module specs from personalizer" ],
    "outcome": { "capstone_brief": "...", "roi_target": "..." }
  },
  "progress": {
    "signals": [ "per-lesson outcomes + signals from grader" ],
    "tuning": { "current difficulty/depth per module" },
    "streak_days": 0
  },
  "assets": [ "keepable assets + capstone artifact, with refs" ],
  "roi_ledger": [ { "learner_id": "...", "asset": "...", "time_saved_per_week": "...", "approved_for_marketing": false } ],
  "certificates": [ { "credential_id": "...", "...": "registry record" } ]
}
```

---

## 4. Where this connects to the real Claude product surface

- **Live sandbox & personalization brain:** the Claude **API** (system prompts that load these skills' instructions).
- **The Skills themselves:** authored as **Agent Skills** (`SKILL.md`), usable in Claude Code / Cowork for the Studio Crew, and as instruction blocks for the API-driven Learner Brain.
- **Building the platform:** Claude **Code** for the app; **Cowork** + subagents for the Studio Crew batch work; **MCP** connectors if the platform needs to read your LMS/CRM/analytics.

Read the `samples/sample-personalized-curriculum.md` next to see the brain produce a real path end-to-end for one persona.
