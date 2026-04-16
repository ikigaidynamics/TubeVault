-- Analytics foundation for TubeVault
-- Tracks search queries, page views, channel usage, and conversions.
-- Hosted on Supabase (EU/Germany). Raw query text auto-nulled after 7 days for GDPR.

-- Core events table
CREATE TABLE analytics_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text NOT NULL,
  channel_id text,
  query_hash text,
  query_raw text,
  result_count int,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_ae_event_type ON analytics_events(event_type);
CREATE INDEX idx_ae_created_at ON analytics_events(created_at);
CREATE INDEX idx_ae_channel_id ON analytics_events(channel_id);
CREATE INDEX idx_ae_query_hash ON analytics_events(query_hash);
CREATE INDEX idx_ae_user_id ON analytics_events(user_id);

-- RLS: only service_role can read/write (server-side API routes only)
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON analytics_events USING (true) WITH CHECK (true);

-- Daily aggregates for long-term retention and fast dashboards
CREATE TABLE analytics_daily (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  date date NOT NULL,
  channel_id text,
  event_type text NOT NULL,
  total_count int DEFAULT 0,
  unique_users int DEFAULT 0,
  unique_sessions int DEFAULT 0,
  UNIQUE(date, channel_id, event_type)
);

ALTER TABLE analytics_daily ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON analytics_daily USING (true) WITH CHECK (true);

-- Auto-null raw queries after 7 days (GDPR compliance)
CREATE OR REPLACE FUNCTION cleanup_raw_queries()
RETURNS void LANGUAGE sql AS $$
  UPDATE analytics_events
  SET query_raw = NULL
  WHERE created_at < now() - interval '7 days'
  AND query_raw IS NOT NULL;
$$;
