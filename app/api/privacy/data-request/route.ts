import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ---------------------------------------------------------------------------
// Persistent rate limiter: max 3 requests per IP-hash per hour (via Supabase)
// ---------------------------------------------------------------------------

const RATE_LIMIT_MAX = 3;

async function isRateLimited(ipHash: string): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { count, error } = await supabaseAdmin
    .from("data_requests")
    .select("*", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", oneHourAgo);

  if (error) {
    console.error("Rate limit query error:", error);
    return false; // fail open — don't block users on DB errors
  }

  return (count ?? 0) >= RATE_LIMIT_MAX;
}

// ---------------------------------------------------------------------------
// SHA-256 hash, truncated to first 16 hex chars
// ---------------------------------------------------------------------------

async function hashIp(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip);
  const buf = await crypto.subtle.digest("SHA-256", data);
  const hex = Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hex.slice(0, 16);
}

// ---------------------------------------------------------------------------
// Allowed request types
// ---------------------------------------------------------------------------

const ALLOWED_TYPES = new Set([
  "Auskunft (Art. 15 DSGVO) / Right of Access",
  "Löschung (Art. 17 DSGVO) / Right to Erasure",
  "Berichtigung (Art. 16 DSGVO) / Right to Rectification",
  "Datenübertragbarkeit (Art. 20 DSGVO) / Right to Data Portability",
  "Widerspruch (Art. 21 DSGVO) / Right to Object",
]);

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { name, email, request_type, request_text, confirmation, website } = body as {
      name?: string;
      email?: string;
      request_type?: string;
      request_text?: string;
      confirmation?: boolean;
      website?: string;
    };

    // Honeypot check — bots fill this hidden field, real users don't
    if (website) {
      return NextResponse.json({
        ok: true,
        message: "Your request has been submitted.",
      });
    }

    // Validate required fields
    if (!email || !request_type || !request_text || !confirmation) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 }
      );
    }

    // Validate request type
    if (!ALLOWED_TYPES.has(request_type)) {
      return NextResponse.json(
        { error: "Invalid request type." },
        { status: 400 }
      );
    }

    // Validate request text length
    if (request_text.length < 20 || request_text.length > 2000) {
      return NextResponse.json(
        { error: "Request text must be between 20 and 2000 characters." },
        { status: 400 }
      );
    }

    // Get IP and hash it
    const headerList = headers();
    const rawIp =
      headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headerList.get("x-real-ip") ||
      "unknown";
    const ipHash = await hashIp(rawIp);

    // Rate limit check
    if (await isRateLimited(ipHash)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later. / Zu viele Anfragen. Bitte versuchen Sie es später erneut." },
        { status: 429 }
      );
    }

    const userAgent = headerList.get("user-agent") || "unknown";

    // Insert into database
    const { error: dbError } = await supabaseAdmin
      .from("data_requests")
      .insert({
        name: name || null,
        email,
        request_type,
        request_text,
        ip_hash: ipHash,
        user_agent: userAgent,
        status: "pending",
      });

    if (dbError) {
      console.error("data_requests insert error:", dbError);
      // Return 200 anyway for UX — the user shouldn't be penalized
      return NextResponse.json({
        ok: true,
        message: "Your request has been submitted.",
      });
    }

    return NextResponse.json({
      ok: true,
      message: "Your request has been submitted.",
    });
  } catch (err) {
    console.error("Data request error:", err);
    return NextResponse.json({
      ok: true,
      message: "Your request has been submitted.",
    });
  }
}
