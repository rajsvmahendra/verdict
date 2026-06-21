"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Spinner } from "@/components/ui/spinner";
import { SearchIcon, ShieldIcon } from "@/components/ui/icons";

const EXAMPLE_CHIPS = [
    { label: "Apple", desc: "Consumer Tech" },
    { label: "Stripe", desc: "Private Fintech" },
    { label: "Nvidia", desc: "AI Chips" },
    { label: "Mercury", desc: "Ambiguous" },
    { label: "Duolingo", desc: "EdTech" },
    { label: "SpaceX", desc: "Aerospace" },
];

const FEATURES = [
    {
        title: "6 Specialized Agents",
        desc: "Each agent has a distinct role — from research to adversarial debate to final synthesis.",
    },
    {
        title: "Evidence-Grounded",
        desc: "Every claim is traceable to structured research data. Nothing is fabricated.",
    },
    {
        title: "Three Clear Outcomes",
        desc: "Invest, Watchlist, or Pass — backed by two separate confidence scores.",
    },
];

interface InputScreenProps {
    onAnalyze: (company: string) => void;
    isSubmitting: boolean;
    clarificationMessage?: string | null;
    errorMessage?: string | null;
}

export function InputScreen({
    onAnalyze,
    isSubmitting,
    clarificationMessage,
    errorMessage,
}: InputScreenProps) {
    const [value, setValue] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    function handleSubmit(company: string) {
        const trimmed = company.trim();
        if (!trimmed || isSubmitting) return;
        onAnalyze(trimmed);
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") handleSubmit(value);
    }

    function handleChipClick(label: string) {
        setValue(label);
        handleSubmit(label);
    }

    return (
        <main className="min-h-screen bg-bg flex flex-col items-center px-4 relative overflow-hidden">
            {/* Parallax background orbs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <motion.div
                    className="absolute w-[500px] h-[500px] rounded-full"
                    style={{
                        background: "radial-gradient(circle, rgba(109,92,255,0.04) 0%, transparent 70%)",
                        top: "10%",
                        left: "15%",
                    }}
                    animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute w-[400px] h-[400px] rounded-full"
                    style={{
                        background: "radial-gradient(circle, rgba(52,211,153,0.03) 0%, transparent 70%)",
                        bottom: "10%",
                        right: "10%",
                    }}
                    animate={{ y: [0, 15, 0], x: [0, -8, 0] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute w-[300px] h-[300px] rounded-full"
                    style={{
                        background: "radial-gradient(circle, rgba(251,191,36,0.025) 0%, transparent 70%)",
                        top: "50%",
                        right: "30%",
                    }}
                    animate={{ y: [0, -12, 0] }}
                    transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>

            {/* Content */}
            <div className="w-full max-w-2xl relative z-10 pt-[18vh] pb-16 space-y-14">

                {/* Hero */}
                <motion.div
                    className="text-center space-y-5"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-surface text-xs text-text-muted">
                        <span className="w-1.5 h-1.5 rounded-full bg-invest animate-pulse" />
                        AI-Powered Investment Committee
                    </div>

                    <h1 className="text-5xl md:text-6xl font-bold tracking-[-0.03em] text-text-primary leading-[1.1]">
                        Get a <span className="text-accent">Verdict</span> on
                        <br />
                        any company.
                    </h1>

                    <p className="text-text-secondary text-lg leading-relaxed max-w-lg mx-auto">
                        Six AI agents research, debate, and deliver a structured
                        investment decision — grounded in evidence, not vibes.
                    </p>
                </motion.div>

                {/* Search */}
                <motion.div
                    className="space-y-3"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                    <motion.div
                        className={`
              relative flex items-center
              card-elevated overflow-hidden
              transition-all duration-400
              ${isFocused ? "border-accent/40 shadow-[0_0_0_1px_rgba(109,92,255,0.2),0_8px_40px_rgba(0,0,0,0.5)]" : ""}
              ${clarificationMessage ? "border-watchlist/30" : ""}
              ${errorMessage ? "border-pass/30" : ""}
            `}
                        layout
                    >
                        <div className="pl-5 flex-shrink-0">
                            {isSubmitting ? (
                                <Spinner size="sm" color="text-accent" />
                            ) : (
                                <SearchIcon className={`w-5 h-5 transition-colors duration-300 ${isFocused ? "text-accent" : "text-text-muted"}`} />
                            )}
                        </div>

                        <input
                            ref={inputRef}
                            type="text"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder="Search any company — name, ticker, or even a typo…"
                            disabled={isSubmitting}
                            className="
                flex-1 bg-transparent px-4 py-5
                text-text-primary placeholder:text-text-muted
                text-base outline-none
                disabled:cursor-not-allowed
                tracking-wide
              "
                        />

                        <motion.button
                            onClick={() => handleSubmit(value)}
                            disabled={!value.trim() || isSubmitting}
                            className="btn-primary mr-3 flex-shrink-0"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                        >
                            Analyse
                        </motion.button>
                    </motion.div>

                    {/* Feedback */}
                    <AnimatePresence mode="wait">
                        {clarificationMessage && (
                            <motion.div
                                key="clarification"
                                initial={{ opacity: 0, y: -6, height: 0 }}
                                animate={{ opacity: 1, y: 0, height: "auto" }}
                                exit={{ opacity: 0, y: -6, height: 0 }}
                                className="card-static border-watchlist/20 px-5 py-4 overflow-hidden"
                            >
                                <div className="flex items-start gap-3">
                                    <ShieldIcon className="w-4 h-4 text-watchlist mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm text-watchlist font-semibold">
                                            Multiple matches found
                                        </p>
                                        <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                                            {clarificationMessage}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {errorMessage && (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0, y: -6, height: 0 }}
                                animate={{ opacity: 1, y: 0, height: "auto" }}
                                exit={{ opacity: 0, y: -6, height: 0 }}
                                className="card-static border-pass/20 px-5 py-4 overflow-hidden"
                            >
                                <div className="flex items-start gap-3">
                                    <ShieldIcon className="w-4 h-4 text-pass mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-pass">{errorMessage}</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Example chips */}
                <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <p className="section-label text-center">Try a company</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {EXAMPLE_CHIPS.map((chip, i) => (
                            <motion.button
                                key={chip.label}
                                onClick={() => handleChipClick(chip.label)}
                                disabled={isSubmitting}
                                className="
                  group relative px-4 py-2.5 rounded-xl
                  card
                  text-sm text-text-secondary
                  disabled:opacity-30 disabled:cursor-not-allowed
                "
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.96 }}
                            >
                                <span className="font-semibold text-text-primary group-hover:text-accent transition-colors">
                                    {chip.label}
                                </span>
                                <span className="text-text-muted text-xs ml-2">
                                    {chip.desc}
                                </span>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* Features */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                >
                    {FEATURES.map((feature, i) => (
                        <motion.div
                            key={feature.title}
                            className="card p-5 space-y-2"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <h3 className="text-sm font-semibold text-text-primary">
                                {feature.title}
                            </h3>
                            <p className="text-xs text-text-muted leading-relaxed">
                                {feature.desc}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Footer */}
                <motion.p
                    className="text-center text-xs text-text-muted pt-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1 }}
                >
                    Built with adversarial AI agents · Not financial advice
                </motion.p>
            </div>
        </main>
    );
}