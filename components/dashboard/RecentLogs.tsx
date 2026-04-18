interface Log {
  id: string;
  date: string;
  sleep_hours: number | null;
  stress_level: number | null;
  energy_level: number | null;
  symptoms: string[] | null;
}

interface RecentLogsProps {
  logs: Log[];
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function ScorePill({
  value,
  colour,
}: {
  value: number | null;
  colour: string;
}) {
  if (value == null) return <span className="text-zinc-600 text-xs">—</span>;
  return (
    <span className={`text-sm font-bold tabular-nums ${colour}`}>{value}</span>
  );
}

export function RecentLogs({ logs }: RecentLogsProps) {
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
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-300">Recent logs</h3>
        <span className="text-xs text-zinc-600">Last {logs.length} entries</span>
      </div>
      <ul className="divide-y divide-zinc-800">
        {logs.map((log) => (
          <li key={log.id} className="px-5 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-zinc-200">
                  {formatDate(log.date)}
                </p>
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
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-center">
                  <p className="text-xs text-zinc-600 mb-0.5">Sleep</p>
                  <ScorePill
                    value={log.sleep_hours}
                    colour="text-blue-400"
                  />
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
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
