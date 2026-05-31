# Design Plan — The Throughline "Build"

> Turn the path from a sequence of lessons into one continuous, visible construction
> of the learner's goal deliverable. By the capstone, the asset is ~80% assembled
> from pieces the learner already made.

Status: **implemented (phases 1–5)** · Owner: product · Last updated: 2026-05-31

> Implementation note: component definitions live in `src/workshop.js` (a central
> map) rather than per-lesson frontmatter — same model, one maintainable place.
> Per-lesson retrieval is served by the "builds on" sequence chip; the cumulative
> review lives in the capstone assembly view. Naming: **"Your Workshop."**

---

## 1. Goal & pedagogical rationale

**Problem.** Lessons are individually strong (8-beat structure, worked example, hands-on
task, a "keepable asset"), but the assets live in separate pockets. The learner only
discovers at the capstone that they were meant to become *one* thing. The experience reads
as "a course of lessons," not "a build."

**Change.** Every lesson contributes a named **component** to a persistent **"Your Build"**
workspace tied to the learner's enrollment goal. The learner watches the deliverable
assemble in real time; the capstone becomes *snap the pieces together and ship*, not
*start from scratch*.

**Why this is the highest-value move.**
- **Progress principle** (Amabile): visible progress on meaningful work is the #1 driver of
  engagement. The Build makes progress concrete and goal-shaped, not a completion %.
- **Backward design** (Wiggins & McTighe): the deliverable is defined first; every lesson is
  justified by the component it adds.
- **Constructive alignment** (Biggs): each lesson's "Apply" task feeds the one assessment
  that matters (the shipped asset), so practice and assessment are the same artifact.
- **Project-based learning**: a single authentic project sustained across the path.

**Reuses existing scaffolding.** `src/goals.js` already enumerates per-goal milestones that
map 1:1 onto components. This plan wires those milestones to actually *accumulate output*.

---

## 2. Core concept — "Your Build"

The Build has two parts:

1. **Toolkit** — reusable prompts/templates from Foundations (F1–F3) and library lessons
   (e.g. A4). These are the "keepable assets" already produced; we just collect them.
2. **The Deliverable** — the goal-specific artifact, assembled from **core components**, one
   contributed per lead-track lesson. This is the thing the learner came for.

The capstone (CAP) is the **assembly + ship** step: review the components, snap them into the
final deliverable, demo, capture ROI.

---

## 3. Component model (per goal / track)

Each module declares the component it contributes. Foundations feed the Toolkit; lead-track
lessons feed the Deliverable. (Derived from existing `goals.js` milestones + each lesson's
keepable asset.)

**Foundations → Toolkit (all learners)**
| Module | Component captured |
|---|---|
| F1 | "Teammate Briefing" template |
| F2 | C-T-F-S prompt scaffold |
| F3 | First-win reusable prompt |

**Operator (A) → "Personal AI operating system"**
| A1 | Chief-of-staff daily routine |
| A2 | Analyze-&-verify block |
| A3 | Sourced-research template |
| A4 | One packaged Skill + the assembled library |

**Builder (B) → "A working tool / tested Skill"**
| B1 | First build (explore→plan→code→commit run) |
| B2 | The working internal tool + its spec |
| B3 | A tested, bundled Skill |
| B4 | A safe connector setup / plan |

**Automator (C) → "A shipped, scheduled automation"**
| C1 | Workflow map + measured baseline |
| C2 | Supervised task-loop brief |
| C3 | Subagent role breakdown |
| C4 | Hands-off operating plan (triggers/gates/logs) |

**Team Leader (D) → "An adopted AI capability"**
| D1 | AI role description |
| D2 | Shared team Skill (encoded SOP) |
| D3 | Adoption rollout plan |
| D4 | One-page governance sheet |

**Capstone (CAP)** — assembles the above into the final deliverable + demo + ROI.

---

## 4. Data model & persistence

Extend the persisted learner state (already saved to localStorage + Neon via `/api/learner`).

```
build: {
  components: {
    [moduleId]: {
      kind: "toolkit" | "deliverable",
      title: string,            // component name (from the model above)
      content: string,          // the learner's saved output (their "Apply" artifact / prompt)
      reflection: string,       // optional: "how will this change your week?"
      addedAt: ISO8601,
      fromLessonOutcome: "solid" | "mastered" | "skipped"
    }
  },
  deliverableTitle: string,     // from goal.deliverable (goals.js)
  lastAssembledAt: ISO8601 | null
}
```

- Written when a lesson is completed (hooks into the existing `onComplete` in the Lesson player).
- The component `content` is seeded from the learner's submission/draft for that lesson, editable later in the Build workspace.
- Backward-compatible: absent `build` → derive an empty one; never blocks existing flows.

