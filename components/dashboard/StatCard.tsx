interface StatCardProps {
  label: string;
  value: string;
  unit?: string;
  sublabel?: string;
  colour: "blue" | "violet" | "amber";
}

const colourMap = {
  blue: {
    icon: "bg-blue-500/10 text-blue-400",
    value: "text-blue-400",
  },
  violet: {
    icon: "bg-violet-500/10 text-violet-400",
    value: "text-violet-400",
  },
  amber: {
    icon: "bg-amber-500/10 text-amber-400",
    value: "text-amber-400",
  },
};

export function StatCard({ label, value, unit, sublabel, colour }: StatCardProps) {
  const c = colourMap[colour];
  return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5 flex flex-col gap-3">
      <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
        {label}
      </span>
      <div className="flex items-end gap-1.5">
        <span className={`text-4xl font-bold tabular-nums ${c.value}`}>
          {value}
        </span>
        {unit && (
          <span className="text-sm text-zinc-500 mb-1">{unit}</span>
        )}
      </div>
      {sublabel && (
        <span className="text-xs text-zinc-600">{sublabel}</span>
      )}
    </div>
  );
}
