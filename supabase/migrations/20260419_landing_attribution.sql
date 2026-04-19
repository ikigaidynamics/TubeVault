-- Landing page attribution tracking
-- Tracks the full funnel: page_view → demo_question → signup → subscription
-- Uses persistent session_id (localStorage UUID, NOT the daily-rotating analytics session)

CREATE TABLE landing_attribution (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text NOT NULL,
  variant_slug text NOT NULL,
  landing_path text NOT NULL,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  event_type text NOT NULL,
  event_metadata jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_la_user_id ON landing_attribution(user_id);
CREATE INDEX idx_la_session_id ON landing_attribution(session_id);
CREATE INDEX idx_la_variant_slug ON landing_attribution(variant_slug);
CREATE INDEX idx_la_event_type ON landing_attribution(event_type);
CREATE INDEX idx_la_created_at ON landing_attribution(created_at);

ALTER TABLE landing_attribution ENABLE ROW LEVEL SECURITY;

-- Anon + authenticated can insert (pre-signup tracking)
CREATE POLICY "anyone_insert" ON landing_attribution FOR INSERT WITH CHECK (true);

-- Authenticated users can read their own rows
CREATE POLICY "auth_read_own" ON landing_attribution FOR SELECT
  USING (auth.uid() = user_id);

-- Service role bypasses all RLS (admin dashboard queries)
CREATE POLICY "service_role_all" ON landing_attribution
  FOR ALL USING (true) WITH CHECK (true);
