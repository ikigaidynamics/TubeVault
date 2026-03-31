-- TubeVault: Tier system migration
-- Adds creator tier, creator_channels column, and daily_questions table
-- Run this in Supabase SQL Editor

-- 1. Update tier constraint to include 'creator'
ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_tier_check,
  ADD CONSTRAINT subscriptions_tier_check
    CHECK (tier IN ('free', 'starter', 'pro', 'premium', 'creator'));

-- 2. Add creator_channels array column
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS creator_channels text[] DEFAULT '{}';

-- 2b. Add selected_channels for free/starter tier channel picking
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS selected_channels text[] DEFAULT '{}';

-- 3. Create daily_questions table for free-tier rate limiting
CREATE TABLE IF NOT EXISTS public.daily_questions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  question_date date NOT NULL DEFAULT CURRENT_DATE,
  count int NOT NULL DEFAULT 0,
  UNIQUE(user_id, question_date)
);

ALTER TABLE public.daily_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own questions"
  ON public.daily_questions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own questions"
  ON public.daily_questions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own questions"
  ON public.daily_questions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access on daily_questions"
  ON public.daily_questions FOR ALL
  USING (auth.role() = 'service_role');

-- 4. Anonymous trial tracking (fingerprint hash, no personal data)
CREATE TABLE IF NOT EXISTS public.anonymous_trials (
  fingerprint_hash text PRIMARY KEY,
  questions_used int NOT NULL DEFAULT 0,
  first_seen timestamptz DEFAULT now(),
  last_seen timestamptz DEFAULT now()
);

-- No RLS needed — only accessed via service role from API routes
