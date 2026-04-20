"use client";

import { useState } from "react";

interface ForecastResult {
  energy: number;
  stress: number;
  symptoms: string[];
  prediction: string;
  tip: string;
}

interface ForecastCardProps {
  totalLogs: number;
}

const MIN_LOGS = 5;

type State = "idle" | "loading" | "done" | "error" | "needs-data";

export function ForecastCard({ totalLogs }: ForecastCardProps) {
  const locked = totalLogs < MIN_LOGS;

  const [state, setState] = useState<State>("idle");
  const [result, setResult] = useState<ForecastResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [needsDataMsg, setNeedsDataMsg] = useState("");

  async function generate() {
    setState("loading");
    setResult(null);
    setErrorMsg("");

    try {
      const res = await fetch("/api/forecast");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail ?? data.error ?? "Unknown error");
      }

      if (data.needsMoreData) {
        setNeedsDataMsg(data.message);
        setState("needs-data");
        return;
      }

      setResult(data as ForecastResult);
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
          <CrystalIcon />
          <h3 className="text-sm font-semibold text-zinc-300">
            Tomorrow&rsquo;s Forecast
          </h3>
        </div>
        {!locked && (
          <button
            onClick={generate}
            disabled={state === "loading"}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            {state === "loading" ? (
              <>
                <SpinnerIcon />
                Forecasting…
              </>
            ) : state === "done" ? (
              <>
                <RefreshIcon />
                Refresh
              </>
            ) : (
              <>
                <CrystalIcon small />
                Forecast
              </>
            )}
          </button>
        )}
      </div>

      {/* Body */}
      <div className="p-5">
        {locked && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-zinc-800 border border-zinc-700">
            <LockIcon />
            <div>
              <p className="text-sm font-medium text-zinc-200">
                Log for {MIN_LOGS} days to unlock your forecast
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                You have {totalLogs} {totalLogs === 1 ? "log" : "logs"} so far.
                Keep going — AI needs a few days of data to predict patterns.
              </p>
            </div>
          </div>
        )}

        {!locked && state === "idle" && (
          <p className="text-sm text-zinc-500 text-center py-4">
            Click &ldquo;Forecast&rdquo; to predict tomorrow&rsquo;s energy, stress, and symptoms from your last 14 days.
          </p>
        )}

        {!locked && state === "loading" && (
          <div className="flex flex-col items-center gap-3 py-6 text-zinc-500">
            <div className="w-8 h-8 rounded-full border-2 border-blue-700 border-t-blue-400 animate-spin" />
            <p className="text-sm">Forecasting tomorrow…</p>
          </div>
        )}

        {!locked && state === "needs-data" && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-zinc-800 border border-zinc-700">
            <InfoIcon />
            <p className="text-sm text-zinc-300">{needsDataMsg}</p>
          </div>
        )}

        {!locked && state === "error" && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-900/20 border border-red-800">
            <ErrorIcon />
            <div>
              <p className="text-sm font-medium text-red-400">
                Failed to generate forecast
              </p>
              <p className="text-xs text-red-500 mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {!locked && state === "done" && result && (
          <div className="space-y-5">
            {/* Gauges */}
            <div className="grid grid-cols-2 gap-4">
              <Gauge
                label="Energy"
                value={result.energy}
                colour="green"
              />
              <Gauge
                label="Stress"
                value={result.stress}
                colour="amber"
              />
            </div>

            {/* Prediction highlight */}
            <div className="p-4 rounded-xl bg-blue-600/10 border border-blue-700/40">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-2">
                Prediction
              </p>
              <p className="text-sm text-zinc-200 leading-relaxed">
                {result.prediction}
              </p>
            </div>

            {/* Symptoms to watch */}
            {result.symptoms.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
                  Symptoms to watch for
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {result.symptoms.map((s, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actionable tip */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-600/40">
              <LightbulbIcon />
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-1">
                  Tip
                </p>
                <p className="text-sm text-zinc-200 leading-relaxed">
                  {result.tip}
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-600 text-right">
              AI forecast · based on your last 14 days
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Gauge({
  label,
  value,
  colour,
}: {
  label: string;
  value: number;
  colour: "green" | "amber";
}) {
  const pct = Math.max(0, Math.min(100, (value / 10) * 100));
  const barColour = colour === "green" ? "bg-green-500" : "bg-amber-500";
  const textColour = colour === "green" ? "text-green-400" : "text-amber-400";
  const trackColour = colour === "green" ? "bg-green-950/50" : "bg-amber-950/50";

  return (
    <div className="p-4 rounded-xl bg-zinc-800/60 border border-zinc-700">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          {label}
        </span>
        <div className="flex items-baseline gap-0.5">
          <span className={`text-2xl font-bold tabular-nums ${textColour}`}>
            {value}
          </span>
          <span className="text-xs text-zinc-500">/10</span>
        </div>
      </div>
      <div
        className={`h-2 rounded-full overflow-hidden ${trackColour}`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={1}
        aria-valuemax={10}
      >
        <div
          className={`h-full ${barColour} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function CrystalIcon({ small }: { small?: boolean }) {
  const size = small ? "w-3.5 h-3.5" : "w-4 h-4 text-blue-400";
  return (
    <svg className={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l6 7-6 13-6-13 6-7zm0 3.2L8 9.5l4 9 4-9-4-4.3z" />
    </svg>
  );
}

function LightbulbIcon() {
  return (
    <svg
      className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M9 21h6v-1.5H9V21zm3-19a7 7 0 00-4 12.74V17a1 1 0 001 1h6a1 1 0 001-1v-2.26A7 7 0 0012 2zm2.5 12.19l-.5.35V16h-4v-1.46l-.5-.35a5 5 0 115.01 0z" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg
      className="w-3.5 h-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 4v5h5M20 20v-5h-5M5 9a7 7 0 0112-3M19 15a7 7 0 01-12 3"
      />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg
      className="w-4 h-4 text-zinc-400 flex-shrink-0 mt-0.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg
      className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      className="w-5 h-5 text-zinc-400 flex-shrink-0 mt-0.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 11c.828 0 1.5.672 1.5 1.5S12.828 14 12 14s-1.5-.672-1.5-1.5S11.172 11 12 11zM6 10V7a6 6 0 1112 0v3m-9 0h6a3 3 0 013 3v5a3 3 0 01-3 3H9a3 3 0 01-3-3v-5a3 3 0 013-3z"
      />
    </svg>
  );
}
