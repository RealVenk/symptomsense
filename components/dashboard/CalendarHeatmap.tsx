"use client";

import { useMemo, useState } from "react";

interface Log {
  date: string;
  sleep_hours: number | null;
  stress_level: number | null;
  energy_level: number | null;
  symptoms: string[] | null;
}

interface CalendarHeatmapProps {
  logs: Log[];
}

interface DayCell {
  iso: string;
  dateObj: Date;
  log: Log | null;
}

const DAYS = 90;

function toIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function colourFor(log: Log | null): string {
  if (!log || log.energy_level == null) {
    return "bg-zinc-800 border-zinc-700/60";
  }
  const e = log.energy_level;
  if (e <= 2) return "bg-green-950 border-green-900";
  if (e <= 4) return "bg-green-800 border-green-700";
  if (e <= 6) return "bg-green-600 border-green-500";
  if (e <= 8) return "bg-green-500 border-green-400";
  return "bg-green-400 border-green-300";
}

function formatFullDate(d: Date): string {
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function CalendarHeatmap({ logs }: CalendarHeatmapProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const { cells, totalLogged, currentStreak } = useMemo(() => {
    const logMap = new Map<string, Log>();
    for (const l of logs) {
      if (l.date) logMap.set(l.date, l);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const cells: DayCell[] = [];
    for (let i = DAYS - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const iso = toIso(d);
      cells.push({ iso, dateObj: d, log: logMap.get(iso) ?? null });
    }

    const totalLogged = cells.filter((c) => c.log !== null).length;

    let currentStreak = 0;
    for (let i = cells.length - 1; i >= 0; i--) {
      if (cells[i].log) currentStreak++;
      else break;
    }

    return { cells, totalLogged, currentStreak };
  }, [logs]);

  // Pad the start so the first column begins on a Sunday (so rows are weekdays).
  const firstDay = cells[0].dateObj.getDay(); // 0 = Sunday
  const padding = firstDay; // number of empty cells at the top of column 0
  const paddedCells: (DayCell | null)[] = [
    ...Array(padding).fill(null),
    ...cells,
  ];

  // Break into 7-row grid, column-major (so each column is a week).
  const columns: (DayCell | null)[][] = [];
  for (let i = 0; i < paddedCells.length; i += 7) {
    columns.push(paddedCells.slice(i, i + 7));
  }
  // Ensure last column has 7 rows
  while (columns[columns.length - 1].length < 7) {
    columns[columns.length - 1].push(null);
  }

  const selectedCell =
    selectedIdx != null ? cells[selectedIdx] ?? null : null;

  return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 gap-4 flex-wrap">
        <div>
          <h3 className="text-sm font-semibold text-zinc-300">
            Logging Streak
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Last 90 days · green = energy level
          </p>
        </div>
        <div className="flex items-center gap-5">
          <div className="text-right">
            <div className="text-2xl font-bold text-zinc-100 tabular-nums">
              {totalLogged}
            </div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-500">
              days logged
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-400 tabular-nums">
              {currentStreak}
            </div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-500">
              day streak
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <div className="flex gap-[3px] min-w-fit">
          {columns.map((col, ci) => (
            <div key={ci} className="flex flex-col gap-[3px]">
              {col.map((cell, ri) => {
                if (!cell) {
                  return (
                    <div
                      key={ri}
                      className="w-3 h-3 rounded-[3px] bg-transparent"
                    />
                  );
                }
                const idx = cells.indexOf(cell);
                const isSelected = selectedIdx === idx;
                return (
                  <button
                    key={ri}
                    type="button"
                    aria-label={`${formatFullDate(cell.dateObj)}${
                      cell.log ? "" : " — no log"
                    }`}
                    onClick={() =>
                      setSelectedIdx(isSelected ? null : idx)
                    }
                    className={`w-3 h-3 rounded-[3px] border cursor-pointer transition-all ${colourFor(
                      cell.log
                    )} ${
                      isSelected
                        ? "ring-2 ring-blue-400 ring-offset-1 ring-offset-zinc-900 scale-125"
                        : "hover:scale-125"
                    }`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-4 text-xs text-zinc-500">
        <span>{cells[0].dateObj.toLocaleDateString("en-GB", { month: "short", day: "numeric" })}</span>
        <div className="flex items-center gap-1.5">
          <span className="text-zinc-600">Less</span>
          <div className="w-3 h-3 rounded-[3px] bg-zinc-800 border border-zinc-700/60" />
          <div className="w-3 h-3 rounded-[3px] bg-green-950 border border-green-900" />
          <div className="w-3 h-3 rounded-[3px] bg-green-800 border border-green-700" />
          <div className="w-3 h-3 rounded-[3px] bg-green-600 border border-green-500" />
          <div className="w-3 h-3 rounded-[3px] bg-green-500 border border-green-400" />
          <div className="w-3 h-3 rounded-[3px] bg-green-400 border border-green-300" />
          <span className="text-zinc-600">More</span>
        </div>
        <span>Today</span>
      </div>

      {/* Tooltip / details panel */}
      {selectedCell && (
        <div className="mt-4 p-4 rounded-xl bg-zinc-800 border border-zinc-700">
          <div className="flex items-start justify-between gap-3 mb-2">
            <p className="text-sm font-semibold text-zinc-200">
              {formatFullDate(selectedCell.dateObj)}
            </p>
            <button
              type="button"
              onClick={() => setSelectedIdx(null)}
              className="text-zinc-500 hover:text-zinc-300 text-xs"
              aria-label="Close details"
            >
              ✕
            </button>
          </div>
          {selectedCell.log ? (
            <div className="grid grid-cols-3 gap-3 text-xs">
              <Metric
                label="Sleep"
                value={
                  selectedCell.log.sleep_hours != null
                    ? `${selectedCell.log.sleep_hours}h`
                    : "—"
                }
                colour="text-blue-400"
              />
              <Metric
                label="Energy"
                value={
                  selectedCell.log.energy_level != null
                    ? `${selectedCell.log.energy_level}/10`
                    : "—"
                }
                colour="text-green-400"
              />
              <Metric
                label="Stress"
                value={
                  selectedCell.log.stress_level != null
                    ? `${selectedCell.log.stress_level}/10`
                    : "—"
                }
                colour="text-amber-400"
              />
              <div className="col-span-3">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1.5">
                  Symptoms
                </p>
                {selectedCell.log.symptoms &&
                selectedCell.log.symptoms.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCell.log.symptoms.map((s, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-full bg-zinc-700 text-zinc-300 text-xs"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-500 text-xs">None reported</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-zinc-500">No log for this day.</p>
          )}
        </div>
      )}
    </div>
  );
}

function Metric({
  label,
  value,
  colour,
}: {
  label: string;
  value: string;
  colour: string;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-0.5">
        {label}
      </p>
      <p className={`text-sm font-semibold ${colour} tabular-nums`}>{value}</p>
    </div>
  );
}
