# Verdict — Build & Debug Log

_This log is updated whenever a debugging session occurs per Rule 8._

_(No issues encountered yet.)_

## 2026-06-20 — LangGraph v1.x typed node registration issue

**Problem:** TypeScript rejected `graph.addEdge(START, "resolver")` with:
`Argument of type '"resolver"' is not assignable to parameter of type '"__start__" | "__end__"'`.

**Diagnosis:** In `@langchain/langgraph@1.4.4`, `addNode()` returns a more specifically typed graph. Calling `addNode()` without preserving the returned type left the graph typed as if it only knew about `START` and `END`.

**Fix:** Rewrote the graph builder using chained `addNode()` / `addEdge()` calls so TypeScript can infer all registered node names before edge wiring.

## 2026-06-21 — Gemini model name mismatch

**Problem:** `gemini-1.5-flash` returned HTTP 404 — model not found.

**Diagnosis:** Listed available models via the REST API. The key does not have
access to the 1.5 generation. Available `generateContent` models start at 2.0+.

**Fix:** Updated MODELS in `lib/gemini/client.ts`:
- fast: `gemini-2.5-flash`
- capable: `gemini-2.5-pro`

## 2026-06-21 — Free tier quota exhaustion on gemini-2.5-flash

**Problem:** Stripe request returned 429 — daily quota of 20 requests/day exhausted.

**Diagnosis:** Each full graph run makes 4-5 Gemini calls. Free tier limit is 20/day
per model. Running multiple test cases in one session hits this quickly.

**Fix:** Added `getStructuredModelWithFallback()` to lib/gemini/client.ts.
Tries gemini-2.5-flash first, automatically falls back to gemini-2.0-flash on 429.
All four agents updated to use the fallback helper instead of direct model calls.