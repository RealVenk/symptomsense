# SymptomSense

SymptomSense is a personal symptom tracking app that helps users log how they feel each day and discover meaningful patterns in their health data over time.

It combines manual and voice-first logging with AI analysis to surface insights such as sleep-energy relationships, stress-related symptom spikes, and weekly health summaries.

## Live Demo

[symptomsense-eight.vercel.app](https://symptomsense-eight.vercel.app)

## What It Does

- Lets users securely sign up and log in
- Supports daily symptom logging with:
  - Date
  - Sleep hours
  - Stress and energy levels
  - Symptom tags
  - Free-text notes
- Supports voice logging via Web Speech API and auto-extraction into structured fields
- Displays a dashboard with trend charts and recent logs
- Generates AI insights from the last 30 days of data
- Allows users to edit and delete their own logs

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Auth + Database:** Supabase (Postgres + Supabase Auth)
- **AI:** Google Gemini API (`@google/generative-ai`)
- **Charts:** Recharts
- **Deployment:** Vercel

## Core Features

- **Authentication**
  - Email/password login and signup with Supabase Auth
  - Protected routes via Next.js `proxy.ts`

- **Symptom Logging**
  - Manual form with sliders, visual scales, and symptom tags
  - Voice mode with live transcript and AI extraction (`/api/extract-log`)

- **Dashboard**
  - 30-day summary cards (average sleep, energy, stress)
  - Sleep trend line chart
  - Energy vs stress comparison chart
  - Recent logs list (latest 7 entries)
  - Edit and delete actions for each log

- **AI Pattern Analysis**
  - On-demand insight generation (`/api/analyse-patterns`)
  - Returns structured JSON:
    - `summary`
    - `insights[]`
  - Handles low-data cases (fewer than 3 logs)

## Project Structure

```txt
app/
  api/
    analyse-patterns/
    extract-log/
  (auth)/
    login/
  dashboard/
  log/
components/
  dashboard/
  log/
lib/
  ai.ts
  supabase/
```

## Setup Instructions

### 1) Clone and install

```bash
git clone <your-repo-url>
cd symptomsense
npm install
```

### 2) Configure environment variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
```

Notes:
- Keep `SUPABASE_SERVICE_ROLE_KEY` and `GEMINI_API_KEY` server-side only.
- Restart the dev server after changing env vars.

### 3) Create database table

Run this in Supabase SQL editor:

```sql
create table if not exists public.symptom_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  sleep_hours numeric,
  stress_level int,
  energy_level int,
  symptoms text[],
  notes text,
  created_at timestamptz not null default now()
);
```

### 4) Enable RLS and policies

```sql
alter table public.symptom_logs enable row level security;

create policy "Users can view own logs"
on public.symptom_logs
for select
using (auth.uid() = user_id);

create policy "Users can insert own logs"
on public.symptom_logs
for insert
with check (auth.uid() = user_id);

create policy "Users can update own logs"
on public.symptom_logs
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own logs"
on public.symptom_logs
for delete
using (auth.uid() = user_id);
```

### 5) Run locally

```bash
npm run dev
```

Open `http://localhost:3000`.

## Scripts

- `npm run dev` - start development server
- `npm run build` - production build
- `npm run start` - run production server
- `npm run lint` - run ESLint

## Security Notes

- API keys are never exposed to the browser.
- AI calls run only via server routes under `app/api/`.
- Data access is enforced by Supabase Row Level Security policies.
