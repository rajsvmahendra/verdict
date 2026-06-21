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
    const verdictDescription = {
        INVEST: "The research strongly supports investing in this company.",
        WATCHLIST: "The case is mixed — worth watching, but not a clear buy or sell yet.",
        PASS: "The risks clearly outweigh the potential upside.",
    };

    return (
        <main className="min-h-screen bg-bg px-4 py-8 md:py-12 relative">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <motion.div
                    className="absolute w-[500px] h-[500px] rounded-full"
                    style={{
                        background: "radial-gradient(circle, rgba(224,140,82,0.03) 0%, transparent 70%)",
                        top: "5%",
                        right: "10%",
                    }}
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>

            <div className="max-w-4xl mx-auto space-y-8 relative z-10">

                {/* Nav */}
                <motion.div
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <button onClick={onReset} className="btn-ghost flex items-center gap-2 text-sm group">
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
                    <div className="flex items-start gap-5">
                        <CompanyLogo
                            companyName={data.resolvedEntity.name}
                            ticker={data.resolvedEntity.ticker}
                            size="lg"
                        />
                        <div className="flex-1 min-w-0 space-y-1.5">
                            <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight leading-tight">
                                {data.resolvedEntity.name}
                            </h1>
                            <p className="text-sm text-text-secondary leading-relaxed">
                                {data.resolvedEntity.description}
                            </p>
                            {data.resolvedEntity.ticker && (
                                <p className="text-xs text-text-muted font-mono">
                                    Ticker: {data.resolvedEntity.ticker}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Verdict */}
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                            <motion.div
                                initial={{ scale: 0.7, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.3, type: "spring", stiffness: 250, damping: 18 }}
                            >
                                <VerdictBadge verdict={data.verdict} size="lg" />
                            </motion.div>

                            <p className="text-sm text-text-secondary leading-relaxed flex-1">
                                {verdictDescription[data.verdict]}
                            </p>
                        </div>

                        {/* Visual Score Meter */}
                        <div className="card-static p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-5">
                                <ConfidenceBar
                                    label="How confident is this decision?"
                                    value={data.confidenceScore.decisionConfidence}
                                    color="decision"
                                    delay={0.4}
                                />
                                <ConfidenceBar
                                    label="How reliable is the data?"
                                    value={data.confidenceScore.dataQualityConfidence}
                                    color="quality"
                                    delay={0.5}
                                />
                            </div>

                            {/* Bull vs Bear visual scale */}
                            <div className="space-y-2 pt-2">
                                <div className="flex justify-between text-[11px] text-text-muted">
                                    <span>Bear side stronger</span>
                                    <span>Bull side stronger</span>
                                </div>
                                <div className="relative h-3 bg-surface-raised rounded-full overflow-hidden">
                                    <motion.div
                                        className="absolute left-0 top-0 h-full bg-pass/30 rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(data.bearCase.severityRating / 10) * 50}%` }}
                                        transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                                    />
                                    <motion.div
                                        className="absolute right-0 top-0 h-full bg-invest/30 rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(data.bullCase.strengthRating / 10) * 50}%` }}
                                        transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                                    />
                                    <motion.div
                                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-text-primary rounded-full shadow-md"
                                        initial={{ left: "50%" }}
                                        animate={{
                                            left: `${50 + ((data.bullCase.strengthRating - data.bearCase.severityRating) / 20) * 50}%`,
                                        }}
                                        transition={{ duration: 1.2, delay: 0.8, type: "spring", stiffness: 100 }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-pass font-mono font-semibold">
                                        Bear {data.bearCase.severityRating}/10
                                    </span>
                                    <span className="text-invest font-mono font-semibold">
                                        Bull {data.bullCase.strengthRating}/10
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Why this verdict */}
                    <div className="card-static p-4 space-y-1.5">
                        <p className="section-label">What drove this decision</p>
                        <p className="text-sm text-text-secondary leading-relaxed">
                            {data.explainability.whyThisVerdict}
                        </p>
                    </div>
                </motion.section>

                {/* ═══════════ SUMMARY ═══════════ */}
                <ScrollReveal>
                    <section className="card-elevated p-6 md:p-8 space-y-4">
                        <SectionHeader icon={ChairIcon} label="The bottom line" color="purple" />
                        <p className="text-base text-text-primary leading-[1.75] font-light">
                            {data.finalThesis}
                        </p>
                    </section>
                </ScrollReveal>

                {/* ═══════════ THE DEBATE ═══════════ */}
                <ScrollReveal delay={0.05}>
                    <section className="space-y-4">
                        <div className="px-1">
                            <p className="section-label">The case for and against</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ScrollReveal direction="left">
                                <div className="card-elevated p-6 space-y-4 border-invest/10 hover:border-invest/25 transition-colors duration-300 h-full">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <AgentBadge icon={BullIcon} color="invest" />
                                            <h3 className="text-sm font-bold text-invest">Why you should invest</h3>
                                        </div>
                                        <ScorePill score={data.bullCase.strengthRating} label="Strength" />
                                    </div>
                                    <p className="text-sm text-text-secondary leading-relaxed">{data.bullCase.thesis}</p>
                                    <EvidenceList items={data.bullCase.evidence} color="invest" label="Supporting evidence" />
                                </div>
                            </ScrollReveal>

                            <ScrollReveal direction="right">
                                <div className="card-elevated p-6 space-y-4 border-pass/10 hover:border-pass/25 transition-colors duration-300 h-full">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <AgentBadge icon={BearIcon} color="pass" />
                                            <h3 className="text-sm font-bold text-pass">Why you shouldn&apos;t</h3>
                                        </div>
                                        <ScorePill score={data.bearCase.severityRating} label="Risk" />
                                    </div>
                                    <p className="text-sm text-text-secondary leading-relaxed">{data.bearCase.risks}</p>
                                    <EvidenceList items={data.bearCase.evidence} color="pass" label="Risk evidence" />
                                </div>
                            </ScrollReveal>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ScrollReveal delay={0.1}>
                                <div className="card-static p-5 border-invest/8 space-y-2">
                                    <p className="section-label text-invest/60">Best reason to invest</p>
                                    <p className="text-sm text-text-secondary leading-relaxed">
                                        {data.explainability.strongestBullArgument}
                                    </p>
                                </div>
                            </ScrollReveal>
                            <ScrollReveal delay={0.15}>
                                <div className="card-static p-5 border-pass/8 space-y-2">
                                    <p className="section-label text-pass/60">Biggest concern</p>
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
                        <div className="px-1">
                            <p className="section-label">Quality check</p>
                        </div>

                        {data.skepticInvoked && data.skepticNotes ? (
                            <div className="card-elevated p-6 space-y-5 border-watchlist/10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <AgentBadge icon={SkepticIcon} color="watchlist" />
                                        <div>
                                            <h3 className="text-sm font-bold text-watchlist">
                                                Our Skeptic flagged some issues
                                            </h3>
                                            <p className="text-[11px] text-text-muted">
                                                This review was triggered because the debate was one-sided
                                            </p>
                                        </div>
                                    </div>
                                    <div className="px-3 py-1 rounded-lg bg-watchlist/10 border border-watchlist/20">
                                        <span className="text-xs font-mono text-watchlist font-semibold">
                                            {data.skepticNotes.adjustedConfidenceDelta > 0 ? "+" : ""}
                                            {(data.skepticNotes.adjustedConfidenceDelta * 100).toFixed(0)}% confidence
                                        </span>
                                    </div>
                                </div>

                                {data.skepticNotes.flaggedClaims.length > 0 && (
                                    <div className="space-y-2.5">
                                        <p className="section-label text-watchlist/50">Claims that need more proof</p>
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
                                        <p className="section-label text-watchlist/50">Things nobody mentioned</p>
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
                                            No additional review needed
                                        </h3>
                                        <p className="text-xs text-text-muted mt-0.5">
                                            The debate was balanced — both sides presented solid arguments.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="card-static p-5 space-y-2">
                            <p className="section-label">Skeptic&apos;s summary</p>
                            <p className="text-sm text-text-secondary leading-relaxed">
                                {data.explainability.skepticChallenge}
                            </p>
                        </div>
                    </section>
                </ScrollReveal>

                {/* ═══════════ STRENGTHS & RISKS ═══════════ */}
                <ScrollReveal>
                    <section className="card-elevated p-6 md:p-8 space-y-6">
                        <p className="section-label">What stands out</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-invest" />
                                    <p className="text-xs text-invest font-bold tracking-wider uppercase">Strengths</p>
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
                                    <p className="text-xs text-pass font-bold tracking-wider uppercase">Risks</p>
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

                {/* ═══════════ FINAL REASONING ═══════════ */}
                <ScrollReveal>
                    <section className="card-elevated p-6 md:p-8 space-y-4">
                        <SectionHeader icon={ChairIcon} label="How we reached this verdict" color="purple" />
                        <p className="text-sm text-text-secondary leading-[1.8]">
                            {data.explainability.verdictReasoning}
                        </p>
                    </section>
                </ScrollReveal>

                {/* ═══════════ SOURCES ═══════════ */}
                <ScrollReveal>
                    <section className="card-elevated p-6 md:p-8 space-y-5">
                        <div className="flex items-center justify-between">
                            <p className="section-label">Where this came from</p>
                            <span className="text-xs text-text-muted font-mono">{data.sources.length} sources</span>
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
                                    <p className="text-xs text-text-secondary truncate font-medium">{source.title}</p>
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
                                        <p className="text-[10px] text-text-muted">Knowledge-based source</p>
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
                            Verdict — For research purposes only · Not financial advice
                        </p>
                        <button onClick={onReset} className="btn-ghost">
                            Research another company
                        </button>
                    </footer>
                </ScrollReveal>
            </div>
        </main>
    );
}

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

function EvidenceList({ items, color, label }: { items: string[]; color: string; label: string }) {
    const dotColor = color === "invest" ? "bg-invest/40" : "bg-pass/40";
    const borderColor = color === "invest" ? "border-invest/15" : "border-pass/15";

    return (
        <div className={`space-y-2 pt-4 border-t ${borderColor}`}>
            <p className="section-label">{label}</p>
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