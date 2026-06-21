"use client";

import { motion } from "framer-motion";
import { VerdictBadge } from "@/components/ui/verdict-badge";
import { ConfidenceBar } from "@/components/ui/confidence-bar";
import { CompanyLogo } from "@/components/ui/company-logo";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import {
    ArrowLeftIcon,
    BullIcon,
    BearIcon,
    SkepticIcon,
    ChairIcon,
    ShieldIcon,
    AlertIcon,
} from "@/components/ui/icons";
import type { AnalyzeSuccessResponse } from "@/lib/api-client";

interface ResultsScreenProps {
    data: AnalyzeSuccessResponse;
    company: string;
    onReset: () => void;
}

export function ResultsScreen({ data, company, onReset }: ResultsScreenProps) {
    return (
        <main className="min-h-screen bg-bg px-4 py-8 md:py-12 relative">
            {/* Background parallax */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <motion.div
                    className="absolute w-[500px] h-[500px] rounded-full"
                    style={{
                        background: "radial-gradient(circle, rgba(109,92,255,0.03) 0%, transparent 70%)",
                        top: "5%",
                        right: "10%",
                    }}
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute w-[400px] h-[400px] rounded-full"
                    style={{
                        background: "radial-gradient(circle, rgba(52,211,153,0.025) 0%, transparent 70%)",
                        bottom: "15%",
                        left: "5%",
                    }}
                    animate={{ y: [0, 12, 0] }}
                    transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>

            <div className="max-w-4xl mx-auto space-y-8 relative z-10">

                {/* Navigation */}
                <motion.div
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <button
                        onClick={onReset}
                        className="btn-ghost flex items-center gap-2 text-sm group"
                    >
                        <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        New search
                    </button>
                    <span className="text-xs text-text-muted font-mono tracking-widest">
                        {data.resolvedEntity.ticker ?? "PRIVATE"}
                    </span>
                </motion.div>

                {/* ═══════════ VERDICT HERO ═══════════ */}
                <motion.section
                    className="card-elevated p-6 md:p-8 space-y-7"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                    {/* Company identity */}
                    <div className="flex items-start gap-5">
                        <motion.div
                            className="float-delayed"
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <CompanyLogo
                                companyName={data.resolvedEntity.name}
                                ticker={data.resolvedEntity.ticker}
                                size="lg"
                            />
                        </motion.div>
                        <div className="flex-1 min-w-0 space-y-1.5">
                            <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight leading-tight">
                                {data.resolvedEntity.name}
                            </h1>
                            <p className="text-sm text-text-secondary leading-relaxed">
                                {data.resolvedEntity.description}
                            </p>
                        </div>
                    </div>

                    {/* Verdict + Confidence */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-5 pt-1">
                        <motion.div
                            initial={{ scale: 0.7, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.3, type: "spring", stiffness: 250, damping: 18 }}
                        >
                            <VerdictBadge verdict={data.verdict} size="lg" />
                        </motion.div>

                        <div className="flex-1 grid grid-cols-2 gap-5 max-w-sm">
                            <ConfidenceBar
                                label="Decision Confidence"
                                value={data.confidenceScore.decisionConfidence}
                                color="decision"
                                delay={0.5}
                            />
                            <ConfidenceBar
                                label="Data Quality"
                                value={data.confidenceScore.dataQualityConfidence}
                                color="quality"
                                delay={0.6}
                            />
                        </div>
                    </div>

                    {/* Banding reason */}
                    <div className="card-static p-4 space-y-1.5">
                        <p className="section-label">Why this verdict</p>
                        <p className="text-sm text-text-secondary leading-relaxed">
                            {data.explainability.whyThisVerdict}
                        </p>
                    </div>
                </motion.section>

                {/* ═══════════ THESIS ═══════════ */}
                <ScrollReveal>
                    <section className="card-elevated p-6 md:p-8 space-y-4">
                        <SectionHeader icon={ChairIcon} label="Investment Thesis" color="purple" />
                        <p className="text-base text-text-primary leading-[1.75] font-light">
                            {data.finalThesis}
                        </p>
                    </section>
                </ScrollReveal>

                {/* ═══════════ BULL vs BEAR ═══════════ */}
                <ScrollReveal delay={0.05}>
                    <section className="space-y-4">
                        <div className="px-1">
                            <p className="section-label">Adversarial Debate</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Bull */}
                            <ScrollReveal direction="left">
                                <div className="card-elevated p-6 space-y-4 border-invest/10 hover:border-invest/25 transition-colors duration-300 h-full">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <AgentBadge icon={BullIcon} color="invest" />
                                            <h3 className="text-sm font-bold text-invest">Bull Case</h3>
                                        </div>
                                        <ScorePill score={data.bullCase.strengthRating} label="Strength" />
                                    </div>

                                    <p className="text-sm text-text-secondary leading-relaxed">
                                        {data.bullCase.thesis}
                                    </p>

                                    <EvidenceList items={data.bullCase.evidence} color="invest" />
                                </div>
                            </ScrollReveal>

                            {/* Bear */}
                            <ScrollReveal direction="right">
                                <div className="card-elevated p-6 space-y-4 border-pass/10 hover:border-pass/25 transition-colors duration-300 h-full">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <AgentBadge icon={BearIcon} color="pass" />
                                            <h3 className="text-sm font-bold text-pass">Bear Case</h3>
                                        </div>
                                        <ScorePill score={data.bearCase.severityRating} label="Severity" />
                                    </div>

                                    <p className="text-sm text-text-secondary leading-relaxed">
                                        {data.bearCase.risks}
                                    </p>

                                    <EvidenceList items={data.bearCase.evidence} color="pass" />
                                </div>
                            </ScrollReveal>
                        </div>

                        {/* Strongest arguments */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ScrollReveal delay={0.1}>
                                <div className="card-static p-5 border-invest/8 space-y-2">
                                    <p className="section-label text-invest/60">Strongest bull argument</p>
                                    <p className="text-sm text-text-secondary leading-relaxed">
                                        {data.explainability.strongestBullArgument}
                                    </p>
                                </div>
                            </ScrollReveal>
                            <ScrollReveal delay={0.15}>
                                <div className="card-static p-5 border-pass/8 space-y-2">
                                    <p className="section-label text-pass/60">Strongest bear argument</p>
                                    <p className="text-sm text-text-secondary leading-relaxed">
                                        {data.explainability.strongestBearArgument}
                                    </p>
                                </div>
                            </ScrollReveal>
                        </div>
                    </section>
                </ScrollReveal>

                {/* ═══════════ SKEPTIC ═══════════ */}
                <ScrollReveal>
                    <section className="space-y-4">
                        {data.skepticInvoked && data.skepticNotes ? (
                            <div className="card-elevated p-6 space-y-5 border-watchlist/10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <AgentBadge icon={SkepticIcon} color="watchlist" />
                                        <div>
                                            <h3 className="text-sm font-bold text-watchlist">
                                                Skeptic Intervened
                                            </h3>
                                            <p className="text-[11px] text-text-muted">
                                                Debate was lopsided or confidence was borderline
                                            </p>
                                        </div>
                                    </div>
                                    <div className="px-3 py-1 rounded-lg bg-watchlist/10 border border-watchlist/20">
                                        <span className="text-xs font-mono text-watchlist font-semibold">
                                            {data.skepticNotes.adjustedConfidenceDelta > 0 ? "+" : ""}
                                            {data.skepticNotes.adjustedConfidenceDelta}
                                        </span>
                                    </div>
                                </div>

                                {data.skepticNotes.flaggedClaims.length > 0 && (
                                    <div className="space-y-2.5">
                                        <p className="section-label text-watchlist/50">Flagged Claims</p>
                                        <ul className="space-y-2">
                                            {data.skepticNotes.flaggedClaims.map((claim, i) => (
                                                <motion.li
                                                    key={i}
                                                    className="flex items-start gap-2.5 text-sm text-text-secondary leading-relaxed"
                                                    initial={{ opacity: 0, x: -8 }}
                                                    whileInView={{ opacity: 1, x: 0 }}
                                                    viewport={{ once: true }}
                                                    transition={{ delay: i * 0.05 }}
                                                >
                                                    <AlertIcon className="w-3.5 h-3.5 text-watchlist mt-1 flex-shrink-0" />
                                                    {claim}
                                                </motion.li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {data.skepticNotes.missingConsiderations.length > 0 && (
                                    <div className="space-y-2.5">
                                        <p className="section-label text-watchlist/50">Missing Considerations</p>
                                        <ul className="space-y-2">
                                            {data.skepticNotes.missingConsiderations.map((item, i) => (
                                                <motion.li
                                                    key={i}
                                                    className="flex items-start gap-2.5 text-sm text-text-secondary leading-relaxed"
                                                    initial={{ opacity: 0, x: -8 }}
                                                    whileInView={{ opacity: 1, x: 0 }}
                                                    viewport={{ once: true }}
                                                    transition={{ delay: i * 0.05 }}
                                                >
                                                    <ShieldIcon className="w-3.5 h-3.5 text-watchlist mt-1 flex-shrink-0" />
                                                    {item}
                                                </motion.li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="card-static p-6">
                                <div className="flex items-center gap-2.5">
                                    <AgentBadge icon={SkepticIcon} color="muted" />
                                    <div>
                                        <h3 className="text-sm font-semibold text-text-secondary">
                                            Skeptic Not Invoked
                                        </h3>
                                        {data.skepticSkipReason && (
                                            <p className="text-xs text-text-muted mt-0.5 max-w-lg">
                                                {data.skepticSkipReason}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="card-static p-5 space-y-2">
                            <p className="section-label">Skeptic Challenge</p>
                            <p className="text-sm text-text-secondary leading-relaxed">
                                {data.explainability.skepticChallenge}
                            </p>
                        </div>
                    </section>
                </ScrollReveal>

                {/* ═══════════ KEY TAKEAWAYS ═══════════ */}
                <ScrollReveal>
                    <section className="card-elevated p-6 md:p-8 space-y-6">
                        <p className="section-label">Key Takeaways</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-invest" />
                                    <p className="text-xs text-invest font-bold tracking-wider uppercase">
                                        Strengths
                                    </p>
                                </div>
                                <ul className="space-y-2.5">
                                    {data.keyStrengths.map((item, i) => (
                                        <motion.li
                                            key={i}
                                            className="text-sm text-text-secondary leading-relaxed pl-4 border-l-2 border-invest/20"
                                            initial={{ opacity: 0, x: -8 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: 0.1 + i * 0.06 }}
                                        >
                                            {item}
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-pass" />
                                    <p className="text-xs text-pass font-bold tracking-wider uppercase">
                                        Risks
                                    </p>
                                </div>
                                <ul className="space-y-2.5">
                                    {data.keyRisks.map((item, i) => (
                                        <motion.li
                                            key={i}
                                            className="text-sm text-text-secondary leading-relaxed pl-4 border-l-2 border-pass/20"
                                            initial={{ opacity: 0, x: -8 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: 0.1 + i * 0.06 }}
                                        >
                                            {item}
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </section>
                </ScrollReveal>

                {/* ═══════════ CHAIR REASONING ═══════════ */}
                <ScrollReveal>
                    <section className="card-elevated p-6 md:p-8 space-y-4">
                        <SectionHeader icon={ChairIcon} label="Chair's Final Reasoning" color="purple" />
                        <p className="text-sm text-text-secondary leading-[1.8]">
                            {data.explainability.verdictReasoning}
                        </p>
                    </section>
                </ScrollReveal>

                {/* ═══════════ SOURCES ═══════════ */}
                <ScrollReveal>
                    <section className="card-elevated p-6 md:p-8 space-y-5">
                        <div className="flex items-center justify-between">
                            <p className="section-label">Sources</p>
                            <span className="text-xs text-text-muted font-mono">
                                {data.sources.length} cited
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {data.sources.map((source, i) => (
                                <motion.div
                                    key={source.id}
                                    className="card px-4 py-3 space-y-1"
                                    initial={{ opacity: 0, y: 6 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.04 }}
                                >
                                    <p className="text-xs text-text-secondary truncate font-medium">
                                        {source.title}
                                    </p>
                                    {source.url ? (
                                        <a
                                            href={source.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[10px] text-accent/60 hover:text-accent transition-colors truncate block"
                                        >
                                            {source.url}
                                        </a>
                                    ) : (
                                        <p className="text-[10px] text-text-muted">
                                            Knowledge-based source
                                        </p>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </section>
                </ScrollReveal>

                {/* ═══════════ FOOTER ═══════════ */}
                <ScrollReveal>
                    <footer className="text-center pt-6 pb-12 space-y-5">
                        <div className="divider" />
                        <p className="text-xs text-text-muted">
                            Verdict — Multi-agent AI investment research · Not financial advice
                        </p>
                        <button onClick={onReset} className="btn-ghost">
                            Analyse another company
                        </button>
                    </footer>
                </ScrollReveal>
            </div>
        </main>
    );
}

// ─── Sub-Components ───────────────────────────────────────────────────────────

function SectionHeader({
    icon: Icon,
    label,
    color,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    color: string;
}) {
    const colorMap: Record<string, { icon: string; bg: string }> = {
        purple: { icon: "text-purple-400", bg: "bg-purple-400/10" },
        accent: { icon: "text-accent", bg: "bg-accent-soft" },
    };
    const c = colorMap[color] ?? colorMap.accent;

    return (
        <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl ${c.bg} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${c.icon}`} />
            </div>
            <p className="section-label">{label}</p>
        </div>
    );
}

function AgentBadge({
    icon: Icon,
    color,
}: {
    icon: React.ComponentType<{ className?: string }>;
    color: string;
}) {
    const colorMap: Record<string, { icon: string; bg: string }> = {
        invest: { icon: "text-invest", bg: "bg-invest/10" },
        pass: { icon: "text-pass", bg: "bg-pass/10" },
        watchlist: { icon: "text-watchlist", bg: "bg-watchlist/10" },
        muted: { icon: "text-text-muted", bg: "bg-border/30" },
    };
    const c = colorMap[color] ?? colorMap.muted;

    return (
        <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-4 h-4 ${c.icon}`} />
        </div>
    );
}

function ScorePill({ score, label }: { score: number; label: string }) {
    return (
        <div className="px-3 py-1 rounded-lg bg-surface-raised border border-border">
            <span className="text-[10px] text-text-muted mr-1.5">{label}</span>
            <span className="text-xs font-mono text-text-primary font-bold">{score}/10</span>
        </div>
    );
}

function EvidenceList({ items, color }: { items: string[]; color: string }) {
    const dotColor = color === "invest" ? "bg-invest/40" : "bg-pass/40";
    const borderColor = color === "invest" ? "border-invest/15" : "border-pass/15";

    return (
        <div className={`space-y-2 pt-4 border-t ${borderColor}`}>
            <p className="section-label">Evidence</p>
            <ul className="space-y-2">
                {items.map((item, i) => (
                    <motion.li
                        key={i}
                        className="flex items-start gap-2.5 text-xs text-text-secondary leading-relaxed"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.04 }}
                    >
                        <span className={`block w-1.5 h-1.5 rounded-full ${dotColor} mt-1.5 flex-shrink-0`} />
                        {item}
                    </motion.li>
                ))}
            </ul>
        </div>
    );
}