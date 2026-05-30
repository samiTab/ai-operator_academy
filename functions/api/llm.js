// Cloudflare Pages Function — production LLM proxy.
// Replaces the Vite dev-proxy (/api/llm) for production deployments.
// Deploy: push to GitHub → Cloudflare Pages auto-deploys.
//
// Set these in Cloudflare Pages → Settings → Environment variables (encrypted):
//   LLM_BASE_URL   e.g. https://api.groq.com/openai/v1
//   LLM_API_KEY    your Groq/Gemini/etc. key  ← never in client bundle
//   ALLOWED_ORIGIN your site domain, e.g. https://aioperator.academy
//
// The optional `x-llm-key` header lets a learner use their own key (sandbox BYO).

export async function onRequestPost(ctx) {
  const { request, env } = ctx;

  // CORS — only allow your own origin.
  const origin = request.headers.get("origin") || "";
  const allowed = env.ALLOWED_ORIGIN || "http://localhost:5173";
  if (origin && origin !== allowed) {
    return new Response("Forbidden", { status: 403 });
  }

  const base = (env.LLM_BASE_URL || "https://api.groq.com/openai/v1").replace(/\/$/, "");
  const byo  = request.headers.get("x-llm-key");
  const key  = byo || env.LLM_API_KEY;
  if (!key) return new Response("No API key configured", { status: 500 });

  // Forward the request body straight to the provider.
  const body = await request.text();
  const upstream = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${key}`,
    },
    body,
  });

  // Stream the response back (important for sandbox chat).
  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("Content-Type") || "application/json",
      "Access-Control-Allow-Origin": allowed,
    },
  });
}

// Handle CORS preflight.
export async function onRequestOptions({ env }) {
  const allowed = env.ALLOWED_ORIGIN || "http://localhost:5173";
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": allowed,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-llm-key",
    },
  });
}
