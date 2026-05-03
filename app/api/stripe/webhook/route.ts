import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { getStripeServer, getTierFromPriceId } from "@/lib/stripe";
import type Stripe from "stripe";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Resolve the Supabase user_id for a Stripe customer ID.
 * Checks subscriptions table first, then falls back to Stripe customer metadata.
 */
async function resolveUserId(customerId: string): Promise<string | null> {
  const { data: existing } = await supabaseAdmin
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .single();

  if (existing?.user_id) return existing.user_id;

  // Fallback: check Stripe customer metadata
  try {
    const customer = (await getStripeServer().customers.retrieve(
      customerId
    )) as Stripe.Customer;
    return customer.metadata?.supabase_user_id || null;
  } catch {
    return null;
  }
}

/**
 * Sync a Stripe subscription state to the Supabase subscriptions table.
 */
async function syncSubscription(subscription: Stripe.Subscription) {
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

  const rawPeriodEnd = (subscription as unknown as Record<string, number>).current_period_end;
  const periodEnd = rawPeriodEnd
    ? new Date(rawPeriodEnd * 1000).toISOString()
    : null;

  const userId = await resolveUserId(customerId);
  if (!userId) {
    console.error(`[webhook] Cannot resolve user for customer ${customerId}`);
    return;
  }

  const { error } = await supabaseAdmin.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      tier,
      status,
      current_period_end: periodEnd,
    },
    { onConflict: "user_id" }
  );

  if (error) {
    console.error(`[webhook] Failed to upsert subscription for ${userId}:`, error);
  } else {
    console.log(`[webhook] Synced subscription for ${userId}: tier=${tier} status=${status}`);
  }
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

/**
 * Handle checkout.session.completed — the most reliable event for new subscriptions.
 * Retrieves the full subscription object and syncs it.
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (session.mode !== "subscription" || !session.subscription) return;

  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription.id;

  const subscription = await getStripeServer().subscriptions.retrieve(subscriptionId);
  await syncSubscription(subscription);

  // Attribution: track subscription_started
  try {
    const customerId =
      typeof session.customer === "string"
        ? session.customer
        : session.customer?.toString() || "";
    const userId = await resolveUserId(customerId);
    if (userId) {
      const { data: firstView } = await supabaseAdmin
        .from("landing_attribution")
        .select("variant_slug, session_id")
        .eq("user_id", userId)
        .eq("event_type", "page_view")
        .order("created_at", { ascending: true })
        .limit(1)
        .single();

      await supabaseAdmin.from("landing_attribution").insert({
        user_id: userId,
        session_id: firstView?.session_id || "webhook",
        variant_slug: firstView?.variant_slug || "unknown",
        landing_path: "/",
        event_type: "subscription_started",
        event_metadata: {
          plan: getTierFromPriceId(subscription.items.data[0]?.price.id),
          stripe_session_id: session.id,
        },
      });
    }
  } catch { /* don't let attribution tracking break the webhook */ }
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

  console.log(`[webhook] Received event: ${event.type}`);

  try {
    switch (event.type) {
      // Primary: fires when user completes Stripe Checkout
      case "checkout.session.completed":
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      // Fires when subscription is first created
      case "customer.subscription.created":
        await syncSubscription(
          event.data.object as Stripe.Subscription
        );
        break;

      // Fires on plan changes, renewals, payment method updates
      case "customer.subscription.updated":
        await syncSubscription(
          event.data.object as Stripe.Subscription
        );
        break;

      // Fires when subscription is cancelled
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        );
        break;

      // Payment failure — mark as past_due
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId =
          typeof invoice.customer === "string"
            ? invoice.customer
            : invoice.customer?.toString() || "";
        if (customerId) {
          await supabaseAdmin
            .from("subscriptions")
            .update({ status: "inactive" })
            .eq("stripe_customer_id", customerId);
        }
        break;
      }
    }
  } catch (err) {
    console.error(`[webhook] Error handling ${event.type}:`, err);
    // Still return 200 so Stripe doesn't retry indefinitely
  }

  return NextResponse.json({ received: true });
}
