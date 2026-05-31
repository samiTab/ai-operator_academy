// ──────────────────────────────────────────────────────────────────────────
//  Curriculum loader
//  Parses the authored 8-beat lessons in /curriculum/**/*.md (the Phase 1
//  content) into structured lesson objects the lesson player renders.
//
//  Each authored lesson follows the lesson-author 8-beat structure:
//    # Title
//    <!-- frontmatter comment: module_id, depth, difficulty, sandbox … -->
//    ## 1. Hook   ## 2. Concept   ## 3. Demo   ## 4. Do it
//    ## 5. Check  ## 6. Apply     ## 7. Retain ## 8. ROI beat
//    ### Keepable asset · ### Common mistakes · ### Honest limit
//    ```json  (grading_rubric)  ```
//
//  Loaded at build time via Vite's import.meta.glob (raw), parsed once.
// ──────────────────────────────────────────────────────────────────────────

// Defensible "minutes saved per use" per module — feeds the ROI tally/certificate.
const ROI_MIN = {
  F1: 20, F2: 60, F3: 30,
  A1: 45, A2: 60, A3: 90, A4: 30,
  B1: 20, B2: 30, B3: 45, B4: 60,
  C1: 10, C2: 60, C3: 60, C4: 90,
  D1: 45, D2: 60, D3: 60, D4: 30,
  CAP: 120,
};

// Realistic "active minutes to complete this lesson" (read the beats + do the
// hands-on exercise once). Distinct from ROI_MIN (time the asset saves later).
// Sums across a path drive the "minutes/day" pacing shown on the path screen.
export const TIME_MIN = {
  F1: 15, F2: 15, F3: 20,
  A1: 18, A2: 20, A3: 20, A4: 15,
  B1: 20, B2: 25, B3: 20, B4: 20,
  C1: 15, C2: 20, C3: 20, C4: 25,
  D1: 18, D2: 20, D3: 18, D4: 15,
  CAP: 40,
};
export function timeToComplete(moduleId) {
  return TIME_MIN[moduleId] != null ? TIME_MIN[moduleId] : 18;
}

