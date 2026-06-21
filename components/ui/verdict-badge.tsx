import type { Verdict } from "@/types/graph";

interface VerdictBadgeProps {
    verdict: Verdict;
    size?: "sm" | "md" | "lg";
}

const config: Record<Verdict, { label: string; bg: string; text: string; border: string; glow: string }> = {
    INVEST: {
        label: "INVEST",
        bg: "bg-invest-bg",
        text: "text-invest",
        border: "border-invest/30",
        glow: "shadow-[0_0_20px_rgba(16,185,129,0.15)]",
    },
    WATCHLIST: {
        label: "WATCHLIST",
        bg: "bg-watchlist-bg",
        text: "text-watchlist",
        border: "border-watchlist/30",
        glow: "shadow-[0_0_20px_rgba(245,158,11,0.15)]",
    },
    PASS: {
        label: "PASS",
        bg: "bg-pass-bg",
        text: "text-pass",
        border: "border-pass/30",
        glow: "shadow-[0_0_20px_rgba(239,68,68,0.15)]",
    },
};

const sizeClass = {
    sm: "text-xs px-2.5 py-1 tracking-wider",
    md: "text-sm px-4 py-1.5 tracking-wider",
    lg: "text-lg px-6 py-2.5 tracking-[0.2em]",
};

export function VerdictBadge({ verdict, size = "md" }: VerdictBadgeProps) {
    const c = config[verdict];

    return (
        <span
            className={`
        inline-flex items-center font-mono font-bold
        rounded-lg border
        ${c.bg} ${c.text} ${c.border} ${c.glow}
        ${sizeClass[size]}
      `}
        >
            {c.label}
        </span>
    );
}