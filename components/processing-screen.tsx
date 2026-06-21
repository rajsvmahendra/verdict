"use client";

import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";

interface AgentDisplayConfig {
    name: string;
    role: string;
    icon: string;
    colorClass: string;
}

const AGENTS: Record<string, AgentDisplayConfig> = {
    resolver: {
        name: "Resolver",
        role: "Identifying company",
        icon: "🔍",
        colorClass: "text-text-secondary",
    },
    research: {
        name: "Research Agent",
        role: "Gathering evidence",
        icon: "📊",
        colorClass: "text-blue-400",
    },
    bull: {
        name: "Bull Agent",
        role: "Building bullish case",
        icon: "📈",
        colorClass: "text-invest",
    },
    bear: {
        name: "Bear Agent",
        role: "Building bearish case",
        icon: "📉",
        colorClass: "text-pass",
    },
    skeptic: {
        name: "Skeptic",
        role: "Stress-testing claims",
        icon: "🔎",
        colorClass: "text-watchlist",
    },
    chair: {
        name: "Chair",
        role: "Synthesizing verdict",
        icon: "⚖️",
        colorClass: "text-violet-400",
    },
};

type AgentStatus = "idle" | "running" | "complete" | "error";

const AGENT_SEQUENCE: Array<{
    agent: keyof typeof AGENTS;
    delayMs: number;
    parallel?: keyof typeof AGENTS;
}> = [
        { agent: "resolver", delayMs: 800 },
        { agent: "research", delayMs: 1800 },
        { agent: "bull", delayMs: 1500, parallel: "bear" },
        { agent: "skeptic", delayMs: 1200 },
        { agent: "chair", delayMs: 1200 },
    ];

interface ProcessingScreenProps {
    company: string;
}

export function ProcessingScreen({ company }: ProcessingScreenProps) {
    const [statuses, setStatuses] = useState<Record<keyof typeof AGENTS, AgentStatus>>({
        resolver: "idle",
        research: "idle",
        bull: "idle",
        bear: "idle",
        skeptic: "idle",
        chair: "idle",
    });

    const [currentMessage, setCurrentMessage] = useState(
        "Convening the committee…"
    );

    useEffect(() => {
        let cancelled = false;

        async function simulateProgress() {
            for (const step of AGENT_SEQUENCE) {
                if (cancelled) break;

                const agentConfig = AGENTS[step.agent];
                setCurrentMessage(`${agentConfig.icon} ${agentConfig.role}…`);

                setStatuses((prev) => {
                    const next = { ...prev, [step.agent]: "running" as AgentStatus };
                    if (step.parallel) {
                        next[step.parallel] = "running";
                    }
                    return next;
                });

                await new Promise((resolve) => setTimeout(resolve, step.delayMs));
                if (cancelled) break;

                setStatuses((prev) => {
                    const next = { ...prev, [step.agent]: "complete" as AgentStatus };
                    if (step.parallel) {
                        next[step.parallel] = "complete";
                    }
                    return next;
                });
            }
        }

        simulateProgress();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <main className="min-h-screen bg-bg flex flex-col items-center justify-center px-4">
            <div className="w-full max-w-3xl space-y-10 animate-fade-in">
                <div className="text-center space-y-2">
                    <p className="text-xs text-text-muted tracking-wider uppercase">
                        Analyzing
                    </p>
                    <h2 className="text-2xl font-semibold text-text-primary tracking-tight">
                        {company}
                    </h2>
                    <p className="text-sm text-text-secondary">{currentMessage}</p>
                </div>

                <div className="space-y-3">
                    <AgentRow agent="resolver" status={statuses.resolver} />
                    <AgentRow agent="research" status={statuses.research} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <AgentRow agent="bull" status={statuses.bull} />
                        <AgentRow agent="bear" status={statuses.bear} />
                    </div>

                    <AgentRow agent="skeptic" status={statuses.skeptic} />
                    <AgentRow agent="chair" status={statuses.chair} />
                </div>

                <p className="text-center text-xs text-text-muted">
                    The committee is deliberating · Bull and Bear run in parallel
                </p>
            </div>
        </main>
    );
}

function AgentRow({
    agent,
    status,
}: {
    agent: keyof typeof AGENTS;
    status: AgentStatus;
}) {
    const config = AGENTS[agent];

    return (
        <div
            className={`
        flex items-center gap-3 px-4 py-3
        rounded-lg border transition-all duration-300
        ${status === "running"
                    ? "bg-surface border-border-subtle"
                    : status === "complete"
                        ? "bg-surface/50 border-border-subtle"
                        : "bg-transparent border-transparent"
                }
      `}
        >
            <span className="text-base flex-shrink-0">{config.icon}</span>

            <div className="flex-1 min-w-0">
                <p
                    className={`text-sm font-medium ${status === "idle" ? "text-text-muted" : config.colorClass
                        }`}
                >
                    {config.name}
                </p>
                <p className="text-xs text-text-muted truncate">{config.role}</p>
            </div>

            <div className="flex-shrink-0">
                {status === "idle" && (
                    <span className="block w-2 h-2 rounded-full bg-border" />
                )}
                {status === "running" && <Spinner size="sm" />}
                {status === "complete" && (
                    <svg
                        className={`w-4 h-4 ${config.colorClass}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                )}
                {status === "error" && (
                    <svg
                        className="w-4 h-4 text-pass"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                )}
            </div>
        </div>
    );
}