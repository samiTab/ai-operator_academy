# Pricing Model — what to charge to cover AI, hosting & marketing

> Goal: a price that comfortably covers **AI API usage**, **server/hosting**, and
> **marketing**, with healthy margin — and stays transparent (no hidden-subscription trap,
> per the blueprint).
>
> **Numbers marked `~` are modeled estimates with stated assumptions; provider prices marked
> `[verify]` change often — confirm against live pricing pages.** Plug your real CAC and
> provider rates into the bracketed slots.

---

## TL;DR

- **The headline finding:** AI API + server are **not** your cost driver. Because the course
  *content is static* (no API to teach), the only AI calls are the personalizer, the grader,
  and the optional sandbox — together **~$0.02–$0.50 per learner**. Hosting amortizes to
  **~$0.10–$0.50 per learner**. **Marketing (customer acquisition) is 95%+ of your real
  per-sale cost.** So the price is set by *acquisition + value*, not infrastructure.
- **Recommended price (self-serve Core, one-time): `$149`** (launch intro `$99`). It covers a
  customer-acquisition cost (CAC) up to ~$60 with ~40–65% net margin.
- **Pro / Cohort: `$499`.** **Team/Enterprise: from `~$1,500`.**
- **Minimum break-even** (delivery + CAC only): see the table — e.g. **~$35** at a $30 CAC.
  Price well above break-even to fund growth and absorb refunds.

---

## 1. Cost to deliver one learner (excluding marketing)

### a) AI API usage
Per-learner platform LLM calls (content is static, so it costs nothing to teach):

| Call | Volume / learner | ~Tokens |
|------|------------------|---------|
| Personalizer (1 path, JSON) | 1 call | ~4k |
| Grader (per submission) | ~14 calls (≈10 lessons × ~1.4 attempts) | ~20k |
| Sandbox (optional) | mostly **0** — default is "use your own Claude" or learner's own key | ~10k (blended; many are 0) |
| Adaptive overlay | static templating → **0** (LLM enrichment is off by default) | 0 |
| **Total** | | **~35k → budget 50k** |

Cost of ~50k tokens/learner by provider:

| Provider / model | ~Blended rate `[verify]` | ~Cost / learner |
|------------------|--------------------------|-----------------|
| **Groq free tier** (default) | $0 (rate-limited; dev/MVP only) | **$0.00** |
| **Groq paid** `gpt-oss-120b` | ~$0.15 in / ~$0.60 out per M | **~$0.02** |
| **Gemini 2.5 Flash** (paid) | ~$0.10 in / ~$0.40 out per M | **~$0.02** |
| **Claude Sonnet** (premium) | ~$3 in / ~$15 out per M | **~$0.33** |

➡️ **Budget $0.50/learner** for AI as a safe worst-case (premium model + retries). On the
default Groq it's effectively free.

### b) Hosting / infrastructure (fixed, amortized)
Production needs: a static host, a small serverless route for the LLM proxy, and a real DB
(move the cert/feedback registries off `localStorage`).

| Item | ~Cost |
|------|-------|
| Static hosting (Vercel/Netlify/Cloudflare Pages) | $0 free tier → ~$20/mo Pro |
| Serverless LLM proxy invocations (~26/learner) | negligible (≪ $0.01/learner) |
| Managed DB (Neon/Supabase) | $0 free tier → ~$20/mo |
| Domain + transactional email + misc | ~$15/mo |
| **Fixed total** | **~$0 (free tiers) → ~$55/mo at modest scale** |

Amortized: at 100 sales/mo → **~$0.55/learner**; at 500/mo → **~$0.11**. Budget **$0.50/learner**.

### c) Transaction & refund costs (scale with price P)
- **Payment processing (Stripe):** `2.9% × P + $0.30`.
- **Refund reserve (ROI guarantee):** assume **8%** refund rate → `0.08 × P`. `[set from real data]`

### Per-learner variable cost (Core, self-serve), excluding marketing
```
cost(P) ≈ $0.50 (AI) + $0.50 (infra) + $0.30 + 0.029·P (Stripe) + 0.08·P (refunds)
        ≈ $1.30 + 0.109·P
```
At **P = $149** → cost ≈ **$17.5**, i.e. ~88% gross margin *before* marketing.

---

## 2. Marketing is the real cost — CAC scenarios

