"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Spinner } from "@/components/ui/spinner";
import { CompanyLogo } from "@/components/ui/company-logo";
import {
    ResolverIcon,
    ResearchIcon,
    BullIcon,
    BearIcon,
    SkepticIcon,
    ChairIcon,
    CheckIcon,
    XIcon,
} from "@/components/ui/icons";

type AgentStatus = "idle" | "running" | "complete" | "error";

interface AgentConfig {
    name: string;
    role: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
}

const AGENTS: Record<string, AgentConfig> = {
    resolver: {
        name: "Resolver",
        role: "Entity Resolution",
        description: "Identifying and disambiguating the company",
        icon: ResolverIcon,
        color: "text-accent",
        bgColor: "bg-accent/10",
    },
    research: {
        name: "Research",
        role: "Due Diligence",
        description: "Gathering business model, financials, and market data",
        icon: ResearchIcon,
        color: "text-blue-400",
        bgColor: "bg-blue-400/10",
    },
    bull: {
        name: "Bull",
        role: "Bullish Analysis",
        description: "Building the strongest case for investing",
        icon: BullIcon,
        color: "text-invest",
        bgColor: "bg-invest/10",
    },
    bear: {
        name: "Bear",
        role: "Bearish Analysis",
        description: "Building the strongest case against investing",
        icon: BearIcon,
        color: "text-pass",
        bgColor: "bg-pass/10",
    },
    skeptic: {
        name: "Skeptic",
        role: "Stress Testing",
        description: "Challenging unsupported claims and finding gaps",
        icon: SkepticIcon,
        color: "text-watchlist",
        bgColor: "bg-watchlist/10",
    },
    chair: {
        name: "Chair",
        role: "Final Synthesis",
        description: "Weighing all evidence and delivering the verdict",
        icon: ChairIcon,
        color: "text-violet-400",
        bgColor: "bg-violet-400/10",
    },
};

const AGENT_SEQUENCE: Array<{
    agent: string;
    delayMs: number;
    parallel?: string;
}> = [
        { agent: "resolver", delayMs: 1200 },
        { agent: "research", delayMs: 2200 },
        { agent: "bull", delayMs: 1800, parallel: "bear" },
        { agent: "skeptic", delayMs: 1500 },
    ];

const STATUS_MESSAGES: Record<string, string> = {
    resolver: "Resolving the exact company entity and checking ambiguity…",
    research: "Pulling business model, financials, competition, and recent developments…",
    bull: "Bull and Bear are now debating in parallel from the same evidence set…",
    skeptic: "Skeptic is stress-testing the stronger argument for unsupported claims…",
    chair: "The Chair is synthesizing the full committee discussion into a final verdict…",
};

interface ProcessingScreenProps {
    company: string;
}

