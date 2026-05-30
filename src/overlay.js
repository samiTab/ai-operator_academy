// ──────────────────────────────────────────────────────────────────────────
//  Adaptive overlay — keeps the static lesson core intact but TAILORS it to the
//  learner. Static-templating first (no API, instant, reliable, free); an optional
//  LLM enrichment hook can rewrite examples into the learner's exact context when a
//  key is present. The teaching content never depends on the model.
// ──────────────────────────────────────────────────────────────────────────

import { chat } from "./llm.js";

// Build the substitution context from the learner profile + path module + goal.
export function overlayContext(profile = {}, mod = {}, goal = null) {
  const industry = profile.industry || "your field";
  const task = profile.task || "your top task";
  const lens = mod.example_lens || `${industry}`;
  const deliverable = (goal && goal.deliverable) || (profile.task ? `a reusable workflow that handles: ${profile.task}` : "a real asset you use at work");
  return {
    industry,
    goal: profile.goal || "your goal",
    task,
    lens,
    deliverable,
    deliverable_short: (goal && goal.short) || "your asset",
    role: profile.role || "operator",
  };
}

// Fill {{var}} placeholders from ctx. Unknown placeholders are left untouched.
export function applyOverlay(md, ctx) {
  if (!md) return md;
  return md.replace(/\{\{\s*([a-z_]+)\s*\}\}/gi, (m, key) => {
    const v = ctx[key];
    return v == null ? m : String(v);
  });
}

// A short, static "why this matters for YOUR goal" connector shown atop a lesson.
export function goalConnector(ctx) {
  if (!ctx) return "";
  return `**For your goal —** this moves you toward **${ctx.deliverable_short}** (${ctx.deliverable}). Do every exercise on *your* real ${ctx.industry} work, not a hypothetical.`;
}

// OPTIONAL LLM enrichment — only call when explicitly enabled (costs an API call).
// Rewrites a lesson section's examples into the learner's exact industry/task. Falls
// back to the original text on any error, so it can never break the lesson.
export async function enrichSection(text, ctx, { apiKey, signal } = {}) {
  try {
    const out = await chat({
      task: "sandbox",
      maxTokens: 500,
      temperature: 0.4,
      apiKey,
      signal,
      system: "You localize a course lesson section to one learner WITHOUT changing its meaning, structure, or accuracy. Keep the same markdown shape and length; only swap generic examples for ones specific to their industry and goal. Never invent product capabilities. Return only the rewritten markdown.",
      user: `Learner: ${ctx.role} in ${ctx.industry}; goal: ${ctx.goal}; task to hand off: ${ctx.task}.\n\nSection to localize:\n${text}`,
    });
    return out && out.trim().length > 20 ? out.trim() : text;
  } catch (e) {
    return text;
  }
}