Customer Acquisition Cost dwarfs everything above. Typical ranges for a prosumer/SMB course:

| Channel mix | ~CAC `[measure yours]` |
|-------------|------------------------|
| Organic / content / referral-led | **$15–35** |
| Mixed (some paid) | **$40–60** |
| Paid-ads-heavy, cold traffic | **$70–120** |

> Your built-in advantage: the capstone produces **real, quotable ROI testimonials**
> (captured in-app). That lowers CAC over time — proof converts far better than ad spend.

---

## 3. Break-even & margin

Break-even price for a target CAC (nets $0 after delivery + CAC):
```
P_breakeven = ($1.30 + $0.30 + CAC) / (1 − 0.029 − 0.08)  = ($1.60 + CAC) / 0.891
```

| CAC | Break-even price | Net margin @ **$149** |
|-----|------------------|------------------------|
| $30 | **~$35** | $149 − $17.5 − $30 = **$101.5 (68%)** |
| $60 | **~$69** | $149 − $17.5 − $60 = **$71.5 (48%)** |
| $100 | **~$114** | $149 − $17.5 − $100 = **$31.5 (21%)** |

➡️ At **$149**, you stay solidly profitable up to ~$60 CAC and survive up to ~$100. If your
CAC runs hot (paid-heavy), either push price toward $199 or shift to organic/referral.

**Fixed-cost coverage:** ~$55/mo fixed ÷ ~$100 net contribution ≈ **<1 sale/month** covers all
infrastructure. The business is gated by acquisition and volume — *not* by API or servers.

---

## 4. Recommended pricing (transparent, one-time)

| Tier | Price | Includes | Margin logic |
|------|-------|----------|--------------|
| **Core** (self-serve) | **$149** (intro **$99**) | Full adaptive path · live/own-Claude practice · capstone · ROI tracking · verifiable certificate · keepable prompt/Skills library | ~88% gross; ~48–68% net at $30–60 CAC |
| **Pro / Cohort** | **$499** | Core + live office hours + reviewed capstone + "living curriculum" updates | Human time ~$50–100/learner → still ~75–85% net; the profit center, absorbs higher CAC |
| **Team / Enterprise** | **from ~$1,500** (5 seats) | Per-seat + admin dashboard + custom industry case studies + rollout support | Priced on value/seats; highest LTV |

**Guarantee:** "ship one automation that saves you 2+ hrs/week or your money back" — credible
because the capstone is built in; cost already reserved at 8%.

**Optional** transparent monthly for ongoing living-curriculum access (e.g. `$19/mo`,
clearly cancelable) — only if you want recurring revenue; never a hidden auto-charge.

---

## 5. Sensitivity & honest caveats
- **Free vs. paid AI:** the default **Groq free tier is dev/MVP only** (rate limits, not
  production). Before launch, enable provider billing (~$10 unlocks ~10× on Groq) — it barely
  moves per-learner cost (~$0.02) but removes 429s. Keep `gpt-oss`/Flash for the JSON tasks;
  reserve premium Claude only if quality testing demands it (still only ~$0.33/learner).
- **Data privacy → cost:** for real learner data, use a provider/tier that doesn't train on
  it (Groq's default policy, or **billed** Gemini — *not* free Gemini). A paid data agreement
  may be required for regulated data; budget for it if relevant.
- **CAC is the number to instrument.** Everything here is robust to API/hosting swings;
  it is *not* robust to a $120 CAC on a $99 price. Measure CAC per channel from day one.
- **Localize to your market.** $149 suits US/EU buyers. For lower-purchasing-power markets,
  set a regional price (PPP-adjusted) or a regional tier — the delivery cost is the same tiny
  amount everywhere, so you have full freedom to price for the market.
- **Replace assumptions with reals:** refund rate, CAC, provider rates, and conversion are the
  inputs that matter — the `[bracketed]` slots. Re-run the break-even table once you have beta
  data (see `docs/phase-4-launch-playbook.md`).

---

## 6. One-line answer
**Charge ~$149 one-time for Core** (intro $99), $499 Pro/Cohort, ~$1,500+ Team. Your AI +
server cost is **~$1–2 per learner** — trivial; the price exists to cover **marketing/CAC and
the real value delivered** (a shipped asset + measured ROI + certificate), not infrastructure.
