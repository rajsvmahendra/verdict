"use client";

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
    return (
        <div className="card-static p-6 space-y-4">
            <div className="skeleton skeleton-title w-2/5" />
            <div className="space-y-2">
                {Array.from({ length: lines }).map((_, i) => (
                    <div
                        key={i}
                        className="skeleton skeleton-text"
                        style={{ width: `${85 - i * 15}%`, animationDelay: `${i * 0.15}s` }}
                    />
                ))}
            </div>
        </div>
    );
}

export function SkeletonBadge() {
    return <div className="skeleton w-28 h-10 rounded-lg" />;
}

export function SkeletonBar() {
    return (
        <div className="space-y-2">
            <div className="skeleton skeleton-text w-1/3" />
            <div className="skeleton h-2 w-full rounded-full" />
        </div>
    );
}