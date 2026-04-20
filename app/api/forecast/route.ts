import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { geminiFlash } from "@/lib/ai";

export interface ForecastResult {
  energy: number;
  stress: number;
  symptoms: string[];
  prediction: string;
  tip: string;
}

const MIN_LOGS = 5;

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  const since = fourteenDaysAgo.toISOString().split("T")[0];

  const { data: logs, error: dbError } = await supabase
    .from("symptom_logs")
    .select("date, sleep_hours, stress_level, energy_level, symptoms, notes")
    .eq("user_id", user.id)
    .gte("date", since)
    .order("date", { ascending: true });

  if (dbError) {
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }

  if (!logs || logs.length < MIN_LOGS) {
    return NextResponse.json(
      {
        needsMoreData: true,
        message: `Log for ${MIN_LOGS} days to unlock your forecast. You currently have ${
          logs?.length ?? 0
        }.`,
      },
      { status: 200 }
    );
  }

  const logsJson = JSON.stringify(
    logs.map((l) => ({
      date: l.date,
      sleep_hours: l.sleep_hours,
      stress_level: l.stress_level,
      energy_level: l.energy_level,
      symptoms: l.symptoms ?? [],
      notes: l.notes ?? null,
    })),
    null,
    2
  );

  const today = new Date().toISOString().split("T")[0];

  const prompt = `You are a personal health forecaster. Based on the user's last 14 days of symptom logs, predict how they are likely to feel tomorrow.

Today's date: ${today}
Data (JSON array, most recent last):
${logsJson}

Return ONLY a valid JSON object — no markdown, no code fences, no explanation:
{
  "energy": <integer 1-10, predicted energy level for tomorrow>,
  "stress": <integer 1-10, predicted stress level for tomorrow>,
  "symptoms": ["<symptom 1>", "<symptom 2>"],
  "prediction": "<1-2 sentence forecast of tomorrow, grounded in recent patterns>",
  "tip": "<one short actionable tip the user can do tonight or tomorrow morning, e.g. 'Sleep before 11pm tonight' — concrete, specific, one sentence>"
}

Rules:
- "energy" and "stress" must be integers between 1 and 10.
- "symptoms" should list 0-4 symptoms that are most likely to appear tomorrow given recent patterns. Use an empty array if nothing stands out.
- Base every field on the data provided — do not invent patterns.
- "tip" should be directly actionable and tied to something in the recent data (sleep trend, stress trend, symptom cluster, etc.).
- Write "prediction" in second person ("You're likely to…").`;

  try {
    const result = await geminiFlash.generateContent(prompt);
    const text = result.response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("[forecast] No JSON in Gemini response:", text);
      return NextResponse.json(
        { error: "Could not parse AI response" },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]) as Partial<ForecastResult>;

    const energy = Number(parsed.energy);
    const stress = Number(parsed.stress);
    if (
      !Number.isFinite(energy) ||
      !Number.isFinite(stress) ||
      energy < 1 ||
      energy > 10 ||
      stress < 1 ||
      stress > 10 ||
      typeof parsed.prediction !== "string" ||
      typeof parsed.tip !== "string" ||
      !Array.isArray(parsed.symptoms)
    ) {
      return NextResponse.json(
        { error: "AI returned an unexpected format" },
        { status: 500 }
      );
    }

    const forecast: ForecastResult = {
      energy: Math.round(energy),
      stress: Math.round(stress),
      symptoms: parsed.symptoms.filter(
        (s): s is string => typeof s === "string"
      ),
      prediction: parsed.prediction,
      tip: parsed.tip,
    };

    return NextResponse.json(forecast);
  } catch (err) {
    console.error("[forecast] Error:", err);
    return NextResponse.json(
      {
        error: "Failed to generate forecast",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
