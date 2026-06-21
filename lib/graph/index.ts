/**
 * Verdict — LangGraph.js Graph Assembly
 */

import { StateGraph, Annotation, START, END } from "@langchain/langgraph";
import type {
    VerdictGraphState,
    AgentStatus,
    AgentStatuses,
    GraphError,
    ResolvedEntity,
    ResearchData,
    BullCase,
    BearCase,
    SkepticNotes,
    ConfidenceScore,
    Verdict,
    Source,
} from "@/types/graph";
import { createInitialState } from "@/types/graph";
import {
    resolverNode,
    researchNode,
    bullNode,
    bearNode,
    skepticNode,
    chairNode,
} from "./nodes";
import {
    routeAfterResolver,
    routeAfterDebate,
    getSkepticSkipReason,
} from "./conditions";

// ─── Agent Status Merge ───────────────────────────────────────────────────────
// Parallel branches (Bull + Bear) each write agentStatuses from their own
// snapshot. Without a monotonic merge, whichever branch lands second will
// overwrite the other branch's "complete" with a stale "idle".
// This reducer ensures status only ever moves forward: idle → running → complete/error.

function mergeAgentStatus(
    current: AgentStatus,
    updated: AgentStatus
): AgentStatus {
    if (updated === "error") return "error";
    if (updated === "complete") return "complete";
    if (updated === "running") {
        if (current === "complete" || current === "error") return current;
        return "running";
    }
    // "idle" never overwrites a more advanced state
    return current;
}

function mergeAgentStatuses(
    current: AgentStatuses,
    updated: AgentStatuses
): AgentStatuses {
    return {
        resolver: mergeAgentStatus(current.resolver, updated.resolver),
        research: mergeAgentStatus(current.research, updated.research),
        bull: mergeAgentStatus(current.bull, updated.bull),
        bear: mergeAgentStatus(current.bear, updated.bear),
        skeptic: mergeAgentStatus(current.skeptic, updated.skeptic),
        chair: mergeAgentStatus(current.chair, updated.chair),
    };
}

// ─── State Annotation ─────────────────────────────────────────────────────────

const VerdictStateAnnotation = Annotation.Root({
    companyNameRaw: Annotation<string>({
        reducer: (_current: string, updated: string) => updated,
        default: () => "",
    }),
    resolvedEntity: Annotation<ResolvedEntity | undefined>({
        reducer: (
            _current: ResolvedEntity | undefined,
            updated: ResolvedEntity | undefined
        ) => updated,
        default: () => undefined,
    }),
    needsClarification: Annotation<boolean | undefined>({
        reducer: (
            _current: boolean | undefined,
            updated: boolean | undefined
        ) => updated,
        default: () => undefined,
    }),
    clarificationMessage: Annotation<string | undefined>({
        reducer: (
            _current: string | undefined,
            updated: string | undefined
        ) => updated,
        default: () => undefined,
    }),
    researchData: Annotation<ResearchData | undefined>({
        reducer: (
            _current: ResearchData | undefined,
            updated: ResearchData | undefined
        ) => updated,
        default: () => undefined,
    }),
    bullCase: Annotation<BullCase | undefined>({
        reducer: (
            _current: BullCase | undefined,
            updated: BullCase | undefined
        ) => updated,
        default: () => undefined,
    }),
    bearCase: Annotation<BearCase | undefined>({
        reducer: (
            _current: BearCase | undefined,
            updated: BearCase | undefined
        ) => updated,
        default: () => undefined,
    }),
    skepticNotes: Annotation<SkepticNotes | undefined>({
        reducer: (
            _current: SkepticNotes | undefined,
            updated: SkepticNotes | undefined
        ) => updated,
        default: () => undefined,
    }),
    skepticInvoked: Annotation<boolean | undefined>({
        reducer: (
            _current: boolean | undefined,
            updated: boolean | undefined
        ) => updated,
        default: () => undefined,
    }),
    skepticSkipReason: Annotation<string | undefined>({
        reducer: (
            _current: string | undefined,
            updated: string | undefined
        ) => updated,
        default: () => undefined,
    }),
    verdict: Annotation<Verdict | undefined>({
        reducer: (
            _current: Verdict | undefined,
            updated: Verdict | undefined
        ) => updated,
        default: () => undefined,
    }),
    confidenceScore: Annotation<ConfidenceScore | undefined>({
        reducer: (
            _current: ConfidenceScore | undefined,
            updated: ConfidenceScore | undefined
        ) => updated,
        default: () => undefined,
    }),
    finalThesis: Annotation<string | undefined>({
        reducer: (
            _current: string | undefined,
            updated: string | undefined
        ) => updated,
        default: () => undefined,
    }),
    keyStrengths: Annotation<string[] | undefined>({
        reducer: (
            _current: string[] | undefined,
            updated: string[] | undefined
        ) => updated,
        default: () => undefined,
    }),
    keyRisks: Annotation<string[] | undefined>({
        reducer: (
            _current: string[] | undefined,
            updated: string[] | undefined
        ) => updated,
        default: () => undefined,
    }),
    sources: Annotation<Source[] | undefined>({
        reducer: (
            _current: Source[] | undefined,
            updated: Source[] | undefined
        ) => updated,
        default: () => undefined,
    }),
    agentStatuses: Annotation<AgentStatuses>({
        reducer: (current: AgentStatuses, updated: AgentStatuses) =>
            mergeAgentStatuses(current, updated),
        default: () => ({
            resolver: "idle",
            research: "idle",
            bull: "idle",
            bear: "idle",
            skeptic: "idle",
            chair: "idle",
        }),
    }),
    errors: Annotation<GraphError[]>({
        reducer: (current: GraphError[], updated: GraphError[]) => {
            if (!updated || updated.length === 0) return current;
            return [...current, ...updated];
        },
        default: () => [],
    }),
});

