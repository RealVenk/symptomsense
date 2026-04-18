"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { ScaleButtons } from "@/components/log/ScaleButtons";
import { SymptomTags } from "@/components/log/SymptomTags";
import { SleepSlider } from "@/components/log/SleepSlider";

export interface EditableLog {
  id: string;
  date: string;
  sleep_hours: number | null;
  stress_level: number | null;
  energy_level: number | null;
  symptoms: string[] | null;
  notes: string | null;
}

interface EditLogModalProps {
  log: EditableLog;
  userId: string;
  onClose: () => void;
  onSaved: () => void;
}

export function EditLogModal({ log, userId, onClose, onSaved }: EditLogModalProps) {
  const [date, setDate] = useState(log.date);
  const [sleepHours, setSleepHours] = useState(log.sleep_hours ?? 7);
  const [stressLevel, setStressLevel] = useState<number | null>(log.stress_level);
  const [energyLevel, setEnergyLevel] = useState<number | null>(log.energy_level);
  const [symptoms, setSymptoms] = useState<string[]>(log.symptoms ?? []);
  const [notes, setNotes] = useState(log.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  function todayString() {
    return new Date().toISOString().split("T")[0];
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (stressLevel === null || energyLevel === null) {
      setError("Please set both stress and energy levels.");
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();
      const { error: dbError } = await supabase
        .from("symptom_logs")
        .update({
          date,
          sleep_hours: sleepHours,
          stress_level: stressLevel,
          energy_level: energyLevel,
          symptoms,
          notes: notes.trim() || null,
        })
        .eq("id", log.id)
        .eq("user_id", userId); // RLS double-check

      if (dbError) throw dbError;
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative z-10 w-full sm:max-w-lg bg-zinc-900 border border-zinc-700 rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92dvh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 px-5 py-4 flex items-center justify-between z-10">
          <h2 className="text-base font-semibold text-zinc-100">Edit log</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="px-5 py-6 space-y-7">
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

          {/* Sleep */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-300">Sleep last night</label>
            <SleepSlider value={sleepHours} onChange={setSleepHours} />
          </div>

          {/* Stress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-zinc-300">Stress level</label>
              {stressLevel && (
                <span className="text-sm font-bold text-amber-400">{stressLevel}/10</span>
              )}
            </div>
            <ScaleButtons
              value={stressLevel}
              onChange={setStressLevel}
              lowLabel="Relaxed"
              highLabel="Overwhelmed"
            />
          </div>

          {/* Energy */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-zinc-300">Energy level</label>
              {energyLevel && (
                <span className="text-sm font-bold text-violet-400">{energyLevel}/10</span>
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
              <label className="text-sm font-medium text-zinc-300">Symptoms</label>
              {symptoms.length > 0 && (
                <span className="text-xs text-zinc-500">{symptoms.length} selected</span>
              )}
            </div>
            <SymptomTags selected={symptoms} onChange={setSymptoms} />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">
              Notes <span className="text-zinc-500 font-normal">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Anything else worth noting…"
              className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-900/30 border border-red-800">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
