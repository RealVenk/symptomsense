"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface DataPoint {
  date: string;
  sleep_hours: number | null;
}

interface SleepChartProps {
  data: DataPoint[];
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm shadow-xl">
      <p className="text-zinc-400 mb-1">{formatDate(label)}</p>
      <p className="text-blue-400 font-semibold">
        {payload[0].value != null ? `${payload[0].value}h sleep` : "No data"}
      </p>
    </div>
  );
}

export function SleepChart({ data }: SleepChartProps) {
  const chartData = data.map((d) => ({
    date: d.date,
    sleep: d.sleep_hours,
  }));

  return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5">
      <h3 className="text-sm font-semibold text-zinc-300 mb-5">
        Sleep hours
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fill: "#71717a", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[0, 12]}
            ticks={[0, 3, 6, 8, 9, 12]}
            tick={{ fill: "#71717a", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <ReferenceLine y={8} stroke="#3f3f46" strokeDasharray="4 4" />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="sleep"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 3, fill: "#3b82f6", strokeWidth: 0 }}
            activeDot={{ r: 5, fill: "#3b82f6" }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-xs text-zinc-600 mt-2">Dashed line = 8h recommended</p>
    </div>
  );
}
