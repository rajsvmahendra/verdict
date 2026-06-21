/**
 * Verdict — LLM Client (OpenRouter)
 *
 * Replaces direct Gemini SDK with OpenRouter via OpenAI-compatible API.
 * All agents call getStructuredModelWithFallback() — no other files change.
 *
 * OpenRouter gives access to 400+ models with automatic fallback routing.
 * We use Gemini 2.5 Flash as primary, Gemini 2.0 Flash as fallback.
 */

import OpenAI from "openai";

// ─── Environment ──────────────────────────────────────────────────────────────

function getApiKey(): string {
    const key = process.env.OPENROUTER_API_KEY;
    if (!key) {
        throw new Error(
            "[Verdict] OPENROUTER_API_KEY is not set. " +
            "Add it to .env.local and restart the server."
        );
    }
    return key;
}

// ─── Client ───────────────────────────────────────────────────────────────────

let clientInstance: OpenAI | null = null;

function getClient(): OpenAI {
    if (!clientInstance) {
        clientInstance = new OpenAI({
            baseURL: "https://openrouter.ai/api/v1",
            apiKey: getApiKey(),
            defaultHeaders: {
                "HTTP-Referer": "https://verdict.app",
                "X-Title": "Verdict - AI Investment Research",
            },
        });
    }
    return clientInstance;
}

// ─── Models ───────────────────────────────────────────────────────────────────

export const MODELS = {
    fast: "google/gemini-2.5-flash",
    fallback: "google/gemini-2.0-flash-001",
    capable: "google/gemini-2.5-pro",
} as const;

export type ModelType = keyof typeof MODELS;

// ─── Core Call ────────────────────────────────────────────────────────────────

async function callModel(
    modelName: string,
    prompt: string
): Promise<string> {
    const client = getClient();

    const response = await client.chat.completions.create({
        model: modelName,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 4096,
        response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
        throw new Error(`[Verdict] Empty response from model: ${modelName}`);
    }

    return content;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Calls the fast model with automatic fallback on rate limit or error.
 * All six agents use this function — no agent touches the SDK directly.
 */
export async function getStructuredModelWithFallback(
    prompt: string
): Promise<string> {
    const models: Array<{ key: ModelType; name: string }> = [
        { key: "fast", name: MODELS.fast },
        { key: "fallback", name: MODELS.fallback },
    ];

    for (const model of models) {
        try {
            const result = await callModel(model.name, prompt);
            return result;
        } catch (error) {
            const is429 =
                error instanceof Error &&
                (error.message.includes("429") ||
                    error.message.includes("quota") ||
                    error.message.includes("rate limit"));

            if (is429 && model.key !== "fallback") {
                console.warn(
                    `[Verdict] ${model.name} rate limited, falling back to ${MODELS.fallback}`
                );
                continue;
            }

            throw error;
        }
    }

    throw new Error(
        "[Verdict] All models exhausted — rate limited on all available models."
    );
}

// ─── Legacy exports (unused but kept for type compatibility) ──────────────────

export function getModel(_type: ModelType = "fast") {
    throw new Error(
        "[Verdict] getModel() is not available with OpenRouter. Use getStructuredModelWithFallback()."
    );
}

export function getStructuredModel(_type: ModelType = "fast") {
    throw new Error(
        "[Verdict] getStructuredModel() is not available with OpenRouter. Use getStructuredModelWithFallback()."
    );
}