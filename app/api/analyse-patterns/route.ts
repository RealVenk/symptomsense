import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { geminiFlash } from "@/lib/ai";

export interface AnalysisResult {
  summary: string;
  insights: string[];
}

const MIN_LOGS = 3;

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const since = thirtyDaysAgo.toISOString().split("T")[0];

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
        message: `You need at least ${MIN_LOGS} logs for pattern analysis. You currently have ${logs?.length ?? 0}.`,
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

  const prompt = `You are a personal health pattern analyst. Analyse the following symptom log data from the last 30 days and surface meaningful, specific insights.

Data (JSON array, one entry per logged day):
${logsJson}

Return ONLY a valid JSON object — no markdown, no code fences, no explanation:
{
  "summary": "<1–2 sentence overview of the user's health trends this period, conversational and encouraging>",
  "insights": [
    "<insight 1>",
    "<insight 2>",
    "<insight 3>"
  ]
}

Rules for insights:
- Include 3–5 insights total
- Each insight must be specific and quantified where the data supports it (e.g. "Energy averages 4.2/10 on days after fewer than 6h sleep vs 6.8/10 otherwise")
- Prioritise cross-field correlations: sleep vs energy, stress vs symptoms, sleep vs stress, etc.
- If a symptom clusters around certain conditions, call it out (e.g. "Headaches occur on X% of high-stress days")
- If data is sparse for a particular correlation, skip it rather than speculate
- Insights must be directly supported by the data provided — do not fabricate patterns
- Write in second person ("Your energy…", "You tend to…")`;

  try {
    const result = await geminiFlash.generateContent(prompt);
    const text = result.response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("[analyse-patterns] No JSON in Gemini response:", text);
      return NextResponse.json(
        { error: "Could not parse AI response" },
        { status: 500 }
      );
    }

    const parsed: AnalysisResult = JSON.parse(jsonMatch[0]);

    if (
      typeof parsed.summary !== "string" ||
      !Array.isArray(parsed.insights) ||
      parsed.insights.length === 0
    ) {
      return NextResponse.json(
        { error: "AI returned an unexpected format" },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("[analyse-patterns] Error:", err);
    return NextResponse.json(
      {
        error: "Failed to generate insights",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
