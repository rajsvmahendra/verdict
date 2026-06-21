/**
 * Verdict — Conditional Edge Logic
 *
 * These functions determine graph routing at decision points.
 * They are pure functions — no side effects, no LLM calls.
 * Each returns a string that maps to a node name in the graph.
 */

import type { VerdictGraphState } from "@/types/graph";

// ─── Thresholds (adjust in Strong scope after real-world testing) ─────────────

const SKEPTIC_LOPSIDED_THRESHOLD = 4; // Difference in strength/severity ratings
const SKEPTIC_BORDERLINE_CONFIDENCE_LOW = 0.4;
const SKEPTIC_BORDERLINE_CONFIDENCE_HIGH = 0.7;

// ─── Condition 1: Resolver Clarification Check ────────────────────────────────

/**
 * After Resolver runs, determine if we need user clarification or can proceed.
 *
 * Routes to:
 * - "needsClarification" → Graph pauses, returns to user for input
 * - "resolved" → Proceed to Research Agent
 */
export function routeAfterResolver(
    state: VerdictGraphState
): "needsClarification" | "resolved" {
    if (state.needsClarification === true) {
        return "needsClarification";
    }

    if (!state.resolvedEntity) {
        // Defensive: if no entity and no clarification flag, treat as needing clarification
        return "needsClarification";
    }

    return "resolved";
}

// ─── Condition 2: Skeptic Invocation Check ────────────────────────────────────

/**
 * After Bull and Bear complete, determine if Skeptic should intervene.
 *
 * Skeptic is invoked when:
 * 1. The Bull/Bear ratings are heavily lopsided (one side dominates), OR
 * 2. The preliminary confidence is in a borderline band where extra scrutiny helps
 *
 * Routes to:
 * - "invokeSkeptic" → Run Skeptic Agent before Chair
 * - "skipSkeptic" → Proceed directly to Chair Agent
 */
export function routeAfterDebate(
    state: VerdictGraphState
): "invokeSkeptic" | "skipSkeptic" {
    // Guard: if either case is missing, skip Skeptic (Chair will handle the error)
    if (!state.bullCase || !state.bearCase) {
        return "skipSkeptic";
    }

    const bullStrength = state.bullCase.strengthRating;
    const bearSeverity = state.bearCase.severityRating;

    // Check 1: Lopsided debate — one side is much stronger than the other
    const ratingDifference = Math.abs(bullStrength - bearSeverity);
    const isLopsided = ratingDifference >= SKEPTIC_LOPSIDED_THRESHOLD;

    // Check 2: Borderline preliminary confidence
    // Preliminary confidence = simple average before Chair's full calculation
    const preliminaryConfidence =
        (bullStrength / 10 + (10 - bearSeverity) / 10) / 2;
    const isBorderline =
        preliminaryConfidence >= SKEPTIC_BORDERLINE_CONFIDENCE_LOW &&
        preliminaryConfidence <= SKEPTIC_BORDERLINE_CONFIDENCE_HIGH;

    if (isLopsided || isBorderline) {
        return "invokeSkeptic";
    }

    return "skipSkeptic";
}

// ─── Condition 3: Post-Skeptic Router (simple passthrough) ────────────────────

/**
 * After Skeptic runs (or is skipped), always proceed to Chair.
 * This exists for graph structure clarity — could be a direct edge,
 * but having it as a function makes the routing logic inspectable.
 */
export function routeToChair(_state: VerdictGraphState): "chair" {
    return "chair";
}

// ─── Helper: Determine Skip Reason for Explainability ─────────────────────────

/**
 * When Skeptic is skipped, generate the reason for Section 4a explainability.
 * This is called by the graph assembly, not a routing condition.
 */
export function getSkepticSkipReason(state: VerdictGraphState): string {
    if (!state.bullCase || !state.bearCase) {
        return "Skeptic skipped: Bull or Bear case was not available.";
    }

    const bullStrength = state.bullCase.strengthRating;
    const bearSeverity = state.bearCase.severityRating;
    const ratingDifference = Math.abs(bullStrength - bearSeverity);
    const preliminaryConfidence =
        (bullStrength / 10 + (10 - bearSeverity) / 10) / 2;

    return (
        `Skeptic not invoked: debate was balanced (rating difference: ${ratingDifference.toFixed(1)}, ` +
        `threshold: ${SKEPTIC_LOPSIDED_THRESHOLD}) and confidence was not borderline ` +
        `(preliminary: ${(preliminaryConfidence * 100).toFixed(0)}%, ` +
        `borderline range: ${SKEPTIC_BORDERLINE_CONFIDENCE_LOW * 100}%-${SKEPTIC_BORDERLINE_CONFIDENCE_HIGH * 100}%).`
    );
}