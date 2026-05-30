import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth, useUser, UserButton } from "@clerk/clerk-react";
import {
  ArrowRight, ArrowLeft, Check, Sparkles, Terminal, Target, Clock,
  Gauge, BookOpen, Play, Send, Loader2, Award, Flame, TrendingUp,
  ChevronRight, RotateCcw, Lock, Zap, CircleCheck, Lightbulb, ShieldAlert,
  AlertTriangle, Gift, Copy, KeyRound, ExternalLink, Flag,
} from "lucide-react";
import Markdown from "./Markdown.jsx";
import { getAuthoredLesson } from "./curriculum.js";
import { chat, chatJson, parseJsonLoose } from "./llm.js";
import { goalFor, milestoneState } from "./goals.js";
import { applyOverlay, goalConnector, overlayContext } from "./overlay.js";

/* ============================== THEME ============================== */
const T = {
  bg: "#15120D", bg2: "#1C1813", surface: "#221D16", surfaceHi: "#2A241B",
  line: "#3A3124", lineHi: "#4A3F2D",
  text: "#F3ECDD", dim: "#B6AB95", faint: "#857B68",
  amber: "#E7A958", amberHi: "#F4C079", clay: "#C76F49", claySoft: "#D98A66",
  green: "#A6BE72", red: "#DA8466", blue: "#7FA8B0",
};

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..650;1,9..144,400..600&family=Spline+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
* { box-sizing: border-box; }
::-webkit-scrollbar { width: 9px; height: 9px; }
::-webkit-scrollbar-track { background: ${T.bg}; }
::-webkit-scrollbar-thumb { background: ${T.line}; border-radius: 6px; }
::-webkit-scrollbar-thumb:hover { background: ${T.lineHi}; }
@keyframes rise { from { opacity:0; transform: translateY(14px);} to {opacity:1; transform:none;} }
@keyframes glow { 0%,100%{opacity:.5;} 50%{opacity:1;} }
@keyframes spin { to { transform: rotate(360deg);} }
@keyframes shimmer { 0%{background-position:-400px 0;} 100%{background-position:400px 0;} }
@keyframes pulseRing { 0%{transform:scale(.9);opacity:.7;} 70%{transform:scale(1.25);opacity:0;} 100%{opacity:0;} }
.rise { animation: rise .6s cubic-bezier(.2,.7,.2,1) both; }
textarea, input { font-family: 'JetBrains Mono', monospace; }
`;

const serif = "'Fraunces', Georgia, serif";
const sans = "'Spline Sans', system-ui, sans-serif";
const mono = "'JetBrains Mono', monospace";

/* ============================== DATA ============================== */
const QUESTIONS = [
  { id: "role", q: "Which best describes you?", type: "single",
    options: ["Business owner", "Manager / Team lead", "Independent (freelancer / solo)", "Just exploring for now"] },
  { id: "industry", q: "What's your field?", type: "single",
    options: ["Marketing & Creative", "Real estate", "Professional services / Consulting", "E-commerce & Retail",
      "Finance & Accounting", "Legal", "Healthcare / Wellness", "Trades & Local services", "Other"] },
  { id: "goal", q: "What do you most want from AI right now?", type: "single",
    options: ["Automate a repetitive workflow", "Build a tool or solution", "Boost my own daily output",
      "Train my team to use AI", "Explore what's possible"] },
  { id: "task", q: "Name the ONE task you'd love to hand off.", type: "text",
    hint: "Be specific — this becomes the real thing you'll build by the end.",
    placeholder: "e.g. Turning messy meeting notes into a polished client follow-up email + action list" },
  { id: "experience", q: "How much have you used AI tools?", type: "single",
    options: ["Never really", "I chat with it sometimes", "I use AI most days", "I've built things with it"] },
  { id: "tech", q: "How do you feel about technical tools (files, terminal, code)?", type: "single",
    options: ["I avoid that stuff", "Willing if you guide me", "Fairly comfortable", "I code"] },
  { id: "time", q: "Realistically, how much time per week?", type: "single",
    options: ["Under 1 hour", "1–3 hours", "3–5 hours", "5+ hours"] },
  { id: "success", q: "What would make the next 30 days a clear win?", type: "text",
    hint: "Your north star — we measure the course against this.",
    placeholder: "e.g. Every proposal goes out same-day instead of taking me two evenings" },
];

const LIBRARY = {
  F1: { id: "F1", track: "F", title: "The mindset shift", blurb: "AI as a teammate, not a search box — what Claude is genuinely good and bad at." },
  F2: { id: "F2", track: "F", title: "Prompting that gets results", blurb: "Audience, format, style — the three levers behind every good output." },
  F3: { id: "F3", track: "F", title: "Your first real win", blurb: "Solve one painful task in 10 minutes, on a real example from your work." },
  A1: { id: "A1", track: "A", title: "Claude as your chief of staff", blurb: "Email, summaries, planning and decisions — your daily co-pilot." },
  A2: { id: "A2", track: "A", title: "Documents & data", blurb: "Analyze, draft, reformat and extract from real files and spreadsheets." },
  A3: { id: "A3", track: "A", title: "Research & synthesis", blurb: "Fast, sourced research and market scans you can trust." },
  A4: { id: "A4", track: "A", title: "Your prompt & Skills library", blurb: "Stop re-typing — package your best prompts into reusable assets." },
  B1: { id: "B1", track: "B", title: "Claude Code without fear", blurb: "What it is, setup, and the Explore → Plan → Code → Commit loop." },
  B2: { id: "B2", track: "B", title: "Build a small internal tool", blurb: "Ship something real — a generator, cleaner, or mini dashboard." },
  B3: { id: "B3", track: "B", title: "Agent Skills", blurb: "Bottle your know-how into Skills Claude applies automatically." },
  B4: { id: "B4", track: "B", title: "Connect your tools (MCP)", blurb: "Wire Claude into the apps you already use." },
  C1: { id: "C1", track: "C", title: "Map a workflow worth automating", blurb: "Choose, scope and measure the baseline before you build." },
  C2: { id: "C2", track: "C", title: "Cowork task loops", blurb: "Delegate real multi-step work to Claude on your own files." },
  C3: { id: "C3", track: "C", title: "Agents & subagents", blurb: "Split big jobs into delegated, parallel tasks." },
  C4: { id: "C4", track: "C", title: "Scheduled automations", blurb: "Make it run without you — with review gates and error handling." },
  D1: { id: "D1", track: "D", title: "Design an AI role", blurb: "Write a job description for an AI teammate and scope its lane." },
  D2: { id: "D2", track: "D", title: "Team Skills & SOPs", blurb: "Turn your playbooks into shared Skills — consistency at scale." },
  D3: { id: "D3", track: "D", title: "Rollout & adoption", blurb: "Get your people actually using it; avoid the common failures." },
  D4: { id: "D4", track: "D", title: "Governance & measurement", blurb: "Data handling, review checkpoints, honest ROI tracking." },
  CAP: { id: "CAP", track: "CAP", title: "Ship your asset", blurb: "Build and ship the real thing from your goals. Unlocks your certificate." },
};
const TRACK_NAME = { F: "Foundations", A: "Operator", B: "Builder", C: "Automator", D: "Team Leader", CAP: "Capstone" };

/* ---------- baked rich lessons (others are generated from a template) ---------- */
const BAKED = {
  F1: (lens) => ({
    hook: `Most people use AI like a slightly smarter search box. Today we reframe it as a teammate you can delegate whole jobs to — the shift that unlocks everything in ${lens}.`,
    concept: "Claude is excellent at language work: drafting, summarizing, transforming, explaining, structuring. It's weak at things it can't see (your private data unless you give it) and at being silently confident when wrong. The operator's job is to delegate clearly and verify the output — exactly like managing a sharp new hire on day one.",
    demoTitle: "See the difference",
    demo: ["Open a chat and ask vaguely: \"help me with my work.\" Watch it flail.",
      "Now delegate like a manager: give it a role, the context, and the exact output you want.",
      "Notice the second response is something you could almost use as-is."],
    task: `Write a short delegation to Claude as if briefing a capable new assistant on a real task from your world (${lens}). Include: (1) the role it's playing, (2) the context, (3) the exact output you want.`,
    apply: "Re-use that same structure on the very next thing you'd normally do yourself today.",
    quiz: { q: "What's the operator's two-part job when delegating to AI?", a: "Delegate clearly, then verify the output." },
    roiMin: 20,
  }),
  F2: (lens) => ({
    hook: `Same AI, wildly different results — the difference is how you ask. Here are the three levers that turn vague into publish-ready for ${lens}.`,
    concept: "Three levers control output quality: AUDIENCE (who it's for), FORMAT (the exact shape — bullets, table, word count, sections), and STYLE (tone and any examples to match). Miss one and you get a generic blob. Name all three and you get something usable on the first try.",
    demoTitle: "The three levers in action",
    demo: ["Take a weak prompt: \"write a summary.\"",
      "Add audience: \"...for a busy client who skims.\"",
      "Add format + style: \"...as 5 bullets, plain and confident, no jargon.\""],
    task: `Write a prompt for a real task in ${lens} that explicitly names all three levers: audience, format (be specific — sections, length), and style. Run it and read the result.`,
    apply: "Save this prompt. You'll reuse the audience+format+style pattern in every lesson from here.",
    quiz: { q: "Name the three levers of a strong prompt.", a: "Audience, format, and style." },
    roiMin: 15,
  }),
  F3: (lens) => ({
    hook: `Enough theory — let's get a real win on the board. Pick one genuinely annoying task in ${lens} and we'll knock it out in about ten minutes.`,
    concept: "You now have the delegation mindset (F1) and the three levers (F2). That's all you need for a first real result. The goal here isn't perfection — it's proof: something you produced with Claude that you'd actually use.",
    demoTitle: "From annoying task to done",
    demo: ["Grab the inputs for one real, current task.",
      "Brief Claude with role + context + the exact output (use all three levers).",
      "Tweak one thing and re-run if a part misses — that's normal and takes seconds."],
    task: `Take your ONE task and get a usable result. Brief Claude properly — role, context, audience, format, style — using real inputs from your work.`,
    apply: "Do it a second time on another real example. Notice how much faster the second one is — that repeatability is what we'll automate later.",
    quiz: { q: "What makes a 'first win' count?", a: "It's something real you'd actually use — proof, not perfection." },
    roiMin: 45,
  }),
  C1: (lens) => ({
    hook: `Before automating anything in ${lens}, you pick the right target and measure it — so your win is provable, not vibes.`,
    concept: "A good automation candidate is repetitive, rule-ish, and time-consuming. Map it as: trigger → steps → output. Then time the manual version once. That baseline is what turns 'I saved time' into 'I saved 75 minutes per listing' — the number that goes on your certificate and your marketing.",
    demoTitle: "Map and measure",
    demo: ["Write the workflow as a simple list: what starts it, the steps, the finished output.",
      "Mark which steps are judgment (keep human) vs. mechanical (automate).",
      "Time yourself doing it once, start to finish."],
    task: `Map your target workflow from ${lens} as trigger → steps → output, flag the mechanical steps, and estimate the current minutes it takes.`,
    apply: "This map is your build spec for the Cowork and Skills lessons coming up.",
    quiz: { q: "Why measure the manual baseline first?", a: "So your time-saved is provable, not a guess." },
    roiMin: 10,
  }),
  C2: (lens) => ({
    hook: `Now we delegate a real multi-step job to Claude in Cowork — the heart of your ${lens} automation.`,
    concept: "Cowork lets Claude work across your actual files and steps, not just a single chat reply. You describe the loop — take this input, do these steps, produce that output — and steer it with review gates at the points that matter. Think 'managing the work,' not 'doing the work.'",
    demoTitle: "Run a task loop",
    demo: ["State the input, the steps, and the finished output you want.",
      "Add a checkpoint: 'show me before sending / saving.'",
      "Run it on one real case and review at the gate."],
    task: `Write the task-loop brief for your mapped workflow (${lens}): the input, the ordered steps, the final output, and one human review checkpoint.`,
    apply: "Run it on a real case end-to-end. Time it against your C1 baseline.",
    quiz: { q: "Where do you put review gates?", a: "At the steps where judgment or risk matters most." },
    roiMin: 30,
  }),
};

