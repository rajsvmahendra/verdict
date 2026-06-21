"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Spinner } from "@/components/ui/spinner";
import { CompanyLogo } from "@/components/ui/company-logo";
import { SkeletonCard, SkeletonBar } from "@/components/ui/skeleton-loader";
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
    activeMessage: string;
    doneMessage: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
}

const AGENTS: Record<string, AgentConfig> = {
    resolver: {
        name: "Resolver",
        role: "Entity Resolution",
        activeMessage: "Identifying and disambiguating your company…",
        doneMessage: "Company identified successfully",
        icon: ResolverIcon,
        color: "text-accent",
        bgColor: "bg-accent-soft",
    },
    research: {
        name: "Research",
        role: "Due Diligence",
        activeMessage: "Pulling business model, financials, market data, and recent news…",
        doneMessage: "Research complete — evidence gathered",
        icon: ResearchIcon,
        color: "text-blue-400",
        bgColor: "bg-blue-400/10",
    },
    bull: {
        name: "Bull",
        role: "Bullish Analyst",
        activeMessage: "Building the strongest possible case for investing…",
        doneMessage: "Bull case constructed",
        icon: BullIcon,
        color: "text-invest",
        bgColor: "bg-invest/10",
    },
    bear: {
        name: "Bear",
        role: "Bearish Analyst",
        activeMessage: "Building the strongest possible case against investing…",
        doneMessage: "Bear case constructed",
        icon: BearIcon,
        color: "text-pass",
        bgColor: "bg-pass/10",
    },
    skeptic: {
        name: "Skeptic",
        role: "Stress Tester",
        activeMessage: "Challenging unsupported claims and hunting for gaps…",
        doneMessage: "Stress test complete",
        icon: SkepticIcon,
        color: "text-watchlist",
        bgColor: "bg-watchlist/10",
    },
    chair: {
        name: "Chair",
        role: "Final Synthesis",
        activeMessage: "Weighing all evidence and computing the final verdict…",
        doneMessage: "Verdict ready",
        icon: ChairIcon,
        color: "text-purple-400",
        bgColor: "bg-purple-400/10",
    },
};

