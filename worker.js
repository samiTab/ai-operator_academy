import { neon } from "@neondatabase/serverless"

async function verifyClerkJWT(token) {
  const parts = token.split(".")
  if (parts.length !== 3) throw new Error("Malformed JWT")
  const [headerB64, payloadB64, signatureB64] = parts

  const decode = (s) => JSON.parse(atob(s.replace(/-/g, "+").replace(/_/g, "/")))
  const header = decode(headerB64)
  const payload = decode(payloadB64)

  if (!payload.iss) throw new Error("Missing iss claim")
  if (Date.now() > payload.exp * 1000) throw new Error("Token expired")

  const jwksResp = await fetch(`${payload.iss}/.well-known/jwks.json`)
  if (!jwksResp.ok) throw new Error("JWKS fetch failed")
  const { keys } = await jwksResp.json()
  const jwk = keys.find((k) => k.kid === header.kid)
  if (!jwk) throw new Error("No matching key in JWKS")

  const key = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"]
  )
  const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`)
  const sig = Uint8Array.from(
    atob(signatureB64.replace(/-/g, "+").replace(/_/g, "/")),
    (c) => c.charCodeAt(0)
  )
  const valid = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, sig, data)
  if (!valid) throw new Error("Invalid signature")

  return payload
}

function corsHeaders(allowed, methods = "GET, PUT, DELETE, OPTIONS") {
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": methods,
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-llm-key",
  }
}

async function handleLlm(request, env) {
  const allowed = env.ALLOWED_ORIGIN || "http://localhost:5173"

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(allowed, "POST, OPTIONS"),
    })
  }

  const origin = request.headers.get("origin") || ""
  if (origin && origin !== allowed) return new Response("Forbidden", { status: 403 })
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 })

  const base = (env.LLM_BASE_URL || "https://api.groq.com/openai/v1").replace(/\/$/, "")
  const byo = request.headers.get("x-llm-key")
  const key = byo || env.LLM_API_KEY
  if (!key) return new Response("No API key configured", { status: 500 })

  const upstream = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${key}`,
    },
    body: await request.text(),
  })

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("Content-Type") || "application/json",
      "Access-Control-Allow-Origin": allowed,
    },
  })
}

async function handleLearner(request, env) {
  const allowed = env.ALLOWED_ORIGIN || "http://localhost:5173"

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(allowed) })
  }

  const origin = request.headers.get("origin") || ""
  if (origin && origin !== allowed) return new Response("Forbidden", { status: 403 })

  const token = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "")
  if (!token) return new Response("Unauthorized", { status: 401, headers: corsHeaders(allowed) })

  let claims
  try {
    claims = await verifyClerkJWT(token)
  } catch (e) {
    return new Response(`Unauthorized: ${e.message}`, { status: 401, headers: corsHeaders(allowed) })
  }

  const userId = claims.sub
  const email = claims.email || ""
  const sql = neon(env.DATABASE_URL)

  try {
    if (request.method === "GET") {
      const rows = await sql`SELECT state FROM learners WHERE clerk_user_id = ${userId}`
      return Response.json(rows[0]?.state ?? null, { headers: corsHeaders(allowed) })
    }
    if (request.method === "PUT") {
      const state = await request.json()
      await sql`
        INSERT INTO learners (clerk_user_id, email, state, updated_at)
        VALUES (${userId}, ${email}, ${JSON.stringify(state)}, NOW())
        ON CONFLICT (clerk_user_id) DO UPDATE
        SET state = ${JSON.stringify(state)}, email = ${email}, updated_at = NOW()
      `
      return Response.json({ ok: true }, { headers: corsHeaders(allowed) })
    }
    if (request.method === "DELETE") {
      await sql`DELETE FROM learners WHERE clerk_user_id = ${userId}`
      return Response.json({ ok: true }, { headers: corsHeaders(allowed) })
    }
    return new Response("Method not allowed", { status: 405, headers: corsHeaders(allowed) })
  } catch (e) {
    console.error("[learner]", e)
    return new Response("Internal error", { status: 500, headers: corsHeaders(allowed) })
  }
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url)

    if (pathname === "/api/llm" || pathname.startsWith("/api/llm/")) {
      return handleLlm(request, env)
    }
    if (pathname === "/api/learner" || pathname.startsWith("/api/learner/")) {
      return handleLearner(request, env)
    }

    try {
      const res = await env.ASSETS.fetch(request)
      if (res.status === 404) {
        // SPA fallback — serve index.html for any unknown path
        return env.ASSETS.fetch(new Request(new URL("/index.html", request.url), request))
      }
      return res
    } catch {
      return env.ASSETS.fetch(new Request(new URL("/index.html", request.url), request))
    }
  },
}