export function ProcessingScreen({ company }: ProcessingScreenProps) {
    const [statuses, setStatuses] = useState<Record<string, AgentStatus>>({
        resolver: "idle",
        research: "idle",
        bull: "idle",
        bear: "idle",
        skeptic: "idle",
        chair: "idle",
    });

    const [activeAgent, setActiveAgent] = useState<string>("resolver");
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let cancelled = false;
        let loopInterval: NodeJS.Timeout | null = null;

        async function simulateProgress() {
            const totalSteps = AGENT_SEQUENCE.length + 1;
            let completedSteps = 0;

            for (const step of AGENT_SEQUENCE) {
                if (cancelled) return;

                setActiveAgent(step.agent);

                setStatuses((prev) => {
                    const next = { ...prev, [step.agent]: "running" as AgentStatus };
                    if (step.parallel) {
                        next[step.parallel] = "running";
                    }
                    return next;
                });

                await new Promise((r) => setTimeout(r, step.delayMs));
                if (cancelled) return;

                completedSteps += 1;
                const nextProgress = Math.min(
                    78,
                    Math.round((completedSteps / totalSteps) * 100)
                );
                setProgress(nextProgress);

                setStatuses((prev) => {
                    const next = { ...prev, [step.agent]: "complete" as AgentStatus };
                    if (step.parallel) {
                        next[step.parallel] = "complete";
                    }
                    return next;
                });
            }

            // Chair starts and remains running until the real API call completes
            if (cancelled) return;

            setActiveAgent("chair");
            setStatuses((prev) => ({
                ...prev,
                chair: "running",
            }));

            // Slowly creep from ~78% to 92%, never 100% before real response
            let current = 78;
            loopInterval = setInterval(() => {
                if (cancelled) return;
                current = Math.min(92, current + 1);
                setProgress(current);
            }, 1800);
        }

        simulateProgress();

        return () => {
            cancelled = true;
            if (loopInterval) clearInterval(loopInterval);
        };
    }, []);

    return (
        <main className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 relative overflow-hidden">
            <motion.div
                className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
                style={{
                    background:
                        "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)",
                }}
                animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />

            <motion.div
                className="w-full max-w-2xl space-y-10 relative z-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="text-center space-y-5">
                    <motion.div
                        className="flex items-center justify-center"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.4 }}
                    >
                        <CompanyLogo companyName={company} size="lg" />
                    </motion.div>

                    <div className="space-y-2">
                        <motion.p
                            className="text-[11px] text-accent tracking-[0.25em] uppercase font-semibold"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            Committee in Session
                        </motion.p>
                        <motion.h2
                            className="text-3xl font-bold text-text-primary tracking-tight"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            {company}
                        </motion.h2>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.p
                            key={activeAgent}
                            className="text-sm text-text-secondary max-w-md mx-auto"
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.3 }}
                        >
                            {STATUS_MESSAGES[activeAgent] ?? "Processing…"}
                        </motion.p>
                    </AnimatePresence>
                </div>

                <div className="space-y-2">
                    <div className="h-1 bg-surface-raised rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-accent rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                    </div>
                    <div className="flex justify-between text-[10px] text-text-muted font-mono">
                        <span>Processing</span>
                        <span>{progress}%</span>
                    </div>
                    <p className="text-[11px] text-text-muted leading-relaxed">
                        Real research runs can take 20–60 seconds depending on model latency and company complexity.
                    </p>
                </div>

                <div className="space-y-2">
                    <AgentCard agent="resolver" status={statuses.resolver} index={0} />
                    <AgentCard agent="research" status={statuses.research} index={1} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <AgentCard agent="bull" status={statuses.bull} index={2} />
                        <AgentCard agent="bear" status={statuses.bear} index={2} />
                    </div>

                    <AgentCard agent="skeptic" status={statuses.skeptic} index={3} />
                    <AgentCard agent="chair" status={statuses.chair} index={4} />
                </div>

                <motion.div
                    className="flex items-center justify-center gap-3 text-[10px] text-text-muted"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                >
                    <span className="h-px w-8 bg-border" />
                    <span className="tracking-[0.15em] uppercase">
                        Bull &amp; Bear run simultaneously · Skeptic intervenes if needed
                    </span>
                    <span className="h-px w-8 bg-border" />
                </motion.div>
            </motion.div>
        </main>
    );
}

function AgentCard({
    agent,
    status,
    index,
}: {
    agent: string;
    status: AgentStatus;
    index: number;
}) {
    const config = AGENTS[agent];
    if (!config) return null;

    const IconComponent = config.icon;

    return (
        <motion.div
            className={`
        flex items-center gap-4 px-5 py-4
        rounded-xl border transition-all duration-500
        ${status === "running"
                    ? "glass-card glow-border"
                    : status === "complete"
                        ? "glass-card border-border/50"
                        : "bg-transparent border-border/20"
                }
      `}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + index * 0.08, duration: 0.3 }}
        >
            <div
                className={`
          w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0
          transition-colors duration-300
          ${status === "idle" ? "bg-border/30" : config.bgColor}
        `}
            >
                <IconComponent
                    className={`w-4 h-4 transition-colors duration-300 ${status === "idle" ? "text-text-muted" : config.color
                        }`}
                />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p
                        className={`text-sm font-semibold transition-colors duration-300 ${status === "idle" ? "text-text-muted" : "text-text-primary"
                            }`}
                    >
                        {config.name}
                    </p>
                    <span
                        className={`text-[10px] tracking-wider uppercase font-medium transition-colors duration-300 ${status === "idle" ? "text-text-muted/50" : "text-text-muted"
                            }`}
                    >
                        {config.role}
                    </span>
                </div>
                <p
                    className={`text-xs transition-colors duration-300 truncate ${status === "running" ? "text-text-secondary" : "text-text-muted/70"
                        }`}
                >
                    {config.description}
                </p>
            </div>

            <div className="flex-shrink-0">
                {status === "idle" && (
                    <span className="block w-2 h-2 rounded-full bg-border" />
                )}
                {status === "running" && <Spinner size="sm" color={config.color} />}
                {status === "complete" && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                        <div
                            className={`w-5 h-5 rounded-full ${config.bgColor} flex items-center justify-center`}
                        >
                            <CheckIcon className={`w-3 h-3 ${config.color}`} />
                        </div>
                    </motion.div>
                )}
                {status === "error" && (
                    <div className="w-5 h-5 rounded-full bg-pass/10 flex items-center justify-center">
                        <XIcon className="w-3 h-3 text-pass" />
                    </div>
                )}
            </div>
        </motion.div>
    );
}