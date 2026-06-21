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