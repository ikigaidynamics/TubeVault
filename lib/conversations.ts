import type { Message, ConversationSummary, ConversationFull } from "./api";

export async function listConversations(
  channel?: string
): Promise<ConversationSummary[]> {
  const params = new URLSearchParams();
  if (channel) params.set("channel", channel);
  const res = await fetch(`/api/conversations?${params}`);
  if (!res.ok) return [];
  return res.json();
}

export async function createConversation(opts: {
  channel_name: string | null;
  is_cross_channel: boolean;
  cross_channel_selection?: string[];
}): Promise<string> {
  const res = await fetch("/api/conversations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(opts),
  });
  if (!res.ok) throw new Error("Failed to create conversation");
  const data = await res.json();
  return data.id;
}

export async function loadConversation(
  id: string
): Promise<ConversationFull> {
  const res = await fetch(`/api/conversations/${id}`);
  if (!res.ok) throw new Error("Failed to load conversation");
  return res.json();
}

export async function appendMessages(
  conversationId: string,
  messages: Message[]
): Promise<void> {
  fetch(`/api/conversations/${conversationId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
    keepalive: true,
  }).catch(() => {});
}

export async function renameConversation(
  id: string,
  title: string
): Promise<void> {
  await fetch(`/api/conversations/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
}

export async function deleteConversation(id: string): Promise<void> {
  fetch(`/api/conversations/${id}`, { method: "DELETE" }).catch(() => {});
}
