-- TubeVault: Channel selection with 30-day lock
-- Run this in Supabase SQL Editor

-- Add channels_locked_until for 30-day lock period
-- (selected_channels column already exists from migration_tiers.sql)
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS channels_locked_until timestamptz;
