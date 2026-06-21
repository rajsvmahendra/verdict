"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Spinner } from "@/components/ui/spinner";
import { SearchIcon, ShieldIcon } from "@/components/ui/icons";

const EXAMPLE_CHIPS = [
    { label: "Apple", desc: "Consumer tech giant" },
    { label: "Stripe", desc: "Private fintech" },
    { label: "Nvidia", desc: "AI chip leader" },
    { label: "Mercury", desc: "Ambiguous name" },
    { label: "Duolingo", desc: "EdTech growth" },
    { label: "SpaceX", desc: "Private aerospace" },
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
        <main className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 relative overflow-hidden">
            {/* Ambient glow behind the input */}
            <motion.div
                className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
                style={{
                    background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
                }}
                animate={{
                    scale: isFocused ? 1.2 : 1,
                    opacity: isFocused ? 1 : 0.6,
                }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
            />

            <motion.div
                className="w-full max-w-2xl space-y-12 relative z-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                {/* Brand */}
                <div className="text-center space-y-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <h1 className="text-6xl font-bold tracking-tight text-shimmer">
                            Verdict
                        </h1>
                    </motion.div>
                    <motion.p
                        className="text-text-secondary text-base leading-relaxed max-w-md mx-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        An AI-powered investment committee that researches, debates,
                        and delivers a structured verdict on any company.
                    </motion.p>
                </div>

                {/* Value Proposition */}
                <motion.div
                    className="flex items-center justify-center gap-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    {[
                        { label: "6 AI Agents", sub: "Research · Debate · Decide" },
                        { label: "Evidence-Based", sub: "Every claim sourced" },
                        { label: "3 Verdicts", sub: "Invest · Watchlist · Pass" },
                    ].map((item) => (
                        <div key={item.label} className="text-center">
                            <p className="text-xs font-semibold text-accent tracking-wider uppercase">
                                {item.label}
                            </p>
                            <p className="text-[10px] text-text-muted mt-0.5">{item.sub}</p>
                        </div>
                    ))}
                </motion.div>

                {/* Search */}
                <motion.div
                    className="space-y-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <div
                        className={`
              relative flex items-center
              glass-card rounded-2xl
              transition-all duration-500
              ${isFocused ? "glow-border" : ""}
              ${clarificationMessage ? "border-watchlist/40" : ""}
              ${errorMessage ? "border-pass/40" : ""}
            `}
                    >
                        <div className="pl-5 flex-shrink-0">
                            {isSubmitting ? (
                                <Spinner size="sm" />
                            ) : (
                                <SearchIcon className="w-5 h-5 text-text-muted" />
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
                font-light tracking-wide
              "
                        />

                        <motion.button
                            onClick={() => handleSubmit(value)}
                            disabled={!value.trim() || isSubmitting}
                            className="
                mr-3 px-5 py-2.5 rounded-xl
                bg-accent text-white
                text-sm font-semibold tracking-wide
                disabled:opacity-20 disabled:cursor-not-allowed
                transition-all duration-200
                hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]
              "
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Analyse
                        </motion.button>
                    </div>

                    {/* Feedback messages */}
                    <AnimatePresence mode="wait">
                        {clarificationMessage && (
                            <motion.div
                                key="clarification"
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className="px-5 py-4 rounded-xl glass-card border-watchlist/20"
                            >
                                <div className="flex items-start gap-3">
                                    <ShieldIcon className="w-4 h-4 text-watchlist mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm text-watchlist font-medium">
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
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className="px-5 py-4 rounded-xl glass-card border-pass/20"
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
                    transition={{ delay: 0.7 }}
                >
                    <p className="text-[11px] text-text-muted text-center tracking-[0.2em] uppercase">
                        Try a company
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {EXAMPLE_CHIPS.map((chip, i) => (
                            <motion.button
                                key={chip.label}
                                onClick={() => handleChipClick(chip.label)}
                                disabled={isSubmitting}
                                className="
                  group relative px-4 py-2 rounded-xl
                  glass-card
                  text-sm text-text-secondary
                  hover:text-text-primary
                  hover:border-accent/30
                  disabled:opacity-30 disabled:cursor-not-allowed
                  transition-all duration-300
                "
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 + i * 0.05 }}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                            >
                                <span className="font-medium">{chip.label}</span>
                                <span className="text-text-muted text-xs ml-1.5 hidden sm:inline">
                                    {chip.desc}
                                </span>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* Footer */}
                <motion.p
                    className="text-center text-[11px] text-text-muted tracking-wide"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                >
                    Six adversarial AI agents · Evidence-grounded research · Not financial advice
                </motion.p>
            </motion.div>
        </main>
    );
}