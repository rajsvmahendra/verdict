/**
 * Verdict — Skeptic Agent
 *
 * Conditionally invoked when Bull/Bear ratings are lopsided OR
 * preliminary confidence is in a borderline band.
 *
 * Stress-tests whichever case is currently winning by hunting for:
 * - Claims not supported by researchData
 * - Missing considerations the winning side glossed over
 * - Overconfident assertions given thin evidence
 *
 * Outputs adjustedConfidenceDelta (always negative or zero).
 * No company-specific hardcoded logic anywhere in this file.
 */

import { getStructuredModelWithFallback } from "@/lib/gemini";
import type { BullCase, BearCase, ResearchData, SkepticNotes } from "@/types/graph";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SkepticLLMResponse {
    winningSide: "bull" | "bear" | "balanced";
    flaggedClaims: string[];
    missingConsiderations: string[];
    adjustedConfidenceDelta: number; // Must be <= 0
    overallAssessment: string;
}

// ─── Prompt ───────────────────────────────────────────────────────────────────

function buildSkepticPrompt(
    companyName: string,
    bullCase: BullCase,
    bearCase: BearCase,
    researchData: ResearchData
): string {
    const winningSide =
        bullCase.strengthRating > bearCase.severityRating ? "Bull" : "Bear";

    return `You are the Skeptic on an investment committee. You have been called in because the debate is one-sided or the confidence level is in a borderline zone requiring extra scrutiny.

Company: ${companyName}

RESEARCH DATA (ground truth — claims must trace here):
---
Business Model: ${researchData.businessModel}
Market Position: ${researchData.marketPosition}
Financial Snapshot: ${researchData.financialSnapshot ?? "Not available"}
Recent Developments: ${researchData.recentNews.join(" | ")}
---

BULL CASE (strengthRating: ${bullCase.strengthRating}/10):
Thesis: ${bullCase.thesis}
Evidence: ${bullCase.evidence.join(" | ")}

BEAR CASE (severityRating: ${bearCase.severityRating}/10):
Risks: ${bearCase.risks}
Evidence: ${bearCase.evidence.join(" | ")}

Currently winning side: ${winningSide}

Your task:
1. Identify claims in either case (especially the winning side) that are NOT supported by the research data above.
2. Identify important considerations that NEITHER side addressed.
3. Assess how much the unsupported claims and gaps should reduce confidence.
4. adjustedConfidenceDelta must be between -0.30 and 0.00 — never positive.
   - 0.00: both cases are well-supported, no significant gaps
   - -0.10: minor unsupported claims or small gaps
   - -0.20: meaningful unsupported assertions or important missing factors
   - -0.30: significant fabrication or critical missing risk factors

Respond with this exact JSON schema:
{
  "winningSide": "bull | bear | balanced",
  "flaggedClaims": [
    "Specific claim from bull or bear case that lacks support in research data",
    "Another flagged claim if present"
  ],
  "missingConsiderations": [
    "Important factor neither side addressed",
    "Another missing consideration if present"
  ],
  "adjustedConfidenceDelta": <number between -0.30 and 0.00>,
  "overallAssessment": "2-3 sentence summary of what the Skeptic found and why confidence was adjusted by this amount."
}

Rules:
- flaggedClaims must reference specific statements from the bull or bear case above.
- If both cases are well-grounded in research data, flaggedClaims can be empty [].
- missingConsiderations should identify genuine gaps, not restate existing evidence.
- Be rigorous — your job is to find weaknesses, not to be fair to both sides.`;
}

// ─── Parser ───────────────────────────────────────────────────────────────────

function parseSkepticResponse(raw: string): SkepticLLMResponse {
    try {
        const parsed = JSON.parse(raw) as SkepticLLMResponse;

        if (!parsed.winningSide) throw new Error("Missing winningSide");
        if (!Array.isArray(parsed.flaggedClaims))
            throw new Error("Missing flaggedClaims array");
        if (!Array.isArray(parsed.missingConsiderations))
            throw new Error("Missing missingConsiderations array");
        if (typeof parsed.adjustedConfidenceDelta !== "number")
            throw new Error("Missing adjustedConfidenceDelta");
        if (parsed.adjustedConfidenceDelta > 0)
            throw new Error("adjustedConfidenceDelta must be <= 0");

        return parsed;
    } catch (error) {
        throw new Error(
            `[Skeptic] Failed to parse LLM response: ${error instanceof Error ? error.message : "Unknown parse error"
            }. Raw: ${raw.slice(0, 300)}`
        );
    }
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export interface SkepticResult {
    skepticNotes: SkepticNotes;
    overallAssessment: string;
}

export async function runSkepticAnalysis(
    companyName: string,
    bullCase: BullCase,
    bearCase: BearCase,
    researchData: ResearchData
): Promise<SkepticResult> {
    const prompt = buildSkepticPrompt(
        companyName,
        bullCase,
        bearCase,
        researchData
    );

    const raw = await getStructuredModelWithFallback(prompt);
    const parsed = parseSkepticResponse(raw);

    // Clamp delta to valid range — defensive
    const clampedDelta = Math.min(0, Math.max(-0.30, parsed.adjustedConfidenceDelta));

    const skepticNotes: SkepticNotes = {
        flaggedClaims: parsed.flaggedClaims,
        missingConsiderations: parsed.missingConsiderations,
        adjustedConfidenceDelta: clampedDelta,
    };

    return {
        skepticNotes,
        overallAssessment: parsed.overallAssessment,
    };
}