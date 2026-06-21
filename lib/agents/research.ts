/**
 * Verdict — Research Agent
 *
 * Gathers structured, sourced evidence about a resolved company.
 * Uses Gemini's knowledge to produce grounded research findings.
 *
 * Evidence-first rules (per architecture Section 2a):
 * - Every field must be explicitly marked "Insufficient evidence" if data is thin.
 * - dataCompleteness is calculated from how many fields have real signal.
 * - No field may be silently fabricated or vague-guessed.
 * - No company-specific hardcoded logic anywhere in this file.
 */

import { getStructuredModel } from "@/lib/gemini";
import type { ResearchData, Source } from "@/types/graph";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ResearchLLMResponse {
    businessModel: string;
    recentDevelopments: string[];
    marketPosition: string;
    financialSnapshot: string | null;
    competitiveLandscape: string;
    keyRisksIdentified: string[];
    dataAvailability: {
        businessModelConfidence: "high" | "medium" | "low";
        financialDataAvailable: boolean;
        recentNewsAvailable: boolean;
        marketDataAvailable: boolean;
    };
    sourcesList: Array<{
        title: string;
        type: "news" | "financial" | "market" | "company" | "general";
        recency: "recent" | "historical" | "unknown";
    }>;
}

// ─── Prompt ───────────────────────────────────────────────────────────────────

function buildResearchPrompt(
    companyName: string,
    ticker: string | undefined,
    description: string
): string {
    const tickerStr = ticker ? ` (${ticker})` : "";

    return `You are a financial research analyst conducting due diligence on a company.

Company: ${companyName}${tickerStr}
Description: ${description}

Conduct thorough research on this company and return a structured JSON response.

CRITICAL RULES:
1. If you lack reliable information for any field, explicitly state "Insufficient evidence: [reason]" — never fabricate or guess vaguely.
2. For private companies or obscure firms, many fields may have insufficient evidence — that is acceptable and expected.
3. recentDevelopments must reflect genuinely recent events (last 12-18 months) — if you cannot verify recency, say so.
4. financialSnapshot is null if the company is private or financial data is unavailable.
5. Be specific — avoid generic statements that could apply to any company.

Return this exact JSON schema:
{
  "businessModel": "Detailed description of how this company generates revenue, its primary products/services, customer segments, and geographic presence. If insufficient evidence, state that explicitly.",
  
  "recentDevelopments": [
    "Specific recent development 1 with approximate timeframe",
    "Specific recent development 2 with approximate timeframe",
    "Specific recent development 3 with approximate timeframe"
  ],
  
  "marketPosition": "Assessment of competitive position, market share where known, key differentiators, and primary competitors. If insufficient evidence, state that explicitly.",
  
  "financialSnapshot": "Key financial metrics: revenue, growth rate, profitability, debt levels if publicly available. Set to null if private or unavailable.",
  
  "competitiveLandscape": "Who are the main competitors and what is the competitive dynamic? If insufficient evidence, state that explicitly.",
  
  "keyRisksIdentified": [
    "Specific risk 1 identified from research",
    "Specific risk 2 identified from research"
  ],
  
  "dataAvailability": {
    "businessModelConfidence": "high | medium | low",
    "financialDataAvailable": true | false,
    "recentNewsAvailable": true | false,
    "marketDataAvailable": true | false
  },
  
  "sourcesList": [
    {
      "title": "Description of information source (e.g., 'Company SEC 10-K filing', 'Reuters news coverage', 'Industry analyst reports')",
      "type": "news | financial | market | company | general",
      "recency": "recent | historical | unknown"
    }
  ]
}

Provide 3-6 sources in sourcesList reflecting the actual types of sources your information comes from.`;
}

// ─── Data Completeness Calculator ────────────────────────────────────────────
// Each dimension contributes to the overall dataQualityConfidence score.
// This calculation is inspectable — not an opaque LLM-guessed number.

function calculateDataCompleteness(
    parsed: ResearchLLMResponse
): number {
    let score = 0;
    const dimensions = 4;

    // Business model (0.25 weight)
    if (
        parsed.dataAvailability.businessModelConfidence === "high" &&
        !parsed.businessModel.toLowerCase().includes("insufficient")
    ) {
        score += 1;
    } else if (
        parsed.dataAvailability.businessModelConfidence === "medium" &&
        !parsed.businessModel.toLowerCase().includes("insufficient")
    ) {
        score += 0.6;
    } else {
        score += 0.2;
    }

    // Financial data (0.25 weight)
    if (
        parsed.dataAvailability.financialDataAvailable &&
        parsed.financialSnapshot !== null
    ) {
        score += 1;
    } else {
        score += 0;
    }

    // Recent news (0.25 weight)
    if (
        parsed.dataAvailability.recentNewsAvailable &&
        parsed.recentDevelopments.length >= 2
    ) {
        score += 1;
    } else if (parsed.recentDevelopments.length >= 1) {
        score += 0.4;
    } else {
        score += 0;
    }

    // Market data (0.25 weight)
    if (
        parsed.dataAvailability.marketDataAvailable &&
        !parsed.marketPosition.toLowerCase().includes("insufficient")
    ) {
        score += 1;
    } else if (!parsed.marketPosition.toLowerCase().includes("insufficient")) {
        score += 0.5;
    } else {
        score += 0;
    }

    return Math.round((score / dimensions) * 100) / 100;
}

// ─── Source Builder ───────────────────────────────────────────────────────────

function buildSources(
    sourcesList: ResearchLLMResponse["sourcesList"],
    companyName: string
): Source[] {
    return sourcesList.map((s, index) => ({
        id: `research-source-${index + 1}`,
        title: s.title,
        url: undefined, // Gemini does not return live URLs — Strong scope adds real citations
        retrievedAt: new Date().toISOString(),
    }));
}

// ─── Parser ───────────────────────────────────────────────────────────────────

function parseResearchResponse(raw: string): ResearchLLMResponse {
    try {
        const parsed = JSON.parse(raw) as ResearchLLMResponse;

        if (!parsed.businessModel) throw new Error("Missing businessModel");
        if (!Array.isArray(parsed.recentDevelopments))
            throw new Error("Missing recentDevelopments array");
        if (!parsed.marketPosition) throw new Error("Missing marketPosition");
        if (!parsed.dataAvailability) throw new Error("Missing dataAvailability");
        if (!Array.isArray(parsed.sourcesList))
            throw new Error("Missing sourcesList");

        return parsed;
    } catch (error) {
        throw new Error(
            `[Research] Failed to parse LLM response: ${error instanceof Error ? error.message : "Unknown parse error"
            }. Raw: ${raw.slice(0, 300)}`
        );
    }
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export interface ResearchResult {
    researchData: ResearchData;
    sources: Source[];
}

export async function researchCompany(
    companyName: string,
    ticker: string | undefined,
    description: string
): Promise<ResearchResult> {
    const model = getStructuredModel("fast");
    const prompt = buildResearchPrompt(companyName, ticker, description);

    const result = await model.generateContent(prompt);
    const raw = result.response.text();
    const parsed = parseResearchResponse(raw);

    const sources = buildSources(parsed.sourcesList, companyName);
    const dataCompleteness = calculateDataCompleteness(parsed);

    const researchData: ResearchData = {
        businessModel: parsed.businessModel,
        recentNews: parsed.recentDevelopments,
        marketPosition: parsed.marketPosition,
        financialSnapshot: parsed.financialSnapshot ?? undefined,
        sources,
        dataCompleteness,
    };

    return { researchData, sources };
}