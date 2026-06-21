/**
 * Verdict — Gemini Client
 *
 * Typed wrapper around the Google AI SDK.
 * Single source of truth for model configuration.
 * All agents import from here — no direct SDK usage elsewhere.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

// ─── Environment ──────────────────────────────────────────────────────────────

function getApiKey(): string {
    const key = process.env.GOOGLE_AI_API_KEY;
    if (!key) {
        throw new Error(
            "[Verdict] GOOGLE_AI_API_KEY is not set. " +
            "Add it to .env.local and restart the server."
        );
    }
    return key;
}

// ─── Client Singleton ─────────────────────────────────────────────────────────

let clientInstance: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
    if (!clientInstance) {
        clientInstance = new GoogleGenerativeAI(getApiKey());
    }
    return clientInstance;
}

// ─── Model Configurations ─────────────────────────────────────────────────────

/**
 * Models available on this API key.
 *
 * gemini-2.5-flash: Fast, cost-effective — used for Resolver, Research, Bull, Bear, Skeptic
 * gemini-2.5-pro:  More capable — reserved for Chair synthesis at Strong scope
 *
 * All agents use flash at MVP scope.
 */
export const MODELS = {
    fast: "gemini-2.5-flash",
    fallback: "gemini-2.0-flash",
    capable: "gemini-2.5-pro",
} as const;

export type ModelType = keyof typeof MODELS;

// ─── Exported Functions ───────────────────────────────────────────────────────

/**
 * Get a generative model instance configured for Verdict.
 *
 * @param type - "fast" for most operations, "capable" for complex synthesis
 */
export function getModel(type: ModelType = "fast") {
    const client = getClient();
    const modelName = MODELS[type];

    return client.getGenerativeModel({
        model: modelName,
        generationConfig: {
            temperature: 0.7,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 4096,
        },
    });
}

/**
 * Get a generative model configured for structured JSON output.
 * Used by agents that need reliable structured responses.
 * Lower temperature improves JSON parsing consistency.
 */
export function getStructuredModel(type: ModelType = "fast") {
    const client = getClient();
    const modelName = MODELS[type];

    return client.getGenerativeModel({
        model: modelName,
        generationConfig: {
            temperature: 0.3,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 4096,
            responseMimeType: "application/json",
        },
    });
}

/**
 * Attempts the fast model first, falls back to gemini-2.0-flash on 429.
 * Used by all agents to survive free-tier quota exhaustion gracefully.
 */
export async function getStructuredModelWithFallback(
    prompt: string
): Promise<string> {
    const models: Array<ModelType> = ["fast", "fallback"];

    for (const modelType of models) {
        try {
            const model = getStructuredModel(modelType);
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            const is429 =
                error instanceof Error && error.message.includes("429");

            if (is429 && modelType !== "fallback") {
                console.warn(
                    `[Verdict] ${MODELS[modelType]} quota exceeded, falling back to ${MODELS.fallback}`
                );
                continue;
            }

            throw error;
        }
    }

    throw new Error("[Verdict] All models exhausted — quota exceeded on all available models.");
}


