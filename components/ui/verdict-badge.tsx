/**
 * VerdictBadge — Renders INVEST / WATCHLIST / PASS with appropriate color.
 */

import type { Verdict } from "@/types/graph";

interface VerdictBadgeProps {
    verdict: Verdict;
    size?: "sm" | "md" | "lg";
}

const config: Record<
    Verdict,
    { label: string; className: string }
> = {
    INVEST: {
        label: "INVEST",
        className:
            "bg-invest-bg text-invest border border-invest/30",
    },
    WATCHLIST: {
        label: "WATCHLIST",
        className:
            "bg-watchlist-bg text-watchlist border border-watchlist/30",
    },
    PASS: {
        label: "PASS",
        className:
            "bg-pass-bg text-pass border border-pass/30",
    },
};

const sizeClass = {
    sm: "text-xs px-2 py-0.5 rounded",
    md: "text-sm px-3 py-1 rounded-md font-medium tracking-wide",
    lg: "text-base px-4 py-1.5 rounded-md font-semibold tracking-widest",
};

export function VerdictBadge({ verdict, size = "md" }: VerdictBadgeProps) {
    const { label, className } = config[verdict];
    return (
        <span className={`inline-flex items-center font-mono ${className} ${sizeClass[size]}`}>
            {label}
        </span>
    );
}