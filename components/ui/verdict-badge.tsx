import type { Verdict } from "@/types/graph";

interface VerdictBadgeProps {
    verdict: Verdict;
    size?: "sm" | "md" | "lg";
}

const config: Record<Verdict, { label: string; color: string; bg: string; border: string }> = {
    INVEST: {
        label: "INVEST",
        color: "text-invest",
        bg: "bg-invest/12",
        border: "border-invest/25",
    },
    WATCHLIST: {
        label: "WATCHLIST",
        color: "text-watchlist",
        bg: "bg-watchlist/12",
        border: "border-watchlist/25",
    },
    PASS: {
        label: "PASS",
        color: "text-pass",
        bg: "bg-pass/12",
        border: "border-pass/25",
    },
};

const sizeClass = {
    sm: "text-[10px] px-2.5 py-1 tracking-[0.15em]",
    md: "text-xs px-3.5 py-1.5 tracking-[0.18em]",
    lg: "text-base px-5 py-2 tracking-[0.2em]",
};

export function VerdictBadge({ verdict, size = "md" }: VerdictBadgeProps) {
    const c = config[verdict];

    return (
        <span
            className={`
        inline-flex items-center font-mono font-bold
        rounded-lg border
        ${c.bg} ${c.color} ${c.border}
        ${sizeClass[size]}
        transition-all duration-300
        hover:scale-105
      `}
        >
            {c.label}
        </span>
    );
}