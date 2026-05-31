# Deploy checklist — what production needs to actually work

The app degrades quietly when config is missing: the UI still loads, but practice,
grading, and cross-device sync silently fall back or fail. This is the audit's #1
production risk — verify all four before calling the deployed site "working."

## Cloudflare Worker — required config

| Name | Where to set | Used by | If missing… |
|---|---|---|---|
| `VITE_CLERK_PUBLISHABLE_KEY` | **Build environment variables** (baked at `vite build`) | Clerk auth (frontend) | white page / error page (already handled gracefully) |
| `LLM_API_KEY` | **Worker Variables & Secrets** (runtime) | `/api/llm` → Groq (sandbox + grader) | sandbox "Run" errors; grader falls back to the heuristic grader (lessons still passable) |
| `DATABASE_URL` | **Worker Variables & Secrets** (runtime) | `/api/learner` → Neon (Workshop + progress sync) | no cross-device sync; localStorage still works single-device |
| `ALLOWED_ORIGIN` | `wrangler.toml` `[vars]` (set ✓) | CORS on both API routes | requests from the deployed origin rejected |

> `VITE_*` vars are **build-time** (compiled into the bundle) — they must be set as
> *Build* environment variables, not runtime Worker secrets. `LLM_API_KEY` and
> `DATABASE_URL` are **runtime** secrets — set them under the Worker's
> Variables & Secrets, not the build vars.

## Neon — schema assumption

`/api/learner` stores the whole learner state as a JSON blob:

```sql
CREATE TABLE IF NOT EXISTS learners (
  clerk_user_id text PRIMARY KEY,
  email         text,
  state         jsonb,          -- MUST be jsonb (not text) — see note below
  updated_at    timestamptz
);
```

The `state` column must be **`jsonb`**. The PUT writes `JSON.stringify(state)` and the
GET returns the column directly; with `jsonb`, Neon returns a parsed object the client
can read. If the column were `text`, the GET would return a JSON *string*, the client's
`remote.plan` check would be `undefined`, and **remote hydration would silently no-op**
(localStorage would still work, masking the problem). Confirm the column type.

## Quick smoke test (deployed site, logged in)

1. Enroll → confirm a personalized path renders (if the personalizer LLM is down, the
   fallback path should still appear — verify it does).
2. Open a lesson → "Practice here" → Run → confirm a model reply (tests `LLM_API_KEY`).
3. Submit for feedback → confirm a graded response (LLM grader or heuristic fallback).
4. Pass a lesson → confirm it's added to the Workshop; reload the page → confirm the
   Workshop piece persists (tests `DATABASE_URL` round-trip).
5. Open a completed lesson from the dashboard → confirm the "completed" banner + saved
   work appear (the revisit fix).
6. Complete the path + capstone → confirm the certificate issues and echoes the Q8 goal.

## Known non-blocking notes

- `functions/api/*.js` (Pages-Function format) are **inert** — production routes through
  `worker.js`. Safe to ignore or delete; the stale comment in `vite.config.js` referring
  to "Pages Functions" is cosmetic.
- Re-passing an already-completed lesson increments the streak again (minor).
- The certificate's `verify.aioperator.academy` URL is decorative — a real verification
  lookup is a future item (Tier 2).
