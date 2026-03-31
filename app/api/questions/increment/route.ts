import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { TIER_LIMITS, type SubscriptionTier } from "@/lib/tiers";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
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

  // Unlimited tiers don't need tracking
  if (limit === Infinity) {
    return NextResponse.json({ remaining: -1, limit: -1 });
  }

  const today = new Date().toISOString().split("T")[0];

  // Use service role for upsert (RLS-safe)
  const { data: existing } = await supabaseAdmin
    .from("daily_questions")
    .select("id, count")
    .eq("user_id", user.id)
    .eq("question_date", today)
    .single();

  let newCount: number;

  if (existing) {
    if (existing.count >= limit) {
      return NextResponse.json(
        { error: "Daily question limit reached", remaining: 0, limit },
        { status: 429 }
      );
    }
    newCount = existing.count + 1;
    await supabaseAdmin
      .from("daily_questions")
      .update({ count: newCount })
      .eq("id", existing.id);
  } else {
    newCount = 1;
    await supabaseAdmin.from("daily_questions").insert({
      user_id: user.id,
      question_date: today,
      count: 1,
    });
  }

  return NextResponse.json({
    remaining: Math.max(0, limit - newCount),
    limit,
  });
}
