# Sample — The Brain, Working End-to-End

This shows the academy brain producing a real experience for one learner, so you can judge the quality before any code is written. Persona is invented for illustration.

---

## The learner (enrollment answers)

> **Sara**, owner of a 6-person residential real-estate brokerage.
> - Role: **Business owner**
> - Industry: **Real estate (residential brokerage)**
> - Primary goal: **Automate a repetitive workflow**
> - Task to hand off: *"Writing up new listings — turning agent notes + photos into a polished listing description, social caption, and email blast."*
> - AI experience: **Sometimes** (uses ChatGPT-style chat occasionally)
> - Technical comfort: **Willing if guided**
> - Time/week: **1–3h**
> - Success in 30 days: *"Every new listing goes from raw notes to published in 15 minutes instead of 90, without me touching it."*

---

## Step 1 — `course-personalizer` output

**Plain-language preview shown to Sara:**

> Here's your custom course, Sara. You'll go from raw listing notes to a published description, caption, and email blast in about 15 minutes — built into a reusable workflow your agents can run without you. We've kept it lean for your 1–3 hrs/week, skipped the team-rollout deep-dives for now, and used real-estate examples throughout. About **4–5 hours total**, and you'll finish holding the actual automation. Your headline stops: *the mindset shift → your first real win on a live listing → Claude as your operations co-pilot → mapping the listing workflow → building it in Cowork → shipping it.*

```json
{
  "learner_summary": "Brokerage owner automating listing production; willing-if-guided, time-limited, wants a hands-off 15-minute pipeline.",
  "lead_track": "C",
  "capstone_brief": "A Cowork automation + Skill that turns agent listing notes (and photo info) into a polished listing description, a social caption, and an email blast, ready to publish.",
  "roi_target": "≈75 min saved per listing (90 → 15); for ~8 listings/month, ≈10 hrs/month.",
  "estimated_total_time": "4-5 hours",
  "path": [
    {"module_id": "F1", "title": "The mindset shift", "depth": "balanced", "difficulty": "guided", "example_lens": "residential brokerage, listing operations", "optional": false, "bonus": false, "why_included": "Frames AI as a teammate that owns a process — matches her 'hands-off' goal."},
    {"module_id": "F2", "title": "Talking to Claude that gets results", "depth": "balanced", "difficulty": "guided", "example_lens": "residential brokerage, listing copy", "optional": false, "bonus": false, "why_included": "Prompting quality is the lever for good listing copy."},
    {"module_id": "F3", "title": "Your first real win", "depth": "just-do-it", "difficulty": "guided", "example_lens": "residential brokerage, one live listing", "optional": false, "bonus": false, "why_included": "Immediate proof using her actual hand-off task."},
    {"module_id": "C1", "title": "Map a workflow worth automating", "depth": "balanced", "difficulty": "guided", "example_lens": "listing production pipeline", "optional": false, "bonus": false, "why_included": "Owner + automation goal; defines and measures the baseline."},
    {"module_id": "A1", "title": "Claude as your chief of staff", "depth": "just-do-it", "difficulty": "guided", "example_lens": "brokerage operations", "optional": false, "bonus": false, "why_included": "Owner secondary; daily-driver fluency before automating."},
    {"module_id": "C2", "title": "Claude Cowork task loops", "depth": "balanced", "difficulty": "guided", "example_lens": "listing pipeline in Cowork", "optional": false, "bonus": false, "why_included": "Core of the automation; chosen over Claude Code because she's 'willing if guided' (no terminal)."},
    {"module_id": "B3", "title": "Agent Skills", "depth": "balanced", "difficulty": "guided", "example_lens": "a reusable 'Listing Writer' Skill", "optional": false, "bonus": false, "why_included": "Packages her brand voice/format so output is consistent and agents can reuse it."},
    {"module_id": "D1", "title": "Design an AI role", "depth": "just-do-it", "difficulty": "guided", "example_lens": "'Listing Coordinator' AI role", "optional": true, "bonus": false, "why_included": "Owner mindset; optional given time limits — promote if she has bandwidth."},
    {"module_id": "B1", "title": "Claude Code without fear", "depth": "balanced", "difficulty": "guided", "example_lens": "brokerage micro-tools", "optional": true, "bonus": true, "why_included": "Offered later only if she gets comfortable and curious."},
    {"module_id": "CAP", "title": "Ship your asset", "depth": "balanced", "difficulty": "guided", "example_lens": "the listing automation", "optional": false, "bonus": false, "why_included": "Builds and ships the capstone; unlocks certificate."}
  ],
  "gaps": [],
  "notes_for_coach": "Time-limited (1-3h); keep momentum, surface fast paths. 'Willing if guided' — keep difficulty at guided until she shows ability, then offer B1 bonus. Watch C2 closely; if Cowork setup frustrates, add a worked example before retry."
}
```

