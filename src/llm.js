// ──────────────────────────────────────────────────────────────────────────
//  Provider-agnostic LLM client (OpenAI-compatible).
//  Talks to /api/llm (the Vite dev proxy → configured provider, default Groq).
//  - Per-task model IDs from VITE_LLM_MODEL_* (override in .env).
//  - Bounded retry with exponential backoff on 429 / 5xx (free tiers rate-limit).
//  - Optional bring-your-own key (sandbox) via the apiKey arg → x-llm-key header.
// ──────────────────────────────────────────────────────────────────────────

const env = (typeof import.meta !== "undefined" && import.meta.env) || {};
export const MODELS = {
  personalizer: env.VITE_LLM_MODEL_PERSONALIZER || "openai/gpt-oss-120b",
  grader: env.VITE_LLM_MODEL_GRADER || "openai/gpt-oss-120b",
  sandbox: env.VITE_LLM_MODEL_SANDBOX || "llama-3.3-70b-versatile",
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * One chat completion. Returns the assistant text.
 * @param {object} o
 * @param {string} [o.system] system prompt
 * @param {string} [o.user] user prompt (ignored if `messages` given)
 * @param {Array}  [o.messages] full OpenAI-style messages
 * @param {("personalizer"|"grader"|"sandbox")} [o.task] selects the model
 * @param {boolean}[o.json] request JSON object output
 * @param {number} [o.maxTokens]
 * @param {number} [o.temperature]
 * @param {string} [o.apiKey] learner's own key (sandbox BYO) → x-llm-key
 * @param {AbortSignal} [o.signal]
 */
export async function chat({ system, user, messages, task = "sandbox", json = false, maxTokens = 1024, temperature, apiKey, signal } = {}) {
  const model = MODELS[task] || MODELS.sandbox;
  const msgs = messages || [
    ...(system ? [{ role: "system", content: system }] : []),
    { role: "user", content: user || "" },
  ];
  const body = {
    model,
    messages: msgs,
    max_tokens: maxTokens,
    temperature: temperature != null ? temperature : json ? 0.2 : 0.6,
  };
  if (json) body.response_format = { type: "json_object" };

  const headers = { "Content-Type": "application/json" };
  if (apiKey) headers["x-llm-key"] = apiKey;

  let lastErr;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch("/api/llm", { method: "POST", headers, body: JSON.stringify(body), signal });
      if (res.status === 429 || res.status >= 500) {
        lastErr = new Error(`provider busy (${res.status})`);
        await sleep(600 * 2 ** attempt + Math.floor(performance.now() % 250));
        continue;
      }
      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        throw new Error(`LLM error ${res.status} ${detail.slice(0, 200)}`);
      }
      const data = await res.json();
      return data?.choices?.[0]?.message?.content ?? "";
    } catch (e) {
      lastErr = e;
      if (signal && signal.aborted) throw e;
      await sleep(400 * 2 ** attempt);
    }
  }
  throw lastErr || new Error("LLM unavailable");
}

// Tolerant JSON extraction (handles ```json fences and surrounding prose).
export function parseJsonLoose(text) {
  const clean = String(text).replace(/```json|```/g, "").trim();
  const s = clean.indexOf("{"), e = clean.lastIndexOf("}");
  if (s < 0 || e < 0) throw new Error("no JSON object found");
  return JSON.parse(clean.slice(s, e + 1));
}

/**
 * Chat that must return JSON matching a shape — validates and retries once with a
 * corrective nudge before giving up (belt-and-suspenders even with provider JSON mode).
 * @param {object} o chat() options
 * @param {(obj:any)=>boolean} [o.validate] returns true if the parsed object is acceptable
 */
export async function chatJson({ validate, ...opts }) {
  let last;
  for (let i = 0; i < 2; i++) {
    const text = await chat({ ...opts, json: true });
    try {
      const obj = parseJsonLoose(text);
      if (!validate || validate(obj)) return obj;
      last = new Error("schema validation failed");
    } catch (e) { last = e; }
    // corrective retry
    opts = {
      ...opts,
      user: (opts.user || "") + "\n\nIMPORTANT: Return ONLY a single valid JSON object, no prose, matching the requested shape exactly.",
    };
  }
  throw last || new Error("could not get valid JSON");
}
