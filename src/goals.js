// ──────────────────────────────────────────────────────────────────────────
//  Goal spine — maps the learner's enrollment goal to a concrete DELIVERABLE and
//  an ordered set of MILESTONES (module → gate). This is what turns "a subset of
//  modules" into "a guaranteed route to the thing you came for."
//
//  The personalizer still composes the actual path; the spine overlays direction:
//  it names the deliverable and shows milestone progress against it.
// ──────────────────────────────────────────────────────────────────────────

export const GOAL_MAP = {
  "Automate a repetitive workflow": {
    track: "C",
    deliverable: "a working, scheduled automation for your chosen workflow — with safety gates and a measured time-saving",
    short: "your shipped automation",
    milestones: [
      { id: "C1", label: "Workflow mapped + baseline measured" },
      { id: "C2", label: "Task delegated as a supervised loop" },
      { id: "C3", label: "Big steps split across focused agents" },
      { id: "C4", label: "Runs hands-off — gates + error handling + log" },
      { id: "CAP", label: "Shipped & ROI measured → certificate" },
    ],
  },
  "Build a tool or solution": {
    track: "B",
    deliverable: "a real internal tool or a tested Skill you use at work",
    short: "your shipped tool",
    milestones: [
      { id: "B1", label: "Claude Code set up; first build run end-to-end" },
      { id: "B2", label: "A working internal tool, tested on real input" },
      { id: "B3", label: "Your know-how packaged into a tested Skill" },
      { id: "B4", label: "Connected to a real app (safely)" },
      { id: "CAP", label: "Shipped & ROI measured → certificate" },
    ],
  },
  "Boost my own daily output": {
    track: "A",
    deliverable: "a personal AI operating system — a reusable prompt/Skills library that removes daily busywork",
    short: "your operator toolkit",
    milestones: [
      { id: "A1", label: "Claude running your daily admin (triage, planning)" },
      { id: "A2", label: "Documents & data work, verified" },
      { id: "A3", label: "Trustworthy, sourced research" },
      { id: "A4", label: "Your reusable prompt & Skills library" },
      { id: "CAP", label: "Shipped & ROI measured → certificate" },
    ],
  },
  "Train my team to use AI": {
    track: "D",
    deliverable: "an adopted AI role + shared Skills + a one-page governance sheet, with rollout results",
    short: "your team AI rollout",
    milestones: [
      { id: "D1", label: "An AI role designed with clear lanes" },
      { id: "D2", label: "SOPs turned into shared Skills (owned)" },
      { id: "D3", label: "A pilot rollout people actually adopt" },
      { id: "D4", label: "Governance + honest measurement in place" },
      { id: "CAP", label: "Shipped & ROI measured → certificate" },
    ],
  },
  "Explore what's possible": {
    track: "A",
    deliverable: "a confident operator's foundation + one real asset you built and use",
    short: "your first real asset",
    milestones: [
      { id: "F3", label: "Your first real win" },
      { id: "A1", label: "Claude as a daily co-pilot" },
      { id: "CAP", label: "Shipped & ROI measured → certificate" },
    ],
  },
};

export function goalFor(profile) {
  if (!profile) return null;
  return GOAL_MAP[profile.goal] || null;
}

// Milestones for this learner, restricted to modules actually in their composed path,
// each annotated with done/current state from progress.
export function milestoneState(goal, plan, progress, currentModuleId) {
  if (!goal || !plan) return [];
  const inPath = new Set(plan.path.map((m) => m.module_id));
  return goal.milestones
    .filter((ms) => inPath.has(ms.id))
    .map((ms) => {
      const p = progress[ms.id];
      const done = !!(p && p.outcome && p.outcome !== "retry");
      return { ...ms, done, current: ms.id === currentModuleId };
    });
}
