import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function getSupabase() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component
          }
        },
      },
    }
  );
}

interface IncomingMessage {
  role: "user" | "assistant";
  content: string;
  sources?: unknown;
  crossChannelGroups?: unknown;
  channelsQueried?: number;
  queryTimeMs?: number;
}

// POST: append messages to a conversation
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify ownership
  const { data: conv } = await supabaseAdmin
    .from("conversations")
    .select("id, title, message_count")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!conv) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const incoming: IncomingMessage[] = body.messages;

  if (!Array.isArray(incoming) || incoming.length === 0) {
    return NextResponse.json({ error: "messages array required" }, { status: 400 });
  }

  // Insert messages
  const rows = incoming.map((m) => ({
    conversation_id: params.id,
    role: m.role,
    content: m.content,
    sources: m.sources || null,
    cross_channel_groups: m.crossChannelGroups || null,
    channels_queried: m.channelsQueried || null,
    query_time_ms: m.queryTimeMs || null,
  }));

  const { error: insertErr } = await supabaseAdmin
    .from("conversation_messages")
    .insert(rows);

  if (insertErr) {
    return NextResponse.json({ error: "Failed to save messages" }, { status: 500 });
  }

  // Update conversation metadata
  const newCount = (conv.message_count || 0) + incoming.length;

  // Auto-title from first user message if title is still default
  const updates: Record<string, unknown> = {
    message_count: newCount,
    updated_at: new Date().toISOString(),
  };

  if (conv.title === "New conversation") {
    const firstUser = incoming.find((m) => m.role === "user");
    if (firstUser) {
      updates.title = firstUser.content.slice(0, 60);
    }
  }

  await supabaseAdmin
    .from("conversations")
    .update(updates)
    .eq("id", params.id);

  return NextResponse.json({ ok: true, message_count: newCount });
}
