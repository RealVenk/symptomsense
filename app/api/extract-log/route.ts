import { NextRequest, NextResponse } from "next/server";
import { geminiFlash } from "@/lib/ai";

const VALID_SYMPTOMS = [
  "headache",
  "fatigue",
  "anxiety",
  "brain fog",
  "nausea",
  "back pain",
  "mood swings",
];

export async function POST(request: NextRequest) {
  const body = await request.json();
  const transcript: string = body?.transcript?.trim();

  if (!transcript) {
    return NextResponse.json(
      { error: "No transcript provided" },
      { status: 400 }
    );
  }

  const prompt = `You are a health data extraction assistant. Extract structured health data from the following spoken transcript.

Transcript: "${transcript}"

Return ONLY a valid JSON object with these exact fields (no markdown, no explanation):
{
  "sleep_hours": <number between 0-12, or null if not mentioned>,
  "stress_level": <integer 1-10, or null if not mentioned>,
  "energy_level": <integer 1-10, or null if not mentioned>,
  "symptoms": <array of strings from this list only: ${VALID_SYMPTOMS.map((s) => `"${s}"`).join(", ")}. Empty array if none mentioned.>,
  "notes": <string with any other relevant health info mentioned, or null if none>
}

Rules:
- Only include symptoms that appear in the allowed list above
- For stress/energy levels, infer from language if not explicitly stated (e.g. "very stressed" → 8, "a bit tired" → 4)
- For sleep, extract hours if mentioned (e.g. "slept 7 hours" → 7, "barely slept" → 3)
- notes should capture anything not covered by the other fields`;

  try {
    console.log("[extract-log] Calling Gemini with transcript:", transcript);
    const result = await geminiFlash.generateContent(prompt);
    const text = result.response.text();
    console.log("[extract-log] Gemini raw response:", text);

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("[extract-log] No JSON found in response:", text);
      return NextResponse.json(
        { error: "Could not parse AI response" },
        { status: 500 }
      );
    }

    const extracted = JSON.parse(jsonMatch[0]);
    console.log("[extract-log] Parsed extracted fields:", extracted);

    // Sanitize the response
    const sanitized = {
      sleep_hours:
        typeof extracted.sleep_hours === "number"
          ? Math.min(12, Math.max(0, extracted.sleep_hours))
          : null,
      stress_level:
        typeof extracted.stress_level === "number"
          ? Math.min(10, Math.max(1, Math.round(extracted.stress_level)))
          : null,
      energy_level:
        typeof extracted.energy_level === "number"
          ? Math.min(10, Math.max(1, Math.round(extracted.energy_level)))
          : null,
      symptoms: Array.isArray(extracted.symptoms)
        ? extracted.symptoms.filter((s: unknown) =>
            VALID_SYMPTOMS.includes(s as string)
          )
        : [],
      notes:
        typeof extracted.notes === "string" ? extracted.notes.trim() : null,
    };

    return NextResponse.json(sanitized);
  } catch (err) {
    console.error("[extract-log] Full error:", err);
    if (err instanceof Error) {
      console.error("[extract-log] Error name:", err.name);
      console.error("[extract-log] Error message:", err.message);
      console.error("[extract-log] Error stack:", err.stack);
    }
    return NextResponse.json(
      {
        error: "Failed to extract data from transcript",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
