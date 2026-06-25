/**
 * Verdict — LLM Client (Groq)
 *
 * Replaces OpenRouter with Groq for faster inference and generous free tier.
 * All agents call getStructuredModelWithFallback() — no other files change.
 *
 * Primary model: llama-3.3-70b-versatile (best quality on Groq free tier)
 * Fallback model: llama-3.1-8b-instant (faster, lighter)
 */

import Groq from "groq-sdk";

// ─── Environment ──────────────────────────────────────────────────────────────

function getApiKey(): string {
    const key = process.env.GROQ_API_KEY;
    if (!key) {
        throw new Error(
            "[Verdict] GROQ_API_KEY is not set. " +
            "Add it to .env.local and restart the server."
        );
    }
    return key;
}

// ─── Client Singleton ─────────────────────────────────────────────────────────

let clientInstance: Groq | null = null;

function getClient(): Groq {
    if (!clientInstance) {
        clientInstance = new Groq({
            apiKey: getApiKey(),
        });
    }
    return clientInstance;
}

// ─── Models ───────────────────────────────────────────────────────────────────

export const MODELS = {
    fast: "llama-3.3-70b-versatile",
    fallback: "llama-3.1-8b-instant",
    capable: "llama-3.3-70b-versatile",
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
        messages: [
            {
                role: "system",
                content:
                    "You are a structured financial research assistant. Always respond with valid JSON only. No markdown, no explanation outside the JSON object.",
            },
            {
                role: "user",
                content: prompt,
            },
        ],
        temperature: 0.3,
        max_tokens: 4096,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
        throw new Error(`[Verdict] Empty response from model: ${modelName}`);
    }

    // Strip markdown code blocks if model wraps JSON in them
    const cleaned = content
        .trim()
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

    return cleaned;
}

// ─── Public API ───────────────────────────────────────────────────────────────

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
            const isRateLimit =
                error instanceof Error &&
                (error.message.includes("429") ||
                    error.message.includes("rate limit") ||
                    error.message.includes("quota"));

            if (isRateLimit && model.key !== "fallback") {
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

// ─── Legacy stubs (kept for import compatibility) ─────────────────────────────

export function getModel(_type: ModelType = "fast") {
    throw new Error(
        "[Verdict] getModel() is not available. Use getStructuredModelWithFallback()."
    );
}

export function getStructuredModel(_type: ModelType = "fast") {
    throw new Error(
        "[Verdict] getStructuredModel() is not available. Use getStructuredModelWithFallback()."
    );
}