/**
 * Verdict — Chair Agent
 *
 * Synthesizes all prior agent outputs into the final verdict.
 *
 * Implements the exact banding table from Section 3:
 * | decisionConfidence | dataQualityConfidence | Verdict    |
 * |--------------------|-----------------------|------------|
 * | High, favorable    | High                  | INVEST     |
 * | High, unfavorable  | High or Low           | PASS       |
 * | Moderate / mixed   | High                  | WATCHLIST  |
 * | Anything           | Low                   | WATCHLIST  |
 *
 * Load-bearing rule: a strong-looking case on thin evidence → WATCHLIST, never INVEST.
 *
 * Populates all five explainability fields from Section 4a.
 * No company-specific hardcoded logic anywhere in this file.
 */

import { getStructuredModelWithFallback } from "@/lib/gemini";
import type {
    BullCase,
    BearCase,
    SkepticNotes,
    ResearchData,
    Verdict,
    ConfidenceScore,
    Source,
} from "@/types/graph";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChairLLMResponse {
    finalThesis: string;
    strongestBullArgument: string;
    strongestBearArgument: string;
    skepticChallenge: string;
    verdictReasoning: string;
    keyStrengths: string[];
    keyRisks: string[];
}

// ─── Confidence Calculation ───────────────────────────────────────────────────
// Both dimensions are derived from inspectable, structured inputs.
// If asked "why is decisionConfidence 0.62", point to this function.

export interface ConfidenceCalculation {
    decisionConfidence: number;
    dataQualityConfidence: number;
    derivation: {
        bullStrength: number;
        bearSeverity: number;
        skepticDelta: number;
        dataCompleteness: number;
        rawDecisionScore: number;
        adjustedDecisionScore: number;
    };
}

export function calculateConfidence(
    bullCase: BullCase,
    bearCase: BearCase,
    skepticNotes: SkepticNotes | undefined,
    researchData: ResearchData
): ConfidenceCalculation {
    // Decision Confidence: how strong is the case in either direction?
    // Derived from the gap between bull strength and bear severity.
    // Range: 0–1 where 1 = maximally clear case in one direction.
    const bullNormalized = bullCase.strengthRating / 10;
    const bearNormalized = bearCase.severityRating / 10;

    // Net favorability: positive = bullish, negative = bearish
    const netFavorability = bullNormalized - bearNormalized;

    // Raw decision score: how clear is the case in either direction?
    // Absolute value of net favorability, scaled to 0–1
    // A large gap in either direction = high decision confidence
    // A tight gap = low decision confidence (mixed/uncertain)
    const rawDecisionScore = Math.abs(netFavorability) + 0.5 * Math.max(bullNormalized, bearNormalized);
    const clampedRaw = Math.min(1, Math.max(0, rawDecisionScore));

    // Apply skeptic adjustment
    const skepticDelta = skepticNotes?.adjustedConfidenceDelta ?? 0;
    const adjustedDecisionScore = Math.min(1, Math.max(0, clampedRaw + skepticDelta));

    // Data Quality Confidence: directly from research agent's assessment
    const dataQualityConfidence = researchData.dataCompleteness;

    return {
        decisionConfidence: Math.round(adjustedDecisionScore * 100) / 100,
        dataQualityConfidence: Math.round(dataQualityConfidence * 100) / 100,
        derivation: {
            bullStrength: bullCase.strengthRating,
            bearSeverity: bearCase.severityRating,
            skepticDelta,
            dataCompleteness: researchData.dataCompleteness,
            rawDecisionScore: Math.round(clampedRaw * 100) / 100,
            adjustedDecisionScore: Math.round(adjustedDecisionScore * 100) / 100,
        },
    };
}

// ─── Verdict Banding ──────────────────────────────────────────────────────────
// Implements the exact table from Section 3.
// This function is the canonical answer to "why did it get this verdict?"

export interface VerdictBanding {
    verdict: Verdict;
    bandingReason: string;
}

const HIGH_DECISION_THRESHOLD = 0.65;
const LOW_DATA_QUALITY_THRESHOLD = 0.5;

