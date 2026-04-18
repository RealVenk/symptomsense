"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { EditLogModal, type EditableLog } from "./EditLogModal";

export interface Log {
  id: string;
  date: string;
  sleep_hours: number | null;
  stress_level: number | null;
  energy_level: number | null;
  symptoms: string[] | null;
  notes: string | null;
}

interface RecentLogsProps {
  logs: Log[];
  userId: string;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function ScorePill({ value, colour }: { value: number | null; colour: string }) {
  if (value == null) return <span className="text-zinc-600 text-xs">—</span>;
  return <span className={`text-sm font-bold tabular-nums ${colour}`}>{value}</span>;
}

export function RecentLogs({ logs, userId }: RecentLogsProps) {
  const router = useRouter();
  const [editingLog, setEditingLog] = useState<EditableLog | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(id: string) {
    setDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("symptom_logs")
        .delete()
        .eq("id", id)
        .eq("user_id", userId); // belt-and-braces: RLS will also enforce this

      if (error) throw error;
      setConfirmDeleteId(null);
      router.refresh();
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleting(false);
    }
  }

  if (logs.length === 0) {
    return (
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 text-center">
        <p className="text-zinc-500 text-sm">
          No logs yet.{" "}
          <a href="/log" className="text-blue-400 hover:underline">
            Add your first entry →
          </a>
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-300">Recent logs</h3>
          <span className="text-xs text-zinc-600">Last {logs.length} entries</span>
        </div>

        <ul className="divide-y divide-zinc-800">
          {logs.map((log) => (
            <li key={log.id}>
              {/* Main row */}
              <div className="px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  {/* Left: date + symptoms */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-zinc-200">{formatDate(log.date)}</p>
                    {log.symptoms && log.symptoms.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {log.symptoms.map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded-full text-xs bg-zinc-800 text-zinc-400 border border-zinc-700"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right: scores + action buttons */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-xs text-zinc-600 mb-0.5">Sleep</p>
                        <ScorePill value={log.sleep_hours} colour="text-blue-400" />
                        {log.sleep_hours != null && (
                          <span className="text-xs text-zinc-600">h</span>
                        )}
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-zinc-600 mb-0.5">Energy</p>
                        <ScorePill value={log.energy_level} colour="text-violet-400" />
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-zinc-600 mb-0.5">Stress</p>
                        <ScorePill value={log.stress_level} colour="text-amber-400" />
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 ml-1 border-l border-zinc-800 pl-3">
                      <button
                        type="button"
                        onClick={() => setEditingLog(log)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                        title="Edit log"
                      >
                        <EditIcon />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(log.id)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                        title="Delete log"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Inline delete confirm */}
              {confirmDeleteId === log.id && (
                <div className="px-5 py-3 bg-red-900/10 border-t border-red-900/30 flex items-center justify-between gap-4">
                  <p className="text-sm text-red-400">Delete this log permanently?</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-3 py-1.5 text-xs rounded-lg border border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(log.id)}
                      disabled={deleting}
                      className="px-3 py-1.5 text-xs rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-medium transition-colors"
                    >
                      {deleting ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Edit modal */}
      {editingLog && (
        <EditLogModal
          log={editingLog}
          userId={userId}
          onClose={() => setEditingLog(null)}
          onSaved={() => {
            setEditingLog(null);
            router.refresh();
          }}
        />
      )}
    </>
  );
}

function EditIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}
