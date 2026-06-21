/**
 * Temporary test route to verify Gemini SDK connection.
 * Will be removed after Step 2 is complete.
 */

import { NextResponse } from "next/server";
import { getModel } from "@/lib/gemini";

export async function GET() {
    try {
        const model = getModel("fast");
        const result = await model.generateContent(
            "Respond with exactly: GEMINI_CONNECTION_OK"
        );
        const text = result.response.text().trim();

        return NextResponse.json({
            status: "success",
            response: text,
            model: "gemini-2.5-flash",
        });
    } catch (error) {
        console.error("[Verdict] Gemini test failed:", error);
        return NextResponse.json(
            {
                status: "error",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}