"use client";

export const SYMPTOM_OPTIONS = [
  "headache",
  "fatigue",
  "anxiety",
  "brain fog",
  "nausea",
  "back pain",
  "mood swings",
] as const;

interface SymptomTagsProps {
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function SymptomTags({ selected, onChange }: SymptomTagsProps) {
  function toggle(symptom: string) {
    if (selected.includes(symptom)) {
      onChange(selected.filter((s) => s !== symptom));
    } else {
      onChange([...selected, symptom]);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {SYMPTOM_OPTIONS.map((symptom) => {
        const isSelected = selected.includes(symptom);
        return (
          <button
            key={symptom}
            type="button"
            onClick={() => toggle(symptom)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              isSelected
                ? "bg-blue-600 text-white shadow-md shadow-blue-900/30"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 border border-zinc-700"
            }`}
          >
            {isSelected && <span className="mr-1">✓</span>}
            {symptom}
          </button>
        );
      })}
    </div>
  );
}
