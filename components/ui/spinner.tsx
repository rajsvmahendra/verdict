interface SpinnerProps {
    size?: "sm" | "md" | "lg";
    color?: string;
}

export function Spinner({ size = "md", color = "text-accent" }: SpinnerProps) {
    const sizeMap = { sm: "w-3.5 h-3.5", md: "w-5 h-5", lg: "w-7 h-7" };

    return (
        <div className={`${sizeMap[size]} ${color} relative`}>
            <svg className="animate-spin" viewBox="0 0 24 24" fill="none">
                <circle
                    cx="12" cy="12" r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="opacity-15"
                />
                <path
                    d="M12 2a10 10 0 0 1 10 10"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                />
            </svg>
        </div>
    );
}