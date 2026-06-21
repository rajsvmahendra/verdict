import { resolveCompany } from "@/lib/agents/resolver";
import { researchCompany } from "@/lib/agents/research";
import { buildBullCase } from "@/lib/agents/bull";
import { buildBearCase } from "@/lib/agents/bear";
import { runSkepticAnalysis } from "@/lib/agents/skeptic";
import { synthesizeVerdict } from "@/lib/agents/chair";
import type {
    AgentStatuses,
    BearCase,
    BullCase,
    ConfidenceScore,
    GraphError,
    ResearchData,
    ResolvedEntity,
    SkepticNotes,
    Source,
    VerdictGraphState,
} from "@/types/graph";

function setAgentStatus(
    state: VerdictGraphState,
    agent: keyof AgentStatuses,
    status: AgentStatuses[keyof AgentStatuses]
): VerdictGraphState {
    return {
        ...state,
        agentStatuses: {
            ...state.agentStatuses,
            [agent]: status,
        },
    };
}

function addGraphError(
    state: VerdictGraphState,
    agent: keyof AgentStatuses,
    message: string,
    recoverable: boolean
): VerdictGraphState {
    const error: GraphError = {
        agent,
        message,
        recoverable,
    };

    return {
        ...state,
        agentStatuses: {
            ...state.agentStatuses,
            [agent]: "error",
        },
        errors: [...state.errors, error],
    };
}

function createStubSource(id: string, title: string, url?: string): Source {
    return {
        id,
        title,
        url,
        retrievedAt: new Date().toISOString(),
    };
}

export async function resolverNode(
    inputState: VerdictGraphState
): Promise<VerdictGraphState> {
    let state = setAgentStatus(inputState, "resolver", "running");

    try {
        const companyName = state.companyNameRaw.trim();

        if (!companyName) {
            return {
                ...addGraphError(
                    state,
                    "resolver",
                    "Company name is required for resolution.",
                    true
                ),
                needsClarification: true,
                clarificationMessage: "Please enter a company name or ticker.",
            };
        }

        const result = await resolveCompany(companyName);

        if (result.resolved && result.resolvedEntity) {
            return {
                ...state,
                resolvedEntity: result.resolvedEntity,
                needsClarification: false,
                clarificationMessage: undefined,
                agentStatuses: {
                    ...state.agentStatuses,
                    resolver: "complete",
                },
            };
        }

        // Needs clarification
        return {
            ...state,
            needsClarification: true,
            clarificationMessage: result.clarificationMessage,
            agentStatuses: {
                ...state.agentStatuses,
                resolver: "complete",
            },
        };
    } catch (error) {
        return addGraphError(
            state,
            "resolver",
            error instanceof Error ? error.message : "Unknown resolver error.",
            false
        );
    }
}

export async function researchNode(
    inputState: VerdictGraphState
): Promise<VerdictGraphState> {
    let state = setAgentStatus(inputState, "research", "running");

    try {
        if (!state.resolvedEntity) {
            return addGraphError(
                state,
                "research",
                "Research Agent cannot run without resolvedEntity.",
                false
            );
        }

        const { researchData, sources } = await researchCompany(
            state.resolvedEntity.name,
            state.resolvedEntity.ticker,
            state.resolvedEntity.description
        );

        return {
            ...state,
            researchData,
            sources,
            agentStatuses: {
                ...state.agentStatuses,
                research: "complete",
            },
        };
    } catch (error) {
        return addGraphError(
            state,
            "research",
            error instanceof Error ? error.message : "Unknown research error.",
            false
        );
    }
}

export async function bullNode(
    inputState: VerdictGraphState
): Promise<VerdictGraphState> {
    let state = setAgentStatus(inputState, "bull", "running");

    try {
        if (!state.researchData || !state.resolvedEntity) {
            return addGraphError(
                state,
                "bull",
                "Bull Agent cannot run without researchData and resolvedEntity.",
                false
            );
        }

        const { bullCase } = await buildBullCase(
            state.resolvedEntity.name,
            state.researchData
        );

        return {
            ...state,
            bullCase,
            agentStatuses: {
                ...state.agentStatuses,
                bull: "complete",
            },
        };
    } catch (error) {
        return addGraphError(
            state,
            "bull",
            error instanceof Error ? error.message : "Unknown bull agent error.",
            false
        );
    }
}


export async function bearNode(
    inputState: VerdictGraphState
): Promise<VerdictGraphState> {
    let state = setAgentStatus(inputState, "bear", "running");

    try {
        if (!state.researchData || !state.resolvedEntity) {
            return addGraphError(
                state,
                "bear",
                "Bear Agent cannot run without researchData and resolvedEntity.",
                false
            );
        }

        const { bearCase } = await buildBearCase(
            state.resolvedEntity.name,
            state.researchData
        );

        return {
            ...state,
            bearCase,
            agentStatuses: {
                ...state.agentStatuses,
                bear: "complete",
            },
        };
    } catch (error) {
        return addGraphError(
            state,
            "bear",
            error instanceof Error ? error.message : "Unknown bear agent error.",
            false
        );
    }
}


export async function skepticNode(
    inputState: VerdictGraphState
): Promise<VerdictGraphState> {
    let state = setAgentStatus(inputState, "skeptic", "running");

    try {
        if (!state.bullCase || !state.bearCase || !state.researchData || !state.resolvedEntity) {
            return addGraphError(
                state,
                "skeptic",
                "Skeptic Agent cannot run without bullCase, bearCase, researchData, and resolvedEntity.",
                false
            );
        }

        const { skepticNotes } = await runSkepticAnalysis(
            state.resolvedEntity.name,
            state.bullCase,
            state.bearCase,
            state.researchData
        );

        return {
            ...state,
            skepticNotes,
            skepticInvoked: true,
            skepticSkipReason: undefined,
            agentStatuses: {
                ...state.agentStatuses,
                skeptic: "complete",
            },
        };
    } catch (error) {
        return addGraphError(
            state,
            "skeptic",
            error instanceof Error ? error.message : "Unknown skeptic agent error.",
            false
        );
    }
}

export async function chairNode(
    inputState: VerdictGraphState
): Promise<VerdictGraphState> {
    let state = setAgentStatus(inputState, "chair", "running");

    try {
        if (!state.bullCase || !state.bearCase || !state.resolvedEntity || !state.researchData) {
            return addGraphError(
                state,
                "chair",
                "Chair Agent cannot run without resolvedEntity, bullCase, bearCase, and researchData.",
                false
            );
        }

        const result = await synthesizeVerdict(
            state.resolvedEntity.name,
            state.bullCase,
            state.bearCase,
            state.skepticNotes,
            state.skepticInvoked ?? false,
            state.skepticSkipReason,
            state.researchData,
            state.sources ?? state.researchData.sources
        );
        return {
            ...state,
            verdict: result.verdict,
            confidenceScore: result.confidenceScore,
            finalThesis: result.finalThesis,
            keyStrengths: result.keyStrengths,
            keyRisks: result.keyRisks,
            strongestBullArgument: result.strongestBullArgument,
            strongestBearArgument: result.strongestBearArgument,
            skepticChallenge: result.skepticChallenge,
            verdictReasoning: result.verdictReasoning,
            bandingReason: result.bandingReason,
            sources: result.sources,
            agentStatuses: {
                ...state.agentStatuses,
                chair: "complete",
            },
        };
    } catch (error) {
        return addGraphError(
            state,
            "chair",
            error instanceof Error ? error.message : "Unknown chair agent error.",
            false
        );
    }
}