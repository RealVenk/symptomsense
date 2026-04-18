"use client";

import { useState, useRef, useEffect } from "react";

// Web Speech API types (not fully covered in TypeScript's built-in DOM lib)
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

interface ExtractedFields {
  sleep_hours: number | null;
  stress_level: number | null;
  energy_level: number | null;
  symptoms: string[];
  notes: string | null;
}

interface VoiceLoggerProps {
  onExtracted: (fields: ExtractedFields) => void;
}

type RecordingState = "idle" | "recording" | "processing" | "done" | "error";

export function VoiceLogger({ onExtracted }: VoiceLoggerProps) {
  const [state, setState] = useState<RecordingState>("idle");
  const [transcript, setTranscript] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognitionAPI =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognitionAPI) {
        setSupported(false);
      }
    }
  }, []);

  function startRecording() {
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let finalTranscript = "";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += t + " ";
        } else {
          interimTranscript += t;
        }
      }
      setTranscript((finalTranscript + interimTranscript).trim());
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setErrorMsg(`Mic error: ${event.error}`);
      setState("error");
    };

    recognition.onend = () => {
      if (finalTranscript.trim()) {
        extractFromTranscript(finalTranscript.trim());
      } else {
        setState("idle");
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
    setState("recording");
    setTranscript("");
    setErrorMsg("");
  }

  function stopRecording() {
    recognitionRef.current?.stop();
  }

  async function extractFromTranscript(text: string) {
    setState("processing");
    try {
      const res = await fetch("/api/extract-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: text }),
      });

      if (!res.ok) throw new Error("Extraction failed");

      const fields: ExtractedFields = await res.json();
      onExtracted(fields);
      setState("done");
    } catch {
      setErrorMsg("Failed to extract data from transcript. Please fill in manually.");
      setState("error");
    }
  }

  if (!supported) {
    return (
      <div className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-4 text-sm text-zinc-400">
        Voice recording is not supported in this browser. Please use Chrome or
        Edge, or fill in the form manually.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {state === "idle" || state === "done" || state === "error" ? (
          <button
            type="button"
            onClick={startRecording}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <MicIcon />
            {state === "done" ? "Record Again" : "Start Recording"}
          </button>
        ) : state === "recording" ? (
          <button
            type="button"
            onClick={stopRecording}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 animate-pulse"
          >
            <StopIcon />
            Stop Recording
          </button>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 text-zinc-400 rounded-lg">
            <SpinnerIcon />
            Analysing with AI...
          </div>
        )}

        {state === "recording" && (
          <span className="flex items-center gap-1.5 text-sm text-red-400">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Listening...
          </span>
        )}
        {state === "done" && (
          <span className="text-sm text-green-400">Form filled from voice</span>
        )}
      </div>

      {transcript && (
        <div className="rounded-xl border border-zinc-700 bg-zinc-800/60 p-4">
          <p className="text-xs text-zinc-500 mb-2 font-medium uppercase tracking-wide">
            Transcript
          </p>
          <p className="text-sm text-zinc-300 leading-relaxed">{transcript}</p>
        </div>
      )}

      {errorMsg && (
        <p className="text-sm text-red-400">{errorMsg}</p>
      )}

      <p className="text-xs text-zinc-500">
        Speak naturally — e.g. &ldquo;I slept 6 hours, my stress is about a 7, I have a headache and feel fatigued&rdquo;
      </p>
    </div>
  );
}

function MicIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
