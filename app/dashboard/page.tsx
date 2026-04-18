import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { StatCard } from "@/components/dashboard/StatCard";
import { SleepChart } from "@/components/dashboard/SleepChart";
import { EnergyStressChart } from "@/components/dashboard/EnergyStressChart";
import { RecentLogs } from "@/components/dashboard/RecentLogs";
import { AIInsights } from "@/components/dashboard/AIInsights";

function avg(values: (number | null)[]): string {
  const nums = values.filter((v): v is number => v !== null);
  if (nums.length === 0) return "—";
  return (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1);
}

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const since = thirtyDaysAgo.toISOString().split("T")[0];

  const { data: logs } = await supabase
    .from("symptom_logs")
    .select("id, date, sleep_hours, stress_level, energy_level, symptoms")
    .eq("user_id", user.id)
    .gte("date", since)
    .order("date", { ascending: true });

  const allLogs = logs ?? [];
  const recentLogs = [...allLogs].reverse().slice(0, 7);

  const avgSleep = avg(allLogs.map((l) => l.sleep_hours));
  const avgEnergy = avg(allLogs.map((l) => l.energy_level));
  const avgStress = avg(allLogs.map((l) => l.stress_level));

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-zinc-100">SymptomSense</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-500 hidden sm:block">
              {user.email}
            </span>
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Page heading + CTA */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-zinc-100">Dashboard</h2>
            <p className="text-sm text-zinc-500 mt-0.5">Last 30 days</p>
          </div>
          <Link
            href="/log"
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors shadow-lg shadow-blue-900/30"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Log Symptoms
          </Link>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard
            label="Avg Sleep"
            value={avgSleep}
            unit={avgSleep !== "—" ? "hrs" : undefined}
            sublabel="per night"
            colour="blue"
          />
          <StatCard
            label="Avg Energy"
            value={avgEnergy}
            unit={avgEnergy !== "—" ? "/10" : undefined}
            sublabel="daily level"
            colour="violet"
          />
          <StatCard
            label="Avg Stress"
            value={avgStress}
            unit={avgStress !== "—" ? "/10" : undefined}
            sublabel="daily level"
            colour="amber"
          />
        </div>

        {/* Charts */}
        {allLogs.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <SleepChart data={allLogs} />
            <EnergyStressChart data={allLogs} />
          </div>
        ) : (
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-10 text-center">
            <p className="text-zinc-500 text-sm">
              Charts will appear once you have at least one log.
            </p>
          </div>
        )}

        {/* AI Insights */}
        <AIInsights />

        {/* Recent logs */}
        <RecentLogs logs={recentLogs} />
      </main>
    </div>
  );
}
