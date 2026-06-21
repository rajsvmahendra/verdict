import { resolveCompany } from "@/lib/agents/resolver";
import { researchCompany } from "@/lib/agents/research";
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

        const bullCase: BullCase = {
            thesis: `${state.resolvedEntity.name} has a plausible upside case based on its stubbed business model, market expansion signals, and placeholder competitive position.`,
            evidence: [
                state.researchData.businessModel,
                state.researchData.recentNews[0] ??
                "Insufficient evidence: no recent news available.",
                state.researchData.marketPosition,
            ],
            strengthRating: 7,
        };

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

        const bearCase: BearCase = {
            risks: `${state.resolvedEntity.name} faces a plausible downside case due to competitive pressure, incomplete financial visibility, and execution risk in placeholder expansion efforts.`,
            evidence: [
                state.researchData.marketPosition,
                state.researchData.financialSnapshot ??
                "Insufficient evidence: no financial snapshot available.",
                state.researchData.recentNews[1] ??
                "Insufficient evidence: no second news item available.",
            ],
            severityRating: 5,
        };

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
        if (!state.bullCase || !state.bearCase) {
            return addGraphError(
                state,
                "skeptic",
                "Skeptic Agent cannot run without both bullCase and bearCase.",
                false
            );
        }

        const skepticNotes: SkepticNotes = {
            flaggedClaims: [
                "Bull case may overstate durability of placeholder competitive advantages.",
            ],
            missingConsiderations: [
                "Need deeper validation of financial quality and market share durability.",
            ],
            adjustedConfidenceDelta: -0.1,
        };

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
        if (!state.bullCase || !state.bearCase || !state.resolvedEntity) {
            return addGraphError(
                state,
                "chair",
                "Chair Agent cannot run without resolvedEntity, bullCase, and bearCase.",
                false
            );
        }

        const decisionConfidenceBase =
            (state.bullCase.strengthRating + (10 - state.bearCase.severityRating)) /
            20;
        const skepticAdjustment = state.skepticNotes?.adjustedConfidenceDelta ?? 0;

        const confidenceScore: ConfidenceScore = {
            decisionConfidence: Math.max(
                0,
                Math.min(1, decisionConfidenceBase + skepticAdjustment)
            ),
            dataQualityConfidence: state.researchData?.dataCompleteness ?? 0.4,
        };

        return {
            ...state,
            verdict: "WATCHLIST",
            confidenceScore,
            finalThesis: `Stub synthesis: ${state.resolvedEntity.name} shows both upside and risk signals, so the placeholder graph returns a neutral Watchlist outcome at scaffolding stage.`,
            keyStrengths: [
                "Plausible business model",
                "Recent expansion-oriented signals",
            ],
            keyRisks: [
                "Incomplete financial visibility",
                "Competitive pressure remains unresolved",
            ],
            skepticInvoked: state.skepticInvoked ?? false,
            skepticSkipReason:
                state.skepticInvoked === true
                    ? undefined
                    : "Skeptic was not invoked by stub graph conditions.",
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