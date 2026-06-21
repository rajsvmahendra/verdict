/**
 * Verdict — Bear Agent
 *
 * Builds the strongest possible evidence-backed case AGAINST investing
 * in the company, using only researchData from state.
 *
 * Evidence-first rules:
 * - Every claim must trace to researchData fields passed in.
 * - If evidence for a risk is thin, say so — do not invent risks.
 * - severityRating is derived from a four-dimension rubric, not guessed.
 * - No company-specific hardcoded logic anywhere in this file.
 */

import { getStructuredModelWithFallback } from "@/lib/gemini";
import type { BearCase, ResearchData } from "@/types/graph";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BearLLMResponse {
    risks: string;
    evidence: string[];
    dimensionScores: {
        competitiveRisk: number;      // 0–10: how exposed is the company to competition
        executionRisk: number;        // 0–10: evidence of missed targets, management issues
        financialRisk: number;        // 0–10: debt, burn rate, profitability concerns
        externalRisk: number;         // 0–10: macro, regulatory, market structure risks
    };
    severityRationale: string;
}

// ─── Severity Rating Rubric ───────────────────────────────────────────────────
// Derived from four risk dimensions. Inspectable and loggable.
// If asked "why is this 6.4", this function is the answer.

export function calculateSeverityRating(
    scores: BearLLMResponse["dimensionScores"]
): number {
    const weights = {
        competitiveRisk: 0.30,
        executionRisk: 0.25,
        financialRisk: 0.30,
        externalRisk: 0.15,
    };

    const weighted =
        scores.competitiveRisk * weights.competitiveRisk +
        scores.executionRisk * weights.executionRisk +
        scores.financialRisk * weights.financialRisk +
        scores.externalRisk * weights.externalRisk;

    return Math.round(weighted * 10) / 10;
}

// ─── Prompt ───────────────────────────────────────────────────────────────────

function buildBearPrompt(
    companyName: string,
    researchData: ResearchData
): string {
    const financialSection = researchData.financialSnapshot
        ? `Financial data: ${researchData.financialSnapshot}`
        : "Financial data: Not available (private company or insufficient public data)";

    return `You are the Bear analyst on an investment committee. Your role is to build the strongest possible case AGAINST investing in this company.

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
1. Build the strongest evidence-backed bearish case using ONLY the research data above.
2. Identify specific evidence points that support the bear case.
3. Score each risk dimension honestly based on what the evidence actually shows.
4. If evidence for a risk dimension is thin, score it based only on what you can see.

Score each risk dimension from 0 to 10 (10 = most severe risk):
- competitiveRisk: How exposed is the company to competitive pressure eroding its position?
- executionRisk: What does evidence show about missed targets, management issues, or operational challenges?
- financialRisk: What concerns exist around debt, burn rate, margins, or profitability sustainability?
- externalRisk: How exposed is the company to macro headwinds, regulatory risk, or structural market shifts?

Respond with this exact JSON schema:
{
  "risks": "2-3 sentence bearish summary grounded in the evidence provided. Be specific to this company.",
  "evidence": [
    "Specific risk evidence point 1 drawn directly from research data",
    "Specific risk evidence point 2 drawn directly from research data",
    "Specific risk evidence point 3 drawn directly from research data",
    "Specific risk evidence point 4 drawn directly from research data (if available)"
  ],
  "dimensionScores": {
    "competitiveRisk": <0-10>,
    "executionRisk": <0-10>,
    "financialRisk": <0-10>,
    "externalRisk": <0-10>
  },
  "severityRationale": "One sentence explaining why you scored the overall risk at this severity level."
}

Rules:
- evidence array must contain 3-5 items, each traceable to the research data above.
- If research data says 'Insufficient evidence' for something, do not score that dimension above 4.
- risks summary must be specific to this company, not generic boilerplate.
- You are adversarial by design — find the real weaknesses, do not soften them.`;
}

// ─── Parser ───────────────────────────────────────────────────────────────────

function parseBearResponse(raw: string): BearLLMResponse {
    try {
        const parsed = JSON.parse(raw) as BearLLMResponse;

        if (!parsed.risks) throw new Error("Missing risks");
        if (!Array.isArray(parsed.evidence)) throw new Error("Missing evidence array");
        if (!parsed.dimensionScores) throw new Error("Missing dimensionScores");
        if (typeof parsed.dimensionScores.competitiveRisk !== "number")
            throw new Error("Missing competitiveRisk score");
        if (typeof parsed.dimensionScores.executionRisk !== "number")
            throw new Error("Missing executionRisk score");
        if (typeof parsed.dimensionScores.financialRisk !== "number")
            throw new Error("Missing financialRisk score");
        if (typeof parsed.dimensionScores.externalRisk !== "number")
            throw new Error("Missing externalRisk score");

        return parsed;
    } catch (error) {
        throw new Error(
            `[Bear] Failed to parse LLM response: ${error instanceof Error ? error.message : "Unknown parse error"
            }. Raw: ${raw.slice(0, 300)}`
        );
    }
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export interface BearResult {
    bearCase: BearCase;
    dimensionScores: BearLLMResponse["dimensionScores"];
    severityRationale: string;
}

export async function buildBearCase(
    companyName: string,
    researchData: ResearchData
): Promise<BearResult> {
    const prompt = buildBearPrompt(companyName, researchData);
    const raw = await getStructuredModelWithFallback(prompt);
    const parsed = parseBearResponse(raw);

    const severityRating = calculateSeverityRating(parsed.dimensionScores);

    const bearCase: BearCase = {
        risks: parsed.risks,
        evidence: parsed.evidence,
        severityRating,
    };

    return {
        bearCase,
        dimensionScores: parsed.dimensionScores,
        severityRationale: parsed.severityRationale,
    };
}