function parseFrontmatter(raw) {
  const fm = {};
  const m = raw.match(/<!--([\s\S]*?)-->/);
  if (m) {
    for (const line of m[1].split("\n")) {
      const i = line.indexOf(":");
      if (i > 0) fm[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    }
  }
  return fm;
}

// Split markdown body into heading-delimited sections (level 2 = beats, level 3 = extras).
// Fence-aware: lines inside ``` code blocks are never treated as headings (the authored
// keepable-asset blocks legitimately contain lines like "## [Task name]").
function splitSections(body) {
  const lines = body.split("\n");
  const out = [];
  let cur = null;
  let inFence = false;
  for (const line of lines) {
    if (/^```/.test(line.trim())) inFence = !inFence;
    const h2 = !inFence && line.match(/^##\s+(.+?)\s*$/);
    const h3 = !inFence && line.match(/^###\s+(.+?)\s*$/);
    if (h2) { cur = { level: 2, title: h2[1], lines: [] }; out.push(cur); }
    else if (h3) { cur = { level: 3, title: h3[1], lines: [] }; out.push(cur); }
    else if (cur) cur.lines.push(line);
  }
  return out.map((s) => ({ ...s, md: s.lines.join("\n").trim() }));
}

function firstCodeBlock(md) {
  const m = md.match(/```(?:[a-z]*)\n([\s\S]*?)```/i);
  return m ? m[1].replace(/\s+$/, "") : "";
}

function parseQuiz(md) {
  // "**Quick check:** <question> *(<answer>)* — <nudge>"
  if (!md) return null;
  const q = md.match(/\*\*Quick check:\*\*\s*([\s\S]*?)\s*\*\(([\s\S]*?)\)\*/);
  if (!q) return null;
  return { q: q[1].replace(/\s+/g, " ").trim(), a: q[2].replace(/\s+/g, " ").trim() };
}

function parseLesson(raw) {
  const fm = parseFrontmatter(raw);
  const titleM = raw.match(/^#\s+(.+?)\s*$/m);
  const title = titleM ? titleM[1].trim() : (fm.module_title || fm.module_id || "Lesson");

  let rubric = null;
  const rj = raw.match(/```json\s*([\s\S]*?)```/);
  if (rj) { try { rubric = JSON.parse(rj[1]); } catch (e) { rubric = null; } }

  // Strip the grading-rubric ```json block before sectioning, so it doesn't get
  // appended to the last prose section (e.g. "Honest limit" / "Go deeper").
  const body = raw.replace(/```json\s*[\s\S]*?```/g, "").trimEnd();
  const sections = splitSections(body);
  const beats = {};
  let assetMd = "", mistakesMd = "", limitMd = "", caseStudyMd = "", sourcesMd = "";
  let principleMd = "", ruleMd = "", proMoveMd = "";
  for (const s of sections) {
    if (s.level === 2) {
      const n = s.title.match(/^(\d+)\./);
      if (n) beats[n[1]] = { title: s.title.replace(/^\d+\.\s*/, ""), md: s.md };
    } else {
      const t = s.title.toLowerCase();
      if (t.includes("keepable asset")) assetMd = s.md;
      else if (t.includes("common mistakes")) mistakesMd = s.md;
      else if (t.includes("honest limit")) limitMd = s.md;
      else if (t.includes("case study") || t.includes("from the field")) caseStudyMd = s.md;
      else if (t.includes("go deeper") || t.includes("sources")) sourcesMd = s.md;
      else if (t.includes("principle")) principleMd = s.md;
      else if (t.includes("rule of thumb") || t.includes("decision rule")) ruleMd = s.md;
      else if (t.includes("pro move") || t.includes("level up")) proMoveMd = s.md;
    }
  }

  const id = (fm.module_id || "").trim();
  return {
    id,
    title,
    sandbox: String(fm.sandbox || "").toLowerCase() !== "false",
    hookMd: beats["1"] ? beats["1"].md : "",
    conceptMd: beats["2"] ? beats["2"].md : "",
    demoTitle: beats["3"] ? beats["3"].title : "Walkthrough",
    demoMd: beats["3"] ? beats["3"].md : "",
    taskTitle: beats["4"] ? beats["4"].title : "Do it",
    taskMd: beats["4"] ? beats["4"].md : "",
    checkMd: beats["5"] ? beats["5"].md : "",
    applyMd: beats["6"] ? beats["6"].md : "",
    quiz: parseQuiz(beats["7"] ? beats["7"].md : "") || { q: "What's the operator's habit after any AI output?", a: "Verify it before relying on it." },
    roiMd: beats["8"] ? beats["8"].md : "",
    assetMd,
    assetCode: firstCodeBlock(assetMd),
    mistakesMd,
    limitMd,
    caseStudyMd,
    sourcesMd,
    principleMd,
    ruleMd,
    proMoveMd,
    roiMin: ROI_MIN[id] != null ? ROI_MIN[id] : 25,
    rubric,
    unlocksCertificate: !!(rubric && rubric.unlocks_certificate),
  };
}

// Eager-load every authored lesson markdown as a raw string.
const files = import.meta.glob("../curriculum/**/*.md", { query: "?raw", import: "default", eager: true });

export const CURRICULUM = {};
for (const [path, raw] of Object.entries(files)) {
  if (/README\.md$/i.test(path)) continue;
  const lesson = parseLesson(raw);
  // Fall back to filename (e.g. A2.md) if frontmatter module_id is missing.
  const fileId = path.split("/").pop().replace(/\.md$/, "");
  const id = lesson.id || fileId;
  CURRICULUM[id] = { ...lesson, id };
}

export function getAuthoredLesson(moduleId) {
  return CURRICULUM[moduleId] || null;
}
