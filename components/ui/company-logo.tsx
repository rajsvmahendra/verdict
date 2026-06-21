"use client";

import { useState } from "react";

interface CompanyLogoProps {
    companyName: string;
    ticker?: string;
    size?: "sm" | "md" | "lg";
}

function getLogoUrl(companyName: string, ticker?: string): string {
    const domain = guessDomain(companyName, ticker);
    return `https://logo.clearbit.com/${domain}`;
}

function guessDomain(companyName: string, ticker?: string): string {
    const cleaned = companyName
        .toLowerCase()
        .replace(/,?\s*(inc\.?|corp\.?|ltd\.?|llc\.?|plc\.?|co\.?|group|holdings?)$/i, "")
        .replace(/[^a-z0-9]/g, "")
        .trim();

    const knownMappings: Record<string, string> = {
        alphabet: "google.com",
        meta: "meta.com",
        berkshirehathaway: "berkshirehathaway.com",
    };

    if (knownMappings[cleaned]) return knownMappings[cleaned];

    return `${cleaned}.com`;
}

function getInitial(name: string): string {
    return name.charAt(0).toUpperCase();
}

const sizeMap = {
    sm: { container: "w-8 h-8", text: "text-sm", img: 32 },
    md: { container: "w-12 h-12", text: "text-lg", img: 48 },
    lg: { container: "w-16 h-16", text: "text-2xl", img: 64 },
};

export function CompanyLogo({ companyName, ticker, size = "md" }: CompanyLogoProps) {
    const [failed, setFailed] = useState(false);
    const s = sizeMap[size];

    if (failed) {
        return (
            <div
                className={`${s.container} rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0`}
            >
                <span className={`${s.text} font-bold text-accent`}>
                    {getInitial(companyName)}
                </span>
            </div>
        );
    }

    return (
        <div
            className={`${s.container} rounded-xl bg-white/5 border border-border flex items-center justify-center overflow-hidden flex-shrink-0`}
        >
            <img
                src={getLogoUrl(companyName, ticker)}
                alt={`${companyName} logo`}
                width={s.img}
                height={s.img}
                className="w-full h-full object-contain p-1.5"
                onError={() => setFailed(true)}
            />
        </div>
    );
}