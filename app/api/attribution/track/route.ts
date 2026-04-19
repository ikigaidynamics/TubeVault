import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

const ALLOWED_EVENTS = new Set([
  "page_view",
  "demo_question",
  "signup_completed",
  "subscription_started",
]);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getAuthUserId(): Promise<string | null> {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}

const OK = NextResponse.json({ ok: true });

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const eventType = body.event_type;
    if (!eventType || !ALLOWED_EVENTS.has(eventType)) return OK;

    // Resolve user_id: prefer explicit from body (signup_completed), fall back to auth cookie
    const cookieUserId = await getAuthUserId();
    const userId = body.user_id || cookieUserId || null;

    const sessionId = body.session_id || "unknown";

    const row = {
      user_id: userId,
      session_id: sessionId,
      variant_slug: body.variant_slug || "default",
      landing_path: body.landing_path || "/",
      referrer: body.referrer || null,
      utm_source: body.utm_source || null,
      utm_medium: body.utm_medium || null,
      utm_campaign: body.utm_campaign || null,
      utm_content: body.utm_content || null,
      utm_term: body.utm_term || null,
      event_type: eventType,
      event_metadata: body.event_metadata || null,
    };

    const { error } = await supabaseAdmin
      .from("landing_attribution")
      .insert(row);

    if (error) console.warn("attribution insert error:", error.message);

    // On signup_completed, backfill user_id onto earlier anonymous rows for this session
    if (eventType === "signup_completed" && userId && sessionId !== "unknown") {
      await supabaseAdmin
        .from("landing_attribution")
        .update({ user_id: userId })
        .eq("session_id", sessionId)
        .is("user_id", null);
    }
  } catch {
    // Never expose errors
  }

  return OK;
}