const AGENT_SEQUENCE: Array<{
    agent: string;
    delayMs: number;
    parallel?: string;
}> = [
        { agent: "resolver", delayMs: 1200 },
        { agent: "research", delayMs: 2500 },
        { agent: "bull", delayMs: 2000, parallel: "bear" },
        { agent: "skeptic", delayMs: 1800 },
    ];

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
    const [showSkeleton, setShowSkeleton] = useState(false);

    useEffect(() => {
        let cancelled = false;
        let creepInterval: NodeJS.Timeout | null = null;

        async function simulateProgress() {
            const totalSteps = AGENT_SEQUENCE.length + 1;
            let completedSteps = 0;

            for (const step of AGENT_SEQUENCE) {
                if (cancelled) return;

                setActiveAgent(step.agent);
                setStatuses((prev) => {
                    const next = { ...prev, [step.agent]: "running" as AgentStatus };
                    if (step.parallel) next[step.parallel] = "running";
                    return next;
                });

                await new Promise((r) => setTimeout(r, step.delayMs));
                if (cancelled) return;

                completedSteps += 1;
                setProgress(Math.min(75, Math.round((completedSteps / totalSteps) * 100)));

                setStatuses((prev) => {
                    const next = { ...prev, [step.agent]: "complete" as AgentStatus };
                    if (step.parallel) next[step.parallel] = "complete";
                    return next;
                });
            }

            if (cancelled) return;

            // Chair starts — show skeleton preview
            setActiveAgent("chair");
            setStatuses((prev) => ({ ...prev, chair: "running" }));
            setShowSkeleton(true);

            // Slowly creep toward 92%
            let current = 75;
            creepInterval = setInterval(() => {
                if (cancelled) return;
                current = Math.min(92, current + 0.5);
                setProgress(Math.round(current));
            }, 1200);
        }

        simulateProgress();
        return () => {
            cancelled = true;
            if (creepInterval) clearInterval(creepInterval);
        };
    }, []);

    const completedCount = Object.values(statuses).filter((s) => s === "complete").length;

    return (
        <main className="min-h-screen bg-bg flex flex-col items-center px-4 relative overflow-hidden">
            {/* Background animation */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <motion.div
                    className="absolute w-[600px] h-[600px] rounded-full"
                    style={{
                        background: "radial-gradient(circle, rgba(109,92,255,0.04) 0%, transparent 70%)",
                        top: "20%",
                        left: "50%",
                        marginLeft: "-300px",
                    }}
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.5, 0.7, 0.5],
                    }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>

            <div className="w-full max-w-2xl relative z-10 pt-[12vh] pb-16 space-y-10">

                {/* Company Header */}
                <motion.div
                    className="flex flex-col items-center text-center space-y-5"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                    <motion.div
                        className="float"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                    >
                        <CompanyLogo companyName={company} size="lg" />
                    </motion.div>

                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/20 bg-accent-soft text-xs text-accent font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                            Committee in Session
                        </div>
                        <h2 className="text-3xl font-bold text-text-primary tracking-tight">
                            {company}
                        </h2>
                    </div>

                    {/* Active message */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeAgent}
                            className="max-w-md"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.25 }}
                        >
                            <p className="text-sm text-text-secondary leading-relaxed">
                                {statuses[activeAgent] === "running"
                                    ? AGENTS[activeAgent]?.activeMessage
                                    : AGENTS[activeAgent]?.doneMessage}
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </motion.div>

                {/* Progress */}
                <motion.div
                    className="space-y-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-text-muted font-medium">
                            {completedCount}/6 agents complete
                        </span>
                        <span className="text-xs font-mono text-text-secondary font-semibold">
                            {progress}%
                        </span>
                    </div>
                    <div className="h-1.5 bg-surface-raised rounded-full overflow-hidden">
                        <motion.div
                            className="h-full rounded-full bg-accent"
                            style={{
                                boxShadow: "0 0 12px rgba(109,92,255,0.4)",
                            }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                        />
                    </div>
                    <p className="text-[11px] text-text-muted">
                        Analysis takes 20–60 seconds depending on data availability and company complexity.
                    </p>
                </motion.div>

                {/* Agent Cards */}
                <div className="space-y-2">
                    <AgentCard agent="resolver" status={statuses.resolver} index={0} />
                    <AgentCard agent="research" status={statuses.research} index={1} />

                    {/* Parallel indicator */}
                    <div className="flex items-center gap-2 px-2 py-1">
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-[10px] text-text-muted tracking-wider uppercase">
                            Running in parallel
                        </span>
                        <div className="flex-1 h-px bg-border" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <AgentCard agent="bull" status={statuses.bull} index={2} />
                        <AgentCard agent="bear" status={statuses.bear} index={2} />
                    </div>

                    <AgentCard agent="skeptic" status={statuses.skeptic} index={3} />
                    <AgentCard agent="chair" status={statuses.chair} index={4} />
                </div>

                {/* Skeleton Preview */}
                <AnimatePresence>
                    {showSkeleton && (
                        <motion.div
                            className="space-y-3 pt-4"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            <p className="section-label text-center">Preparing your verdict…</p>
                            <div className="grid grid-cols-2 gap-3">
                                <SkeletonBar />
                                <SkeletonBar />
                            </div>
                            <SkeletonCard lines={4} />
                            <div className="grid grid-cols-2 gap-3">
                                <SkeletonCard lines={3} />
                                <SkeletonCard lines={3} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
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
        rounded-xl border transition-all duration-400
        ${status === "running"
                    ? "card-elevated border-accent/15"
                    : status === "complete"
                        ? "card-static border-border/60 opacity-70"
                        : "bg-transparent border-border/15 opacity-40"
                }
      `}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: status === "idle" ? 0.4 : status === "complete" ? 0.7 : 1, x: 0 }}
            transition={{ delay: 0.15 + index * 0.08, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
            {/* Icon */}
            <motion.div
                className={`
          w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
          transition-all duration-400
          ${status === "idle" ? "bg-border/20" : config.bgColor}
        `}
                animate={status === "running" ? { scale: [1, 1.05, 1] } : {}}
                transition={status === "running" ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : {}}
            >
                <IconComponent
                    className={`w-4.5 h-4.5 transition-colors duration-300 ${status === "idle" ? "text-text-muted" : config.color
                        }`}
                />
            </motion.div>

            {/* Text */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p
                        className={`text-sm font-semibold transition-colors duration-300 ${status === "idle" ? "text-text-muted" : "text-text-primary"
                            }`}
                    >
                        {config.name}
                    </p>
                    <span className="text-[10px] tracking-wider uppercase text-text-muted font-medium">
                        {config.role}
                    </span>
                </div>
                <AnimatePresence mode="wait">
                    <motion.p
                        key={`${agent}-${status}`}
                        className="text-xs text-text-muted truncate mt-0.5"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {status === "running"
                            ? config.activeMessage
                            : status === "complete"
                                ? config.doneMessage
                                : config.role}
                    </motion.p>
                </AnimatePresence>
            </div>

            {/* Status */}
            <div className="flex-shrink-0">
                {status === "idle" && (
                    <span className="block w-2 h-2 rounded-full bg-border" />
                )}
                {status === "running" && <Spinner size="sm" color={config.color} />}
                {status === "complete" && (
                    <motion.div
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    >
                        <div className={`w-6 h-6 rounded-full ${config.bgColor} flex items-center justify-center`}>
                            <CheckIcon className={`w-3.5 h-3.5 ${config.color}`} />
                        </div>
                    </motion.div>
                )}
                {status === "error" && (
                    <div className="w-6 h-6 rounded-full bg-pass/10 flex items-center justify-center">
                        <XIcon className="w-3.5 h-3.5 text-pass" />
                    </div>
                )}
            </div>
        </motion.div>
    );
}