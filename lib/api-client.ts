/**
 * Verdict — Frontend API Client
 *
 * Type-safe client for calling /api/analyze from the frontend.
 * Never used server-side — this is a browser-only module.
 */

import type {
    Verdict,
    ConfidenceScore,
    BullCase,
    BearCase,
    SkepticNotes,
    ResolvedEntity,
    AgentStatuses,
    GraphError,
    Source,
} from "@/types/graph";

// ─── Response Types ───────────────────────────────────────────────────────────

export interface ExplainabilityFields {
    whyThisVerdict: string;
    strongestBullArgument: string;
    strongestBearArgument: string;
    skepticChallenge: string;
    verdictReasoning: string;
}

export interface AnalyzeSuccessResponse {
    status: "success";
    verdict: Verdict;
    confidenceScore: ConfidenceScore;
    finalThesis: string;
    explainability: ExplainabilityFields;
    keyStrengths: string[];
    keyRisks: string[];
    bullCase: BullCase;
    bearCase: BearCase;
    skepticNotes?: SkepticNotes;
    skepticInvoked: boolean;
    skepticSkipReason?: string;
    sources: Source[];
    resolvedEntity: ResolvedEntity;
    agentStatuses: AgentStatuses;
    errors: GraphError[];
}

export interface AnalyzeClarificationResponse {
    status: "clarification_needed";
    message: string;
}

export interface AnalyzeErrorResponse {
    status: "error";
    error?: string;
    errors?: GraphError[];
}

export type AnalyzeResponse =
    | AnalyzeSuccessResponse
    | AnalyzeClarificationResponse
    | AnalyzeErrorResponse;

// ─── Client ───────────────────────────────────────────────────────────────────

export async function analyzeCompany(
    company: string
): Promise<AnalyzeResponse> {
    const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company }),
    });

    const data = await response.json() as AnalyzeResponse;
    return data;
}