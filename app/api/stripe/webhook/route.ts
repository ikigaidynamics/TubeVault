import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { getStripeServer, getTierFromPriceId } from "@/lib/stripe";
import type Stripe from "stripe";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const priceId = subscription.items.data[0]?.price.id;
  const tier = getTierFromPriceId(priceId) || "free";
  const status =
    subscription.status === "active" || subscription.status === "trialing"
      ? "active"
      : "inactive";

  // Find user by stripe_customer_id
  const { data: existing } = await supabaseAdmin
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .single();

  if (!existing) {
    // Try to find via Stripe customer metadata
    const customer = (await getStripeServer().customers.retrieve(
      customerId
    )) as Stripe.Customer;
    const userId = customer.metadata?.supabase_user_id;
    if (!userId) return;

    await supabaseAdmin.from("subscriptions").upsert(
      {
        user_id: userId,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id,
        tier,
        status,
        current_period_end: new Date(
          ((subscription as unknown as Record<string, number>).current_period_end ?? 0) * 1000
        ).toISOString(),
      },
      { onConflict: "user_id" }
    );
    return;
  }

  await supabaseAdmin
    .from("subscriptions")
    .update({
      stripe_subscription_id: subscription.id,
      tier,
      status,
      current_period_end: new Date(
        ((subscription as unknown as Record<string, number>).current_period_end ?? 0) * 1000
      ).toISOString(),
    })
    .eq("user_id", existing.user_id);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  await supabaseAdmin
    .from("subscriptions")
    .update({
      tier: "free",
      status: "inactive",
      stripe_subscription_id: null,
      current_period_end: null,
    })
    .eq("stripe_customer_id", customerId);
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = getStripeServer().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
      await handleSubscriptionChange(
        event.data.object as Stripe.Subscription
      );
      break;
    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(
        event.data.object as Stripe.Subscription
      );
      break;
  }

  return NextResponse.json({ received: true });
}
