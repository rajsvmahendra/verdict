"use client";

import { useCallback, useState } from "react";
import { InputScreen } from "@/components/input-screen";
import { ProcessingScreen } from "@/components/processing-screen";
import { analyzeCompany, type AnalyzeResponse } from "@/lib/api-client";

type AppScreen = "input" | "processing" | "results";

export default function Home() {
  const [screen, setScreen] = useState<AppScreen>("input");
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [company, setCompany] = useState("");
  const [clarificationMessage, setClarificationMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAnalyze = useCallback(async (companyName: string) => {
    setCompany(companyName);
    setClarificationMessage(null);
    setErrorMessage(null);
    setIsSubmitting(true);
    setScreen("processing");

    try {
      const response = await analyzeCompany(companyName);

      if (response.status === "clarification_needed") {
        setClarificationMessage(response.message);
        setScreen("input");
        setIsSubmitting(false);
        return;
      }

      if (response.status === "error") {
        const isQuota =
          response.errors?.[0]?.message?.includes("429") ||
          response.errors?.[0]?.message?.includes("quota") ||
          response.error?.includes("429");

        setErrorMessage(
          isQuota
            ? "API quota reached. Please wait a few minutes and try again."
            : "Analysis failed. Please try again."
        );
        setScreen("input");
        setIsSubmitting(false);
        return;
      }

      setResult(response);
      setScreen("results");
      setIsSubmitting(false);
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
      setScreen("input");
      setIsSubmitting(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    setScreen("input");
    setResult(null);
    setCompany("");
    setClarificationMessage(null);
    setErrorMessage(null);
    setIsSubmitting(false);
  }, []);

  if (screen === "input") {
    return (
      <InputScreen
        onAnalyze={handleAnalyze}
        isSubmitting={isSubmitting}
        clarificationMessage={clarificationMessage}
        errorMessage={errorMessage}
      />
    );
  }

  if (screen === "processing") {
    return <ProcessingScreen company={company} />;
  }

  if (screen === "results" && result) {
    return (
      <main className="min-h-screen bg-bg flex items-center justify-center px-4">
        <div className="text-center space-y-4 animate-fade-in">
          <p className="text-text-secondary text-sm">Results for</p>
          <p className="text-text-primary font-mono text-lg">{company}</p>
          <p className="text-text-muted text-xs">
            Results screen coming in Step 6
          </p>
          <button
            onClick={handleReset}
            className="mt-4 px-4 py-2 rounded-lg border border-border text-text-secondary text-sm hover:text-text-primary hover:border-text-muted transition-colors"
          >
            ← New search
          </button>
        </div>
      </main>
    );
  }

  return null;
}