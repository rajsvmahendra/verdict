/**
 * ConfidenceBar — Renders a labeled confidence score with a progress bar.
 */

interface ConfidenceBarProps {
    label: string;
    value: number; // 0–1
    color?: "default" | "quality";
}

export function ConfidenceBar({
    label,
    value,
    color = "default",
}: ConfidenceBarProps) {
    const percent = Math.round(value * 100);
    const barColor =
        color === "quality"
            ? "bg-violet-500"
            : percent >= 65
                ? "bg-invest"
                : percent >= 40
                    ? "bg-watchlist"
                    : "bg-pass";

    return (
        <div className="space-y-1.5">
            <div className="flex justify-between items-center">
                <span className="text-xs text-text-secondary font-medium">{label}</span>
                <span className="text-xs font-mono text-text-primary">{percent}%</span>
            </div>
            <div className="h-1.5 bg-surface-raised rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
}