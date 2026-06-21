"use client";

import { useState, useRef, useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";

const EXAMPLE_CHIPS = [
    { label: "Apple", category: "well-known" },
    { label: "Stripe", category: "private" },
    { label: "Nvidia", category: "well-known" },
    { label: "Mercury", category: "ambiguous" },
    { label: "Duolingo", category: "smaller" },
    { label: "SpaceX", category: "private" },
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
        if (e.key === "Enter") {
            handleSubmit(value);
        }
    }

    function handleChipClick(label: string) {
        setValue(label);
        handleSubmit(label);
    }

    return (
        <main className="min-h-screen bg-bg flex flex-col items-center justify-center px-4">
            <div className="w-full max-w-2xl space-y-10 animate-fade-in">
                <div className="text-center space-y-3">
                    <h1 className="text-5xl font-semibold tracking-tight text-text-primary">
                        Verdict
                    </h1>
                    <p className="text-text-secondary text-base">
                        Multi-agent AI investment research &amp; decision engine
                    </p>
                </div>

                <div className="space-y-3">
                    <div
                        className={`
              relative flex items-center
              bg-surface border rounded-xl
              transition-all duration-200
              ${isSubmitting
                                ? "border-border opacity-70"
                                : clarificationMessage
                                    ? "border-watchlist/50"
                                    : errorMessage
                                        ? "border-pass/40"
                                        : "border-border hover:border-text-muted focus-within:border-text-secondary"
                            }
            `}
                    >
                        <div className="pl-4 text-text-muted flex-shrink-0">
                            {isSubmitting ? (
                                <Spinner size="sm" />
                            ) : (
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                                    />
                                </svg>
                            )}
                        </div>

                        <input
                            ref={inputRef}
                            type="text"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter a company name or ticker…"
                            disabled={isSubmitting}
                            className="
                flex-1 bg-transparent px-3 py-4
                text-text-primary placeholder:text-text-muted
                text-base outline-none
                disabled:cursor-not-allowed
              "
                        />

                        <button
                            onClick={() => handleSubmit(value)}
                            disabled={!value.trim() || isSubmitting}
                            className="
                mr-2 px-4 py-2 rounded-lg
                bg-text-primary text-bg
                text-sm font-medium
                disabled:opacity-30 disabled:cursor-not-allowed
                hover:bg-accent transition-colors duration-150
                flex-shrink-0
              "
                        >
                            Analyse
                        </button>
                    </div>

                    {clarificationMessage && (
                        <div className="px-4 py-3 rounded-lg bg-watchlist-bg border border-watchlist/20 animate-fade-in">
                            <p className="text-sm text-watchlist leading-relaxed">
                                <span className="font-medium">Clarification needed — </span>
                                {clarificationMessage}
                            </p>
                            <p className="text-xs text-text-muted mt-1">
                                Please refine your search above.
                            </p>
                        </div>
                    )}

                    {errorMessage && (
                        <div className="px-4 py-3 rounded-lg bg-pass-bg border border-pass/20 animate-fade-in">
                            <p className="text-sm text-pass">{errorMessage}</p>
                        </div>
                    )}
                </div>

                <div className="space-y-3">
                    <p className="text-xs text-text-muted text-center tracking-wider uppercase">
                        Try an example
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {EXAMPLE_CHIPS.map((chip) => (
                            <button
                                key={chip.label}
                                onClick={() => handleChipClick(chip.label)}
                                disabled={isSubmitting}
                                className="
                  px-3 py-1.5 rounded-full
                  bg-surface border border-border
                  text-sm text-text-secondary
                  hover:border-text-muted hover:text-text-primary
                  disabled:opacity-40 disabled:cursor-not-allowed
                  transition-all duration-150
                "
                            >
                                {chip.label}
                            </button>
                        ))}
                    </div>
                </div>

                <p className="text-center text-xs text-text-muted">
                    Powered by a six-agent adversarial committee · Not financial advice
                </p>
            </div>
        </main>
    );
}