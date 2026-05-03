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

// GET: load a conversation with all messages
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: conv, error: convErr } = await supabaseAdmin
    .from("conversations")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (convErr || !conv) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const { data: msgs } = await supabaseAdmin
    .from("conversation_messages")
    .select("*")
    .eq("conversation_id", params.id)
    .order("created_at", { ascending: true });

  const messages = (msgs || []).map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
    sources: m.sources || undefined,
    crossChannelGroups: m.cross_channel_groups || undefined,
    channelsQueried: m.channels_queried || undefined,
    queryTimeMs: m.query_time_ms || undefined,
  }));

  return NextResponse.json({
    id: conv.id,
    title: conv.title,
    channel_name: conv.channel_name,
    is_cross_channel: conv.is_cross_channel,
    cross_channel_selection: conv.cross_channel_selection || [],
    message_count: conv.message_count,
    updated_at: conv.updated_at,
    messages,
  });
}

// DELETE: remove a conversation (messages cascade)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify ownership before deleting
  const { data: conv } = await supabaseAdmin
    .from("conversations")
    .select("id")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!conv) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await supabaseAdmin.from("conversations").delete().eq("id", params.id);

  return NextResponse.json({ ok: true });
}