export function determineVerdict(
    decisionConfidence: number,
    dataQualityConfidence: number,
    bullStrength: number,
    bearSeverity: number
): VerdictBanding {
    const isBullish = bullStrength > bearSeverity;
    const isHighDecision = decisionConfidence >= HIGH_DECISION_THRESHOLD;
    const isLowDataQuality = dataQualityConfidence < LOW_DATA_QUALITY_THRESHOLD;

    // Row 4 (load-bearing): Low data quality → WATCHLIST, regardless of case strength
    if (isLowDataQuality) {
        return {
            verdict: "WATCHLIST",
            bandingReason:
                `Data quality confidence is low (${(dataQualityConfidence * 100).toFixed(0)}%, ` +
                `below ${LOW_DATA_QUALITY_THRESHOLD * 100}% threshold). ` +
                `Even a strong-looking case cannot resolve to INVEST on thin evidence. ` +
                `Verdict: WATCHLIST until more reliable data is available.`,
        };
    }

    // Row 2: High decision confidence, unfavorable (bearish) → PASS
    if (isHighDecision && !isBullish) {
        return {
            verdict: "PASS",
            bandingReason:
                `Decision confidence is high (${(decisionConfidence * 100).toFixed(0)}%) ` +
                `and the case is unfavorable (bear severity ${bearSeverity.toFixed(1)} > ` +
                `bull strength ${bullStrength.toFixed(1)}). ` +
                `Data quality is adequate (${(dataQualityConfidence * 100).toFixed(0)}%). ` +
                `Verdict: PASS — the risks clearly outweigh the upside.`,
        };
    }

    // Row 1: High decision confidence, favorable (bullish), high data quality → INVEST
    if (isHighDecision && isBullish) {
        return {
            verdict: "INVEST",
            bandingReason:
                `Decision confidence is high (${(decisionConfidence * 100).toFixed(0)}%), ` +
                `the case is favorable (bull strength ${bullStrength.toFixed(1)} > ` +
                `bear severity ${bearSeverity.toFixed(1)}), ` +
                `and data quality is adequate (${(dataQualityConfidence * 100).toFixed(0)}%). ` +
                `Verdict: INVEST — strong evidence supports the bullish thesis.`,
        };
    }

    // Row 3: Moderate/mixed case, high data quality → WATCHLIST
    return {
        verdict: "WATCHLIST",
        bandingReason:
            `Decision confidence is moderate (${(decisionConfidence * 100).toFixed(0)}%, ` +
            `below ${HIGH_DECISION_THRESHOLD * 100}% threshold). ` +
            `The case is mixed (bull: ${bullStrength.toFixed(1)}, bear: ${bearSeverity.toFixed(1)}). ` +
            `Data quality is adequate (${(dataQualityConfidence * 100).toFixed(0)}%). ` +
            `Verdict: WATCHLIST — the case is not clear enough in either direction.`,
    };
}

// ─── Prompt ───────────────────────────────────────────────────────────────────

function buildChairPrompt(
    companyName: string,
    bullCase: BullCase,
    bearCase: BearCase,
    skepticNotes: SkepticNotes | undefined,
    skepticInvoked: boolean,
    skepticSkipReason: string | undefined,
    verdict: Verdict,
    bandingReason: string
): string {
    const skepticSection = skepticInvoked && skepticNotes
        ? `SKEPTIC ANALYSIS (was invoked):
Flagged Claims: ${skepticNotes.flaggedClaims.length > 0 ? skepticNotes.flaggedClaims.join(" | ") : "None — both cases were well-grounded."}
Missing Considerations: ${skepticNotes.missingConsiderations.length > 0 ? skepticNotes.missingConsiderations.join(" | ") : "None identified."}
Confidence Adjustment: ${skepticNotes.adjustedConfidenceDelta}`
        : `SKEPTIC ANALYSIS (was NOT invoked):
Reason: ${skepticSkipReason ?? "Debate was balanced and confidence was not borderline."}`;

    return `You are the Chair of an investment committee. You are synthesizing the final verdict.

Company: ${companyName}

BULL CASE (strengthRating: ${bullCase.strengthRating}/10):
Thesis: ${bullCase.thesis}
Evidence: ${bullCase.evidence.join(" | ")}

BEAR CASE (severityRating: ${bearCase.severityRating}/10):
Risks: ${bearCase.risks}
Evidence: ${bearCase.evidence.join(" | ")}

${skepticSection}

ALGORITHMIC VERDICT: ${verdict}
BANDING REASON: ${bandingReason}

Your task is to write the narrative synthesis — NOT to override the algorithmic verdict.
The verdict has already been determined by the scoring system. Your job is to explain WHY in human-readable language.

Respond with this exact JSON schema:
{
  "finalThesis": "3-4 sentence synthesis explaining the overall investment case for ${companyName}. Be specific and balanced.",
  "strongestBullArgument": "The single most compelling argument FOR investing, in one sentence.",
  "strongestBearArgument": "The single most compelling argument AGAINST investing, in one sentence.",
  "skepticChallenge": "If the Skeptic was invoked, summarize their most important finding. If not invoked, explain why extra scrutiny was not needed.",
  "verdictReasoning": "2-3 sentences explaining how you weighed the bull case, bear case, and skeptic input (if any) to arrive at the ${verdict} verdict. Reference the banding reason.",
  "keyStrengths": [
    "Key strength 1 — specific to this company",
    "Key strength 2 — specific to this company",
    "Key strength 3 — specific to this company"
  ],
  "keyRisks": [
    "Key risk 1 — specific to this company",
    "Key risk 2 — specific to this company",
    "Key risk 3 — specific to this company"
  ]
}

Rules:
- finalThesis must be balanced, mentioning both upside and risk.
- keyStrengths and keyRisks must each have 2-4 items, specific to this company.
- verdictReasoning must reference the algorithmic banding reason, not override it.
- skepticChallenge must accurately reflect whether the Skeptic was or was not invoked.`;
}

