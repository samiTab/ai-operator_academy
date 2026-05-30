# Curriculum — Phase 1 content

Full lesson scripts for **Foundations**, **all four tracks** (A Operator, B Builder,
C Automator, D Team Leader), and the shared **Capstone** — authored via the `lesson-author`
skill and following the academy's fixed **8-beat structure** (see
[skills/lesson-author/SKILL.md](../skills/lesson-author/SKILL.md)).

These are the **canonical "master" lessons**, written at a neutral default profile so the
brain can re-tune them per learner:

- **Depth:** `balanced` (≈3–5 sentence concept + one analogy)
- **Difficulty:** `standard` (normal scaffolding, one hint)
- **Example lens:** each lesson anchors on a *specific, believable* case study, but the
  hands-on "Do it" beat is written so any learner can swap in their own industry.

At runtime, `course-personalizer` decides which of these appear and in what order, and
`lesson-author` regenerates any module at a different depth/difficulty/lens for the
individual learner. `exercise-grader` consumes the `grading_rubric` JSON appended to each
lesson; `progress-coach` reads the resulting signals.

## Modules in this package

### Foundations (almost everyone)
| ID | Title | File |
|----|-------|------|
| F1 | The mindset shift | [foundations/F1.md](foundations/F1.md) |
| F2 | Talking to Claude that gets results | [foundations/F2.md](foundations/F2.md) |
| F3 | Your first real win | [foundations/F3.md](foundations/F3.md) |

### Track A — The Operator (own output)
| ID | Title | File |
|----|-------|------|
| A1 | Claude as your chief of staff | [track-a-operator/A1.md](track-a-operator/A1.md) |
| A2 | Documents & data | [track-a-operator/A2.md](track-a-operator/A2.md) |
| A3 | Research & synthesis | [track-a-operator/A3.md](track-a-operator/A3.md) |
| A4 | Your personal prompt & Skills library | [track-a-operator/A4.md](track-a-operator/A4.md) |

### Track C — The Automator (workflows)
| ID | Title | File |
|----|-------|------|
| C1 | Map a workflow worth automating | [track-c-automator/C1.md](track-c-automator/C1.md) |
| C2 | Claude Cowork task loops | [track-c-automator/C2.md](track-c-automator/C2.md) |
| C3 | Agents & subagents | [track-c-automator/C3.md](track-c-automator/C3.md) |
| C4 | Scheduled & multi-step automations | [track-c-automator/C4.md](track-c-automator/C4.md) |

> Track C is a continuous build: C1 maps and measures a workflow, C2 delegates it as a Cowork
> loop, C3 splits big jobs into subagents, and C4 makes it run hands-off — ending in the
> learner's **capstone** automation with a measured ROI claim.

### Track B — The Builder (solutions, non-coder-friendly)
| ID | Title | File |
|----|-------|------|
| B1 | Claude Code without fear | [track-b-builder/B1.md](track-b-builder/B1.md) |
| B2 | Build a small internal tool | [track-b-builder/B2.md](track-b-builder/B2.md) |
| B3 | Agent Skills | [track-b-builder/B3.md](track-b-builder/B3.md) |
| B4 | Connect your tools (MCP) | [track-b-builder/B4.md](track-b-builder/B4.md) |

> Track B builds confidence first (B1) then a real tool (B2), packages know-how into a tested
> Skill (B3), and connects Claude to live apps safely (B4). `sandbox` is `false` for B1/B2/B4
> — they run on the learner's own machine/accounts.

### Track D — The Team Leader (AI as teammate)
| ID | Title | File |
|----|-------|------|
| D1 | Design an AI role | [track-d-team-leader/D1.md](track-d-team-leader/D1.md) |
| D2 | Team Skills & SOPs | [track-d-team-leader/D2.md](track-d-team-leader/D2.md) |
| D3 | Rollout & adoption | [track-d-team-leader/D3.md](track-d-team-leader/D3.md) |
| D4 | Governance, safety & measurement | [track-d-team-leader/D4.md](track-d-team-leader/D4.md) |

> Track D scales AI from individual to team: design the role (D1), equip it with shared Skills
> from your SOPs (D2), roll it out so people actually adopt it (D3), and govern it safely with
> honest ROI measurement (D4).

### Capstone (everyone)
| ID | Title | File |
|----|-------|------|
| CAP | Ship your asset | [capstone/CAP.md](capstone/CAP.md) |

> Every learner ends here. CAP is a guided **build-and-ship** of the real asset from their
> enrollment goal + lead track, demoed on a real case with a measured ROI number. Its
> `grading_rubric` carries `unlocks_certificate: true` — completing the path **and** shipping
> the capstone is what `certificate-issuer` validates into a verifiable credential.

## Each lesson contains (the quality bar)
1. The full 8 beats: Hook → Concept → Demo → Do it → Check → Apply → Retain → ROI beat
2. ≥1 industry case study with realistic names/numbers
3. A **keepable asset** in a copy-paste block (prompt, template, checklist, or Skill)
4. A **Common mistakes** callout
5. An **honest limit** (where Claude is weak here)
6. An appended `grading_rubric` JSON block for `exercise-grader`

## Screenshots
`![demo](screenshot: …)` placeholders mark where an annotated screen capture goes when the
lesson player is built (Phase 2). The bracketed text describes exactly what each shot shows.
