import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { getStripeServer, getTierFromPriceId } from "@/lib/stripe";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/stripe/sync
 *
 * Directly checks Stripe for the current user's active subscription
 * and syncs the tier to Supabase. This is the fallback for when
 * webhooks are slow or missed.
 *
 * Returns: { tier, synced: boolean }
 */
export async function POST() {
  try {
    // Get authenticated user
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user's stripe_customer_id from Supabase
    const { data: sub } = await supabaseAdmin
      .from("subscriptions")
      .select("stripe_customer_id, tier, status")
      .eq("user_id", user.id)
      .single();

    if (!sub?.stripe_customer_id) {
      return NextResponse.json({ tier: "free", synced: false });
    }

    // Check Stripe directly for active subscriptions
    const subscriptions = await getStripeServer().subscriptions.list({
      customer: sub.stripe_customer_id,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      // No active subscription in Stripe — ensure Supabase reflects that
      if (sub.tier !== "free" || sub.status !== "inactive") {
        await supabaseAdmin
          .from("subscriptions")
          .update({ tier: "free", status: "inactive", stripe_subscription_id: null, current_period_end: null })
          .eq("user_id", user.id);
      }
      return NextResponse.json({ tier: "free", synced: true });
    }

    // Active subscription found — sync to Supabase
    const stripeSub = subscriptions.data[0];
    const priceId = stripeSub.items.data[0]?.price.id;
    const tier = getTierFromPriceId(priceId) || "free";
    const rawPeriodEnd = (stripeSub as unknown as Record<string, number>).current_period_end;
    const periodEnd = rawPeriodEnd
      ? new Date(rawPeriodEnd * 1000).toISOString()
      : null;

    const needsUpdate =
      sub.tier !== tier ||
      sub.status !== "active";

    if (needsUpdate) {
      await supabaseAdmin
        .from("subscriptions")
        .update({
          stripe_subscription_id: stripeSub.id,
          tier,
          status: "active",
          current_period_end: periodEnd,
        })
        .eq("user_id", user.id);
    }

    return NextResponse.json({ tier, synced: needsUpdate });
  } catch (error) {
    console.error("[stripe/sync] Error:", error);
    return NextResponse.json(
      { error: "Failed to sync subscription" },
      { status: 500 }
    );
  }
}