// ─── Internal Nodes ───────────────────────────────────────────────────────────

async function mergeDebateNode(
    _state: VerdictGraphState
): Promise<Partial<VerdictGraphState>> {
    return {};
}

async function skipSkepticNode(
    state: VerdictGraphState
): Promise<Partial<VerdictGraphState>> {
    return {
        skepticInvoked: false,
        skepticSkipReason: getSkepticSkipReason(state),
        agentStatuses: {
            ...state.agentStatuses,
            skeptic: "complete",
        },
    };
}

async function clarificationNode(
    _state: VerdictGraphState
): Promise<Partial<VerdictGraphState>> {
    return {};
}

// ─── Graph Builder ────────────────────────────────────────────────────────────

export function buildVerdictGraph() {
    const graph = new StateGraph(VerdictStateAnnotation)
        .addNode("resolver", resolverNode)
        .addNode("research", researchNode)
        .addNode("bull", bullNode)
        .addNode("bear", bearNode)
        .addNode("mergeDebate", mergeDebateNode)
        .addNode("skeptic", skepticNode)
        .addNode("skipSkeptic", skipSkepticNode)
        .addNode("chair", chairNode)
        .addNode("clarification", clarificationNode)
        .addEdge(START, "resolver")
        .addConditionalEdges("resolver", routeAfterResolver, {
            needsClarification: "clarification",
            resolved: "research",
        })
        .addEdge("research", "bull")
        .addEdge("research", "bear")
        .addEdge("bull", "mergeDebate")
        .addEdge("bear", "mergeDebate")
        .addConditionalEdges("mergeDebate", routeAfterDebate, {
            invokeSkeptic: "skeptic",
            skipSkeptic: "skipSkeptic",
        })
        .addEdge("skeptic", "chair")
        .addEdge("skipSkeptic", "chair")
        .addEdge("chair", END)
        .addEdge("clarification", END);

    return graph.compile();
}

// ─── Runner ───────────────────────────────────────────────────────────────────

export async function runVerdictGraph(
    companyNameRaw: string
): Promise<VerdictGraphState> {
    const compiled = buildVerdictGraph();
    const initialState = createInitialState(companyNameRaw);
    const result = await compiled.invoke(initialState);
    return result as VerdictGraphState;
}