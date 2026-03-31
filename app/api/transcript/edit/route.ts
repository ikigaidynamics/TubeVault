import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://mindvault.ikigai-dynamics.com/api";

export async function PUT(request: Request) {
  const cookieStore = cookies();
  const supabase = createServerClient(
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check user is a creator
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("tier, creator_channels")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  if (!sub || sub.tier !== "creator") {
    return NextResponse.json({ error: "Creator access required" }, { status: 403 });
  }

  const body = await request.json();
  const { video_id, chunk_index, text } = body;

  if (!video_id || chunk_index === undefined || !text) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Proxy to MindVaultAPI with admin key
  const apiKey = process.env.CREATOR_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  const res = await fetch(
    `${API_BASE_URL}/transcript/${video_id}/chunk/${chunk_index}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify({ text }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json(
      { error: "Failed to update transcript", details: err },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}
