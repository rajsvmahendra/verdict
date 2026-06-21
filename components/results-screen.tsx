"use client";

import { VerdictBadge } from "@/components/ui/verdict-badge";
import { ConfidenceBar } from "@/components/ui/confidence-bar";
import type { AnalyzeSuccessResponse } from "@/lib/api-client";

interface ResultsScreenProps {
    data: AnalyzeSuccessResponse;
    company: string;
    onReset: () => void;
}

export function ResultsScreen({ data, company, onReset }: ResultsScreenProps) {
    return (
        <main className="min-h-screen bg-bg px-4 py-12">
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">

                {/* Header: Back + Company Name */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={onReset}
                        className="text-sm text-text-muted hover:text-text-secondary transition-colors"
                    >
                        ← New search
                    </button>
                    <span className="text-xs text-text-muted font-mono">
                        {data.resolvedEntity.ticker ?? "PRIVATE"}
                    </span>
                </div>

                {/* Verdict Hero */}
                <section className="space-y-6 pb-8 border-b border-border-subtle">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-semibold text-text-primary tracking-tight">
                            {data.resolvedEntity.name}
                        </h1>
                        <p className="text-sm text-text-secondary">
                            {data.resolvedEntity.description}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                        <VerdictBadge verdict={data.verdict} size="lg" />
                        <div className="flex-1 grid grid-cols-2 gap-4 max-w-md">
                            <ConfidenceBar
                                label="Decision Confidence"
                                value={data.confidenceScore.decisionConfidence}
                            />
                            <ConfidenceBar
                                label="Data Quality"
                                value={data.confidenceScore.dataQualityConfidence}
                                color="quality"
                            />
                        </div>
                    </div>

                    {/* Banding Reason */}
                    <div className="px-4 py-3 rounded-lg bg-surface border border-border-subtle">
                        <p className="text-xs text-text-muted uppercase tracking-wider mb-1">
                            Why this verdict
                        </p>
                        <p className="text-sm text-text-secondary leading-relaxed">
                            {data.explainability.whyThisVerdict}
                        </p>
                    </div>
                </section>

                {/* Thesis */}
                <section className="space-y-3 pb-8 border-b border-border-subtle">
                    <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider">
                        Investment Thesis
                    </h2>
                    <p className="text-base text-text-primary leading-relaxed">
                        {data.finalThesis}
                    </p>
                </section>

                {/* Bull vs Bear */}
                <section className="space-y-4 pb-8 border-b border-border-subtle">
                    <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider">
                        Adversarial Debate
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Bull Case */}
                        <div className="rounded-lg border border-border-subtle bg-surface p-5 space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-invest">
                                    Bull Case
                                </h3>
                                <span className="text-xs font-mono text-text-muted">
                                    Strength: {data.bullCase.strengthRating}/10
                                </span>
                            </div>
                            <p className="text-sm text-text-secondary leading-relaxed">
                                {data.bullCase.thesis}
                            </p>
                            <div className="space-y-1.5 pt-2 border-t border-border-subtle">
                                <p className="text-xs text-text-muted uppercase tracking-wider">
                                    Evidence
                                </p>
                                <ul className="space-y-1">
                                    {data.bullCase.evidence.map((item, i) => (
                                        <li
                                            key={i}
                                            className="text-xs text-text-secondary leading-relaxed pl-3 relative before:content-[''] before:absolute before:left-0 before:top-1.5 before:w-1 before:h-1 before:rounded-full before:bg-invest/50"
                                        >
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Bear Case */}
                        <div className="rounded-lg border border-border-subtle bg-surface p-5 space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-pass">
                                    Bear Case
                                </h3>
                                <span className="text-xs font-mono text-text-muted">
                                    Severity: {data.bearCase.severityRating}/10
                                </span>
                            </div>
                            <p className="text-sm text-text-secondary leading-relaxed">
                                {data.bearCase.risks}
                            </p>
                            <div className="space-y-1.5 pt-2 border-t border-border-subtle">
                                <p className="text-xs text-text-muted uppercase tracking-wider">
                                    Evidence
                                </p>
                                <ul className="space-y-1">
                                    {data.bearCase.evidence.map((item, i) => (
                                        <li
                                            key={i}
                                            className="text-xs text-text-secondary leading-relaxed pl-3 relative before:content-[''] before:absolute before:left-0 before:top-1.5 before:w-1 before:h-1 before:rounded-full before:bg-pass/50"
                                        >
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Strongest Arguments */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="px-4 py-3 rounded-lg bg-invest-bg/50 border border-invest/10">
                            <p className="text-xs text-text-muted mb-1">Strongest bull argument</p>
                            <p className="text-sm text-text-secondary leading-relaxed">
                                {data.explainability.strongestBullArgument}
                            </p>
                        </div>
                        <div className="px-4 py-3 rounded-lg bg-pass-bg/50 border border-pass/10">
                            <p className="text-xs text-text-muted mb-1">Strongest bear argument</p>
                            <p className="text-sm text-text-secondary leading-relaxed">
                                {data.explainability.strongestBearArgument}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Skeptic */}
                <section className="space-y-3 pb-8 border-b border-border-subtle">
                    <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider">
                        Skeptic Review
                    </h2>

                    {data.skepticInvoked && data.skepticNotes ? (
                        <div className="rounded-lg border border-watchlist/20 bg-watchlist-bg/30 p-5 space-y-3">
                            <p className="text-sm text-watchlist font-medium">
                                Skeptic was invoked — debate was lopsided or confidence was borderline
                            </p>

                            {data.skepticNotes.flaggedClaims.length > 0 && (
                                <div className="space-y-1">
                                    <p className="text-xs text-text-muted uppercase tracking-wider">
                                        Flagged Claims
                                    </p>
                                    <ul className="space-y-1">
                                        {data.skepticNotes.flaggedClaims.map((claim, i) => (
                                            <li
                                                key={i}
                                                className="text-xs text-text-secondary leading-relaxed pl-3 relative before:content-[''] before:absolute before:left-0 before:top-1.5 before:w-1 before:h-1 before:rounded-full before:bg-watchlist/50"
                                            >
                                                {claim}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {data.skepticNotes.missingConsiderations.length > 0 && (
                                <div className="space-y-1">
                                    <p className="text-xs text-text-muted uppercase tracking-wider">
                                        Missing Considerations
                                    </p>
                                    <ul className="space-y-1">
                                        {data.skepticNotes.missingConsiderations.map((item, i) => (
                                            <li
                                                key={i}
                                                className="text-xs text-text-secondary leading-relaxed pl-3 relative before:content-[''] before:absolute before:left-0 before:top-1.5 before:w-1 before:h-1 before:rounded-full before:bg-watchlist/50"
                                            >
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <p className="text-xs text-text-muted">
                                Confidence adjustment: {data.skepticNotes.adjustedConfidenceDelta}
                            </p>
                        </div>
                    ) : (
                        <div className="rounded-lg border border-border-subtle bg-surface p-5">
                            <p className="text-sm text-text-secondary">
                                Skeptic was not invoked.
                            </p>
                            {data.skepticSkipReason && (
                                <p className="text-xs text-text-muted mt-1">
                                    {data.skepticSkipReason}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Skeptic Challenge Explainability */}
                    <div className="px-4 py-3 rounded-lg bg-surface border border-border-subtle">
                        <p className="text-xs text-text-muted mb-1">Skeptic challenge</p>
                        <p className="text-sm text-text-secondary leading-relaxed">
                            {data.explainability.skepticChallenge}
                        </p>
                    </div>
                </section>

                {/* Key Strengths / Risks */}
                <section className="space-y-4 pb-8 border-b border-border-subtle">
                    <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider">
                        Key Takeaways
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <p className="text-xs text-invest font-medium uppercase tracking-wider">
                                Strengths
                            </p>
                            <ul className="space-y-1.5">
                                {data.keyStrengths.map((item, i) => (
                                    <li
                                        key={i}
                                        className="text-sm text-text-secondary pl-3 relative before:content-[''] before:absolute before:left-0 before:top-2 before:w-1 before:h-1 before:rounded-full before:bg-invest"
                                    >
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="space-y-2">
                            <p className="text-xs text-pass font-medium uppercase tracking-wider">
                                Risks
                            </p>
                            <ul className="space-y-1.5">
                                {data.keyRisks.map((item, i) => (
                                    <li
                                        key={i}
                                        className="text-sm text-text-secondary pl-3 relative before:content-[''] before:absolute before:left-0 before:top-2 before:w-1 before:h-1 before:rounded-full before:bg-pass"
                                    >
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Verdict Reasoning */}
                <section className="space-y-3 pb-8 border-b border-border-subtle">
                    <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider">
                        Chair&apos;s Reasoning
                    </h2>
                    <p className="text-sm text-text-secondary leading-relaxed">
                        {data.explainability.verdictReasoning}
                    </p>
                </section>

                {/* Sources */}
                <section className="space-y-3 pb-8">
                    <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider">
                        Sources ({data.sources.length})
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {data.sources.map((source) => (
                            <div
                                key={source.id}
                                className="px-3 py-2 rounded-lg bg-surface border border-border-subtle"
                            >
                                <p className="text-xs text-text-secondary truncate">
                                    {source.title}
                                </p>
                                {source.url && (
                                    <a
                                        href={source.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-text-muted hover:text-text-secondary transition-colors truncate block"
                                    >
                                        {source.url}
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Footer */}
                <footer className="text-center pt-4 pb-8 border-t border-border-subtle">
                    <p className="text-xs text-text-muted">
                        Verdict — Multi-agent AI investment research · Not financial advice
                    </p>
                    <button
                        onClick={onReset}
                        className="mt-3 px-4 py-2 rounded-lg border border-border text-text-secondary text-sm hover:text-text-primary hover:border-text-muted transition-colors"
                    >
                        Analyse another company
                    </button>
                </footer>
            </div>
        </main>
    );
}