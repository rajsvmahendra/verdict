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