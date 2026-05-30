# Phase 4 — Launch & Iterate Playbook

> The product is built (Phases 0–3): blueprint, six Agent Skills, 20 authored lessons, a
> working adaptive app (enroll → personalize → learn-by-doing → ship → certify), and a
> marketing suite. Phase 4 is about getting real learners through it, capturing proof, and
> tuning the system on real signals. This is an operating plan, not code.

---

## 0. The goal of Phase 4
Turn a built product into a **proven** one: a small founding cohort ships real assets, we
capture honest ROI + testimonials, and we use the live signals to tune adaptivity and decide
what to expand. Success = a handful of defensible "I built X, it saves me Y hours/week"
stories and a course that measurably gets people to ship.

---

## 1. Founding cohort (the beta)

**Size:** 10–20 hand-picked learners. Small enough to support personally, large enough to
surface patterns.

**Who:** a deliberate mix across the four tracks so every track gets real-world testing —
e.g. 2–3 business owners (Automator), 2–3 independents (Operator), 2–3 builders (Builder),
2–3 managers (Team Leader). Bias toward people with a *clear, painful, repetitive task* —
they get the fastest, most quotable wins.

**The offer (transparent, honesty-first):**
- Free or steeply discounted founding access (`[PRICE / FREE]`) in exchange for: finishing
  the path, shipping a capstone, and giving honest feedback + a usable testimonial *if*
  they're happy (never required, never fabricated).
- Clear terms, no hidden charges, no auto-renew. State the time commitment up front
  (~4–8 hours over `[N]` weeks).
- A founding-member perk: locked-in price on future tiers / lifetime "living curriculum"
  updates `[CONFIRM]`.

**Recruitment channels:** warm network first (highest trust), then the LinkedIn calendar's
"founding cohort" CTA (see [marketing/social-content-calendar.md](../marketing/social-content-calendar.md)),
then 1–2 relevant communities. Aim for fit over volume.

---

## 2. Onboarding & support
- **Kickoff (group, 30 min):** the honest pitch, what they'll build, how to give feedback,
  the privacy/data rules from D4. Set the expectation: *you finish holding a real asset.*
- **Each learner names their capstone target on day one** (their enrollment Q4/Q8). This is
  the single biggest predictor of finishing — a concrete, personal target.
- **Office hours** (`[weekly / async channel]`) to unblock the Builder/Automator setup
  steps (Claude Code install, connectors) — that's where beta learners stall.
- **A buddy/champion model** for any team-track learners (mirrors D3).

---

## 3. What to measure (the beta scorecard)
Track honestly — including misses (the D4 principle). The app already records most of this.

| Metric | Source | Target (set your own) |
|--------|--------|-----------------------|
| **Activation** — % who finish enrollment → first lesson | app flow | `[ ]` |
| **First-win rate** — % who pass F3 | grader outcomes | `[ ]` |
| **Completion** — % who finish the core path | dashboard progress | `[ ]` |
| **Ship rate** — % who ship a capstone (earn the cert) | certificate registry | the north star |
| **Measured ROI** — median hours/week saved per shipped capstone | ROI tally / testimonial capture | `[ ]` |
| **Where it stalls** — the module with the highest drop-off | grader/progress signals | find & fix |
| **Adaptivity quality** — retries-per-lesson, hint usage trend | coach signals | should fall over time |
| **Satisfaction** — rating at capstone | testimonial capture | `[ ]` |

> The app's **testimonial + ROI capture** (Phase 4 code, on the certificate screen) and the
> **localStorage registries** (`aoa:registry:v1`, `aoa:feedback:v1`) are your raw data. In a
> hosted version these move to a real backend; for the beta, export them per-learner.

---

## 4. Collect ROI testimonials (the funnel's fuel)
The most persuasive marketing asset is a real learner outcome — so the capstone *is* the
testimonial engine.
- At the certificate step, the app now asks (consent-gated): a rating, **what they built**,
  and **hours saved/week**. Only shared with permission.
- For happy, consenting learners, follow up for a 30-second testimonial video
  (see [marketing/video-scripts.md](../marketing/video-scripts.md) SCRIPT-03) showing the
  *actual asset*.
- Feed every verified quote/metric into the `[REAL_LEARNER_QUOTE]` / `[METRIC]` placeholders
  across the landing page and social calendar. **Never** fabricate — placeholders stay empty
  until real data exists.

---

## 5. Tune adaptivity (use the live signals)
The app now wires a lightweight **progress-coach** into the lesson flow: it reads grading
signals (first-try success, retries, struggle, advanced ability) and nudges difficulty
up or down for upcoming lessons, with a visible coach note.

Phase 4 work is to **tune the rules with real data**:
- Watch retries-per-lesson and time-on-lesson. If a specific module spikes struggle across
  many learners, the lesson (not the learner) needs work — regenerate it at a gentler depth
  via `lesson-author`, or add a worked example.
- If strong learners breeze through, make sure the "stretch" path actually stretches
  (the coach should be unlocking harder variants/bonuses).
- Validate the personalizer's choices against reality: are owners getting the Automator
  lead? Are "avoid terminal" learners correctly steered to Cowork over Claude Code? Adjust
  `PERSONALIZER_SYS` rules where the data disagrees.

---

## 6. Expand tracks & curriculum (data-driven)
Only expand where demand shows up:
- **Bonus/advanced modules** for learners who hit "stretch" (raw API, advanced MCP, eval
  harnesses) — the blueprint already gestures at these.
- **Industry packs** — if a vertical clusters in the cohort (e.g. real estate, accounting),
  author industry-specific example sets via `lesson-author`.
- **"Living curriculum"** — when Claude ships a new capability, add a lesson; this is the
  paid-tier promise. `lesson-author` + `marketing-generator` make it cheap to ship + announce.

---

## 7. The iterate loop (run weekly during beta)
```
1. SHIP signals → read the scorecard (activation, ship rate, stall point, ROI).
2. FIND the single biggest leak (the module/step losing the most people).
3. FIX one thing (regenerate a lesson, adjust a personalizer/coach rule, smooth a setup step).
4. CAPTURE any new shipped capstones → testimonials → into marketing placeholders.
5. REPEAT. One high-leverage fix per cycle beats ten guesses.
```

---

## 8. Exit criteria → general launch
Move from beta to open launch when:
- Ship rate is healthy and stable (most finishers ship a real capstone).
- You have `[3–5]` verified, quotable ROI testimonials with consent.
- The top stall points have been fixed (no module bleeding learners).
- Pricing/terms are finalized and transparent; the guarantee is honored and credible.
- The personalizer + coach decisions hold up against real learner outcomes.

Then: turn on the marketing suite for cold traffic, swap real testimonials into every
placeholder, and keep the weekly iterate loop running.
