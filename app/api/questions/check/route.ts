import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { TIER_LIMITS, type SubscriptionTier } from "@/lib/tiers";

export async function GET() {
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

  // Get user's subscription tier
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("tier")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  const tier: SubscriptionTier = (sub?.tier as SubscriptionTier) || "free";
  const limit = TIER_LIMITS[tier].maxQuestionsPerDay;

  if (limit === Infinity) {
    return NextResponse.json({ remaining: -1, limit: -1, tier });
  }

  // Get today's question count
  const today = new Date().toISOString().split("T")[0];
  const { data: dq } = await supabase
    .from("daily_questions")
    .select("count")
    .eq("user_id", user.id)
    .eq("question_date", today)
    .single();

  const used = dq?.count || 0;
  const remaining = Math.max(0, limit - used);

  return NextResponse.json({ remaining, limit, tier });
}
