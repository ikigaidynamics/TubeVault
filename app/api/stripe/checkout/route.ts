import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getStripeServer, PRICE_IDS, type PriceKey } from "@/lib/stripe";
import { getOrCreateStripeCustomer } from "@/lib/subscription";

export async function POST(request: Request) {
  try {
    const { priceKey, trial } = (await request.json()) as { priceKey: PriceKey; trial?: boolean };

    const priceId = PRICE_IDS[priceKey];
    if (!priceId) {
      return NextResponse.json(
        { error: "Invalid price key" },
        { status: 400 }
      );
    }

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
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const customerId = await getOrCreateStripeCustomer(
      user.id,
      user.email!
    );

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

    // Support 30-day free trial for Pro plan
    const isProTrial = trial && priceKey.startsWith("pro_");

    const session = await getStripeServer().checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      ...(isProTrial && {
        subscription_data: {
          trial_period_days: 30,
        },
      }),
      success_url: `${appUrl}/dashboard?checkout=success${isProTrial ? "&trial=pro" : ""}`,
      cancel_url: `${appUrl}/pricing?checkout=cancelled`,
      metadata: {
        supabase_user_id: user.id,
        ...(isProTrial && { trial: "pro_30d" }),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
