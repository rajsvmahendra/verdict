/**
 * Verdict — Resolver Agent
 *
 * Disambiguates raw company name input into a structured ResolvedEntity.
 * Handles: typos, ticker symbols, common name variants, ambiguous inputs.
 *
 * Routes to clarification when the input is genuinely ambiguous
 * (multiple plausible matches with no clear winner).
 *
 * No company-specific hardcoded logic. Generalizes to any input.
 */

import { getStructuredModel } from "@/lib/gemini";
import type { ResolvedEntity } from "@/types/graph";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ResolverLLMResponse {
    resolved: boolean;
    ambiguous: boolean;
    entity?: {
        name: string;
        ticker?: string;
        description: string;
        resolutionConfidence: number;
    };
    clarificationMessage?: string;
    reasoning: string;
}

// ─── Prompt ───────────────────────────────────────────────────────────────────

function buildResolverPrompt(companyNameRaw: string): string {
    return `You are a financial data resolver. Your job is to identify the company a user is referring to.

User input: "${companyNameRaw}"

Your task:
1. Determine if this refers to a specific, identifiable company or organization.
2. Handle typos, abbreviations, ticker symbols, and common name variants.
3. If multiple companies could match with roughly equal probability, flag as ambiguous.
4. If no real company matches, set resolved to false.

Respond with a JSON object matching this exact schema:
{
  "resolved": boolean,
  "ambiguous": boolean,
  "entity": {
    "name": "Full official company name",
    "ticker": "TICKER (if publicly traded, otherwise omit)",
    "description": "One sentence: what this company does and where it operates",
    "resolutionConfidence": number between 0 and 1
  },
  "clarificationMessage": "Only include if ambiguous=true. Ask the user to clarify which company they mean, listing the 2-3 most likely candidates.",
  "reasoning": "Brief explanation of how you resolved or why you flagged as ambiguous"
}

Rules:
- If resolved=true and ambiguous=false, always include the entity object.
- If ambiguous=true, always include clarificationMessage listing specific candidates.
- If resolved=false, set ambiguous=false and include clarificationMessage explaining why.
- resolutionConfidence: 0.9+ for clear matches, 0.7-0.9 for likely matches, below 0.7 flag as ambiguous.
- Never invent a company that does not exist.
- description must be factual and concise — one sentence only.`;
}

// ─── Parser ───────────────────────────────────────────────────────────────────

function parseResolverResponse(raw: string): ResolverLLMResponse {
    try {
        const parsed = JSON.parse(raw) as ResolverLLMResponse;

        // Validate required fields
        if (typeof parsed.resolved !== "boolean") {
            throw new Error("Missing required field: resolved");
        }
        if (typeof parsed.ambiguous !== "boolean") {
            throw new Error("Missing required field: ambiguous");
        }
        if (typeof parsed.reasoning !== "string") {
            throw new Error("Missing required field: reasoning");
        }

        return parsed;
    } catch (error) {
        throw new Error(
            `[Resolver] Failed to parse LLM response: ${error instanceof Error ? error.message : "Unknown parse error"
            }. Raw response: ${raw.slice(0, 200)}`
        );
    }
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export interface ResolverResult {
    resolved: boolean;
    needsClarification: boolean;
    resolvedEntity?: ResolvedEntity;
    clarificationMessage?: string;
    reasoning: string;
}

export async function resolveCompany(
    companyNameRaw: string
): Promise<ResolverResult> {
    const model = getStructuredModel("fast");
    const prompt = buildResolverPrompt(companyNameRaw);

    const result = await model.generateContent(prompt);
    const raw = result.response.text();
    const parsed = parseResolverResponse(raw);

    // Case 1: Clearly resolved
    if (parsed.resolved && !parsed.ambiguous && parsed.entity) {
        const resolvedEntity: ResolvedEntity = {
            name: parsed.entity.name,
            ticker: parsed.entity.ticker,
            description: parsed.entity.description,
            resolutionConfidence: parsed.entity.resolutionConfidence,
        };

        return {
            resolved: true,
            needsClarification: false,
            resolvedEntity,
            reasoning: parsed.reasoning,
        };
    }

    // Case 2: Ambiguous or unresolvable
    return {
        resolved: false,
        needsClarification: true,
        clarificationMessage:
            parsed.clarificationMessage ??
            `Could not confidently identify a company from "${companyNameRaw}". Please provide more detail.`,
        reasoning: parsed.reasoning,
    };
}