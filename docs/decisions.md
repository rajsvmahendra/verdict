# Verdict — Architecture Decisions Log

## 2026-06-20 — Project Initialization

**Decision:** Initialize Verdict using Next.js (App Router) + TypeScript (strict) + Tailwind CSS.

**Rationale:**
- Next.js App Router provides production-ready routing, API routes, and server components in a single framework.
- TypeScript strict mode enforces the typed state schema required by the architecture — no `any` escapes.
- Tailwind CSS enables a controlled, consistent design system without a component library dependency at this stage.
- Explicit folder scaffolding (`lib/`, `lib/agents/`, `lib/graph/`, `types/`, `docs/`) established up front to prevent ad-hoc growth as agent complexity increases.

**Alternatives considered:**
- `src/` directory layout — rejected for simplicity at MVP scale; can be restructured later if needed.
- Component library (e.g., shadcn/ui) — deferred to Strong scope; Tailwind alone is sufficient for MVP.

**No agent logic implemented in this step.** This commit is foundation only.

## 2026-06-21 — Gemini SDK Integration

**Decision:** Use `@google/generative-ai` SDK with a centralized client wrapper in `lib/gemini/`.

**Rationale:**
- Single source of truth for API key access and model configuration.
- All agents import from `lib/gemini` — no direct SDK usage scattered across the codebase.
- Two model configurations: `getModel` for general use, `getStructuredModel` for reliable JSON output with lower temperature.
- MVP uses `gemini-1.5-flash` for all agents. Routing to `gemini-1.5-pro` for Chair synthesis is deferred to Strong scope.

**Trade-off:** Lower temperature (0.3) on structured model may reduce creativity in edge cases, but dramatically improves JSON parsing reliability.

## 2026-06-21 — Chair Agent verdict banding design

**Decision:** Verdict is determined algorithmically from the banding table BEFORE the LLM generates the narrative synthesis. The LLM explains the verdict but cannot override it.

**Rationale:**
- Ensures the banding table from Section 3 is deterministic and inspectable.
- Prevents the LLM from producing a different verdict than the scoring system warrants.
- The load-bearing rule (low data quality → WATCHLIST, never INVEST) is enforced in code, not in a prompt instruction that the LLM might ignore.
- Confidence calculation is mechanical (calculateConfidence function) and fully derivable from structured state — not an opaque LLM-guessed number.

**Trade-off:** The LLM may sometimes want to argue for a different verdict than the banding produces. We accept this — the banding table is the authority, and the LLM's job is to explain it, not override it.