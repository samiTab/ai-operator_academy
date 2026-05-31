// ──────────────────────────────────────────────────────────────────────────
//  The Workshop — the throughline "build".
//
//  Every lesson contributes one named COMPONENT to a persistent Workshop tied to
//  the learner's goal. Foundations feed a reusable TOOLKIT; lead-track lessons
//  assemble the goal DELIVERABLE; the capstone snaps it together and ships.
//
//  This module is self-contained (no imports from the big app file) — it defines
//  the static component model and pure helpers that compute Workshop state from
//  the learner's plan, progress, and saved build content.
// ──────────────────────────────────────────────────────────────────────────

// kind: "toolkit" (reusable asset) · "deliverable" (a core piece of the goal) · "capstone"
export const COMPONENT = {
  // Foundations → Toolkit (everyone)
  F1: { kind: "toolkit", title: "“Teammate Briefing” template", capture: "Save the briefing prompt that produced your finished artifact." },
  F2: { kind: "toolkit", title: "C-T-F-S prompt scaffold", capture: "Save your four-part (Context · Task · Format · Style) prompt." },
  F3: { kind: "toolkit", title: "First-win reusable prompt", capture: "Save the exact prompt that delivered your first real win." },

  // Operator (A) → personal AI operating system
  A1: { kind: "deliverable", title: "Chief-of-staff daily routine", capture: "Save your context block + the triage/draft/prioritize routine." },
  A2: { kind: "deliverable", title: "Analyze-&-verify block", capture: "Save your shape→flag→cite document-analysis instruction." },
  A3: { kind: "deliverable", title: "Sourced-research template", capture: "Save your scope→source→mark→check research prompt." },
  A4: { kind: "deliverable", title: "Packaged Skill + prompt library", capture: "Save your library starter and your first SKILL.md." },

  // Builder (B) → a working tool / tested Skill
  B1: { kind: "deliverable", title: "First build (explore→plan→code→commit)", capture: "Save the plan Claude Code produced and what you built." },
  B2: { kind: "deliverable", title: "Working internal tool + spec", capture: "Save your tool spec (job · input · output) and what it does." },
  B3: { kind: "deliverable", title: "Tested, bundled Skill", capture: "Save your SKILL.md and the two test results." },
  B4: { kind: "deliverable", title: "Safe connector setup", capture: "Save your GOAL→SCOPE→READ→GATE connection plan." },

  // Automator (C) → a shipped, scheduled automation
  C1: { kind: "deliverable", title: "Workflow map + baseline", capture: "Save your step map, mechanical/judgment marks, and baseline number." },
  C2: { kind: "deliverable", title: "Supervised task-loop brief", capture: "Save your Cowork brief with guardrails and gates." },
  C3: { kind: "deliverable", title: "Subagent role breakdown", capture: "Save your lead + subagent role decomposition." },
  C4: { kind: "deliverable", title: "Hands-off operating plan", capture: "Save your trigger · gates · error-handling · log plan." },

  // Team Leader (D) → an adopted AI capability
  D1: { kind: "deliverable", title: "AI role description", capture: "Save your mission→scope→escalate→done role doc." },
  D2: { kind: "deliverable", title: "Shared team Skill", capture: "Save your encoded SOP Skill with its owner + review cadence." },
  D3: { kind: "deliverable", title: "Adoption rollout plan", capture: "Save your pilot→win→champion→measure plan." },
  D4: { kind: "deliverable", title: "One-page governance sheet", capture: "Save your data→gate→track→trust governance one-pager." },

  CAP: { kind: "capstone", title: "Your shipped deliverable", capture: "Assemble your components into the finished, demoed asset." },
};

export function componentDef(moduleId) {
  return COMPONENT[moduleId] || { kind: "deliverable", title: "Lesson asset", capture: "Save what you produced in this lesson." };
}

// True if a module's saved component should count toward the core deliverable.
function isDeliverable(moduleId, mod) {
  const def = componentDef(moduleId);
  if (def.kind !== "deliverable") return false;
  // optional/bonus modules feed the Toolkit, not the core deliverable count
  return !(mod && (mod.optional || mod.bonus));
}

// Compute the full Workshop view from plan + progress + saved build content.
// Returns { deliverable: [item], toolkit: [item], capstone: item|null,
//           filled, total, deliverableTitle } where each item carries status.
export function buildWorkshop(plan, progress = {}, build = {}, deliverableTitle = "your asset") {
  const components = (build && build.components) || {};
  if (!plan || !Array.isArray(plan.path)) {
    return { deliverable: [], toolkit: [], capstone: null, filled: 0, total: 0, deliverableTitle };
  }

  // First not-yet-done module = "current"
  const firstOpenIdx = plan.path.findIndex(
    (m) => !(progress[m.module_id] && progress[m.module_id].outcome !== "retry")
  );

  const toItem = (m, i) => {
    const def = componentDef(m.module_id);
    const saved = components[m.module_id] || null;
    const p = progress[m.module_id];
    const done = !!(p && p.outcome && p.outcome !== "retry");
    const status = done ? "done" : i === firstOpenIdx ? "current" : "upcoming";
    return {
      moduleId: m.module_id,
      kind: def.kind,
      title: def.title,
      capture: def.capture,
      content: saved ? saved.content || "" : "",
      reflection: saved ? saved.reflection || "" : "",
      outcome: saved ? saved.outcome : p ? p.outcome : null,
      filled: !!(saved && (saved.content || "").trim()),
      status,
    };
  };

  const deliverable = [];
  const toolkit = [];
  let capstone = null;

  plan.path.forEach((m, i) => {
    const def = componentDef(m.module_id);
    const item = toItem(m, i);
    if (def.kind === "capstone") capstone = item;
    else if (isDeliverable(m.module_id, m)) deliverable.push(item);
    else toolkit.push(item);
  });

  const total = deliverable.length;
  const filled = deliverable.filter((d) => d.status === "done" || d.filled).length;

  return { deliverable, toolkit, capstone, filled, total, deliverableTitle };
}

// Build the "builds on → adds → sets up" sequence connector for a lesson index.
export function sequenceFor(plan, idx) {
  if (!plan || !Array.isArray(plan.path)) return null;
  const here = componentDef(plan.path[idx]?.module_id);
  const prev = idx > 0 ? componentDef(plan.path[idx - 1]?.module_id) : null;
  const next = idx < plan.path.length - 1 ? componentDef(plan.path[idx + 1]?.module_id) : null;
  return {
    adds: here ? here.title : null,
    addsKind: here ? here.kind : null,
    buildsOn: prev ? prev.title : null,
    setsUp: next ? next.title : null,
  };
}
