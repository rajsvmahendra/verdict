"use client";

import { motion } from "framer-motion";

interface ConfidenceBarProps {
    label: string;
    value: number;
    color?: "decision" | "quality";
    delay?: number;
}

export function ConfidenceBar({
    label,
    value,
    color = "decision",
    delay = 0,
}: ConfidenceBarProps) {
    const percent = Math.round(value * 100);

    const barColor =
        color === "quality"
            ? "bg-accent"
            : percent >= 65
                ? "bg-invest"
                : percent >= 40
                    ? "bg-watchlist"
                    : "bg-pass";

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <span className="text-[11px] text-text-muted font-medium tracking-wide">
                    {label}
                </span>
                <span className="text-sm font-mono font-bold text-text-primary">
                    {percent}%
                </span>
            </div>
            <div className="h-1.5 bg-surface-raised rounded-full overflow-hidden">
                <motion.div
                    className={`h-full rounded-full ${barColor}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 1.2, delay, ease: [0.16, 1, 0.3, 1] }}
                />
            </div>
        </div>
    );
}