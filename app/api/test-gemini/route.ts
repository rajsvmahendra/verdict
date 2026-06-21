/**
 * Temporary test route to verify OpenRouter connection.
 */

import { NextResponse } from "next/server";
import { getStructuredModelWithFallback } from "@/lib/gemini";

export async function GET() {
    try {
        const result = await getStructuredModelWithFallback(
            'Respond with exactly this JSON: {"status": "OPENROUTER_CONNECTION_OK", "model": "gemini-2.5-flash"}'
        );

        return NextResponse.json({
            status: "success",
            response: JSON.parse(result),
            provider: "OpenRouter",
        });
    } catch (error) {
        console.error("[Verdict] OpenRouter test failed:", error);
        return NextResponse.json(
            {
                status: "error",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}