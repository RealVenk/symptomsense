"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ScaleButtons } from "./ScaleButtons";
import { SymptomTags } from "./SymptomTags";
import { SleepSlider } from "./SleepSlider";
import { VoiceLogger } from "./VoiceLogger";

interface SymptomLogFormProps {
  userId: string;
}

type Mode = "manual" | "voice";

function todayString() {
  return new Date().toISOString().split("T")[0];
}

export function SymptomLogForm({ userId }: SymptomLogFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("manual");

  const [date, setDate] = useState(todayString());
  const [sleepHours, setSleepHours] = useState(7);
  const [stressLevel, setStressLevel] = useState<number | null>(null);
  const [energyLevel, setEnergyLevel] = useState<number | null>(null);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function applyExtracted(fields: {
    sleep_hours: number | null;
    stress_level: number | null;
    energy_level: number | null;
    symptoms: string[];
    notes: string | null;
  }) {
    if (fields.sleep_hours !== null) setSleepHours(fields.sleep_hours);
    if (fields.stress_level !== null) setStressLevel(fields.stress_level);
    if (fields.energy_level !== null) setEnergyLevel(fields.energy_level);
    if (fields.symptoms.length > 0) setSymptoms(fields.symptoms);
    if (fields.notes) setNotes(fields.notes);
    setMode("manual");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (stressLevel === null || energyLevel === null) {
      setSubmitError("Please set both stress and energy levels.");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("symptom_logs").insert({
        user_id: userId,
        date,
        sleep_hours: sleepHours,
        stress_level: stressLevel,
        energy_level: energyLevel,
        symptoms,
        notes: notes.trim() || null,
      });

      if (error) throw error;
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to save. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div className="flex p-1 bg-zinc-800 rounded-xl gap-1">
        <button
          type="button"
          onClick={() => setMode("manual")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === "manual"
              ? "bg-zinc-700 text-white shadow"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <FormIcon />
          Manual Entry
        </button>
        <button
          type="button"
          onClick={() => setMode("voice")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === "voice"
              ? "bg-zinc-700 text-white shadow"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <MicIcon />
          Voice Log
        </button>
      </div>

      {/* Voice mode */}
      {mode === "voice" && (
        <div className="rounded-xl border border-zinc-700 bg-zinc-800/40 p-5">
          <h3 className="text-sm font-medium text-zinc-300 mb-4">
            Describe how you feel — AI will extract the details
          </h3>
          <VoiceLogger onExtracted={applyExtracted} />
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-7">
        {/* Date */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">Date</label>
          <input
            type="date"
            value={date}
            max={todayString()}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent [color-scheme:dark]"
          />
        </div>

        {/* Sleep hours */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-zinc-300">
            Sleep last night
          </label>
          <SleepSlider value={sleepHours} onChange={setSleepHours} />
        </div>

        {/* Stress level */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-zinc-300">
              Stress level
            </label>
            {stressLevel && (
              <span className="text-sm font-bold text-blue-400">
                {stressLevel}/10
              </span>
            )}
          </div>
          <ScaleButtons
            value={stressLevel}
            onChange={setStressLevel}
            lowLabel="Relaxed"
            highLabel="Overwhelmed"
          />
        </div>

        {/* Energy level */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-zinc-300">
              Energy level
            </label>
            {energyLevel && (
              <span className="text-sm font-bold text-blue-400">
                {energyLevel}/10
              </span>
            )}
          </div>
          <ScaleButtons
            value={energyLevel}
            onChange={setEnergyLevel}
            lowLabel="Drained"
            highLabel="Energised"
          />
        </div>

        {/* Symptoms */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-zinc-300">
              Symptoms today
            </label>
            {symptoms.length > 0 && (
              <span className="text-xs text-zinc-500">
                {symptoms.length} selected
              </span>
            )}
          </div>
          <SymptomTags selected={symptoms} onChange={setSymptoms} />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">
            Notes{" "}
            <span className="text-zinc-500 font-normal">(optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Anything else worth noting — diet, exercise, unusual events..."
            className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Error */}
        {submitError && (
          <div className="p-3 rounded-lg bg-red-900/30 border border-red-800">
            <p className="text-sm text-red-400">{submitError}</p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 shadow-lg shadow-blue-900/30"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving...
            </span>
          ) : (
            "Save Log"
          )}
        </button>
      </form>
    </div>
  );
}

function FormIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
    </svg>
  );
}
