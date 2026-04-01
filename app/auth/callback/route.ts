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
  const forwardedHost = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const origin = forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : process.env.NEXT_PUBLIC_APP_URL ?? "https://tubevault.io";

  if (code) {
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
            // Clean up stale auth-token chunks not in the fresh set
            const freshNames = new Set(cookiesToSet.map(({ name }) => name));
            for (const cookie of cookieStore.getAll()) {
              if (
                cookie.name.startsWith("sb-") &&
                cookie.name.includes("auth-token") &&
                !cookie.name.includes("code-verifier") &&
                !freshNames.has(cookie.name)
              ) {
                try {
                  cookieStore.set(cookie.name, "", { maxAge: 0, path: "/" });
                } catch {}
              }
            }

            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {}
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
