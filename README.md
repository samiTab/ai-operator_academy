# AI Operator Academy — Local Setup

A Vite + React + Tailwind scaffold for the AI Operator Academy course platform.
This package is pre-wired so you only need to drop in the files you downloaded
from the chat, install, and run.

## Target location

Extract this folder to:

    C:\code\digital-product\ai-operator-academy

(So that `package.json` sits directly inside `...\ai-operator-academy\`.)

## Prerequisites

- Node.js 18+ (check with `node -v`). Get it from https://nodejs.org

## Setup (Windows)

Open PowerShell in the project folder, then either run the helper script:

    ./setup.ps1

…or do it manually:

    npm install
    copy .env.example .env

Then open `.env` and paste your Anthropic API key.

## Run

    npm run dev

Open http://localhost:5173 — you should see a green "Scaffold is working" screen.

## Drop in your files

| Downloaded file                       | Put it here                                  |
|---------------------------------------|----------------------------------------------|
| AIOperatorAcademy.jsx                 | src\AIOperatorAcademy.jsx  (replace placeholder) |
| 00-MASTER-BLUEPRINT.md                | docs\                                        |
| orchestration.md                      | agents\                                      |
| sample-personalized-curriculum.md     | samples\                                     |
| each SKILL.md (six skills)            | skills\<skill-name>\SKILL.md                 |

After replacing `src\AIOperatorAcademy.jsx`, refresh the browser.

## Live AI calls (provider-agnostic, default: Groq free tier)

The app talks to a **provider-agnostic, OpenAI-compatible** LLM layer via the Vite dev
proxy (`/api/llm` → your provider). The default is **Groq's free tier** (fast, and the only
free provider that guarantees strict JSON for the personalizer/grader). Configure it in
`.env`:

```
LLM_BASE_URL=https://api.groq.com/openai/v1     # server-side only, never bundled
LLM_API_KEY=gsk_your_groq_key                   # free key: https://console.groq.com/keys
VITE_LLM_MODEL_PERSONALIZER=openai/gpt-oss-120b
VITE_LLM_MODEL_GRADER=openai/gpt-oss-120b
VITE_LLM_MODEL_SANDBOX=llama-3.3-70b-versatile
```

To use a different provider, just change `LLM_BASE_URL` + `LLM_API_KEY` (Gemini, OpenRouter,
Cerebras, etc. — all OpenAI-compatible). See `.env.example` for examples and caveats.

**The practice sandbox is optional.** Learners can either do each exercise in their **own
Claude** (the prompt is shown copy-ready) or practice in-app — optionally with **their own
API key** so it runs on their quota, not the shared one.

**Free tiers are for dev/MVP only** — expect rate limits (the app retries with backoff).
For production, enable billing on your provider and route calls through your own backend
rather than the dev proxy. See `docs/pricing-model.md` for the cost/price model.

## Build for production

    npm run build      # outputs to dist/
    npm run preview    # preview the production build locally

## force redeploy


