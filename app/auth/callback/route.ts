import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  // Behind a reverse proxy (Caddy), request.url shows localhost.
  // Use x-forwarded headers or fall back to NEXT_PUBLIC_APP_URL.
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
  const forwardedHost =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const origin = forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : process.env.NEXT_PUBLIC_APP_URL ?? "https://tubevault.io";

  if (code) {
    const cookieStore = cookies();
    const pendingCookies: { name: string; value: string; options: Record<string, unknown> }[] = [];

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            // Collect cookies instead of setting them on cookieStore directly
            // This avoids the header-size issue with Next.js cookies() API
            for (const cookie of cookiesToSet) {
              pendingCookies.push(cookie);
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // --- OAuth attribution tracking ---
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const tvSessionId = cookieStore.get("tv_session_id")?.value;

        if (user?.id && tvSessionId) {
          // New signup = user created within last 60 seconds
          const isNewSignup =
            Date.now() - new Date(user.created_at).getTime() < 60_000;

          if (isNewSignup) {
            // Look up the earliest page_view for this session
            const { data: pageView } = await supabaseAdmin
              .from("landing_attribution")
              .select("variant_slug, landing_path, utm_source, utm_medium, utm_campaign, utm_content, utm_term, referrer")
              .eq("session_id", tvSessionId)
              .eq("event_type", "page_view")
              .order("created_at", { ascending: true })
              .limit(1)
              .maybeSingle();

            // Insert signup_completed event
            await supabaseAdmin.from("landing_attribution").insert({
              user_id: user.id,
              session_id: tvSessionId,
              variant_slug: pageView?.variant_slug || "unknown",
              landing_path: pageView?.landing_path || "/",
              referrer: pageView?.referrer || null,
              utm_source: pageView?.utm_source || null,
              utm_medium: pageView?.utm_medium || null,
              utm_campaign: pageView?.utm_campaign || null,
              utm_content: pageView?.utm_content || null,
              utm_term: pageView?.utm_term || null,
              event_type: "signup_completed",
              event_metadata: { method: "google" },
            });

            // Backfill user_id on earlier anonymous rows for this session
            await supabaseAdmin
              .from("landing_attribution")
              .update({ user_id: user.id })
              .eq("session_id", tvSessionId)
              .is("user_id", null);
          }
        }
      } catch (e) {
        // Attribution must NEVER break the auth callback
        console.warn("OAuth attribution error:", e);
      }

      // Build redirect response and set cookies via response headers
      // This avoids the Next.js cookies() header size limitation
      const response = NextResponse.redirect(`${origin}${next}`);

      // Clear the tv_session_id cookie (no longer needed)
      response.cookies.set("tv_session_id", "", { maxAge: 0, path: "/" });

      // Clean up stale auth-token chunks
      const freshNames = new Set(pendingCookies.map(({ name }) => name));
      for (const cookie of cookieStore.getAll()) {
        if (
          cookie.name.startsWith("sb-") &&
          cookie.name.includes("auth-token") &&
          !cookie.name.includes("code-verifier") &&
          !freshNames.has(cookie.name)
        ) {
          response.cookies.set(cookie.name, "", { maxAge: 0, path: "/" });
        }
      }

      // Set all auth cookies on the response
      for (const { name, value, options } of pendingCookies) {
        response.cookies.set(name, value, options as Record<string, unknown>);
      }

      return response;
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
