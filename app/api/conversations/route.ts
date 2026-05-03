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

// GET: list conversations for the current user
export async function GET(req: NextRequest) {
  const supabase = getSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const channel = req.nextUrl.searchParams.get("channel");
  const limit = Math.min(
    parseInt(req.nextUrl.searchParams.get("limit") || "30", 10),
    100
  );

  let query = supabaseAdmin
    .from("conversations")
    .select("id, title, channel_name, is_cross_channel, message_count, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (channel) {
    query = query.eq("channel_name", channel).eq("is_cross_channel", false);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

// POST: create a new conversation
export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { channel_name, is_cross_channel, cross_channel_selection } = body as {
    channel_name?: string | null;
    is_cross_channel?: boolean;
    cross_channel_selection?: string[];
  };

  const { data, error } = await supabaseAdmin
    .from("conversations")
    .insert({
      user_id: user.id,
      channel_name: channel_name || null,
      is_cross_channel: is_cross_channel || false,
      cross_channel_selection: cross_channel_selection || [],
    })
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}
