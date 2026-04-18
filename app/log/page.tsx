import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SymptomLogForm } from "@/components/log/SymptomLogForm";

export default async function LogPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-zinc-800 bg-zinc-900">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-xl font-bold text-zinc-100 hover:text-white transition-colors"
          >
            SymptomSense
          </Link>
          <span className="text-sm text-zinc-500 hidden sm:block">
            {user.email}
          </span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 sm:p-8">
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-zinc-100">
              Log Your Symptoms
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Track how you&apos;re feeling today to build your health picture
            </p>
          </div>

          <SymptomLogForm userId={user.id} />
        </div>
      </main>
    </div>
  );
}
