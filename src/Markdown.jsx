// ──────────────────────────────────────────────────────────────────────────
//  Minimal, safe Markdown renderer (builds React nodes — no innerHTML).
//  Handles the subset the authored lessons use: paragraphs, **bold**,
//  `inline code`, ```fenced code```, ordered/unordered lists, > blockquotes,
//  and ![demo](screenshot: …) placeholders (rendered as a labelled chip).
// ──────────────────────────────────────────────────────────────────────────
import React from "react";

const SHOT = /!\[[^\]]*\]\(screenshot:\s*([^)]*)\)/gi;

// Inline: **bold**, `code`, and screenshot chips.
function inline(text, T, mono, keyBase) {
  const nodes = [];
  let rest = text;
  let k = 0;
  // tokenizer over **bold**, *italic*, `code`, screenshot, and [text](url) links
  const re = /(\*\*([^*]+)\*\*)|(`([^`]+)`)|(!\[[^\]]*\]\(screenshot:\s*([^)]*)\))|(\[([^\]]+)\]\((https?:\/\/[^)]+)\))|(\*([^*\n]+)\*)/g;
  let last = 0;
  let m;
  while ((m = re.exec(rest)) !== null) {
    if (m.index > last) nodes.push(rest.slice(last, m.index));
    if (m[2] != null) {
      nodes.push(<strong key={`${keyBase}-b${k++}`} style={{ color: T.text, fontWeight: 600 }}>{m[2]}</strong>);
    } else if (m[4] != null) {
      nodes.push(<code key={`${keyBase}-c${k++}`} style={{ fontFamily: mono, fontSize: "0.86em", background: T.surfaceHi, color: T.amberHi, padding: "1px 5px", borderRadius: 5 }}>{m[4]}</code>);
    } else if (m[6] != null) {
      nodes.push(
        <span key={`${keyBase}-s${k++}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: mono, fontSize: 11, color: T.faint, border: `1px dashed ${T.line}`, borderRadius: 6, padding: "2px 8px", margin: "2px 0", background: T.bg2 }}>
          ▦ {m[6].trim()}
        </span>
      );
    } else if (m[8] != null) {
      nodes.push(
        <a key={`${keyBase}-l${k++}`} href={m[9]} target="_blank" rel="noopener noreferrer"
          style={{ color: T.amberHi, textDecoration: "underline", textUnderlineOffset: 2, textDecorationColor: `${T.amber}66` }}>{m[8]}</a>
      );
    } else if (m[11] != null) {
      nodes.push(<em key={`${keyBase}-i${k++}`} style={{ fontStyle: "italic", color: T.dim }}>{m[11]}</em>);
    }
    last = re.lastIndex;
  }
  if (last < rest.length) nodes.push(rest.slice(last));
  return nodes;
}

export default function Markdown({ md, T, mono, style }) {
  if (!md) return null;
  const lines = md.split("\n");
  const blocks = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // fenced code block
    if (/^```/.test(line.trim())) {
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i].trim())) { buf.push(lines[i]); i++; }
      i++; // closing fence
      blocks.push(
        <pre key={`k${key++}`} style={{ fontFamily: mono, fontSize: 12.5, lineHeight: 1.55, background: "#0F0D0A", border: `1px solid ${T.line}`, borderRadius: 10, padding: "13px 15px", overflowX: "auto", color: T.dim, whiteSpace: "pre-wrap", margin: "10px 0" }}>
          {buf.join("\n")}
        </pre>
      );
      continue;
    }

    // blank
    if (line.trim() === "") { i++; continue; }

    // blockquote
    if (/^>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, "")); i++; }
      blocks.push(
        <div key={`k${key++}`} style={{ borderLeft: `3px solid ${T.amber}66`, padding: "6px 14px", margin: "10px 0", color: T.dim, fontSize: 14.5, lineHeight: 1.6, background: `${T.amber}0c`, borderRadius: "0 8px 8px 0" }}>
          {inline(buf.join(" "), T, mono, `q${key}`)}
        </div>
      );
      continue;
    }

    // ordered list
    if (/^\d+\.\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) { items.push(lines[i].replace(/^\d+\.\s/, "")); i++; }
      blocks.push(
        <ol key={`k${key++}`} style={{ margin: "8px 0", paddingLeft: 20, color: T.dim, fontSize: 14.5, lineHeight: 1.7 }}>
          {items.map((it, j) => <li key={j} style={{ marginBottom: 4 }}>{inline(it, T, mono, `ol${key}-${j}`)}</li>)}
        </ol>
      );
      continue;
    }

    // unordered list
    if (/^[-*]\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i])) { items.push(lines[i].replace(/^[-*]\s/, "")); i++; }
      blocks.push(
        <ul key={`k${key++}`} style={{ margin: "8px 0", paddingLeft: 20, color: T.dim, fontSize: 14.5, lineHeight: 1.7 }}>
          {items.map((it, j) => <li key={j} style={{ marginBottom: 4 }}>{inline(it, T, mono, `ul${key}-${j}`)}</li>)}
        </ul>
      );
      continue;
    }

    // paragraph (accumulate until blank / block boundary)
    const buf = [];
    while (i < lines.length && lines[i].trim() !== "" && !/^```/.test(lines[i].trim()) && !/^>\s?/.test(lines[i]) && !/^\d+\.\s/.test(lines[i]) && !/^[-*]\s/.test(lines[i])) {
      buf.push(lines[i]); i++;
    }
    blocks.push(
      <p key={`k${key++}`} style={{ margin: "0 0 10px", color: T.text, fontSize: 15.5, lineHeight: 1.62 }}>
        {inline(buf.join(" "), T, mono, `p${key}`)}
      </p>
    );
  }

  return <div style={style}>{blocks}</div>;
}
