import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { url: channelUrl } = (await request.json()) as { url: string };

    if (!channelUrl?.trim()) {
      return NextResponse.json({ error: "URL required" }, { status: 400 });
    }

    // Require authentication
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
              // ignore
            }
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Store in analytics_events (bypasses consent — this is a direct user action)
    await supabaseAdmin.from("analytics_events").insert({
      event_type: "channel_request",
      user_id: user.id,
      session_id: "direct",
      metadata: {
        requested_channel_url: channelUrl.trim(),
        user_email: user.email,
      },
    });

    // Send email notification
    const resendKey = process.env.RESEND_API_KEY;
    const adminEmail = process.env.ADMIN_EMAIL || "jost@ikigai-dynamics.com";

    if (resendKey) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "TubeVault <notifications@ikigai-dynamics.com>",
            to: adminEmail,
            subject: `Channel Request: ${channelUrl.trim()}`,
            html: `
              <h2>New Channel Request</h2>
              <p><strong>URL:</strong> <a href="${channelUrl.trim()}">${channelUrl.trim()}</a></p>
              <p><strong>User:</strong> ${user.email}</p>
              <p><strong>Time:</strong> ${new Date().toISOString()}</p>
            `,
          }),
        });
      } catch (emailErr) {
        console.warn("Failed to send channel request email:", emailErr);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Channel request error:", error);
    return NextResponse.json(
      { error: "Failed to submit request" },
      { status: 500 }
    );
  }
}
