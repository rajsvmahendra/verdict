/**
 * Verdict — /api/analyze
 *
 * POST endpoint that accepts a company name and runs the full
 * LangGraph investment research pipeline.
 *
 * Request:  { "company": "Tesla" }
 * Response: Full VerdictGraphState (typed)
 *
 * No authentication at MVP scope.
 */

import { NextRequest, NextResponse } from "next/server";
import { runVerdictGraph } from "@/lib/graph";
import type { VerdictGraphState } from "@/types/graph";

interface AnalyzeRequest {
    company: string;
}

function isValidRequest(body: unknown): body is AnalyzeRequest {
    return (
        typeof body === "object" &&
        body !== null &&
        "company" in body &&
        typeof (body as AnalyzeRequest).company === "string" &&
        (body as AnalyzeRequest).company.trim().length > 0
    );
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const body: unknown = await request.json();

        if (!isValidRequest(body)) {
            return NextResponse.json(
                {
                    error: "Invalid request. Provide { \"company\": \"<company name>\" }.",
                },
                { status: 400 }
            );
        }

        const companyName = body.company.trim();
        const result: VerdictGraphState = await runVerdictGraph(companyName);

        // If the graph ended at clarification, return a 200 with the clarification flag
        if (result.needsClarification) {
            return NextResponse.json(
                {
                    status: "clarification_needed",
                    message:
                        result.clarificationMessage ??
                        "The input was ambiguous. Please clarify.",
                    state: result,
                },
                { status: 200 }
            );
        }

        // If there are unrecoverable errors, return 500 with full state for debugging
        const unrecoverableErrors = result.errors.filter((e) => !e.recoverable);
        if (unrecoverableErrors.length > 0) {
            return NextResponse.json(
                {
                    status: "error",
                    errors: unrecoverableErrors,
                    state: result,
                },
                { status: 500 }
            );
        }

        // Success — full verdict
        return NextResponse.json(
            {
                status: "success",
                verdict: result.verdict,
                confidenceScore: result.confidenceScore,
                finalThesis: result.finalThesis,
                keyStrengths: result.keyStrengths,
                keyRisks: result.keyRisks,
                bullCase: result.bullCase,
                bearCase: result.bearCase,
                skepticNotes: result.skepticNotes,
                skepticInvoked: result.skepticInvoked,
                skepticSkipReason: result.skepticSkipReason,
                sources: result.sources,
                resolvedEntity: result.resolvedEntity,
                agentStatuses: result.agentStatuses,
                errors: result.errors,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("[Verdict] Unhandled error in /api/analyze:", error);
        return NextResponse.json(
            {
                status: "error",
                error:
                    error instanceof Error
                        ? error.message
                        : "An unexpected error occurred.",
            },
            { status: 500 }
        );
    }
}