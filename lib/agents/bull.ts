/**
 * Verdict — Bull Agent
 *
 * Builds the strongest possible evidence-backed case FOR investing
 * in the company, using only researchData from state.
 *
 * Evidence-first rules:
 * - Every claim must trace to researchData fields passed in.
 * - If evidence is thin, the bull case must say so — not paper over it.
 * - strengthRating is derived from a four-dimension rubric, not guessed.
 * - No company-specific hardcoded logic anywhere in this file.
 */

import { getStructuredModelWithFallback } from "@/lib/gemini";
import type { BullCase, ResearchData } from "@/types/graph";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BullLLMResponse {
    thesis: string;
    evidence: string[];
    dimensionScores: {
        businessQuality: number;    // 0–10: moat, defensibility, revenue quality
        growthPotential: number;    // 0–10: addressable market, expansion signals
        marketPosition: number;     // 0–10: competitive advantage, differentiation
        managementExecution: number; // 0–10: evidence of delivery, track record
    };
    strengthRationale: string;
}

// ─── Strength Rating Rubric ───────────────────────────────────────────────────
// Derived from four dimensions. Inspectable and loggable.
// If asked "why is this 7.2", this function is the answer.

export function calculateStrengthRating(
    scores: BullLLMResponse["dimensionScores"]
): number {
    const weights = {
        businessQuality: 0.35,
        growthPotential: 0.30,
        marketPosition: 0.25,
        managementExecution: 0.10,
    };

    const weighted =
        scores.businessQuality * weights.businessQuality +
        scores.growthPotential * weights.growthPotential +
        scores.marketPosition * weights.marketPosition +
        scores.managementExecution * weights.managementExecution;

    return Math.round(weighted * 10) / 10;
}

// ─── Prompt ───────────────────────────────────────────────────────────────────

function buildBullPrompt(
    companyName: string,
    researchData: ResearchData
): string {
    const financialSection = researchData.financialSnapshot
        ? `Financial data: ${researchData.financialSnapshot}`
        : "Financial data: Not available (private company or insufficient public data)";

    return `You are the Bull analyst on an investment committee. Your role is to build the strongest possible case FOR investing in this company.

Company: ${companyName}

RESEARCH DATA (you may only use what is provided below — do not invent facts):
---
Business Model: ${researchData.businessModel}

Recent Developments:
${researchData.recentNews.map((n, i) => `${i + 1}. ${n}`).join("\n")}

Market Position: ${researchData.marketPosition}

${financialSection}
---

Your task:
1. Build the strongest evidence-backed bullish thesis using ONLY the research data above.
2. Identify specific evidence points that support the bull case.
3. Score each dimension honestly based on what the evidence actually supports.
4. If evidence for a dimension is thin or missing, score it low — do not fabricate strength.

Score each dimension from 0 to 10:
- businessQuality: How defensible is the business model? Does it have moat, pricing power, recurring revenue?
- growthPotential: What does evidence suggest about growth trajectory and market opportunity?
- marketPosition: How strong is competitive positioning based on available evidence?
- managementExecution: What does evidence show about delivery and track record?

Respond with this exact JSON schema:
{
  "thesis": "2-3 sentence bullish thesis grounded in the evidence provided. Be specific to this company.",
  "evidence": [
    "Specific evidence point 1 drawn directly from research data",
    "Specific evidence point 2 drawn directly from research data",
    "Specific evidence point 3 drawn directly from research data",
    "Specific evidence point 4 drawn directly from research data (if available)"
  ],
  "dimensionScores": {
    "businessQuality": <0-10>,
    "growthPotential": <0-10>,
    "marketPosition": <0-10>,
    "managementExecution": <0-10>
  },
  "strengthRationale": "One sentence explaining why you scored the overall case at this strength level."
}

Rules:
- evidence array must contain 3-5 items, each traceable to the research data above.
- If research data says 'Insufficient evidence' for something, do not score that dimension above 4.
- thesis must be specific to this company, not generic boilerplate.`;
}

// ─── Parser ───────────────────────────────────────────────────────────────────

function parseBullResponse(raw: string): BullLLMResponse {
    try {
        const parsed = JSON.parse(raw) as BullLLMResponse;

        if (!parsed.thesis) throw new Error("Missing thesis");
        if (!Array.isArray(parsed.evidence)) throw new Error("Missing evidence array");
        if (!parsed.dimensionScores) throw new Error("Missing dimensionScores");
        if (typeof parsed.dimensionScores.businessQuality !== "number")
            throw new Error("Missing businessQuality score");
        if (typeof parsed.dimensionScores.growthPotential !== "number")
            throw new Error("Missing growthPotential score");
        if (typeof parsed.dimensionScores.marketPosition !== "number")
            throw new Error("Missing marketPosition score");
        if (typeof parsed.dimensionScores.managementExecution !== "number")
            throw new Error("Missing managementExecution score");

        return parsed;
    } catch (error) {
        throw new Error(
            `[Bull] Failed to parse LLM response: ${error instanceof Error ? error.message : "Unknown parse error"
            }. Raw: ${raw.slice(0, 300)}`
        );
    }
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export interface BullResult {
    bullCase: BullCase;
    dimensionScores: BullLLMResponse["dimensionScores"];
    strengthRationale: string;
}

export async function buildBullCase(
    companyName: string,
    researchData: ResearchData
): Promise<BullResult> {
    const prompt = buildBullPrompt(companyName, researchData);
    const raw = await getStructuredModelWithFallback(prompt);
    const parsed = parseBullResponse(raw);

    const strengthRating = calculateStrengthRating(parsed.dimensionScores);

    const bullCase: BullCase = {
        thesis: parsed.thesis,
        evidence: parsed.evidence,
        strengthRating,
    };

    return {
        bullCase,
        dimensionScores: parsed.dimensionScores,
        strengthRationale: parsed.strengthRationale,
    };
}