function templateLesson(mod, lens) {
  return {
    hook: `This is where "${mod.title.toLowerCase()}" stops being a concept and becomes a result you can use in ${lens}.`,
    concept: `${mod.blurb} The operator approach: delegate the task clearly with audience, format and style, keep judgment calls human, and verify the output before you rely on it.`,
    demoTitle: "Walk through it",
    demo: ["Set up the task with a clear brief (role + context + exact output).",
      "Run it on a small, real example from your work.",
      "Review, tweak one thing, and lock in what works as a reusable pattern."],
    task: `Apply "${mod.title}" to a real situation in ${lens}. Brief Claude properly and produce one concrete, usable result.`,
    apply: "Capture what worked as a saved prompt or note so you can repeat it without thinking.",
    quiz: { q: `What's the operator's habit after any AI output?`, a: "Verify it before relying on it." },
    roiMin: 25,
  };
}
function getLesson(mod, lens) {
  const b = BAKED[mod.id];
  return b ? b(lens) : templateLesson(mod, lens);
}

/* ============================== LLM (provider-agnostic) ============================== */
// Thin wrappers over the OpenAI-compatible client in llm.js (default provider: Groq, free).
async function llmText(system, user, { task = "sandbox", maxTokens = 800, apiKey, signal } = {}) {
  return chat({ system, user, task, maxTokens, apiKey, signal });
}
const parseJson = parseJsonLoose;
// Strip markdown to a plain one-liner (used to summarize a task for the grader).
function stripMd(s) {
  return (s || "").replace(/```[\s\S]*?```/g, " ").replace(/[*`>#_]/g, "").replace(/!\[[^\]]*\]\([^)]*\)/g, " ").replace(/\s+/g, " ").trim().slice(0, 500);
}

/* ---- personalizer (live, with rule-based fallback) ---- */
const PERSONALIZER_SYS = `You are the AI Operator Academy course-personalizer. Compose a personalized path from this exact module library (use only these IDs): F1,F2,F3,A1,A2,A3,A4,B1,B2,B3,B4,C1,C2,C3,C4,D1,D2,D3,D4,CAP.
Rules: Everyone gets F1-F3 and CAP (CAP last). Map goal->lead track: Automate=C, Build=B, Boost=A, Train team=D, Explore=A+tasters. Add by role: Owner-> add C1 & D1; Manager/Team lead-> add D2,D3. Independent-> lean, favor A & B. Gate technical modules by comfort: "avoid"-> prefer C2 (Cowork) over B1, mark code-heavy optional; "guided"-> B1 with scaffolding; comfortable/codes-> full B + a bonus. Trim by time: <3h -> lead track + foundations + CAP only, others optional. Set depth (just-do-it|balanced|deep) and difficulty (guided|standard|stretch). Keep the core path SHORT (aim 6-9 core modules). Set example_lens to their industry+function. Write capstone_brief (one concrete asset sentence from their task) and roi_target (a measurable phrase).
Return ONLY JSON: {"learner_summary","lead_track","capstone_brief","roi_target","estimated_total_time","path":[{"module_id","depth","difficulty","example_lens","optional":bool,"bonus":bool,"why_included"}]}`;

function fallbackPath(p) {
  const lead = { "Automate a repetitive workflow": "C", "Build a tool or solution": "B", "Boost my own daily output": "A", "Train my team to use AI": "D" }[p.goal] || "A";
  const lens = `${p.industry}, ${p.task ? p.task.slice(0, 40) : "daily work"}`;
  const core = ["F1", "F2", "F3"];
  const leadMods = { A: ["A1", "A2", "A4"], B: ["B1", "B2", "B3"], C: ["C1", "C2", "B3"], D: ["A1", "D1", "D2"] }[lead];
  const ids = [...core, ...leadMods];
  if (p.role === "Business owner" && !ids.includes("C1")) ids.push("C1");
  ids.push("CAP");
  const diff = { "I avoid that stuff": "guided", "Willing if you guide me": "guided", "Fairly comfortable": "standard", "I code": "stretch" }[p.tech] || "guided";
  const depth = p.experience === "I've built things with it" ? "deep" : "balanced";
  return {
    learner_summary: `A ${p.role.toLowerCase()} in ${p.industry} focused on: ${p.goal.toLowerCase()}.`,
    lead_track: lead,
    capstone_brief: p.task ? `A reusable workflow that handles: ${p.task}` : "A reusable workflow built around your top task.",
    roi_target: "Measurable time saved every week on your chosen task.",
    estimated_total_time: p.time === "Under 1 hour" || p.time === "1–3 hours" ? "4–5 hours" : "6–8 hours",
    path: ids.map((id) => ({ module_id: id, depth: id === "F3" || id === "A1" ? "just-do-it" : depth, difficulty: diff, example_lens: lens, optional: false, bonus: false, why_included: "Matched to your role, goal and available time." })),
  };
}

/* ---- grader (live, with heuristic fallback) ---- */
const GRADER_SYS = `You are the AI Operator Academy exercise-grader, a warm coach (never a gatekeeper). Given a task and the learner's submission, judge it generously on intent over form. Decide an outcome band: mastered|solid|developing|retry. Give SPECIFIC, ACTIONABLE, ENCOURAGING feedback: lead with a genuine win, then the single most useful next move, with a corrected snippet if helpful. Keep it to 2-4 sentences. If they put sensitive data somewhere risky, note it kindly.
Return ONLY JSON: {"outcome","feedback_markdown","first_try_success":bool,"showed_advanced_ability":bool}`;

function fallbackGrade(sub) {
  const len = (sub || "").trim().length;
  if (len < 25) return { outcome: "developing", feedback_markdown: "You're on the board — but there's not quite enough here yet for Claude (or me) to work with. Add the specifics: who it's for, the exact output you want, and your style. Then give it another go.", first_try_success: false, showed_advanced_ability: false };
  const hasStructure = /(format|bullet|section|audience|tone|style|email|table|word|step)/i.test(sub);
  if (hasStructure && len > 90) return { outcome: "solid", feedback_markdown: "Nicely done — you briefed it like a manager, with real specifics. That's exactly the habit that makes outputs usable on the first try. Next time, try adding one example of the style you want and watch it get even sharper.", first_try_success: true, showed_advanced_ability: len > 220 };
  return { outcome: "developing", feedback_markdown: "Good start, and your intent is clear. The upgrade: be explicit about the FORMAT you want (sections, length) and the STYLE (tone, or an example to match). Add those two lines and re-run — it'll jump in quality.", first_try_success: false, showed_advanced_ability: false };
}

/* ---- progress-coach (live adaptivity) — reads recent grading signals and tunes the
        difficulty of the current lesson up or down, with a visible coach note. ---- */
const DIFF_LADDER = ["guided", "standard", "stretch"];
function coachAdjust(plan, progress, idx) {
  const base = (plan.path[idx] && plan.path[idx].difficulty) || "standard";
  let baseI = DIFF_LADDER.indexOf(base); if (baseI < 0) baseI = 1;
  const recent = plan.path.slice(0, idx).map((m) => progress[m.module_id]).filter(Boolean).slice(-3);
  let score = 0, advanced = false;
  for (const p of recent) {
    const s = p.signals || {};
    if (p.outcome === "developing" || p.outcome === "retry") score += 1;
    if (s.attempts && s.attempts > 1) score += 1;
    if (s.first_try_success) score -= 1;
    if (p.outcome === "mastered") score -= 1;
    if (s.showed_advanced_ability) { score -= 1; advanced = true; }
  }
  let eff = baseI, changed = null, note = "";
  if (score >= 2 && baseI > 0) {
    eff = baseI - 1; changed = "down";
    note = "I noticed the last lessons took a few tries — I've eased the difficulty and leaned on more support here. No rush; you've got this.";
  } else if (score <= -2 && advanced && baseI < 2) {
    eff = baseI + 1; changed = "up";
    note = "You're moving fast and showing real ability — I've stepped up the challenge on this one. Stretch a little.";
  }
  return { difficulty: DIFF_LADDER[eff], base, changed, note };
}

/* ============================== STORAGE ============================== */
// Browser localStorage persistence (the original prototype targeted a non-standard
// window.storage that doesn't exist in a real browser, so state never saved).
const KEY = "aoa:state:v1";
const REGISTRY_KEY = "aoa:registry:v1"; // verifiable certificate registry
function saveState(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
function loadState() { try { const r = localStorage.getItem(KEY); return r ? JSON.parse(r) : null; } catch (e) { return null; } }
function clearState() { try { localStorage.removeItem(KEY); } catch (e) {} }

function loadRegistry() { try { return JSON.parse(localStorage.getItem(REGISTRY_KEY) || "{}"); } catch (e) { return {}; } }
function registerCredential(record) {
  try { const r = loadRegistry(); r[record.credential_id] = record; localStorage.setItem(REGISTRY_KEY, JSON.stringify(r)); } catch (e) {}
}

// Testimonial / ROI capture — the marketing funnel's fuel (Phase 4). Consent-gated.
const FEEDBACK_KEY = "aoa:feedback:v1";
function saveFeedback(record) {
  try {
    const all = JSON.parse(localStorage.getItem(FEEDBACK_KEY) || "[]");
    all.push(record);
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(all));
  } catch (e) {}
}

/* ============================== UI PRIMITIVES ============================== */
const Btn = ({ children, onClick, kind = "primary", disabled, style, icon: Icon }) => {
  const base = { fontFamily: sans, fontWeight: 500, fontSize: 15, border: "none", borderRadius: 12, padding: "13px 22px",
    cursor: disabled ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", gap: 9, transition: "all .18s ease", opacity: disabled ? .5 : 1 };
  const kinds = {
    primary: { background: `linear-gradient(135deg, ${T.amber}, ${T.clay})`, color: "#21190F", boxShadow: "0 6px 22px -8px rgba(231,169,88,.5)" },
    ghost: { background: "transparent", color: T.dim, border: `1px solid ${T.line}` },
    soft: { background: T.surfaceHi, color: T.text, border: `1px solid ${T.line}` },
  };
  return <button onClick={disabled ? undefined : onClick} style={{ ...base, ...kinds[kind], ...style }}
    onMouseEnter={(e) => !disabled && (e.currentTarget.style.transform = "translateY(-1px)")}
    onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}>
    {Icon && <Icon size={17} />}{children}</button>;
};

const Tag = ({ children, color = T.dim }) => (
  <span style={{ fontFamily: mono, fontSize: 11, letterSpacing: .5, textTransform: "uppercase", color,
    border: `1px solid ${color}44`, borderRadius: 6, padding: "3px 8px", background: `${color}12` }}>{children}</span>
);

// Practice-mode toggle button style.
const modeBtn = (active) => ({
  display: "inline-flex", alignItems: "center", gap: 7, fontFamily: sans, fontSize: 13.5, fontWeight: 500,
  padding: "9px 15px", borderRadius: 10, cursor: "pointer", transition: "all .15s",
  background: active ? `${T.amber}1c` : T.surface, color: active ? T.text : T.dim,
  border: `1px solid ${active ? T.amber : T.line}`,
});

/* ============================== APP ============================== */
export default function App() {
  const { getToken } = useAuth();
  const { user } = useUser();

  const [screen, setScreen] = useState("loading");
  const [profile, setProfile] = useState({});
  const [plan, setPlan] = useState(null);
  const [progress, setProgress] = useState({}); // moduleId -> {outcome, roiMin}
  const [idx, setIdx] = useState(0);
  const [streak, setStreak] = useState(0);
  const [credential, setCredential] = useState(null); // issued certificate record
  const [byoKey, setByoKeyState] = useState(() => { try { return localStorage.getItem("aoa:llmkey") || ""; } catch (e) { return ""; } });
  const setByoKey = (k) => { setByoKeyState(k); try { k ? localStorage.setItem("aoa:llmkey", k) : localStorage.removeItem("aoa:llmkey"); } catch (e) {} };
  const goal = goalFor(profile);
  const saveTimer = useRef(null);

  // Mount: 1) fast localStorage hydration, 2) async Neon fetch (authoritative)
  useEffect(() => {
    const local = loadState();
    if (local && local.plan) {
      setProfile(local.profile || {}); setPlan(local.plan); setProgress(local.progress || {});
      setStreak(local.streak || 0); setCredential(local.credential || null);
    }
    setScreen("welcome");

    (async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const resp = await fetch("/api/learner", { headers: { Authorization: `Bearer ${token}` } });
        if (!resp.ok) return;
        const remote = await resp.json();
        if (remote && remote.plan) {
          setProfile(remote.profile || {}); setPlan(remote.plan); setProgress(remote.progress || {});
          setStreak(remote.streak || 0); setCredential(remote.credential || null);
          saveState(remote);
        }
      } catch {}
    })();
  }, []); // eslint-disable-line

  // Save: localStorage immediately, Neon debounced 2 s
  useEffect(() => {
    if (!plan) return;
    const state = { profile, plan, progress, streak, credential };
    saveState(state);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        const token = await getToken();
        if (!token) return;
        await fetch("/api/learner", {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(state),
        });
      } catch {}
    }, 2000);
  }, [profile, plan, progress, streak, credential]); // eslint-disable-line

  const corePath = plan ? plan.path.filter((m) => !m.optional && !m.bonus) : [];
  const doneCore = corePath.filter((m) => progress[m.module_id] && progress[m.module_id].outcome !== "retry").length;
  const allCoreDone = plan && doneCore >= corePath.length && progress["CAP"];
  const roiTotal = Object.values(progress).reduce((a, p) => a + (p.roiMin || 0), 0);

  // Issue (once) and persist a verifiable credential to the registry.
  const issueCredential = useCallback((rec) => {
    setCredential((prev) => {
      if (prev) return prev;
      registerCredential(rec);
      return rec;
    });
  }, []);

  const resetAll = async () => {
    clearState();
    try {
      const token = await getToken();
      if (token) await fetch("/api/learner", { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    } catch {}
    setProfile({}); setPlan(null); setProgress({}); setIdx(0); setStreak(0); setCredential(null); setScreen("welcome");
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: sans,
      backgroundImage: `radial-gradient(900px 500px at 80% -8%, ${T.clay}1c, transparent), radial-gradient(700px 500px at 0% 100%, ${T.amber}10, transparent)` }}>
      <style>{FONTS}</style>
      <Header screen={screen} plan={plan} onDash={() => setScreen("dashboard")} onReset={resetAll} user={user} />
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "0 22px 80px" }}>
        {screen === "loading" && <Center><Loader2 size={26} style={{ animation: "spin 1s linear infinite", color: T.amber }} /></Center>}
        {screen === "welcome" && <Welcome hasPlan={!!plan} onStart={() => setScreen("enroll")} onResume={() => setScreen("dashboard")} />}
        {screen === "enroll" && <Enroll onDone={(p) => { setProfile(p); setScreen("building"); }} onBack={() => setScreen("welcome")} />}
        {screen === "building" && <Building profile={profile} onReady={(pl) => { setPlan(pl); setProgress({}); setIdx(0); setScreen("path"); }} />}
        {screen === "path" && plan && <PathReveal plan={plan} profile={profile} goal={goal} onBegin={() => { setIdx(0); setScreen("lesson"); }} />}
        {screen === "lesson" && plan && (
          <Lesson key={idx} plan={plan} idx={idx} progress={progress} profile={profile} goal={goal}
            byoKey={byoKey} setByoKey={setByoKey}
            onComplete={(modId, outcome, roiMin, signals) => {
              setProgress((pr) => ({ ...pr, [modId]: { outcome, roiMin, signals } }));
              setStreak((s) => s + 1);
            }}
            onNext={() => { if (idx < plan.path.length - 1) { setIdx(idx + 1); } else setScreen("dashboard"); }}
            onJumpDash={() => setScreen("dashboard")} />
        )}
        {screen === "dashboard" && plan && (
          <Dashboard plan={plan} progress={progress} streak={streak} roiTotal={roiTotal} goal={goal}
            doneCore={doneCore} coreLen={corePath.length} allCoreDone={allCoreDone}
            onOpen={(i) => { setIdx(i); setScreen("lesson"); }}
            onCert={() => setScreen("certificate")} />
        )}
        {screen === "certificate" && plan && <Certificate plan={plan} profile={profile} progress={progress} roiTotal={roiTotal} credential={credential} onIssue={issueCredential} allCoreDone={allCoreDone} onBack={() => setScreen("dashboard")} />}
      </div>
    </div>
  );
}

const Center = ({ children }) => <div style={{ display: "grid", placeItems: "center", minHeight: "60vh" }}>{children}</div>;

/* ------------------------------- HEADER ------------------------------- */
function Header({ screen, plan, onDash, onReset, user }) {
  const displayName = user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] || "";
  return (
    <div style={{ position: "sticky", top: 0, zIndex: 20, backdropFilter: "blur(10px)",
      background: `${T.bg}cc`, borderBottom: `1px solid ${T.line}` }}>
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "14px 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg,${T.amber},${T.clay})`, display: "grid", placeItems: "center" }}>
            <Terminal size={16} color="#21190F" />
          </div>
          <div style={{ lineHeight: 1 }}>
            <div style={{ fontFamily: serif, fontSize: 18, fontWeight: 600 }}>AI Operator <span style={{ color: T.amber }}>Academy</span></div>
            <div style={{ fontFamily: mono, fontSize: 9.5, color: T.faint, letterSpacing: 1, marginTop: 2 }}>BUILD YOUR AI WORKFORCE</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {displayName && (
            <span style={{ fontFamily: mono, fontSize: 12, color: T.faint, display: "none" }} className="md-show">{displayName}</span>
          )}
          {plan && screen !== "loading" && (
            <>
              {screen !== "dashboard" && <Btn kind="ghost" onClick={onDash} style={{ padding: "8px 14px", fontSize: 13 }}>Dashboard</Btn>}
              <Btn kind="ghost" onClick={onReset} style={{ padding: "8px 12px", fontSize: 13 }} icon={RotateCcw}> </Btn>
            </>
          )}
          <UserButton appearance={{
            variables: { colorBackground: T.surface, colorText: T.text, colorPrimary: T.amber, borderRadius: "10px" },
            elements: { userButtonAvatarBox: { width: 30, height: 30 } },
          }} />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------- WELCOME ------------------------------- */
function Welcome({ onStart, onResume, hasPlan }) {
  return (
    <div className="rise" style={{ paddingTop: 70, textAlign: "center" }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 26 }}>
        <Tag color={T.amber}>Adaptive · Hands-on · Certified</Tag>
      </div>
      <h1 style={{ fontFamily: serif, fontSize: 58, lineHeight: 1.04, fontWeight: 600, margin: "0 auto 22px", maxWidth: 760, letterSpacing: -1 }}>
        Put AI to work in your business — <span style={{ color: T.amber, fontStyle: "italic" }}>this week.</span>
      </h1>
      <p style={{ fontSize: 19, color: T.dim, maxWidth: 560, margin: "0 auto 14px", lineHeight: 1.55 }}>
        Not another "learn the buttons" course. A path built around <em style={{ color: T.text }}>your</em> work — you'll ship a real automation and walk away with the proof.
      </p>
      <p style={{ fontSize: 14.5, color: T.faint, maxWidth: 520, margin: "0 auto 38px" }}>
        Master Claude AI &amp; Claude Code. Answer a few questions and we'll design your course — adaptive in depth, order and difficulty.
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <Btn onClick={onStart} icon={Sparkles}>Design my course</Btn>
        {hasPlan && <Btn kind="soft" onClick={onResume} icon={ArrowRight}>Resume where I left off</Btn>}
      </div>
      <div style={{ display: "flex", gap: 22, justifyContent: "center", marginTop: 56, flexWrap: "wrap" }}>
        {[[Target, "A path composed for your role & goal"], [Terminal, "Practice in a live Claude sandbox"], [Award, "A verifiable certificate tied to what you built"]].map(([I, t], i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, color: T.dim, fontSize: 13.5, maxWidth: 230, textAlign: "left" }}>
            <div style={{ minWidth: 34, height: 34, borderRadius: 9, background: T.surface, border: `1px solid ${T.line}`, display: "grid", placeItems: "center" }}><I size={16} color={T.amber} /></div>{t}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------- ENROLL ------------------------------- */
function Enroll({ onDone, onBack }) {
  const [step, setStep] = useState(0);
  const [ans, setAns] = useState({});
  const q = QUESTIONS[step];
  const val = ans[q.id] || "";
  const canNext = q.type === "text" ? val.trim().length > 2 : !!val;
  const pct = Math.round(((step) / QUESTIONS.length) * 100);

  const next = () => { if (step < QUESTIONS.length - 1) setStep(step + 1); else onDone(ans); };
  const back = () => { if (step === 0) onBack(); else setStep(step - 1); };

  return (
    <div style={{ paddingTop: 44, maxWidth: 640, margin: "0 auto" }}>
      <div style={{ height: 4, background: T.surface, borderRadius: 4, marginBottom: 34, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg,${T.clay},${T.amber})`, transition: "width .4s ease", borderRadius: 4 }} />
      </div>
      <div className="rise" key={step}>
        <div style={{ fontFamily: mono, fontSize: 12, color: T.faint, marginBottom: 12 }}>QUESTION {step + 1} / {QUESTIONS.length}</div>
        <h2 style={{ fontFamily: serif, fontSize: 31, fontWeight: 600, margin: "0 0 8px", lineHeight: 1.18 }}>{q.q}</h2>
        {q.hint && <p style={{ color: T.faint, fontSize: 14, margin: "0 0 24px" }}>{q.hint}</p>}
        {q.type === "single" ? (
          <div style={{ display: "grid", gap: 10, marginTop: 22 }}>
            {q.options.map((o) => {
              const sel = val === o;
              return <button key={o} onClick={() => setAns({ ...ans, [q.id]: o })}
                style={{ textAlign: "left", fontFamily: sans, fontSize: 15.5, padding: "16px 18px", borderRadius: 13, cursor: "pointer",
                  background: sel ? `${T.amber}1c` : T.surface, color: sel ? T.text : T.dim,
                  border: `1px solid ${sel ? T.amber : T.line}`, transition: "all .15s", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {o} {sel && <Check size={18} color={T.amber} />}
              </button>;
            })}
          </div>
        ) : (
          <textarea autoFocus value={val} onChange={(e) => setAns({ ...ans, [q.id]: e.target.value })} placeholder={q.placeholder} rows={4}
            style={{ width: "100%", marginTop: 14, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 13, color: T.text,
              padding: "16px 18px", fontSize: 15, lineHeight: 1.5, resize: "vertical", outline: "none" }} />
        )}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32 }}>
          <Btn kind="ghost" onClick={back} icon={ArrowLeft}>Back</Btn>
          <Btn onClick={next} disabled={!canNext} icon={step === QUESTIONS.length - 1 ? Sparkles : ArrowRight}>
            {step === QUESTIONS.length - 1 ? "Build my course" : "Continue"}
          </Btn>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------- BUILDING ------------------------------- */
function Building({ profile, onReady }) {
  const [msg, setMsg] = useState("Reading your answers…");
  const ran = useRef(false);
  useEffect(() => {
    if (ran.current) return; ran.current = true;
    const steps = ["Reading your answers…", "Choosing your lead track…", "Right-sizing depth & difficulty…", "Localizing examples to your field…", "Sequencing your path…"];
    let i = 0; const iv = setInterval(() => { i = (i + 1) % steps.length; setMsg(steps[i]); }, 1100);
    (async () => {
      let plan = null;
      try {
        const user = `Learner answers:\nrole: ${profile.role}\nindustry: ${profile.industry}\ngoal: ${profile.goal}\ntask_to_hand_off: ${profile.task}\nexperience: ${profile.experience}\ntechnical_comfort: ${profile.tech}\ntime_per_week: ${profile.time}\nsuccess_in_30_days: ${profile.success}`;
        plan = await chatJson({ system: PERSONALIZER_SYS, user, task: "personalizer", maxTokens: 1800, validate: (p) => p && Array.isArray(p.path) && p.path.length > 0 });
        if (!plan.path || !plan.path.length) throw new Error("empty");
        plan.path = plan.path.filter((m) => LIBRARY[m.module_id]);
        if (!plan.path.find((m) => m.module_id === "CAP")) plan.path.push({ module_id: "CAP", depth: "balanced", difficulty: "guided", example_lens: profile.industry, optional: false, bonus: false, why_included: "Ship your capstone and unlock your certificate." });
      } catch (e) { plan = fallbackPath(profile); }
      clearInterval(iv);
      setMsg("Your course is ready.");
      setTimeout(() => onReady(plan), 650);
    })();
  }, []);
  return (
    <Center>
      <div style={{ textAlign: "center" }}>
        <div style={{ position: "relative", width: 90, height: 90, margin: "0 auto 30px" }}>
          {[0, 1, 2].map((i) => <div key={i} style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `2px solid ${T.amber}`, animation: `pulseRing 2s ${i * .5}s infinite ease-out` }} />)}
          <div style={{ position: "absolute", inset: 22, borderRadius: "50%", background: `linear-gradient(135deg,${T.amber},${T.clay})`, display: "grid", placeItems: "center" }}>
            <Sparkles size={22} color="#21190F" />
          </div>
        </div>
        <div style={{ fontFamily: serif, fontSize: 24, marginBottom: 8 }}>Designing your course</div>
        <div style={{ fontFamily: mono, fontSize: 13, color: T.amber }}>{msg}</div>
      </div>
    </Center>
  );
}

/* ------------------------------- PATH REVEAL ------------------------------- */
function PathReveal({ plan, profile, goal, onBegin }) {
  const core = plan.path.filter((m) => !m.optional && !m.bonus);
  const extra = plan.path.filter((m) => m.optional || m.bonus);
  const ms = milestoneState(goal, plan, {}, null);
  return (
    <div className="rise" style={{ paddingTop: 40 }}>
      <Tag color={T.green}>Your personalized path</Tag>
      <h2 style={{ fontFamily: serif, fontSize: 34, fontWeight: 600, margin: "16px 0 10px", lineHeight: 1.18 }}>{plan.learner_summary}</h2>

      {goal && (
        <div style={{ background: `linear-gradient(135deg, ${T.green}14, ${T.amber}10)`, border: `1px solid ${T.green}44`, borderRadius: 16, padding: "18px 20px", margin: "6px 0 26px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Flag size={15} color={T.green} />
            <span style={{ fontFamily: mono, fontSize: 11.5, letterSpacing: 1, textTransform: "uppercase", color: T.green }}>Where this path takes you</span>
          </div>
          <div style={{ fontSize: 16, lineHeight: 1.5, color: T.text, marginBottom: ms.length ? 14 : 0 }}>
            You'll finish holding <b style={{ color: T.amberHi }}>{goal.deliverable}</b>.
          </div>
          {ms.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {ms.map((mst, i) => (
                <div key={mst.id} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, color: T.dim, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 9, padding: "6px 10px" }}>
                  <span style={{ fontFamily: mono, fontSize: 11, color: T.green }}>{i + 1}</span>{mst.label}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <div style={{ display: "flex", gap: 22, flexWrap: "wrap", margin: "18px 0 30px" }}>
        <Stat icon={Target} label="Your capstone" value={plan.capstone_brief} wide />
        <Stat icon={TrendingUp} label="Target ROI" value={plan.roi_target} wide />
        <Stat icon={Clock} label="Total time" value={plan.estimated_total_time} />
        <Stat icon={Gauge} label="Lead track" value={TRACK_NAME[plan.lead_track] || "—"} />
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        {core.map((m, i) => <ModuleRow key={m.module_id} m={m} n={i + 1} />)}
      </div>
      {extra.length > 0 && (
        <>
          <div style={{ fontFamily: mono, fontSize: 12, color: T.faint, margin: "24px 0 10px", letterSpacing: 1 }}>OPTIONAL · UNLOCK IF YOU HAVE TIME</div>
          <div style={{ display: "grid", gap: 10, opacity: .7 }}>{extra.map((m, i) => <ModuleRow key={m.module_id} m={m} n={core.length + i + 1} muted />)}</div>
        </>
      )}
      <div style={{ marginTop: 36 }}><Btn onClick={onBegin} icon={Play}>Begin lesson 1</Btn></div>
    </div>
  );
}
function Stat({ icon: I, label, value, wide }) {
  return (
    <div style={{ flex: wide ? "1 1 340px" : "1 1 150px", background: T.surface, border: `1px solid ${T.line}`, borderRadius: 14, padding: "14px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, color: T.faint, fontSize: 11.5, fontFamily: mono, letterSpacing: .5, textTransform: "uppercase", marginBottom: 6 }}><I size={13} color={T.amber} />{label}</div>
      <div style={{ fontSize: 15, color: T.text, lineHeight: 1.4 }}>{value}</div>
    </div>
  );
}
function ModuleRow({ m, n, muted }) {
  const mod = LIBRARY[m.module_id];
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 13, padding: "15px 17px", display: "flex", gap: 14, alignItems: "flex-start" }}>
      <div style={{ minWidth: 30, height: 30, borderRadius: 8, background: muted ? T.surfaceHi : `${T.amber}1c`, color: muted ? T.faint : T.amber, display: "grid", placeItems: "center", fontFamily: mono, fontSize: 13, fontWeight: 500 }}>{n}</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
          <span style={{ fontWeight: 600, fontSize: 16 }}>{mod.title}</span>
          <Tag>{TRACK_NAME[mod.track]}</Tag>
          <Tag color={T.blue}>{m.difficulty}</Tag>
        </div>
        <div style={{ color: T.dim, fontSize: 13.5, marginTop: 5, lineHeight: 1.45 }}>{m.why_included || mod.blurb}</div>
      </div>
    </div>
  );
}

/* ------------------------------- LESSON PLAYER ------------------------------- */
function Lesson({ plan, idx, progress, profile, goal, byoKey, setByoKey, onComplete, onNext, onJumpDash }) {
  const m = plan.path[idx];
  const mod = LIBRARY[m.module_id];
  const lens = m.example_lens || "your work";
  const A = getAuthoredLesson(m.module_id);   // rich authored 8-beat lesson (Phase 1 content)
  const L = getLesson(mod, lens);             // template fallback
  const isCap = m.module_id === "CAP";
  const quiz = A ? A.quiz : L.quiz;
  const roiMin = A ? A.roiMin : L.roiMin;
  const coach = coachAdjust(plan, progress, idx);  // live adaptivity (progress-coach)

  // Adaptive overlay — tailor the static lesson to this learner (static templating).
  const ctx = overlayContext(profile, m, goal);
  const ov = (md) => applyOverlay(md, ctx);
  const ms = milestoneState(goal, plan, progress, m.module_id);
  const myMilestone = ms.findIndex((x) => x.current);

  const [phase, setPhase] = useState("learn"); // learn -> do -> done
  const [draft, setDraft] = useState("");
  const [sandboxOut, setSandboxOut] = useState("");
  const [running, setRunning] = useState(false);
  const [grading, setGrading] = useState(false);
  const [result, setResult] = useState(null);
  const [quizPicked, setQuizPicked] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [sandboxMode, setSandboxMode] = useState("byoc"); // byoc = own Claude | inapp = practice here
  const [copied, setCopied] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const starterPrompt = (A && A.assetCode) || (A ? stripMd(A.taskMd) : (L.task || ""));
  const copyStarter = async () => {
    try { await navigator.clipboard.writeText(starterPrompt); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch (e) {}
  };

  const runSandbox = async () => {
    if (!draft.trim()) return;
    setRunning(true); setSandboxOut("");
    try {
      const out = await llmText(
        "You are Claude, helping a business operator practice. Respond exactly as you would to their prompt, concisely and usefully. This is a live practice sandbox.",
        draft, { task: "sandbox", maxTokens: 700, apiKey: byoKey || undefined });
      setSandboxOut(out || "(no response)");
    } catch (e) {
      setSandboxOut("⚠️ Couldn't reach the model just now (free tiers rate-limit — try again in a moment), or add your own key below. Your prompt:\n\n" + draft);
    }
    setRunning(false);
  };

  const submit = async () => {
    setGrading(true);
    const thisAttempt = attempts + 1;
    setAttempts(thisAttempt);
    let g;
    try {
      const rb = A && A.rubric;
      const taskSummary = (rb && rb.task_summary) || (A ? stripMd(A.taskMd) : L.task);
      const rubricText = rb && rb.criteria
        ? "\n\nGRADE AGAINST THIS RUBRIC (criteria with weights):\n" +
          rb.criteria.map((c) => `- (${c.weight}) ${c.check}`).join("\n") +
          (rb.what_great_looks_like ? `\n\nWhat great looks like: ${rb.what_great_looks_like}` : "")
        : "";
      g = await chatJson({ system: GRADER_SYS, user: `TASK: ${taskSummary}${rubricText}\n\nLEARNER SUBMISSION (their prompt${sandboxOut ? " + the result they got" : ""}):\n${draft}\n\n${sandboxOut ? "RESULT:\n" + sandboxOut.slice(0, 600) : ""}`, task: "grader", maxTokens: 700, validate: (x) => x && x.outcome });
    } catch (e) { g = fallbackGrade(draft); }
    setResult(g); setGrading(false);
    if (g.outcome === "solid" || g.outcome === "mastered") {
      const signals = {
        first_try_success: thisAttempt === 1 && !!g.first_try_success,
        showed_advanced_ability: !!g.showed_advanced_ability,
        attempts: thisAttempt,
        struggled: thisAttempt > 1,
      };
      onComplete(m.module_id, g.outcome, roiMin, signals);
      setPhase("done");
    }
  };

  const passed = result && (result.outcome === "solid" || result.outcome === "mastered");

  return (
    <div className="rise" style={{ paddingTop: 34 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, color: T.faint, fontSize: 13 }}>
        <span style={{ fontFamily: mono }}>{String(idx + 1).padStart(2, "0")}</span>
        <span>·</span><Tag>{TRACK_NAME[mod.track]}</Tag><Tag color={T.blue}>{m.depth}</Tag>
        <Tag color={coach.changed ? T.green : T.amber}>{coach.difficulty}{coach.changed === "up" ? " ↑" : coach.changed === "down" ? " ↓" : ""}</Tag>
      </div>
      <h2 style={{ fontFamily: serif, fontSize: 33, fontWeight: 600, margin: "0 0 18px", lineHeight: 1.16 }}>{A ? A.title : mod.title}</h2>

      {coach.note && (
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", background: `${T.green}12`, border: `1px solid ${T.green}3a`, borderRadius: 12, padding: "12px 15px", marginBottom: 14 }}>
          <Sparkles size={16} color={T.green} style={{ marginTop: 2, flexShrink: 0 }} />
          <div style={{ fontSize: 13.5, lineHeight: 1.55, color: T.dim }}><b style={{ color: T.green }}>Your coach:</b> {coach.note}</div>
        </div>
      )}

      {goal && myMilestone >= 0 && (
        <div style={{ display: "flex", gap: 9, alignItems: "center", background: `${T.amber}10`, border: `1px solid ${T.amber}33`, borderRadius: 12, padding: "10px 14px", marginBottom: 20, flexWrap: "wrap" }}>
          <Flag size={14} color={T.amber} />
          <span style={{ fontSize: 13, color: T.dim }}>Milestone <b style={{ color: T.amberHi }}>{myMilestone + 1} of {ms.length}</b> toward {goal.short}: <b style={{ color: T.text }}>{ms[myMilestone].label}</b></span>
        </div>
      )}

      {phase === "learn" && (
        <div>
          {goal && (
            <div style={{ marginBottom: 18 }}><Markdown md={goalConnector(ctx)} T={T} mono={mono} /></div>
          )}
          {A ? (
            <>
              <Beat n="01" label="Why this matters"><Markdown md={ov(A.hookMd)} T={T} mono={mono} /></Beat>
              <Beat n="02" label="The idea"><Markdown md={ov(A.conceptMd)} T={T} mono={mono} /></Beat>
              <Beat n="03" label={A.demoTitle || "Walkthrough"}><Markdown md={ov(A.demoMd)} T={T} mono={mono} /></Beat>
            </>
          ) : (
            <>
              <Beat n="01" label="Why this matters">{L.hook}</Beat>
              <Beat n="02" label="The idea">{L.concept}</Beat>
              <Beat n="03" label={L.demoTitle || "Walkthrough"}>
                <ol style={{ margin: "6px 0 0", paddingLeft: 18, color: T.dim, lineHeight: 1.7 }}>
                  {L.demo.map((d, i) => <li key={i} style={{ marginBottom: 4 }}>{d}</li>)}
                </ol>
              </Beat>
            </>
          )}
          <div style={{ marginTop: 26 }}><Btn onClick={() => setPhase("do")} icon={Terminal}>{isCap ? "Build my capstone" : "Try it in the sandbox"}</Btn></div>
        </div>
      )}

      {phase !== "learn" && (
        <div>
          <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 14, padding: 18, marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Zap size={15} color={T.amber} /><span style={{ fontWeight: 600 }}>{isCap ? "Your capstone task" : (A ? A.taskTitle : "Do it")}</span>
            </div>
            {A ? <Markdown md={ov(A.taskMd)} T={T} mono={mono} /> : <p style={{ color: T.dim, fontSize: 14.5, lineHeight: 1.6, margin: 0 }}>{L.task}</p>}
          </div>

          {/* PRACTICE MODE TOGGLE */}
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            <button onClick={() => setSandboxMode("byoc")} style={modeBtn(sandboxMode === "byoc")}>
              <ExternalLink size={14} /> Do it in my own Claude
            </button>
            <button onClick={() => setSandboxMode("inapp")} style={modeBtn(sandboxMode === "inapp")}>
              <Terminal size={14} /> Practice here
            </button>
          </div>

          {sandboxMode === "byoc" ? (
            /* ---- BYO Claude: copy the prompt, do it in your own Claude, paste the result back ---- */
            <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 14, padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <Copy size={14} color={T.amber} /><b style={{ fontSize: 14.5 }}>Use your own Claude</b>
                <span style={{ color: T.faint, fontSize: 12.5 }}>— claude.ai, Claude Code, or Cowork</span>
              </div>
              <p style={{ color: T.faint, fontSize: 13, margin: "0 0 10px", lineHeight: 1.5 }}>Copy the starter below, run it in your own Claude, then paste what you got back to get feedback.</p>
              {starterPrompt && (
                <div style={{ position: "relative", marginBottom: 12 }}>
                  <pre style={{ fontFamily: mono, fontSize: 12.5, lineHeight: 1.55, background: "#0F0D0A", border: `1px solid ${T.line}`, borderRadius: 10, padding: "13px 15px", overflowX: "auto", color: T.dim, whiteSpace: "pre-wrap", margin: 0 }}>{starterPrompt}</pre>
                  <Btn kind="soft" onClick={copyStarter} icon={copied ? CircleCheck : Copy} style={{ position: "absolute", top: 8, right: 8, padding: "6px 12px", fontSize: 12.5 }}>{copied ? "Copied" : "Copy"}</Btn>
                </div>
              )}
              <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={5}
                placeholder="Paste your prompt and/or what Claude gave you back…"
                style={{ width: "100%", background: "#0F0D0A", border: `1px solid ${T.line}`, borderRadius: 10, color: T.text, padding: "12px 14px", fontSize: 13.5, lineHeight: 1.6, resize: "vertical", outline: "none" }} />
            </div>
          ) : (
            /* ---- In-app sandbox (optional): uses the platform key, or the learner's own key ---- */
            <div style={{ background: "#0F0D0A", border: `1px solid ${T.lineHi}`, borderRadius: 14, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderBottom: `1px solid ${T.line}`, background: T.bg2 }}>
                <Terminal size={14} color={T.amber} />
                <span style={{ fontFamily: mono, fontSize: 12, color: T.dim }}>practice sandbox</span>
                <button onClick={() => setShowKey((v) => !v)} title="Use your own API key" style={{ marginLeft: "auto", background: "transparent", border: "none", cursor: "pointer", color: byoKey ? T.green : T.faint, display: "flex", alignItems: "center", gap: 5, fontFamily: mono, fontSize: 11 }}>
                  <KeyRound size={12} />{byoKey ? "your key" : "shared key"}
                </button>
              </div>
              {showKey && (
                <div style={{ padding: "12px 14px", borderBottom: `1px solid ${T.line}`, background: T.bg2 }}>
                  <div style={{ fontSize: 12.5, color: T.dim, marginBottom: 7, lineHeight: 1.5 }}>Use <b style={{ color: T.text }}>your own</b> key so practice runs on your quota (free Groq key from console.groq.com, or any OpenAI-compatible key). Stored only in this browser.</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <input type="password" defaultValue={byoKey} placeholder="paste your API key…" onChange={(e) => setByoKey(e.target.value.trim())}
                      style={{ flex: "1 1 240px", background: "#0F0D0A", border: `1px solid ${T.line}`, borderRadius: 8, color: T.text, padding: "9px 12px", fontSize: 13, outline: "none", fontFamily: mono }} />
                    {byoKey && <Btn kind="ghost" onClick={() => setByoKey("")} style={{ padding: "8px 12px", fontSize: 12.5 }}>Clear</Btn>}
                  </div>
                </div>
              )}
              <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={5}
                placeholder="Write your prompt here, then run it…"
                style={{ width: "100%", background: "transparent", border: "none", color: T.text, padding: "14px 16px", fontSize: 13.5, lineHeight: 1.6, resize: "vertical", outline: "none" }} />
              <div style={{ display: "flex", gap: 8, padding: "0 14px 14px" }}>
                <Btn kind="soft" onClick={runSandbox} disabled={running || !draft.trim()} icon={running ? Loader2 : Play}>{running ? "Running…" : "Run"}</Btn>
              </div>
              {sandboxOut && (
                <div style={{ borderTop: `1px solid ${T.line}`, padding: "14px 16px", background: "#0B0907" }}>
                  <div style={{ fontFamily: mono, fontSize: 11, color: T.green, marginBottom: 8 }}>CLAUDE ▸</div>
                  <div style={{ fontSize: 13.5, lineHeight: 1.65, color: T.text, whiteSpace: "pre-wrap" }}>{sandboxOut}</div>
                </div>
              )}
            </div>
          )}

          {/* GRADING */}
          {!passed && (
            <div style={{ marginTop: 16, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <Btn onClick={submit} disabled={grading || !draft.trim()} icon={grading ? Loader2 : Send}>{grading ? "Getting feedback…" : "Submit for feedback"}</Btn>
              {result && !passed && <span style={{ color: T.faint, fontSize: 13 }}>Tweak your prompt above and resubmit — no penalty for trying again.</span>}
            </div>
          )}

          {result && (
            <Feedback result={result} />
          )}

          {/* APPLY + RETAIN + ROI after passing */}
          {passed && (
            <div className="rise">
              <Beat n="06" label="Apply to your real work" tint={T.green}>
                {A ? <Markdown md={ov(A.applyMd)} T={T} mono={mono} /> : L.apply}
              </Beat>

              {/* Keepable asset */}
              {A && A.assetCode && (
                <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 14, padding: 18, margin: "8px 0 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}><Gift size={15} color={T.amber} /><b>Keep this</b><span style={{ color: T.faint, fontSize: 13 }}>— a reusable asset you walk away with</span></div>
                  <pre style={{ fontFamily: mono, fontSize: 12.5, lineHeight: 1.55, background: "#0F0D0A", border: `1px solid ${T.line}`, borderRadius: 10, padding: "13px 15px", overflowX: "auto", color: T.dim, whiteSpace: "pre-wrap", margin: 0 }}>{A.assetCode}</pre>
                </div>
              )}

              {/* Quick check */}
              <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 14, padding: 18, margin: "8px 0 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}><Lightbulb size={15} color={T.amber} /><b>Quick check</b></div>
                <p style={{ margin: "0 0 10px", color: T.dim }}>{quiz.q}</p>
                {!quizPicked ? <Btn kind="soft" onClick={() => setQuizPicked(true)}>Reveal answer</Btn>
                  : <div style={{ color: T.green, fontSize: 14.5 }}><CircleCheck size={15} style={{ verticalAlign: -2 }} /> {quiz.a}</div>}
              </div>

              {/* Honest limit */}
              {A && A.limitMd && (
                <div style={{ background: `${T.red}10`, border: `1px solid ${T.red}3a`, borderRadius: 14, padding: "14px 18px", margin: "0 0 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}><AlertTriangle size={15} color={T.red} /><b style={{ color: T.claySoft }}>Know the limit</b></div>
                  <Markdown md={ov(A.limitMd)} T={T} mono={mono} />
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: 12, background: `${T.amber}14`, border: `1px solid ${T.amber}40`, borderRadius: 14, padding: "16px 18px" }}>
                <TrendingUp size={20} color={T.amber} />
                <div><b style={{ color: T.amberHi }}>≈ {roiMin} min saved</b> <span style={{ color: T.dim }}>each time you do this. That stacks up fast — and it's now tracked on your dashboard.</span></div>
              </div>
              <div style={{ marginTop: 26, display: "flex", gap: 10 }}>
                <Btn onClick={onNext} icon={idx < plan.path.length - 1 ? ArrowRight : Award}>{idx < plan.path.length - 1 ? "Next lesson" : "Finish & see dashboard"}</Btn>
                <Btn kind="ghost" onClick={onJumpDash}>Dashboard</Btn>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Beat({ n, label, children, tint = T.amber }) {
  return (
    <div style={{ display: "flex", gap: 16, marginBottom: 22 }}>
      <div style={{ fontFamily: mono, fontSize: 12, color: tint, paddingTop: 3, minWidth: 22 }}>{n}</div>
      <div style={{ flex: 1, borderLeft: `1px solid ${T.line}`, paddingLeft: 16 }}>
        <div style={{ fontFamily: mono, fontSize: 11.5, color: T.faint, letterSpacing: 1, textTransform: "uppercase", marginBottom: 7 }}>{label}</div>
        <div style={{ fontSize: 16, lineHeight: 1.62, color: T.text }}>{children}</div>
      </div>
    </div>
  );
}
function Feedback({ result }) {
  const tones = { mastered: T.green, solid: T.green, developing: T.amber, retry: T.red };
  const c = tones[result.outcome] || T.amber;
  const labels = { mastered: "Mastered", solid: "Solid work", developing: "Developing", retry: "Let's refine it" };
  return (
    <div className="rise" style={{ marginTop: 16, background: `${c}12`, border: `1px solid ${c}44`, borderRadius: 14, padding: "16px 18px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <CircleCheck size={16} color={c} /><b style={{ color: c }}>{labels[result.outcome] || "Feedback"}</b>
        {result.showed_advanced_ability && <Tag color={T.green}>advanced ability noticed</Tag>}
      </div>
      <div style={{ fontSize: 14.5, lineHeight: 1.62, color: T.text }}>{result.feedback_markdown}</div>
    </div>
  );
}

/* ------------------------------- DASHBOARD ------------------------------- */
function Dashboard({ plan, progress, streak, roiTotal, goal, doneCore, coreLen, allCoreDone, onOpen, onCert }) {
  const pct = coreLen ? Math.round((doneCore / coreLen) * 100) : 0;
  const weekly = Math.round(roiTotal); // mins; treat as per-cycle estimate
  const nextIdx = plan.path.findIndex((m) => !(progress[m.module_id] && progress[m.module_id].outcome !== "retry"));
  const ms = milestoneState(goal, plan, progress, null);
  const msDone = ms.filter((x) => x.done).length;
  return (
    <div className="rise" style={{ paddingTop: 38 }}>
      <h2 style={{ fontFamily: serif, fontSize: 32, fontWeight: 600, margin: "0 0 16px" }}>Your dashboard</h2>

      {goal && ms.length > 0 && (
        <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 16, padding: "16px 18px", marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            <Flag size={15} color={T.amber} />
            <span style={{ fontSize: 14.5 }}>Toward <b style={{ color: T.amberHi }}>{goal.short}</b></span>
            <span style={{ marginLeft: "auto", fontFamily: mono, fontSize: 12, color: T.faint }}>{msDone}/{ms.length} milestones</span>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {ms.map((mst) => (
              <div key={mst.id} title={mst.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: mst.done ? T.green : T.faint, background: mst.done ? `${T.green}14` : T.bg2, border: `1px solid ${mst.done ? T.green + "44" : T.line}`, borderRadius: 8, padding: "5px 9px" }}>
                {mst.done ? <Check size={12} color={T.green} /> : <span style={{ width: 12, height: 12, borderRadius: "50%", border: `1.5px solid ${T.faint}`, display: "inline-block" }} />}
                {mst.label}
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
        <Ring pct={pct} />
        <Metric icon={Flame} value={streak} label="Lessons completed" color={T.clay} />
        <Metric icon={Clock} value={`${weekly}m`} label="Time saved / cycle" color={T.amber} />
        <Metric icon={BookOpen} value={`${doneCore}/${coreLen}`} label="Core modules" color={T.green} />
      </div>

      {allCoreDone ? (
        <div style={{ background: `linear-gradient(135deg, ${T.amber}22, ${T.clay}22)`, border: `1px solid ${T.amber}55`, borderRadius: 16, padding: 22, marginBottom: 26, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <Award size={30} color={T.amber} />
          <div style={{ flex: 1, minWidth: 220 }}><b style={{ fontSize: 17 }}>You've earned your certificate.</b><div style={{ color: T.dim, fontSize: 14, marginTop: 3 }}>Path complete and capstone shipped. Claim your verifiable credential.</div></div>
          <Btn onClick={onCert} icon={Award}>View certificate</Btn>
        </div>
      ) : nextIdx >= 0 && (
        <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 16, padding: 20, marginBottom: 26, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <Play size={22} color={T.amber} />
          <div style={{ flex: 1, minWidth: 200 }}><div style={{ color: T.faint, fontSize: 12, fontFamily: mono }}>UP NEXT</div><b style={{ fontSize: 16 }}>{LIBRARY[plan.path[nextIdx].module_id].title}</b></div>
          <Btn onClick={() => onOpen(nextIdx)} icon={ArrowRight}>Continue</Btn>
        </div>
      )}

      <div style={{ display: "grid", gap: 10 }}>
        {plan.path.map((m, i) => {
          const p = progress[m.module_id];
          const done = p && p.outcome !== "retry";
          const mod = LIBRARY[m.module_id];
          const locked = !done && i > nextIdx && nextIdx >= 0;
          return (
            <button key={m.module_id} onClick={() => !locked && onOpen(i)} disabled={locked}
              style={{ textAlign: "left", display: "flex", alignItems: "center", gap: 14, background: T.surface, border: `1px solid ${done ? T.green + "55" : T.line}`,
                borderRadius: 13, padding: "14px 16px", cursor: locked ? "not-allowed" : "pointer", opacity: locked ? .45 : 1, transition: "all .15s" }}>
              <div style={{ minWidth: 30, height: 30, borderRadius: 8, background: done ? `${T.green}22` : T.surfaceHi, display: "grid", placeItems: "center" }}>
                {done ? <Check size={16} color={T.green} /> : locked ? <Lock size={14} color={T.faint} /> : <span style={{ fontFamily: mono, fontSize: 13, color: T.amber }}>{i + 1}</span>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}><b style={{ fontSize: 15.5 }}>{mod.title}</b><Tag>{TRACK_NAME[mod.track]}</Tag>{(m.optional || m.bonus) && <Tag color={T.blue}>optional</Tag>}</div>
              </div>
              {done && <span style={{ fontFamily: mono, fontSize: 11, color: T.green }}>{p.outcome}</span>}
              {!locked && !done && <ChevronRight size={17} color={T.faint} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
function Ring({ pct }) {
  const r = 30, c = 2 * Math.PI * r;
  return (
    <div style={{ flex: "1 1 150px", background: T.surface, border: `1px solid ${T.line}`, borderRadius: 16, padding: 18, display: "flex", alignItems: "center", gap: 14 }}>
      <svg width="76" height="76" viewBox="0 0 76 76">
        <circle cx="38" cy="38" r={r} fill="none" stroke={T.line} strokeWidth="7" />
        <circle cx="38" cy="38" r={r} fill="none" stroke={T.amber} strokeWidth="7" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (c * pct) / 100} transform="rotate(-90 38 38)" style={{ transition: "stroke-dashoffset .6s ease" }} />
        <text x="38" y="43" textAnchor="middle" fill={T.text} fontSize="18" fontFamily={mono}>{pct}%</text>
      </svg>
      <div><div style={{ fontSize: 12, color: T.faint, fontFamily: mono, textTransform: "uppercase", letterSpacing: .5 }}>Course progress</div><div style={{ fontSize: 15, marginTop: 4, color: T.dim }}>Keep going — you're building real assets.</div></div>
    </div>
  );
}
function Metric({ icon: I, value, label, color }) {
  return (
    <div style={{ flex: "1 1 130px", background: T.surface, border: `1px solid ${T.line}`, borderRadius: 16, padding: 18 }}>
      <I size={18} color={color} />
      <div style={{ fontFamily: serif, fontSize: 30, fontWeight: 600, marginTop: 8 }}>{value}</div>
      <div style={{ fontSize: 12.5, color: T.faint, marginTop: 2 }}>{label}</div>
    </div>
  );
}

/* ------------------------------- CERTIFICATE ------------------------------- */
function Certificate({ plan, profile, progress, roiTotal, credential, onIssue, allCoreDone, onBack }) {
  const [name, setName] = useState((credential && credential.learner_name) || profile.name || "");
  const title = { A: "Operator", B: "Builder", C: "Workflow Automation", D: "Team Enablement" }[plan.lead_track] || "Practitioner";

  // Phase 4 — testimonial / ROI capture (consent-gated). Feeds the marketing funnel.
  const [rating, setRating] = useState(0);
  const [built, setBuilt] = useState(plan.capstone_brief || "");
  const [hours, setHours] = useState("");
  const [quote, setQuote] = useState("");
  const [consent, setConsent] = useState(false);
  const [fbSent, setFbSent] = useState(false);
  const submitFeedback = () => {
    saveFeedback({
      credential_id: credential ? credential.credential_id : null,
      learner_name: name || "Anonymous",
      lead_track: plan.lead_track,
      rating,
      built,
      hours_saved_per_week: hours,
      quote,
      consent_to_share: consent,
      roi_minutes_total: Math.round(roiTotal),
      captured_at: new Date().toISOString(),
    });
    setFbSent(true);
  };

  // Issue the credential once, the first time the earned certificate is viewed, and
  // persist it to the verifiable registry (localStorage). Stable across reloads.
  useEffect(() => {
    if (allCoreDone && !credential && onIssue) {
      const rand = (() => { const a = new Uint8Array(4); (window.crypto || {}).getRandomValues?.(a); return Array.from(a, (b) => b.toString(16).padStart(2, "0")).join(""); })();
      const issue_date = new Date().toISOString().slice(0, 10);
      const cid = "AOA-" + issue_date.slice(0, 4) + "-" + (rand || Math.floor(performance.now()).toString(16)).slice(0, 8);
      onIssue({
        credential_id: cid,
        credential_title: `AI Operator — ${title}`,
        learner_name: name || "Learner",
        capstone_asset: plan.capstone_brief,
        roi_summary: `≈ ${Math.round(roiTotal)} minutes saved per cycle`,
        issue_date,
        verification_url: `https://verify.aioperator.academy/${cid}`,
        path_completed: plan.path.map((m) => m.module_id),
        lead_track: plan.lead_track,
      });
    }
  }, [allCoreDone, credential, onIssue]); // eslint-disable-line

  const id = credential ? credential.credential_id : "AOA-PREVIEW";
  return (
    <div className="rise" style={{ paddingTop: 38 }}>
      <Btn kind="ghost" onClick={onBack} icon={ArrowLeft} style={{ marginBottom: 20 }}>Back to dashboard</Btn>
      <div style={{ marginBottom: 18 }}>
        <label style={{ fontSize: 13, color: T.faint }}>Name on certificate</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name"
          style={{ display: "block", marginTop: 6, width: "100%", maxWidth: 360, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 10, color: T.text, padding: "11px 14px", fontSize: 15, outline: "none" }} />
      </div>

      <div style={{ position: "relative", borderRadius: 18, padding: 2, background: `linear-gradient(135deg,${T.amber},${T.clay},${T.amber})` }}>
        <div style={{ borderRadius: 16, background: T.bg2, padding: "42px 40px",
          backgroundImage: `radial-gradient(500px 300px at 100% 0%, ${T.amber}12, transparent)` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 30 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: `linear-gradient(135deg,${T.amber},${T.clay})`, display: "grid", placeItems: "center" }}><Terminal size={18} color="#21190F" /></div>
              <span style={{ fontFamily: serif, fontSize: 18 }}>AI Operator Academy</span>
            </div>
            <Award size={30} color={T.amber} />
          </div>
          <div style={{ fontFamily: mono, fontSize: 12, color: T.faint, letterSpacing: 2, textTransform: "uppercase" }}>Certificate of Completion</div>
          <div style={{ fontFamily: serif, fontSize: 40, fontWeight: 600, margin: "10px 0 4px", color: T.amberHi }}>AI Operator — {title}</div>
          <div style={{ color: T.dim, fontSize: 15, marginBottom: 26 }}>This certifies that</div>
          <div style={{ fontFamily: serif, fontSize: 34, fontStyle: "italic", borderBottom: `1px solid ${T.line}`, paddingBottom: 18, marginBottom: 22 }}>{name || "Your Name"}</div>
          <div style={{ display: "flex", gap: 28, flexWrap: "wrap", marginBottom: 24 }}>
            <div style={{ flex: "1 1 260px" }}>
              <div style={{ fontFamily: mono, fontSize: 11, color: T.faint, letterSpacing: 1 }}>BUILT</div>
              <div style={{ fontSize: 14.5, marginTop: 4, color: T.text }}>{plan.capstone_brief}</div>
            </div>
            <div style={{ flex: "1 1 160px" }}>
              <div style={{ fontFamily: mono, fontSize: 11, color: T.faint, letterSpacing: 1 }}>MEASURED IMPACT</div>
              <div style={{ fontSize: 14.5, marginTop: 4, color: T.green }}>≈ {Math.round(roiTotal)} minutes saved per cycle</div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 14, borderTop: `1px solid ${T.line}`, paddingTop: 18 }}>
            <div>
              <div style={{ fontFamily: mono, fontSize: 12, color: T.amber }}>{id}</div>
              <div style={{ fontSize: 11.5, color: T.faint, marginTop: 3 }}>verify at verify.aioperator.academy/{id}</div>
            </div>
            <div style={{ fontSize: 11, color: T.faint, maxWidth: 280, textAlign: "right" }}>Demonstrates practical, hands-on capability with Claude AI &amp; Claude Code. Not an academic accreditation.</div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 22, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 14, padding: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}><Sparkles size={15} color={T.amber} /><b>Ready-to-share post</b></div>
        <p style={{ color: T.dim, fontSize: 14, lineHeight: 1.6, margin: 0, fontStyle: "italic" }}>
          "I just built {plan.capstone_brief.replace(/^A /, "a ")}{hours ? ` — saving about ${hours} a week` : ""} — and completed the AI Operator Academy (hands-on, not theory). The most useful thing I've done for my workflow in months."
        </p>
      </div>

      {/* Phase 4 — capture the real outcome (the marketing funnel's fuel) */}
      <div style={{ marginTop: 16, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 14, padding: 18 }}>
        {!fbSent ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}><TrendingUp size={15} color={T.green} /><b>Help us with your result</b></div>
            <p style={{ color: T.faint, fontSize: 13, margin: "0 0 14px", lineHeight: 1.5 }}>Took you 30 seconds — this is how we improve the course and (with your permission) show real outcomes.</p>

            <div style={{ fontSize: 12.5, color: T.dim, marginBottom: 6 }}>How was it?</div>
            <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setRating(n)} aria-label={`${n} star`}
                  style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 24, lineHeight: 1, color: n <= rating ? T.amber : T.line, transition: "color .12s" }}>★</button>
              ))}
            </div>

            <label style={{ fontSize: 12.5, color: T.dim }}>What did you build?</label>
            <input value={built} onChange={(e) => setBuilt(e.target.value)} placeholder="e.g. an automation that turns notes into a client follow-up"
              style={{ display: "block", width: "100%", margin: "6px 0 14px", background: T.bg2, border: `1px solid ${T.line}`, borderRadius: 10, color: T.text, padding: "10px 13px", fontSize: 14, outline: "none" }} />

            <label style={{ fontSize: 12.5, color: T.dim }}>Roughly how much time does it save you?</label>
            <input value={hours} onChange={(e) => setHours(e.target.value)} placeholder="e.g. 3 hours / week"
              style={{ display: "block", width: "100%", maxWidth: 260, margin: "6px 0 14px", background: T.bg2, border: `1px solid ${T.line}`, borderRadius: 10, color: T.text, padding: "10px 13px", fontSize: 14, outline: "none" }} />

            <label style={{ fontSize: 12.5, color: T.dim }}>Anything you'd say about the course? (optional)</label>
            <textarea value={quote} onChange={(e) => setQuote(e.target.value)} rows={2} placeholder="One honest line we could quote…"
              style={{ display: "block", width: "100%", margin: "6px 0 14px", background: T.bg2, border: `1px solid ${T.line}`, borderRadius: 10, color: T.text, padding: "10px 13px", fontSize: 14, lineHeight: 1.5, resize: "vertical", outline: "none" }} />

            <label style={{ display: "flex", gap: 9, alignItems: "flex-start", fontSize: 13, color: T.dim, marginBottom: 14, cursor: "pointer", lineHeight: 1.5 }}>
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginTop: 2, accentColor: T.amber }} />
              You may share my result and quote publicly (with my name &amp; track). You can change this anytime — nothing is shared without this box ticked.
            </label>

            <Btn onClick={submitFeedback} disabled={!rating} icon={Send}>Submit my result</Btn>
          </>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <CircleCheck size={18} color={T.green} />
            <div style={{ fontSize: 14.5 }}><b style={{ color: T.green }}>Thank you.</b> <span style={{ color: T.dim }}>Saved{consent ? " — and you've allowed us to share it. We may reach out for a 30-second story." : " privately. We won't share it."}</span></div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 18, color: T.faint, fontSize: 13 }}>
        <ShieldAlert size={15} color={T.amber} /> Certificate is earned by completing your path and shipping a real capstone — not just watching.
      </div>
    </div>
  );
}
