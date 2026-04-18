import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-20 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <span className="text-base font-bold tracking-tight">SymptomSense</span>
          <Link
            href="/login"
            className="px-4 py-1.5 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center min-h-screen text-center px-4 pt-16">
        {/* Background glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-3xl" />
          <div className="absolute top-1/3 left-1/4 w-72 h-72 rounded-full bg-violet-600/8 blur-3xl" />
        </div>

        <div className="relative max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-700 bg-zinc-900 text-xs text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            AI-powered health tracking
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-none">
            <span className="text-white">Symptom</span>
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              Sense
            </span>
          </h1>

          <p className="text-xl sm:text-2xl text-zinc-400 font-light max-w-xl mx-auto leading-relaxed">
            Discover what your body is trying to tell you.
          </p>

          <p className="text-base text-zinc-500 max-w-md mx-auto">
            Log your symptoms daily, track patterns over time, and get
            personalised AI insights into your health.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/login"
              className="px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-900/40 text-sm"
            >
              Get Started — it&apos;s free
            </Link>
            <a
              href="#how-it-works"
              className="px-7 py-3.5 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white font-medium rounded-xl transition-all text-sm"
            >
              See How It Works ↓
            </a>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-zinc-600 text-xs animate-bounce">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section
        id="how-it-works"
        className="py-24 px-4 border-t border-zinc-800"
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">
              How it works
            </h2>
            <p className="text-zinc-500">Three simple steps to better health awareness</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Log daily",
                desc: "Record sleep, stress, energy and symptoms in seconds — type or speak.",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                ),
                colour: "text-blue-400 bg-blue-500/10 border-blue-500/20",
              },
              {
                step: "02",
                title: "Track patterns",
                desc: "Charts reveal how sleep, stress and energy move together over weeks.",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                ),
                colour: "text-violet-400 bg-violet-500/10 border-violet-500/20",
              },
              {
                step: "03",
                title: "Get AI insights",
                desc: "Gemini analyses your data and surfaces correlations like \"headaches follow poor sleep.\"",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                ),
                colour: "text-amber-400 bg-amber-500/10 border-amber-500/20",
              },
            ].map(({ step, title, desc, icon, colour }) => (
              <div
                key={step}
                className="relative bg-zinc-900 rounded-2xl border border-zinc-800 p-6 flex flex-col gap-4 hover:border-zinc-700 transition-colors"
              >
                <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${colour}`}>
                  {icon}
                </div>
                <div>
                  <span className="text-xs font-mono text-zinc-600">{step}</span>
                  <h3 className="text-base font-semibold text-white mt-0.5">{title}</h3>
                  <p className="text-sm text-zinc-500 mt-2 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 px-4 border-t border-zinc-800 bg-zinc-900/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">Features</h2>
            <p className="text-zinc-500">Everything you need to understand your health</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                title: "Voice logging",
                desc: "Speak naturally about how you feel. AI extracts structured fields automatically — no typing required.",
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
                  </svg>
                ),
                gradient: "from-blue-600/20 to-blue-600/5",
                border: "border-blue-500/20",
                icon_bg: "bg-blue-500/10 text-blue-400",
              },
              {
                title: "Pattern detection",
                desc: "Interactive charts show sleep, energy and stress over 30 days. Spot trends at a glance.",
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                gradient: "from-violet-600/20 to-violet-600/5",
                border: "border-violet-500/20",
                icon_bg: "bg-violet-500/10 text-violet-400",
              },
              {
                title: "AI-powered insights",
                desc: "Gemini analyses months of data and surfaces correlations like \"headaches are 3× more likely when stress exceeds 7.\"",
                icon: (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l2.4 7.2H22l-6.2 4.5 2.4 7.3L12 16.5 5.8 21l2.4-7.3L2 9.2h7.6L12 2z" />
                  </svg>
                ),
                gradient: "from-amber-600/20 to-amber-600/5",
                border: "border-amber-500/20",
                icon_bg: "bg-amber-500/10 text-amber-400",
              },
            ].map(({ title, desc, icon, gradient, border, icon_bg }) => (
              <div
                key={title}
                className={`rounded-2xl border ${border} bg-gradient-to-b ${gradient} p-6 flex flex-col gap-4`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${icon_bg}`}>
                  {icon}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">{title}</h3>
                  <p className="text-sm text-zinc-500 mt-2 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-14 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-900/40 text-sm"
            >
              Start tracking for free
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-zinc-800 py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-600">
          <span className="font-semibold text-zinc-500">SymptomSense</span>
          <span>Built with Next.js, Supabase and Gemini AI</span>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-zinc-400 transition-colors">Sign in</Link>
            <Link href="/login" className="hover:text-zinc-400 transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
