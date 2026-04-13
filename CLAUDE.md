@AGENTS.md
# SymptomSense — Project Bible

## What this is
A web app where users log symptoms daily (voice or form). AI analyses patterns across weeks of data and surfaces insights like "low sleep correlates with headaches 2 days later." Built as a biomed + software portfolio project.

## Tech stack
- **Framework:** Next.js (App Router, server components preferred)
- **Database + Auth:** Supabase (Postgres + Supabase Auth)
- **Deployment:** Vercel
- **AI:** Gemini API (will swap to Anthropic later)
- **Styling:** Tailwind CSS

## Current status
- [x] Next.js scaffolded
- [x] Deployed on Vercel
- [x] Supabase project created
- [x] Environment variables set up
- [x] Auth flow (login/signup)
- [ ] Symptom log form
- [ ] Voice → structured log extraction
- [ ] Pattern detection AI
- [ ] Correlation dashboard
- [ ] Weekly AI summary

## Features (in priority order)
1. **Auth** — login/signup via Supabase Auth
2. **Manual log form** — log sleep_hours, stress_level, energy_level, symptoms, notes
3. **Voice logging** — user speaks, AI extracts structured fields
4. **Pattern detection** — AI analysis across weeks of logs
5. **Correlation dashboard** — graphs (sleep vs energy, stress vs symptoms)
6. **Weekly summary** — "your energy dropped 20% this week"

## Database schema
```sql
-- Handled by Supabase Auth
users (id, email, ...)

-- Main data table
symptom_logs (
  id          uuid primary key,
  user_id     uuid references auth.users,
  date        date,
  sleep_hours numeric,
  stress_level int,        -- 1–10
  energy_level int,        -- 1–10
  symptoms    text[],
  notes       text,
  created_at  timestamptz default now()
)
```

## Non-negotiable rules
- **No API keys in frontend** — all AI calls go through Next.js API routes (`/app/api/`)
- **RLS always on** — every Supabase table must have Row Level Security enabled
- **Server components first** — only use `'use client'` when actually needed
- **Small, reusable components** — no monolithic files
- **AI calls server-side only** — never call Gemini/Anthropic directly from the browser

## File/folder conventions
```
/app
  /api          ← all AI and sensitive API routes
  /(auth)       ← login, signup pages
  /dashboard    ← main app after login
  /log          ← new symptom log entry
/components     ← reusable UI components
/lib
  /supabase.ts  ← supabase client init
  /ai.ts        ← AI call helpers
```

## Environment variables needed
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY   ← server-side only, never expose
GEMINI_API_KEY              ← server-side only, never expose
```

## Key patterns to follow
- Use `createServerClient` from `@supabase/ssr` in server components and API routes
- Use `createBrowserClient` only in client components
- Protect routes by checking session in layout or middleware
- For voice: use browser Web Speech API to get transcript, POST to `/api/extract-log`, return structured JSON
- For pattern analysis: fetch last 30 days of logs server-side, send to AI with a structured prompt, return insights