---

## Step 2 — `lesson-author` renders module F3 ("Your first real win")

*(depth: just-do-it, difficulty: guided, lens: one live listing)*

> # Get a publish-ready listing in 10 minutes — from your own messy notes
>
> ## 1. Hook
> You know the 90-minute slog: turn an agent's scribbled notes into a description, a social caption, and an email that doesn't sound like a robot. Today you do one real listing in about 10 minutes.
>
> ## 2. Concept
> Claude is great at turning rough input into polished, on-brand text — *if* you tell it three things: who it's for, what format you want, and your style. That's the whole trick. We'll give it all three in one prompt.
>
> ## 3. Demo
> 1. Open Claude and start a new chat. ![demo](screenshot: empty Claude chat, cursor in the message box)
> 2. Paste the prompt below, replacing the bracketed parts with your real listing. ![demo](screenshot: prompt pasted with listing notes filled in)
> 3. Send it and read the three outputs. ![demo](screenshot: Claude's response showing description, caption, and email sections)
>
> ## 4. Do it
> Grab the notes for a **real, current listing**. Copy this prompt, fill the brackets, and run it:
>
> ```
> You're helping a residential real-estate brokerage write listing content.
> Here are the raw notes for a new listing:
> [PASTE AGENT NOTES — address, beds/baths, sqft, standout features, neighborhood]
>
> Produce three things, each clearly labeled:
> 1. LISTING DESCRIPTION — ~120 words, warm and professional, no clichés like "must-see."
> 2. SOCIAL CAPTION — for Instagram, 2–3 short lines, 1 relevant emoji max, 3 hashtags.
> 3. EMAIL BLAST — subject line + 90-word body inviting buyers to book a viewing.
> Match this style: [paste 2 sentences from a listing you liked, or write "clean, confident, no hype"].
> ```
>
> Read the output. Tweak one bracket and re-run if a section misses — that's normal and takes seconds.
>
> ## 5. Check
> Good = all three labeled sections, the description avoids hype-clichés, the caption fits Instagram, the email has a real subject + a clear call to book. (Your work is auto-checked and you'll get specific feedback.)
>
> ## 6. Apply to YOUR work
> Run it again on a *second* real listing right now. Notice it took a fraction of the time. That repeatability is exactly what we'll automate in a few lessons.
>
> ## 7. Retain
> **Quick check:** What three things does Claude need to produce on-brand copy? *(Audience, format, and your style.)* — 🔥 Day 1 done. You just produced real, usable listing content.
>
> ## 8. ROI beat
> You just did in ~10 minutes what usually takes ~90. Across ~8 listings/month, that's roughly **10 hours back every month** — and we haven't even automated it yet.
>
> ```json
> {
>   "module_id": "F3",
>   "task_summary": "Produce a labeled listing description, social caption, and email blast from real listing notes using a structured prompt.",
>   "criteria": [
>     {"id": "c1", "check": "Output has all three clearly labeled sections (description, caption, email).", "weight": 0.4},
>     {"id": "c2", "check": "Prompt specified audience, format, and style (not just 'write a listing').", "weight": 0.35},
>     {"id": "c3", "check": "Description avoids hype-clichés and email includes a subject line + call to book.", "weight": 0.25}
>   ],
>   "common_failure_modes": ["Vague prompt ('write a listing') yielding one blob of text", "No style guidance so tone is generic"],
>   "what_great_looks_like": "Three tight, on-brand sections she could publish with minor edits, produced from a prompt that clearly specified audience, format, and style."
> }
> ```

---

## Step 3 — `exercise-grader` grades Sara's submission

**Sara's prompt was:** *"Write a listing for 14 Oak St, 3 bed 2 bath, big garden, near schools."* (She skipped format + style.)

```json
{
  "outcome": "developing",
  "score": 0.4,
  "criteria_results": [
    {"id": "c1", "status": "missing", "evidence": "Output was a single paragraph; no caption or email sections."},
    {"id": "c2", "status": "partial", "evidence": "Gave the facts (audience implied) but no format or style instruction."},
    {"id": "c3", "status": "partial", "evidence": "Description was fine but no email/subject; one 'charming' cliché."}
  ],
  "feedback_markdown": "Solid start — your facts were clear, so Claude had good raw material. The reason you got one paragraph instead of your three pieces is that the prompt didn't ask for the **three labeled sections** or your **style**. Add this to the end of your prompt and re-run: *'Produce three labeled sections — LISTING DESCRIPTION (~120 words, no clichés), SOCIAL CAPTION (Instagram, 3 hashtags), EMAIL BLAST (subject + 90-word body). Style: clean and confident, no hype.'* Watch all three come back ready to use.",
  "signals": {"first_try_success": false, "used_hint": false, "struggled": false, "showed_advanced_ability": false, "time_note": "on pace"},
  "suggested_next_action": "offer_hint_and_retry"
}
```

## Step 4 — `progress-coach` decides next step

```json
{
  "next_step": "support_then_retry",
  "difficulty_change": "none",
  "depth_change": "none",
  "insert_before_next": "none",
  "escalate_to_personalizer": false,
  "nudge_markdown": "First drafts almost always miss the format line — totally normal. You're one tweak away from the full three-piece output. Give it another go.",
  "coach_note": "Single 'developing' on a foundational lesson; not a trend. Keep guided. Re-grade after retry; if she nails it, momentum is fine."
}
```

*(Sara adds the format/style line, re-runs, gets a clean three-section output → grader returns `solid`, `first_try_success` on retry. Coach advances her to C1.)*

---

## Step 5 — `certificate-issuer` (after she ships the capstone)

Sara completes the path and builds the capstone: a Cowork automation + a "Listing Writer" Skill that produces all three assets from pasted notes, in her brand voice.

```json
{
  "issued": true,
  "credential_id": "AOA-2026-7f3a9c21",
  "credential_title": "AI Operator — Workflow Automation",
  "learner_name": "Sara [Lastname]",
  "capstone_asset": "A Cowork automation + 'Listing Writer' Skill that turns raw agent notes into a publish-ready listing description, social caption, and email blast in her brokerage's voice.",
  "roi_summary": "≈75 min saved per listing (90 → ~15); ≈10 hrs/month across the brokerage.",
  "issue_date": "2026-05-29",
  "verification_url": "https://verify.aioperator.academy/AOA-2026-7f3a9c21",
  "registry_record": {"credential_id": "AOA-2026-7f3a9c21", "learner_id": "sara-...", "path_completed": ["F1","F2","F3","C1","A1","C2","B3","CAP"], "capstone_ref": "asset://sara/listing-writer", "roi": "≈10 hrs/month"},
  "share_copy": "I just built an AI automation that turns my agents' raw notes into a publish-ready listing description, social caption, and email blast — cutting listing production from ~90 minutes to ~15. Completed the AI Operator Academy (hands-on, not theory). #realestate #AI #automation",
  "certificate_render_spec": {"title": "AI Operator — Workflow Automation", "subtitle": "Demonstrates practical, hands-on capability with Claude AI and Claude Code. Not an academic accreditation.", "recipient": "Sara [Lastname]", "highlight_asset": "Built: 'Listing Writer' automation + Skill", "highlight_roi": "≈10 hours/month saved", "credential_id": "AOA-2026-7f3a9c21", "verify_url": "https://verify.aioperator.academy/AOA-2026-7f3a9c21", "date": "2026-05-29"}
}
```

---

## What this sample demonstrates

- The path is genuinely **composed** for Sara (lead Track C, owner add-ons, Cowork chosen over Claude Code because she avoids the terminal, time-trimmed, optional/bonus parked at the end).
- Lessons are **short, hands-on, industry-specific**, and produce a **keepable asset** — with an honest ROI tally.
- The grader **teaches** instead of judging; the coach **adapts without nagging**.
- The certificate is **earned and verifiable**, and its share copy sells the *specific outcome* — which becomes marketing fuel.
