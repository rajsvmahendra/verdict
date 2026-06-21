"use client";

import { motion } from "framer-motion";
import { VerdictBadge } from "@/components/ui/verdict-badge";
import { ConfidenceBar } from "@/components/ui/confidence-bar";
import { CompanyLogo } from "@/components/ui/company-logo";
import { ArrowLeftIcon, BullIcon, BearIcon, SkepticIcon, ChairIcon, ShieldIcon, AlertIcon } from "@/components/ui/icons";
import type { AnalyzeSuccessResponse } from "@/lib/api-client";

interface ResultsScreenProps {
    data: AnalyzeSuccessResponse;
    company: string;
    onReset: () => void;
}

const stagger = {
    parent: {
        animate: { transition: { staggerChildren: 0.08 } },
    },
    child: {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4, ease: "easeOut" },
    },
};

export function ResultsScreen({ data, company, onReset }: ResultsScreenProps) {
    return (
        <main className="min-h-screen bg-bg px-4 py-8 md:py-12">
            <motion.div
                className="max-w-4xl mx-auto space-y-6"
                variants={stagger.parent}
                initial="initial"
                animate="animate"
            >
                {/* Navigation */}
                <motion.div
                    className="flex items-center justify-between"
                    variants={stagger.child}
                >
                    <button
                        onClick={onReset}
                        className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors group"
                    >
                        <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        <span>New search</span>
                    </button>
                    <span className="text-xs text-text-muted font-mono tracking-wider">
                        {data.resolvedEntity.ticker ?? "PRIVATE"}
                    </span>
                </motion.div>

                {/* ═══════════════════════ VERDICT HERO ═══════════════════════ */}
                <motion.section
                    className="glass-card rounded-2xl p-6 md:p-8 space-y-6"
                    variants={stagger.child}
                >
                    {/* Company identity */}
                    <div className="flex items-start gap-5">
                        <CompanyLogo
                            companyName={data.resolvedEntity.name}
                            ticker={data.resolvedEntity.ticker}
                            size="lg"
                        />
                        <div className="flex-1 min-w-0 space-y-1">
                            <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">
                                {data.resolvedEntity.name}
                            </h1>
                            <p className="text-sm text-text-secondary leading-relaxed">
                                {data.resolvedEntity.description}
                            </p>
                        </div>
                    </div>

                    {/* Verdict + Confidence */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-5 pt-2">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 15 }}
                        >
                            <VerdictBadge verdict={data.verdict} size="lg" />
                        </motion.div>

                        <div className="flex-1 grid grid-cols-2 gap-5 max-w-sm">
                            <ConfidenceBar
                                label="Decision Confidence"
                                value={data.confidenceScore.decisionConfidence}
                                color="decision"
                                delay={0.4}
                            />
                            <ConfidenceBar
                                label="Data Quality"
                                value={data.confidenceScore.dataQualityConfidence}
                                color="quality"
                                delay={0.5}
                            />
                        </div>
                    </div>

                    {/* Banding reason */}
                    <div className="px-4 py-3 rounded-xl bg-surface border border-border-subtle">
                        <p className="text-[10px] text-accent tracking-[0.2em] uppercase font-semibold mb-1.5">
                            Why this verdict
                        </p>
                        <p className="text-sm text-text-secondary leading-relaxed">
                            {data.explainability.whyThisVerdict}
                        </p>
                    </div>
                </motion.section>

                {/* ═══════════════════════ THESIS ═══════════════════════ */}
                <motion.section
                    className="glass-card rounded-2xl p-6 md:p-8 space-y-3"
                    variants={stagger.child}
                >
                    <SectionLabel icon={ChairIcon} label="Investment Thesis" color="text-violet-400" />
                    <p className="text-base text-text-primary leading-relaxed font-light">
                        {data.finalThesis}
                    </p>
                </motion.section>

                {/* ═══════════════════════ BULL vs BEAR ═══════════════════════ */}
                <motion.section className="space-y-4" variants={stagger.child}>
                    <div className="px-1">
                        <p className="text-[10px] text-text-muted tracking-[0.2em] uppercase font-semibold">
                            Adversarial Debate
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Bull */}
                        <motion.div
                            className="glass-card rounded-2xl p-6 space-y-4 border-invest/10 hover:border-invest/25 transition-colors duration-300"
                            variants={stagger.child}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-invest/10 flex items-center justify-center">
                                        <BullIcon className="w-4 h-4 text-invest" />
                                    </div>
                                    <h3 className="text-sm font-bold text-invest tracking-wide">
                                        Bull Case
                                    </h3>
                                </div>
                                <span className="text-xs font-mono text-text-muted bg-surface-raised px-2 py-0.5 rounded-md">
                                    {data.bullCase.strengthRating}/10
                                </span>
                            </div>

                            <p className="text-sm text-text-secondary leading-relaxed">
                                {data.bullCase.thesis}
                            </p>

                            <EvidenceList
                                items={data.bullCase.evidence}
                                color="bg-invest/40"
                            />
                        </motion.div>

                        {/* Bear */}
                        <motion.div
                            className="glass-card rounded-2xl p-6 space-y-4 border-pass/10 hover:border-pass/25 transition-colors duration-300"
                            variants={stagger.child}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-pass/10 flex items-center justify-center">
                                        <BearIcon className="w-4 h-4 text-pass" />
                                    </div>
                                    <h3 className="text-sm font-bold text-pass tracking-wide">
                                        Bear Case
                                    </h3>
                                </div>
                                <span className="text-xs font-mono text-text-muted bg-surface-raised px-2 py-0.5 rounded-md">
                                    {data.bearCase.severityRating}/10
                                </span>
                            </div>

                            <p className="text-sm text-text-secondary leading-relaxed">
                                {data.bearCase.risks}
                            </p>

                            <EvidenceList
                                items={data.bearCase.evidence}
                                color="bg-pass/40"
                            />
                        </motion.div>
                    </div>

                    {/* Strongest arguments */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="px-5 py-4 rounded-xl bg-invest/5 border border-invest/10">
                            <p className="text-[10px] text-invest/70 tracking-[0.15em] uppercase font-semibold mb-1.5">
                                Strongest bull argument
                            </p>
                            <p className="text-sm text-text-secondary leading-relaxed">
                                {data.explainability.strongestBullArgument}
                            </p>
                        </div>
                        <div className="px-5 py-4 rounded-xl bg-pass/5 border border-pass/10">
                            <p className="text-[10px] text-pass/70 tracking-[0.15em] uppercase font-semibold mb-1.5">
                                Strongest bear argument
                            </p>
                            <p className="text-sm text-text-secondary leading-relaxed">
                                {data.explainability.strongestBearArgument}
                            </p>
                        </div>
                    </div>
                </motion.section>

                {/* ═══════════════════════ SKEPTIC ═══════════════════════ */}
                <motion.section className="space-y-4" variants={stagger.child}>
                    {data.skepticInvoked && data.skepticNotes ? (
                        <div className="glass-card rounded-2xl p-6 space-y-4 border-watchlist/15">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-watchlist/10 flex items-center justify-center">
                                    <SkepticIcon className="w-4 h-4 text-watchlist" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-watchlist tracking-wide">
                                        Skeptic Intervened
                                    </h3>
                                    <p className="text-[10px] text-text-muted">
                                        Debate was lopsided or confidence was borderline
                                    </p>
                                </div>
                            </div>

                            {data.skepticNotes.flaggedClaims.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-[10px] text-watchlist/70 tracking-[0.15em] uppercase font-semibold">
                                        Flagged Claims
                                    </p>
                                    <ul className="space-y-1.5">
                                        {data.skepticNotes.flaggedClaims.map((claim, i) => (
                                            <li
                                                key={i}
                                                className="flex items-start gap-2 text-xs text-text-secondary leading-relaxed"
                                            >
                                                <AlertIcon className="w-3 h-3 text-watchlist mt-0.5 flex-shrink-0" />
                                                {claim}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {data.skepticNotes.missingConsiderations.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-[10px] text-watchlist/70 tracking-[0.15em] uppercase font-semibold">
                                        Missing Considerations
                                    </p>
                                    <ul className="space-y-1.5">
                                        {data.skepticNotes.missingConsiderations.map((item, i) => (
                                            <li
                                                key={i}
                                                className="flex items-start gap-2 text-xs text-text-secondary leading-relaxed"
                                            >
                                                <ShieldIcon className="w-3 h-3 text-watchlist mt-0.5 flex-shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="flex items-center gap-2 pt-1 text-xs text-text-muted">
                                <span>Confidence adjustment:</span>
                                <span className="font-mono text-watchlist">
                                    {data.skepticNotes.adjustedConfidenceDelta > 0 ? "+" : ""}
                                    {data.skepticNotes.adjustedConfidenceDelta}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="glass-card rounded-2xl p-6 space-y-2">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-border/30 flex items-center justify-center">
                                    <SkepticIcon className="w-4 h-4 text-text-muted" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-text-secondary">
                                        Skeptic Not Invoked
                                    </h3>
                                    {data.skepticSkipReason && (
                                        <p className="text-xs text-text-muted mt-0.5">
                                            {data.skepticSkipReason}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Skeptic challenge explainability */}
                    <div className="px-5 py-4 rounded-xl glass-card">
                        <p className="text-[10px] text-text-muted tracking-[0.15em] uppercase font-semibold mb-1.5">
                            Skeptic Challenge
                        </p>
                        <p className="text-sm text-text-secondary leading-relaxed">
                            {data.explainability.skepticChallenge}
                        </p>
                    </div>
                </motion.section>

                {/* ═══════════════════════ KEY TAKEAWAYS ═══════════════════════ */}
                <motion.section
                    className="glass-card rounded-2xl p-6 md:p-8 space-y-5"
                    variants={stagger.child}
                >
                    <p className="text-[10px] text-text-muted tracking-[0.2em] uppercase font-semibold">
                        Key Takeaways
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-invest" />
                                <p className="text-xs text-invest font-semibold tracking-wider uppercase">
                                    Strengths
                                </p>
                            </div>
                            <ul className="space-y-2">
                                {data.keyStrengths.map((item, i) => (
                                    <motion.li
                                        key={i}
                                        className="text-sm text-text-secondary leading-relaxed pl-4 relative before:content-[''] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-px before:bg-invest/40"
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.6 + i * 0.05 }}
                                    >
                                        {item}
                                    </motion.li>
                                ))}
                            </ul>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-pass" />
                                <p className="text-xs text-pass font-semibold tracking-wider uppercase">
                                    Risks
                                </p>
                            </div>
                            <ul className="space-y-2">
                                {data.keyRisks.map((item, i) => (
                                    <motion.li
                                        key={i}
                                        className="text-sm text-text-secondary leading-relaxed pl-4 relative before:content-[''] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-px before:bg-pass/40"
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.6 + i * 0.05 }}
                                    >
                                        {item}
                                    </motion.li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </motion.section>

                {/* ═══════════════════════ CHAIR REASONING ═══════════════════════ */}
                <motion.section
                    className="glass-card rounded-2xl p-6 md:p-8 space-y-3"
                    variants={stagger.child}
                >
                    <SectionLabel icon={ChairIcon} label="Chair's Final Reasoning" color="text-violet-400" />
                    <p className="text-sm text-text-secondary leading-relaxed">
                        {data.explainability.verdictReasoning}
                    </p>
                </motion.section>

                {/* ═══════════════════════ SOURCES ═══════════════════════ */}
                <motion.section
                    className="glass-card rounded-2xl p-6 md:p-8 space-y-4"
                    variants={stagger.child}
                >
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] text-text-muted tracking-[0.2em] uppercase font-semibold">
                            Sources
                        </p>
                        <span className="text-xs text-text-muted font-mono">
                            {data.sources.length} cited
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {data.sources.map((source, i) => (
                            <motion.div
                                key={source.id}
                                className="px-4 py-3 rounded-xl bg-surface border border-border-subtle hover:border-accent/20 transition-colors duration-200"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.7 + i * 0.03 }}
                            >
                                <p className="text-xs text-text-secondary truncate">
                                    {source.title}
                                </p>
                                {source.url ? (
                                    <a
                                        href={source.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[10px] text-accent/70 hover:text-accent transition-colors truncate block mt-0.5"
                                    >
                                        {source.url}
                                    </a>
                                ) : (
                                    <p className="text-[10px] text-text-muted mt-0.5">
                                        Knowledge-based source
                                    </p>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* ═══════════════════════ FOOTER ═══════════════════════ */}
                <motion.footer
                    className="text-center pt-6 pb-10 space-y-4"
                    variants={stagger.child}
                >
                    <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                    <p className="text-[11px] text-text-muted">
                        Verdict — Multi-agent AI investment research · Not financial advice
                    </p>
                    <button
                        onClick={onReset}
                        className="
              px-6 py-2.5 rounded-xl
              glass-card hover:border-accent/30
              text-text-secondary text-sm
              hover:text-text-primary
              transition-all duration-300
            "
                    >
                        Analyse another company
                    </button>
                </motion.footer>
            </motion.div>
        </main>
    );
}

// ─── Shared Sub-Components ────────────────────────────────────────────────────

function SectionLabel({
    icon: Icon,
    label,
    color,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    color: string;
}) {
    return (
        <div className="flex items-center gap-2.5">
            <div className={`w-7 h-7 rounded-lg ${color === "text-violet-400" ? "bg-violet-400/10" : "bg-accent/10"} flex items-center justify-center`}>
                <Icon className={`w-3.5 h-3.5 ${color}`} />
            </div>
            <p className="text-[10px] text-text-muted tracking-[0.2em] uppercase font-semibold">
                {label}
            </p>
        </div>
    );
}

function EvidenceList({
    items,
    color,
}: {
    items: string[];
    color: string;
}) {
    return (
        <div className="space-y-2 pt-3 border-t border-border-subtle">
            <p className="text-[10px] text-text-muted tracking-[0.15em] uppercase font-semibold">
                Evidence
            </p>
            <ul className="space-y-1.5">
                {items.map((item, i) => (
                    <li
                        key={i}
                        className="flex items-start gap-2 text-xs text-text-secondary leading-relaxed"
                    >
                        <span
                            className={`block w-1 h-1 rounded-full ${color} mt-1.5 flex-shrink-0`}
                        />
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    );
}