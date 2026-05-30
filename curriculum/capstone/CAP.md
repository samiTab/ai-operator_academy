<!--
module_id: CAP
module_title: Ship your asset (capstone)
depth: balanced
difficulty: standard
example_lens: the learner's own enrollment goal + lead track (illustrative examples span all tracks)
learner_goal: build, demo, and ship the real asset from their enrollment answers; capture ROI; unlock the certificate
task_to_hand_off: (the learner's enrollment Q4/Q8 answer — this lesson finally ships it)
sandbox: true
-->

# Ship your asset: build the real thing, prove the ROI, earn the certificate

## 1. Hook (≈15s read)
This is the moment the whole academy was built for. Everything so far was practice; now you ship the **real asset** you named when you enrolled — the automation, the tool, the prompt library, the team role — and walk away holding something you use at work, with a number that proves it paid off.

## 2. Concept
A capstone isn't a quiz — it's **a real asset, demoed and adopted**, with **measured ROI**. That's what makes your certificate a portfolio piece instead of a badge. Your asset is whatever your path pointed at:

- **Operator (A):** a personal prompt/Skills library that removes daily re-typing.
- **Builder (B):** a working internal tool or a tested, bundled Skill.
- **Automator (C):** a mapped → delegated → scheduled automation with gates and a run log.
- **Team Leader (D):** an adopted AI role + shared Skill + one-page governance, with adoption results.

The build standard is the one you've practiced all course: **start from the spec/brief you already wrote, ship the simplest working version, test it on real input, and keep the human gates on anything irreversible.** Then you do the two things that turn "built" into "shipped": a **demo** (show it working on a real case) and an **ROI capture** (the honest before/after number). The mindset: you're not finishing a course — you're putting a teammate to work.

## 3. Demo
Three learners ship, each in their lane:

1. **Operator:** Lena finalizes a 6-prompt library + one "client-summary" Skill; demos it on a live email. *Saves ~3 hrs/week.* ![demo](screenshot: a polished prompt library doc + a Skill producing a client summary)
2. **Automator:** Priya ships her scheduled returns automation with gates and a daily run log; demos a real morning run. *~8 hrs/week → ~20 min review.* ![demo](screenshot: the returns automation's run-summary log after a real scheduled run)
3. **Team Leader:** Nadia presents the adopted Intake Coordinator role + shared brief Skill + governance one-pager, with 2-week pilot numbers. *Team saves ~5 hrs/week.* ![demo](screenshot: a one-page capstone summary: asset, demo link, adoption + ROI numbers)

## 4. Do it (the core — build & ship)
Pull up your **capstone brief** (the one-liner you've refined since F3/your lead track). Then run the ship checklist with Claude as your build partner:

```
I'm shipping my capstone. Here's my brief: [PASTE your capstone brief + lead track].
Walk me through shipping it:
1. SCOPE CHECK: is this the simplest version that delivers the outcome? Trim anything extra.
2. BUILD: help me complete the asset (tool / automation / Skill / library / role+governance).
3. TEST: run it on ONE real case end-to-end. What broke? Fix it. Keep my human gates.
4. DEMO SCRIPT: write the 60-second "here's it working on a real case" walkthrough.
5. ROI CAPTURE: help me state the honest before/after — time saved per run × frequency = /week and /month.
6. PORTFOLIO BLURB: one paragraph describing what I built and the measured result.
```

Finish when your asset **works on a real case**, you can **demo it**, and you have an **honest ROI number**. That trio is your submission.

> **Privacy & safety note:** ship with the gates you learned — irreversible/customer-facing/financial actions stay human-approved; keep confidential data out of any shared asset. A shipped asset that's unsafe isn't shipped.

## 5. Check — 🎓 this unlocks your certificate
Done well = (1) a **real, working asset** demonstrated on a **real case** (not a mockup); (2) an **honest, defensible ROI number** (before/after × frequency); (3) a **portfolio blurb** describing the asset and result. This is what `certificate-issuer` validates — completion **plus** a shipped capstone earns the verifiable credential (track completed, asset built, measured ROI).

## 6. Apply to YOUR work — make it permanent
Put the asset into your actual workflow today, and schedule its first **review/maintenance date** (Skills drift, automations need monitoring, governance gets reviewed). Ask Claude: *"What's the one upgrade that would make this asset 2× more valuable next quarter?"* — that's your roadmap beyond the academy.

## 7. Retain
**Quick check:** What three things turn "I built something" into a shippable capstone? *(It works on a real case, you can demo it, and you have an honest measured ROI number.)* — 🏆🎓 You didn't just learn AI — you put an AI teammate to work and proved it. Certificate unlocked.

## 8. ROI beat
This is the full payoff your whole path was aiming at: a real asset, running in your work, with a number you can defend — commonly **2+ hours/week saved at minimum**, often far more for automation and team capstones. That number is your certificate's headline, your LinkedIn proof, and the start of compounding returns as you build the next one.

---

### 🎁 Keepable asset — the "Ship It" checklist
```
□ SCOPE: simplest version that delivers the outcome (trimmed)
□ BUILD: asset complete (tool / automation / Skill / library / role+governance)
□ TEST: works on ONE real case end-to-end; gates intact
□ DEMO: 60-sec "here's it working" walkthrough
□ ROI:  honest before/after × frequency = /week + /month
□ BLURB: one paragraph — what I built + the measured result
□ NEXT: in-workflow + a review/maintenance date set
```

### ⚠️ Common mistakes
- **Demoing a mockup.** It must work on a *real* case — that's the whole point of a capstone.
- **Inflated ROI.** A number you can't defend hurts you. Honest and modest beats impressive and fake.
- **Scope creep at the finish line.** Ship the working version; the upgrade is next quarter's job.
- **Building and abandoning.** An asset you don't put into your workflow saved zero hours. Adopt it.

### 🔎 Honest limit
A capstone proves you can build and ship one real asset with AI — it's demonstrated practical capability, not an academic accreditation, and (like everything you built) it still needs the human judgment, verification, and gates you practiced. The asset will need maintenance as tools and your needs change. That's not a weakness of the credential — it's the honest framing that makes it trustworthy, and it's exactly how the certificate is described.

```json
{
  "module_id": "CAP",
  "task_summary": "Build, test, demo, and ship the learner's real capstone asset from their enrollment goal/lead track, working on a real case with human gates intact, and capture an honest before/after ROI plus a portfolio blurb — the basis for the verifiable certificate.",
  "criteria": [
    {"id": "c1", "check": "A real, working asset demonstrated on a real case (not a mockup), with irreversible/sensitive actions still human-gated.", "weight": 0.45},
    {"id": "c2", "check": "An honest, defensible ROI figure (before/after × frequency = weekly/monthly).", "weight": 0.3},
    {"id": "c3", "check": "A portfolio blurb describing the asset and its measured result.", "weight": 0.25}
  ],
  "common_failure_modes": ["Demoing a mockup instead of a working asset", "Inflated or undefendable ROI claim", "Scope creep preventing a shipped version", "Building the asset but never adopting it into the workflow"],
  "what_great_looks_like": "A genuinely useful asset running on a real case with appropriate human gates, an honest and defensible ROI number, and a clear portfolio paragraph — the learner has adopted it into their actual workflow and set a maintenance date.",
  "unlocks_certificate": true
}
```