// ─── Parser ───────────────────────────────────────────────────────────────────

function parseChairResponse(raw: string): ChairLLMResponse {
    try {
        const parsed = JSON.parse(raw) as ChairLLMResponse;

        if (!parsed.finalThesis) throw new Error("Missing finalThesis");
        if (!parsed.strongestBullArgument) throw new Error("Missing strongestBullArgument");
        if (!parsed.strongestBearArgument) throw new Error("Missing strongestBearArgument");
        if (!parsed.skepticChallenge) throw new Error("Missing skepticChallenge");
        if (!parsed.verdictReasoning) throw new Error("Missing verdictReasoning");
        if (!Array.isArray(parsed.keyStrengths)) throw new Error("Missing keyStrengths");
        if (!Array.isArray(parsed.keyRisks)) throw new Error("Missing keyRisks");

        return parsed;
    } catch (error) {
        throw new Error(
            `[Chair] Failed to parse LLM response: ${error instanceof Error ? error.message : "Unknown parse error"
            }. Raw: ${raw.slice(0, 300)}`
        );
    }
}

// ─── Deduplicate Sources ──────────────────────────────────────────────────────

function deduplicateSources(sources: Source[]): Source[] {
    const seen = new Set<string>();
    return sources.filter((s) => {
        if (seen.has(s.id)) return false;
        seen.add(s.id);
        return true;
    });
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export interface ChairResult {
    verdict: Verdict;
    confidenceScore: ConfidenceScore;
    finalThesis: string;
    keyStrengths: string[];
    keyRisks: string[];
    sources: Source[];
    bandingReason: string;
    strongestBullArgument: string;
    strongestBearArgument: string;
    skepticChallenge: string;
    verdictReasoning: string;
}

export async function synthesizeVerdict(
    companyName: string,
    bullCase: BullCase,
    bearCase: BearCase,
    skepticNotes: SkepticNotes | undefined,
    skepticInvoked: boolean,
    skepticSkipReason: string | undefined,
    researchData: ResearchData,
    allSources: Source[]
): Promise<ChairResult> {
    // Step 1: Calculate confidence (inspectable, mechanical)
    const confidence = calculateConfidence(
        bullCase,
        bearCase,
        skepticNotes,
        researchData
    );

    // Step 2: Determine verdict from banding table (deterministic)
    const { verdict, bandingReason } = determineVerdict(
        confidence.decisionConfidence,
        confidence.dataQualityConfidence,
        bullCase.strengthRating,
        bearCase.severityRating
    );

    // Step 3: Generate narrative synthesis (LLM — does NOT override verdict)
    const prompt = buildChairPrompt(
        companyName,
        bullCase,
        bearCase,
        skepticNotes,
        skepticInvoked,
        skepticSkipReason,
        verdict,
        bandingReason
    );

    const raw = await getStructuredModelWithFallback(prompt);
    const parsed = parseChairResponse(raw);

    const confidenceScore: ConfidenceScore = {
        decisionConfidence: confidence.decisionConfidence,
        dataQualityConfidence: confidence.dataQualityConfidence,
    };

    return {
        verdict,
        confidenceScore,
        finalThesis: parsed.finalThesis,
        keyStrengths: parsed.keyStrengths,
        keyRisks: parsed.keyRisks,
        sources: deduplicateSources(allSources),
        bandingReason,
        strongestBullArgument: parsed.strongestBullArgument,
        strongestBearArgument: parsed.strongestBearArgument,
        skepticChallenge: parsed.skepticChallenge,
        verdictReasoning: parsed.verdictReasoning,
    };
}