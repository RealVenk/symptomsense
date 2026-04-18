"use client";

import { useState } from "react";

interface AnalysisResult {
  summary: string;
  insights: string[];
}

type State = "idle" | "loading" | "done" | "error" | "needs-data";

export function AIInsights() {
  const [state, setState] = useState<State>("idle");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [needsDataMsg, setNeedsDataMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  async function generate() {
    setState("loading");
    setResult(null);
    setErrorMsg("");

    try {
      const res = await fetch("/api/analyse-patterns");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail ?? data.error ?? "Unknown error");
      }

      if (data.needsMoreData) {
        setNeedsDataMsg(data.message);
        setState("needs-data");
        return;
      }

      setResult(data);
      setState("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setState("error");
    }
  }

  return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <SparkleIcon />
          <h3 className="text-sm font-semibold text-zinc-300">AI Insights</h3>
        </div>
        <button
          onClick={generate}
          disabled={state === "loading"}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
        >
          {state === "loading" ? (
            <>
              <SpinnerIcon />
              Analysing…
            </>
          ) : state === "done" ? (
            <>
              <SparkleIcon small />
              Regenerate
            </>
          ) : (
            <>
              <SparkleIcon small />
              Generate Insights
            </>
          )}
        </button>
      </div>

      {/* Body */}
      <div className="p-5">
        {/* Idle */}
        {state === "idle" && (
          <p className="text-sm text-zinc-500 text-center py-4">
            Click &ldquo;Generate Insights&rdquo; to let AI analyse your last 30 days of logs and surface patterns.
          </p>
        )}

        {/* Loading */}
        {state === "loading" && (
          <div className="flex flex-col items-center gap-3 py-6 text-zinc-500">
            <div className="w-8 h-8 rounded-full border-2 border-violet-700 border-t-violet-400 animate-spin" />
            <p className="text-sm">Analysing your health patterns…</p>
          </div>
        )}

        {/* Needs more data */}
        {state === "needs-data" && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-zinc-800 border border-zinc-700">
            <InfoIcon />
            <p className="text-sm text-zinc-300">{needsDataMsg}</p>
          </div>
        )}

        {/* Error */}
        {state === "error" && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-900/20 border border-red-800">
            <ErrorIcon />
            <div>
              <p className="text-sm font-medium text-red-400">Failed to generate insights</p>
              <p className="text-xs text-red-500 mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {state === "done" && result && (
          <div className="space-y-5">
            {/* Summary highlight */}
            <div className="p-4 rounded-xl bg-violet-600/10 border border-violet-700/40">
              <p className="text-xs font-semibold uppercase tracking-widest text-violet-400 mb-2">
                This period
              </p>
              <p className="text-sm text-zinc-200 leading-relaxed">{result.summary}</p>
            </div>

            {/* Insight cards */}
            <ul className="space-y-3">
              {result.insights.map((insight, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 p-4 rounded-xl bg-zinc-800 border border-zinc-700 hover:border-zinc-600 transition-colors"
                >
                  <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center">
                    <ChevronIcon />
                  </span>
                  <p className="text-sm text-zinc-300 leading-relaxed">{insight}</p>
                </li>
              ))}
            </ul>

            <p className="text-xs text-zinc-600 text-right">
              AI analysis · based on your last 30 days
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function SparkleIcon({ small }: { small?: boolean }) {
  const size = small ? "w-3.5 h-3.5" : "w-4 h-4 text-violet-400";
  return (
    <svg className={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l2.4 7.2H22l-6.2 4.5 2.4 7.3L12 16.5 5.8 21l2.4-7.3L2 9.2h7.6L12 2z" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg className="w-4 h-4 text-zinc-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg className="w-3 h-3 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}
