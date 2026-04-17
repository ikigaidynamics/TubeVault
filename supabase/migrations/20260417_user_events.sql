-- User lifecycle events for email sequences and conversion tracking
CREATE TABLE user_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_name text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_ue_user_id ON user_events(user_id);
CREATE INDEX idx_ue_event_name ON user_events(event_name);
CREATE INDEX idx_ue_created_at ON user_events(created_at);
CREATE INDEX idx_ue_user_event ON user_events(user_id, event_name);

ALTER TABLE user_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON user_events
  FOR ALL USING (true) WITH CHECK (true);
