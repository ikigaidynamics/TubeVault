import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

const ALLOWED_EVENTS = new Set([
  "search",
  "search_no_result",
  "timestamp_click",
  "channel_view",
  "channel_request",
  "upgrade_click",
  "signup",
  "subscription_start",
  "page_view",
]);

const RATE_LIMIT = 200; // events per session per hour
const rateBuckets = new Map<string, { count: number; reset: number }>();

// Prune stale buckets every 10 minutes
setInterval(() => {
  const now = Date.now();
  rateBuckets.forEach((val, key) => {
    if (now > val.reset) rateBuckets.delete(key);
  });
}, 600_000);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function checkRateLimit(sessionId: string): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(sessionId);

  if (!bucket || now > bucket.reset) {
    rateBuckets.set(sessionId, { count: 1, reset: now + 3_600_000 });
    return true;
  }

  if (bucket.count >= RATE_LIMIT) return false;
  bucket.count++;
  return true;
}

async function getAuthUserId(): Promise<string | null> {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );
    const {
      data: { user },
    } = await supabase.auth.getUser();
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

    const sessionId = body.session_id || "unknown";
    if (!checkRateLimit(sessionId)) return OK;

    const userId = await getAuthUserId();

    // Only store raw query for authenticated users on search events
    let queryRaw: string | null = null;
    if (userId && eventType === "search" && body.query_raw) {
      queryRaw = body.query_raw;
    }

    const row = {
      event_type: eventType,
      user_id: userId,
      session_id: sessionId,
      channel_id: body.channel_id || null,
      query_hash: body.query_hash || null,
      query_raw: queryRaw,
      result_count:
        typeof body.result_count === "number" ? body.result_count : null,
      metadata: body.metadata || {},
    };

    const { error } = await supabaseAdmin
      .from("analytics_events")
      .insert(row);

    if (error) {
      console.warn("analytics insert error:", error.message);
    }
  } catch {
    // Never expose errors to client
  }

  return OK;
}
