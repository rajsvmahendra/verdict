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
    waitingLabel: string;
    activeMessage: string;
    doneMessage: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
}

const AGENTS: Record<string, AgentConfig> = {
    resolver: {
        name: "Finding the company",
        waitingLabel: "Lookup",
        activeMessage: "Looking up the exact company you searched for…",
        doneMessage: "Found it — moving on to research",
        icon: ResolverIcon,
        color: "text-accent",
        bgColor: "bg-accent-soft",
    },
    research: {
        name: "Researching",
        waitingLabel: "Research",
        activeMessage: "Reading through financials, news, market data, and competitive landscape…",
        doneMessage: "Research complete — handing off to the analysts",
        icon: ResearchIcon,
        color: "text-blue-400",
        bgColor: "bg-blue-400/10",
    },
    bull: {
        name: "Making the case for",
        waitingLabel: "Bull side",
        activeMessage: "Building the strongest argument for why this is a good investment…",
        doneMessage: "Bull case ready",
        icon: BullIcon,
        color: "text-invest",
        bgColor: "bg-invest/10",
    },
    bear: {
        name: "Making the case against",
        waitingLabel: "Bear side",
        activeMessage: "Building the strongest argument for why you should stay away…",
        doneMessage: "Bear case ready",
        icon: BearIcon,
        color: "text-pass",
        bgColor: "bg-pass/10",
    },
    skeptic: {
        name: "Double-checking",
        waitingLabel: "Review",
        activeMessage: "Looking for weak arguments, missing info, or unsupported claims…",
        doneMessage: "Review complete — nothing slipped through",
        icon: SkepticIcon,
        color: "text-watchlist",
        bgColor: "bg-watchlist/10",
    },
    chair: {
        name: "Deciding the verdict",
        waitingLabel: "Verdict",
        activeMessage: "Weighing everything together to reach a final decision…",
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

const HEADLINE_MESSAGES: Record<string, string> = {
    resolver: "Figuring out which company you mean…",
    research: "Digging into the data — this is the thorough part…",
    bull: "Two analysts are debating at the same time…",
    skeptic: "Running a quality check on both sides…",
    chair: "Almost there — putting together your verdict…",
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
    const [showSkeleton, setShowSkeleton] = useState(false);

    const completedCount = Object.values(statuses).filter(
        (s) => s === "complete"
    ).length;

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
                setProgress(
                    Math.min(75, Math.round((completedSteps / totalSteps) * 100))
                );

                setStatuses((prev) => {
                    const next = { ...prev, [step.agent]: "complete" as AgentStatus };
                    if (step.parallel) next[step.parallel] = "complete";
                    return next;
                });
            }

            if (cancelled) return;

            setActiveAgent("chair");
            setStatuses((prev) => ({ ...prev, chair: "running" }));
            setShowSkeleton(true);

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

    return (
        <main className="min-h-screen bg-bg flex flex-col items-center px-4 relative overflow-hidden">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <motion.div
                    className="absolute w-[600px] h-[600px] rounded-full"
                    style={{
                        background: "radial-gradient(circle, rgba(224,140,82,0.04) 0%, transparent 70%)",
                        top: "20%",
                        left: "50%",
                        marginLeft: "-300px",
                    }}
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.7, 0.5] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>

            <div className="w-full max-w-2xl relative z-10 pt-[10vh] pb-16 space-y-8">
                {/* Company Header */}
                <motion.div
                    className="flex flex-col items-center text-center space-y-4"
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
                        <motion.h2
                            className="text-3xl font-bold text-text-primary tracking-tight"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            Researching {company}
                        </motion.h2>

                        <AnimatePresence mode="wait">
                            <motion.p
                                key={activeAgent}
                                className="text-sm text-text-secondary max-w-md mx-auto leading-relaxed"
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.25 }}
                            >
                                {HEADLINE_MESSAGES[activeAgent] ?? "Working on it…"}
                            </motion.p>
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Progress */}
                <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-text-muted">
                            Step {completedCount} of 6
                        </span>
                        <span className="text-xs font-mono text-text-secondary font-semibold">
                            {progress}%
                        </span>
                    </div>
                    <div className="h-1.5 bg-surface-raised rounded-full overflow-hidden">
                        <motion.div
                            className="h-full rounded-full bg-accent"
                            style={{ boxShadow: "0 0 12px rgba(224,140,82,0.4)" }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                        />
                    </div>
                    <p className="text-[11px] text-text-muted">
                        This usually takes 20–60 seconds. We&apos;re being thorough, not slow.
                    </p>
                </motion.div>

                {/* Steps */}
                <div className="space-y-2">
                    <StepCard agent="resolver" status={statuses.resolver} index={0} />
                    <StepCard agent="research" status={statuses.research} index={1} />

                    <div className="flex items-center gap-2 px-2 py-1">
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-[10px] text-text-muted tracking-wider uppercase">
                            These two run at the same time
                        </span>
                        <div className="flex-1 h-px bg-border" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <StepCard agent="bull" status={statuses.bull} index={2} />
                        <StepCard agent="bear" status={statuses.bear} index={2} />
                    </div>

                    <StepCard agent="skeptic" status={statuses.skeptic} index={3} />
                    <StepCard agent="chair" status={statuses.chair} index={4} />
                </div>

                {/* Skeleton Preview */}
                <AnimatePresence>
                    {showSkeleton && (
                        <motion.div
                            className="space-y-3 pt-2"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            <p className="section-label text-center">
                                Your verdict is being prepared…
                            </p>
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

function StepCard({
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

    const displayText =
        status === "running"
            ? config.activeMessage
            : status === "complete"
                ? config.doneMessage
                : "Waiting…";

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
            animate={{
                opacity: status === "idle" ? 0.4 : status === "complete" ? 0.7 : 1,
                x: 0,
            }}
            transition={{
                delay: 0.15 + index * 0.08,
                duration: 0.35,
                ease: [0.16, 1, 0.3, 1] as const,
            }}
        >
            <motion.div
                className={`
          w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
          transition-all duration-400
          ${status === "idle" ? "bg-border/20" : config.bgColor}
        `}
                animate={status === "running" ? { scale: [1, 1.05, 1] } : {}}
                transition={
                    status === "running"
                        ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
                        : {}
                }
            >
                <IconComponent
                    className={`w-4 h-4 transition-colors duration-300 ${status === "idle" ? "text-text-muted" : config.color
                        }`}
                />
            </motion.div>

            <div className="flex-1 min-w-0">
                <p
                    className={`text-sm font-semibold transition-colors duration-300 ${status === "idle" ? "text-text-muted" : "text-text-primary"
                        }`}
                >
                    {status === "idle" ? config.waitingLabel : config.name}
                </p>
                <AnimatePresence mode="wait">
                    <motion.p
                        key={`${agent}-${status}`}
                        className="text-xs text-text-muted truncate mt-0.5"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {displayText}
                    </motion.p>
                </AnimatePresence>
            </div>

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
                        <div
                            className={`w-6 h-6 rounded-full ${config.bgColor} flex items-center justify-center`}
                        >
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