-- ==========================================================
-- FC BAYERN GAMES: FEEDBACK TABLE & RLS SECURITY POLICIES
-- Run this script inside your Supabase Project's SQL Editor.
-- ==========================================================

-- 1. Create feedback table (supports multi-select sections via text[])
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now() not null,
  overall_experience integer not null check (overall_experience between 1 and 5),
  what_liked text,
  what_improved text,
  website_part text[] not null,
  comments text
);

-- Note: If your feedback table was previously created with a single 'text' column,
-- you can migrate it to text[] with:
-- alter table public.feedback alter column website_part type text[] using array[website_part];

-- 2. Enable Row Level Security (RLS)
alter table public.feedback enable row level security;

-- 3. Policy: Allow anonymous visitors to submit feedback (INSERT ONLY)
create policy "Allow anonymous feedback submissions"
  on public.feedback
  for insert
  to anon
  with check (true);

-- 4. No SELECT / UPDATE / DELETE policies are added for 'anon',
-- meaning public visitors cannot view, alter, or scrape other submissions.