No schema change needed in Neon (state is a JSON blob in the `learners.state` column).

---

## 5. Lesson-content additions

Add to each lesson's frontmatter (parsed in `curriculum.js`):

```
component_kind: deliverable        # or: toolkit
component_title: Workflow map + baseline
component_capture: |               # short instruction: what to save into the Build
  Save your step map, mechanical/judgment marks, and the baseline number.
```

`curriculum.js` already parses frontmatter; add three keys. Lessons with no component (rare)
simply contribute nothing. Authoring effort: one block per lesson (21 total), content already
implied by each lesson's existing "Apply" + keepable-asset sections.

---

## 6. UI / UX

**A. "Your Build" workspace (new screen + dashboard panel).**
- A vertical stack showing the Deliverable's components as cards: filled (done), current
  (in progress), and upcoming (ghosted). Mirrors the milestone strip but holds real content.
- Each filled card shows the saved artifact with an edit button.
- A header: *"Building: [deliverable]"* + a progress meter (`n / total components`).
- Toolkit shown as a secondary collapsible section.

**B. In-lesson capture.**
- The "Apply to YOUR work" beat gains a **"Add to your Build"** action that saves the
  learner's output into the component. Confirmation: *"✓ Added 'Workflow map' to your Build —
  3 of 5 pieces of your automation."*

**C. Always-on goal strip (supporting layer).**
- Top of every lesson: *"Toward: [deliverable] · piece 3 of 5"* using existing
  `milestoneState`. Replaces the current quieter milestone line with a Build-aware one.

**D. Sequence connectors (supporting layer).**
- Extend `goalConnector(ctx)` to: *"Builds on → [prev component]. Adds → [this component].
  Sets up → [next]."* Turns the path into a visible staircase.

**E. Capstone assembly.**
- CAP renders the collected components as a checklist to review/snap together, then the
  existing demo + ROI capture. The "build from scratch" feeling disappears.

---

## 7. Reinforcement layers (cheap, high-retention)

- **Reflection capture**: at each milestone, one prompt — *"How will this change your week?"* —
  saved with the component. Adds metacognition (Schön) and fuels the certificate testimonial.
- **Retrieval recap**: lesson start shows *"Last time you added [X]; today you add [Y]"* — a
  spaced callback (testing effect, Roediger & Karpicke) instead of cold starts.
- **Pre-capstone review beat**: a short cumulative recall of the components before assembly.

---

## 8. Personalized / variable paths & edge cases

- **Variable paths**: the personalizer composes different module sets. The Build counts only
  components for modules actually in `plan.path` (same filter as `milestoneState`).
- **Skipped lessons** (the skip-and-continue escape hatch): component is still created, marked
  `fromLessonOutcome: "skipped"`, content empty/placeholder — the Build shows a gentle
  "add this later" state rather than a hole.
- **Optional/bonus modules**: contribute to Toolkit, not the core Deliverable count.
- **Fallback paths** (`fallbackPath`): components derive from module IDs, so they work
  identically without the LLM personalizer.
- **Goal = "Explore"**: lighter deliverable; Build leans on Toolkit + the F3/A1 components.

---

## 9. Certificate integration

- Certificate already shows ROI; add **"You built: [deliverable], assembled from N components"**
  and echo the learner's enrollment Q8 success criterion: *"You said success looked like:
  '[answer]'."* Closes the goal loop explicitly.
- The Build components become the portfolio backing the credential.

---

## 10. Phased rollout

1. **Phase 1 — data + capture (no UI risk).** Add `build` to state, capture component content
   on lesson completion, frontmatter keys in `curriculum.js`. Invisible but accumulating.
2. **Phase 2 — Build workspace + dashboard panel.** The visible payoff.
3. **Phase 3 — goal strip + sequence connectors.** Coherence layer.
4. **Phase 4 — reflection + retrieval recaps.** Retention layer.
5. **Phase 5 — capstone assembly view + certificate loop-close.**
6. **Phase 6 (separate track) — depth layer** (principle line, decision rule, pro-move) and
   videos.

Each phase is independently shippable and backward-compatible.

---

## 11. Open decisions for you

1. **Component content source** — auto-seed from the learner's lesson submission, or ask them
   to paste/confirm a clean version into the Build? (Recommend: auto-seed, editable.)
2. **Build as a separate screen vs. an expanded dashboard panel?** (Recommend: dashboard panel
   first, promote to its own screen if it earns it.)
3. **Reflection prompt — required or optional?** (Recommend: optional, one line, never blocks.)
4. **Naming** — "Your Build," "Workshop," "Your Deliverable," other?
