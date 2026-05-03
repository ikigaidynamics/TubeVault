-- Chat history: persistent conversations and messages
-- Allows users to revisit past chats across sessions and devices.

-- ── Conversations table ──
CREATE TABLE conversations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'New conversation',
  channel_name text,                          -- null for cross-channel
  is_cross_channel boolean NOT NULL DEFAULT false,
  cross_channel_selection text[] DEFAULT '{}', -- selected channel slugs (cross-channel only)
  message_count int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_conversations_user_updated ON conversations(user_id, updated_at DESC);
CREATE INDEX idx_conversations_user_channel ON conversations(user_id, channel_name);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_conversations" ON conversations
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ── Conversation messages table ──
CREATE TABLE conversation_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  sources jsonb,                   -- Source[] serialized
  cross_channel_groups jsonb,      -- ChannelSourceGroup[] serialized
  channels_queried int,
  query_time_ms int,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_conv_messages_conversation ON conversation_messages(conversation_id, created_at);

ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_messages" ON conversation_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_messages.conversation_id
        AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_messages.conversation_id
        AND c.user_id = auth.uid()
    )
  );
