import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import type { ConsentMethod } from "@/lib/consent";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/** SHA-256 hash, truncated to first 16 hex chars for anonymity. */
async function hashIp(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip);
  const buf = await crypto.subtle.digest("SHA-256", data);
  const hex = Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hex.slice(0, 16);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      session_id,
      consent_categories,
      consent_method,
      policy_version,
    } = body as {
      session_id: string;
      consent_categories: Record<string, boolean>;
      consent_method: ConsentMethod;
      policy_version: string;
    };

    if (!session_id || !consent_categories || !consent_method) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    // Resolve user_id from auth cookie (if logged in)
    let userId: string | null = null;
    try {
      const cookieStore = cookies();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },
            setAll() {},
          },
        }
      );
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) userId = user.id;
    } catch {
      // not logged in — that's fine
    }

    // Hash IP for anonymity (never store raw)
    const headerList = headers();
    const rawIp =
      headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headerList.get("x-real-ip") ||
      "unknown";
    const ipHash = await hashIp(rawIp);

    const userAgent = headerList.get("user-agent") || "unknown";

    await supabaseAdmin.from("consent_log").insert({
      session_id,
      user_id: userId,
      ip_hash: ipHash,
      user_agent: userAgent,
      consent_categories,
      consent_method,
      policy_version: policy_version || "1.0",
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Consent log error:", err);
    // Silent fail — consent logging must never block the user
    return NextResponse.json({ ok: true });
  }
}
