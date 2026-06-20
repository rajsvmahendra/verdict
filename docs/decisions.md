# Verdict — Architecture Decisions Log

## 2025-01-20 — Project Initialization

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