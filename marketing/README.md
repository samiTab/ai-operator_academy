# Marketing Suite — Phase 3

Launch and growth assets for AI Operator Academy, generated via the
[`marketing-generator`](../skills/marketing-generator/SKILL.md) skill and following its
honesty rules and brand voice.

## Contents
| Asset | File | Use |
|-------|------|-----|
| Landing page | [landing-page.md](landing-page.md) | Full 12-section page copy + `<title>`/meta + CTA labels |
| Social calendar | [social-content-calendar.md](social-content-calendar.md) | 2-week multi-platform plan (LinkedIn primary), ~80% value / 20% pitch |
| Image briefs | [image-briefs.md](image-briefs.md) | 8 briefs + ready-to-use generation prompts (IMG-01…08) |
| Video scripts | [video-scripts.md](video-scripts.md) | Hero explainer, 30s reel, testimonial format — with shot lists |

Cross-references are wired: social posts point to `IMG-0x` briefs and `SCRIPT-0x` videos; videos and images point to real app screens to capture as `[SCREENSHOT: …]`.

## The non-negotiable honesty rules (baked into every asset)
- Only claims the course actually delivers: adaptive path · hands-on practice · a shipped capstone asset · ROI tracking · a **verifiable, non-academic** certificate.
- Transparent pricing — **no** hidden subscriptions, fake urgency, or inflated promises.
- The certificate shows *practical capability*, not accreditation — and says so.
- Claude / Claude Code referenced **descriptively**; no implied Anthropic endorsement.
- **No fabricated** testimonials, learner counts, or results. Every such spot is a clearly-marked `[BRACKETED_PLACEHOLDER]` for a human to fill with verified data.

## The funnel insight
The most persuasive asset this product can have is a real learner saying *"I built X and it saves me Y hours a week."* The platform already captures this at the capstone (it measures ROI and issues a verifiable certificate). **Feed those real quotes/metrics back into the `[REAL_LEARNER_QUOTE]` / `[METRIC]` slots** across the landing page, social calendar, and testimonial video — that's what converts. Until verified ones exist, the placeholders stay placeholders.

## Where this plugs into the product
- Hero CTA `Design my course` → the app's enrollment flow ([src/AIOperatorAcademy.jsx](../src/AIOperatorAcademy.jsx)).
- `View a sample path` → the worked example in [samples/sample-personalized-curriculum.md](../samples/sample-personalized-curriculum.md).
- Screenshot shot-lists map to real screens: enrollment quiz, personalized path reveal, a lesson's Do-it beat + sandbox, grader feedback, dashboard ROI, and the certificate.
