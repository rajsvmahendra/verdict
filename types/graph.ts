/**
 * Verdict — Central State Schema
 *
 * This is the single source of truth for all agent inputs and outputs.
 * Every agent reads from and writes to this typed object.
 * No agent may use `any` — all fields must trace to this schema.
 */

// ─── Sub-types ────────────────────────────────────────────────────────────────

export interface ResolvedEntity {
    name: string;
    ticker?: string;
    description: string;
    resolutionConfidence: number; // 0–1
}

export interface Source {
    id: string;
    title: string;
    url?: string;
    retrievedAt: string; // ISO timestamp
}

export interface ResearchData {
    businessModel: string;
    recentNews: string[];
    marketPosition: string;
    financialSnapshot?: string; // Optional — may not exist for private companies
    sources: Source[];
    dataCompleteness: number; // 0–1, drives dataQualityConfidence
}

export interface BullCase {
    thesis: string;
    evidence: string[];
    strengthRating: number; // 0–10, derived from rubric in Chair node
}

export interface BearCase {
    risks: string;
    evidence: string[];
    severityRating: number; // 0–10, derived from rubric in Chair node
}

export interface SkepticNotes {
    flaggedClaims: string[];
    missingConsiderations: string[];
    adjustedConfidenceDelta: number; // Negative number, e.g. -0.15
}

export type Verdict = "INVEST" | "WATCHLIST" | "PASS";

export interface ConfidenceScore {
    decisionConfidence: number;   // 0–1, how strong is the case
    dataQualityConfidence: number; // 0–1, how reliable is the evidence
}

// ─── Agent Status (for UI progress tracking) ──────────────────────────────────

export type AgentStatus = "idle" | "running" | "complete" | "error";

export interface AgentStatuses {
    resolver: AgentStatus;
    research: AgentStatus;
    bull: AgentStatus;
    bear: AgentStatus;
    skeptic: AgentStatus;
    chair: AgentStatus;
}

// ─── Error Handling ───────────────────────────────────────────────────────────

export interface GraphError {
    agent: keyof AgentStatuses;
    message: string;
    recoverable: boolean;
}

// ─── Root Graph State ─────────────────────────────────────────────────────────

export interface VerdictGraphState {
    // Input
    companyNameRaw: string;

    // Resolver output
    resolvedEntity?: ResolvedEntity;
    needsClarification?: boolean;
    clarificationMessage?: string;

    // Research Agent output
    researchData?: ResearchData;

    // Bull + Bear Agent outputs (populated in parallel)
    bullCase?: BullCase;
    bearCase?: BearCase;

    // Skeptic Agent output (conditionally populated)
    skepticNotes?: SkepticNotes;
    skepticInvoked?: boolean;
    skepticSkipReason?: string; // Populated when Skeptic is NOT invoked — required by Section 4a

    // Chair Agent output
    verdict?: Verdict;
    confidenceScore?: ConfidenceScore;
    finalThesis?: string;
    keyStrengths?: string[];
    keyRisks?: string[];
    sources?: Source[]; // Deduplicated across all agents

    // System fields
    agentStatuses: AgentStatuses;
    errors: GraphError[];
}

// ─── Initial State Factory ────────────────────────────────────────────────────

export function createInitialState(companyNameRaw: string): VerdictGraphState {
    return {
        companyNameRaw,
        agentStatuses: {
            resolver: "idle",
            research: "idle",
            bull: "idle",
            bear: "idle",
            skeptic: "idle",
            chair: "idle",
        },
        errors: [],
    };
}