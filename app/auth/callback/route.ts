import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

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
      // Build redirect response and set cookies via response headers
      // This avoids the Next.js cookies() header size limitation
      const response = NextResponse.redirect(`${origin}${next}`);

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
