"use client";

interface SleepSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function SleepSlider({ value, onChange }: SleepSliderProps) {
  const pct = (value / 12) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-white">{value}</span>
          <span className="text-zinc-400 text-sm">hours</span>
        </div>
        <span className="text-xs text-zinc-500">
          {value < 6 ? "Below recommended" : value <= 9 ? "Healthy range" : "Oversleeping"}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={0}
          max={12}
          step={0.5}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer focus:outline-none"
          style={{
            background: `linear-gradient(to right, #2563eb ${pct}%, #3f3f46 ${pct}%)`,
          }}
        />
      </div>
      <div className="flex justify-between text-xs text-zinc-500">
        <span>0h</span>
        <span>3h</span>
        <span>6h</span>
        <span>9h</span>
        <span>12h</span>
      </div>
    </div>
  );
}
