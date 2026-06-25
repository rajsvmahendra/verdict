/**
 * Connection test route — verifies Groq is reachable.
 */

import { NextResponse } from "next/server";
import { getStructuredModelWithFallback } from "@/lib/gemini";

export async function GET() {
    try {
        const result = await getStructuredModelWithFallback(
            'Respond with exactly this JSON and nothing else: {"status": "GROQ_CONNECTION_OK", "model": "llama-3.3-70b-versatile"}'
        );

        return NextResponse.json({
            status: "success",
            response: JSON.parse(result),
            provider: "Groq",
        });
    } catch (error) {
        console.error("[Verdict] Groq test failed:", error);
        return NextResponse.json(
            {
                status: "error",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}