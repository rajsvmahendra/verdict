"use client";

import { useState } from "react";

interface CompanyLogoProps {
    companyName: string;
    ticker?: string;
    size?: "sm" | "md" | "lg";
}

const DOMAIN_MAP: Record<string, string> = {
    apple: "apple.com",
    alphabet: "google.com",
    google: "google.com",
    meta: "meta.com",
    facebook: "meta.com",
    microsoft: "microsoft.com",
    amazon: "amazon.com",
    netflix: "netflix.com",
    tesla: "tesla.com",
    nvidia: "nvidia.com",
    stripe: "stripe.com",
    spacex: "spacex.com",
    duolingo: "duolingo.com",
    uber: "uber.com",
    airbnb: "airbnb.com",
    spotify: "spotify.com",
    shopify: "shopify.com",
    palantir: "palantir.com",
    coinbase: "coinbase.com",
    discord: "discord.com",
    figma: "figma.com",
    notion: "notion.so",
    slack: "slack.com",
    zoom: "zoom.us",
    snowflake: "snowflake.com",
    databricks: "databricks.com",
    openai: "openai.com",
    anthropic: "anthropic.com",
    samsung: "samsung.com",
    sony: "sony.com",
    toyota: "toyota.com",
    nike: "nike.com",
    cocacola: "coca-cola.com",
    pepsi: "pepsico.com",
    walmart: "walmart.com",
    target: "target.com",
    costco: "costco.com",
    starbucks: "starbucks.com",
    mcdonalds: "mcdonalds.com",
    visa: "visa.com",
    mastercard: "mastercard.com",
    paypal: "paypal.com",
    jpmorgan: "jpmorganchase.com",
    goldman: "goldmansachs.com",
    morgan: "morganstanley.com",
    berkshire: "berkshirehathaway.com",
    adobe: "adobe.com",
    salesforce: "salesforce.com",
    oracle: "oracle.com",
    intel: "intel.com",
    amd: "amd.com",
    ibm: "ibm.com",
    cisco: "cisco.com",
    dell: "dell.com",
    hp: "hp.com",
    twitter: "x.com",
    snap: "snap.com",
    pinterest: "pinterest.com",
    reddit: "reddit.com",
    linkedin: "linkedin.com",
    dropbox: "dropbox.com",
    square: "squareup.com",
    block: "block.xyz",
    robinhood: "robinhood.com",
    plaid: "plaid.com",
    mercury: "mercury.com",
    ramp: "ramp.com",
    brex: "brex.com",
};

function getDomain(companyName: string): string {
    const cleaned = companyName
        .toLowerCase()
        .replace(/,?\s*(inc\.?|corp\.?|corporation|ltd\.?|llc\.?|plc\.?|co\.?|group|holdings?|& co\.?|technologies|technology|systems|platforms?)$/i, "")
        .trim();

    for (const [key, domain] of Object.entries(DOMAIN_MAP)) {
        if (cleaned.includes(key)) {
            return domain;
        }
    }

    const slugged = cleaned.replace(/[^a-z0-9]/g, "");
    return `${slugged}.com`;
}

function getInitials(name: string): string {
    const words = name
        .replace(/,?\s*(Inc\.?|Corp\.?|Corporation|Ltd\.?|LLC|PLC)$/i, "")
        .trim()
        .split(/\s+/);
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

const sizeMap = {
    sm: { container: "w-10 h-10", text: "text-sm", icon: 32 },
    md: { container: "w-14 h-14", text: "text-lg", icon: 48 },
    lg: { container: "w-[72px] h-[72px]", text: "text-2xl", icon: 64 },
};

export function CompanyLogo({ companyName, size = "md" }: CompanyLogoProps) {
    const [currentSource, setCurrentSource] = useState(0);
    const [allFailed, setAllFailed] = useState(false);
    const s = sizeMap[size];
    const domain = getDomain(companyName);

    // Multiple logo sources in priority order
    const sources = [
        `https://logo.clearbit.com/${domain}`,
        `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
        `https://icons.duckduckgo.com/ip3/${domain}.ico`,
    ];

    function handleError() {
        if (currentSource < sources.length - 1) {
            setCurrentSource((prev) => prev + 1);
        } else {
            setAllFailed(true);
        }
    }

    if (allFailed) {
        return (
            <div
                className={`${s.container} rounded-2xl bg-accent-soft border border-accent/15 flex items-center justify-center flex-shrink-0`}
            >
                <span className={`${s.text} font-bold text-accent`}>
                    {getInitials(companyName)}
                </span>
            </div>
        );
    }

    return (
        <div
            className={`${s.container} rounded-2xl bg-surface-raised border border-border flex items-center justify-center overflow-hidden flex-shrink-0`}
        >
            <img
                src={sources[currentSource]}
                alt={`${companyName} logo`}
                className="w-full h-full object-contain p-2.5"
                onError={handleError}
            />
        </div>
    );
}