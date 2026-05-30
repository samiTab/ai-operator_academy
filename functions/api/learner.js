// Cloudflare Pages Function — learner state sync (GET / PUT / DELETE).
// Verifies the Clerk session JWT using Web Crypto API (no extra npm dep),
// then reads/writes the learner's full app state to Neon.
//
// Set in Cloudflare Pages → Settings → Environment variables:
//   DATABASE_URL    Neon connection string (server-only)
//   ALLOWED_ORIGIN  your site domain e.g. https://aioperator.academy

import { neon } from "@neondatabase/serverless";

// Verify a Clerk-issued RS256 JWT using the Web Crypto API.
// Fetches the JWKS from the Clerk issuer URL embedded in the JWT payload.
async function verifyClerkJWT(token) {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Malformed JWT");
  const [headerB64, payloadB64, signatureB64] = parts;

  const decode = (s) =>
    JSON.parse(atob(s.replace(/-/g, "+").replace(/_/g, "/")));
  const header = decode(headerB64);
  const payload = decode(payloadB64);

  if (!payload.iss) throw new Error("Missing iss claim");
  if (Date.now() > payload.exp * 1000) throw new Error("Token expired");

  const jwksResp = await fetch(`${payload.iss}/.well-known/jwks.json`);
  if (!jwksResp.ok) throw new Error("JWKS fetch failed");
  const { keys } = await jwksResp.json();
  const jwk = keys.find((k) => k.kid === header.kid);
  if (!jwk) throw new Error("No matching key in JWKS");

  const key = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"]
  );
  const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
  const sig = Uint8Array.from(
    atob(signatureB64.replace(/-/g, "+").replace(/_/g, "/")),
    (c) => c.charCodeAt(0)
  );
  const valid = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, sig, data);
  if (!valid) throw new Error("Invalid signature");

  return payload; // { sub: userId, email, ... }
}

function cors(allowed) {
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export async function onRequestOptions({ env }) {
  const allowed = env.ALLOWED_ORIGIN || "http://localhost:5173";
  return new Response(null, { status: 204, headers: cors(allowed) });
}

async function handle({ request, env }) {
  const allowed = env.ALLOWED_ORIGIN || "http://localhost:5173";
  const origin = request.headers.get("origin") || "";
  if (origin && origin !== allowed) {
    return new Response("Forbidden", { status: 403 });
  }

  const auth = request.headers.get("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (!token) {
    return new Response("Unauthorized", { status: 401, headers: cors(allowed) });
  }

  let claims;
  try {
    claims = await verifyClerkJWT(token);
  } catch (e) {
    return new Response(`Unauthorized: ${e.message}`, {
      status: 401,
      headers: cors(allowed),
    });
  }

  const userId = claims.sub;
  const email = claims.email || "";
  const sql = neon(env.DATABASE_URL);

  try {
    if (request.method === "GET") {
      const rows =
        await sql`SELECT state FROM learners WHERE clerk_user_id = ${userId}`;
      return Response.json(rows[0]?.state ?? null, { headers: cors(allowed) });
    }

    if (request.method === "PUT") {
      const state = await request.json();
      await sql`
        INSERT INTO learners (clerk_user_id, email, state, updated_at)
        VALUES (${userId}, ${email}, ${JSON.stringify(state)}, NOW())
        ON CONFLICT (clerk_user_id) DO UPDATE
        SET state = ${JSON.stringify(state)}, email = ${email}, updated_at = NOW()
      `;
      return Response.json({ ok: true }, { headers: cors(allowed) });
    }

    if (request.method === "DELETE") {
      await sql`DELETE FROM learners WHERE clerk_user_id = ${userId}`;
      return Response.json({ ok: true }, { headers: cors(allowed) });
    }

    return new Response("Method not allowed", {
      status: 405,
      headers: cors(allowed),
    });
  } catch (e) {
    console.error("[learner]", e);
    return new Response("Internal error", {
      status: 500,
      headers: cors(allowed),
    });
  }
}

export const onRequestGet = handle;
export const onRequestPut = handle;
export const onRequestDelete = handle;
