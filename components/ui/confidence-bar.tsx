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

    const glowColor =
        color === "quality"
            ? "shadow-[0_0_8px_rgba(99,102,241,0.4)]"
            : percent >= 65
                ? "shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                : percent >= 40
                    ? "shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                    : "shadow-[0_0_8px_rgba(239,68,68,0.4)]";

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <span className="text-xs text-text-secondary font-medium tracking-wide">
                    {label}
                </span>
                <span className="text-sm font-mono font-bold text-text-primary">
                    {percent}%
                </span>
            </div>
            <div className="h-2 bg-surface-raised rounded-full overflow-hidden">
                <motion.div
                    className={`h-full rounded-full ${barColor} ${glowColor}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 1, delay, ease: "easeOut" }}
                />
            </div>
        </div>
    );
}