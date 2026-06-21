"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Spinner } from "@/components/ui/spinner";
import { SearchIcon, ShieldIcon } from "@/components/ui/icons";

const EXAMPLE_CHIPS = [
    { label: "Apple", desc: "Tech & Consumer" },
    { label: "Stripe", desc: "Payments" },
    { label: "Nvidia", desc: "Semiconductors" },
    { label: "Mercury", desc: "Try an ambiguous name" },
    { label: "Duolingo", desc: "Education" },
    { label: "SpaceX", desc: "Aerospace" },
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
            {/* Background depth layers */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <motion.div
                    className="absolute w-[500px] h-[500px] rounded-full"
                    style={{
                        background: "radial-gradient(circle, rgba(224,140,82,0.04) 0%, transparent 70%)",
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
            </div>

            <div className="w-full max-w-2xl relative z-10 pt-[8vh] pb-10 space-y-10">

                {/* Hero */}
                <motion.div
                    className="text-center space-y-5"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                    <h1 className="text-5xl md:text-6xl font-bold tracking-[-0.03em] text-text-primary leading-[1.1]">
                        Should you invest in
                        <br />
                        <span className="text-accent">that company?</span>
                    </h1>

                    <p className="text-text-secondary text-lg leading-relaxed max-w-lg mx-auto">
                        Type any company name. Our AI research team will investigate it,
                        debate the pros and cons, and give you a clear answer —
                        <span className="text-text-primary font-medium"> Invest</span>,
                        <span className="text-text-primary font-medium"> Watchlist</span>, or
                        <span className="text-text-primary font-medium"> Pass</span>.
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
              ${isFocused ? "border-accent/40 shadow-[0_0_0_1px_rgba(224,140,82,0.2),0_8px_40px_rgba(0,0,0,0.5)]" : ""}
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
                            placeholder="Try 'Tesla', 'MSFT', or even a misspelling..."
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
                            Research
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
                                            Which one did you mean?
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
                    <p className="section-label text-center">Popular searches</p>
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

                {/* How it works */}
                <motion.div
                    className="space-y-5 pt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                >
                    <p className="section-label text-center">How it works</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[
                            {
                                step: "1",
                                title: "We research it",
                                desc: "Our AI pulls real data — business model, financials, recent news, and competitive position.",
                            },
                            {
                                step: "2",
                                title: "Two sides debate",
                                desc: "A Bull agent argues for investing. A Bear agent argues against. A Skeptic challenges the winner.",
                            },
                            {
                                step: "3",
                                title: "You get a verdict",
                                desc: "A Chair agent weighs everything and delivers Invest, Watchlist, or Pass — with full reasoning.",
                            },
                        ].map((item, i) => (
                            <motion.div
                                key={item.step}
                                className="card p-5 space-y-2.5"
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                            >
                                <div className="w-7 h-7 rounded-lg bg-accent-soft flex items-center justify-center">
                                    <span className="text-xs font-bold text-accent">{item.step}</span>
                                </div>
                                <h3 className="text-sm font-semibold text-text-primary">
                                    {item.title}
                                </h3>
                                <p className="text-xs text-text-muted leading-relaxed">
                                    {item.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Footer */}
                <motion.p
                    className="text-center text-xs text-text-muted pt-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1 }}
                >
                    For research purposes only · This is not financial advice
                </motion.p>
            </div>
        </main>
    );
}