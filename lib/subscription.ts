import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// Import for local use
import { TIER_LIMITS as _TIER_LIMITS, type SubscriptionTier as _SubscriptionTier } from "./tiers";

// Re-export shared types/constants for server consumers
export type { SubscriptionTier, TierLimits } from "./tiers";
export { TIER_LIMITS, getTierLimits, canAccessChannel, canAskQuestion } from "./tiers";

export interface Subscription {
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  tier: import("./tiers").SubscriptionTier;
  status: string;
  current_period_end: string | null;
  creator_channels: string[];
  selected_channels: string[];
  channels_locked_until: string | null;
}

/**
 * Get the current user's subscription from Supabase (server-side).
 * Returns "free" tier if no subscription found.
 */
export async function getUserSubscription(): Promise<Subscription> {
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
    return {
      user_id: "",
      stripe_customer_id: null,
      stripe_subscription_id: null,
      tier: "free",
      status: "inactive",
      current_period_end: null,
      creator_channels: [],
      selected_channels: [],
      channels_locked_until: null,
    };
  }

  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  if (!data) {
    return {
      user_id: user.id,
      stripe_customer_id: null,
      stripe_subscription_id: null,
      tier: "free",
      status: "inactive",
      current_period_end: null,
      creator_channels: [],
      selected_channels: [],
      channels_locked_until: null,
    };
  }

  return {
    ...data,
    creator_channels: data.creator_channels || [],
    selected_channels: data.selected_channels || [],
    channels_locked_until: data.channels_locked_until || null,
  } as Subscription;
}

// ── Channel selection helpers (server-side, uses service role) ──

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function getUserSelectedChannels(
  userId: string
): Promise<{ selected: string[]; lockedUntil: string | null; canChange: boolean }> {
  const admin = getAdminClient();
  const { data } = await admin
    .from("subscriptions")
    .select("selected_channels, channels_locked_until")
    .eq("user_id", userId)
    .single();

  const selected: string[] = data?.selected_channels || [];
  const lockedUntil: string | null = data?.channels_locked_until || null;
  const canChange = !lockedUntil || new Date(lockedUntil) < new Date();

  return { selected, lockedUntil, canChange };
}

export async function updateSelectedChannels(
  userId: string,
  channels: string[],
  tier: _SubscriptionTier
): Promise<{ selected: string[]; lockedUntil: string }> {
  const limit = _TIER_LIMITS[tier].maxChannels;

  if (limit !== Infinity && channels.length > limit) {
    throw new Error(`Tier ${tier} allows max ${limit} channels`);
  }

  const lockedUntil = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000
  ).toISOString();

  const admin = getAdminClient();
  await admin
    .from("subscriptions")
    .update({
      selected_channels: channels,
      channels_locked_until: lockedUntil,
    })
    .eq("user_id", userId);

  return { selected: channels, lockedUntil };
}

export function isChannelAccessibleForUser(
  tier: _SubscriptionTier,
  channelSlug: string,
  selectedChannels: string[]
): boolean {
  if (_TIER_LIMITS[tier].maxChannels === Infinity) return true;
  return selectedChannels.includes(channelSlug);
}

/**
 * Get or create a Stripe customer ID for a user (server-side, uses service role).
 */
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string
): Promise<string> {
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Check if user already has a customer ID
  const { data: existing } = await supabaseAdmin
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .single();

  if (existing?.stripe_customer_id) {
    return existing.stripe_customer_id;
  }

  // Create Stripe customer
  const { getStripeServer } = await import("@/lib/stripe");
  const customer = await getStripeServer().customers.create({
    email,
    metadata: { supabase_user_id: userId },
  });

  // Upsert subscription record with customer ID
  await supabaseAdmin.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_customer_id: customer.id,
      tier: "free",
      status: "inactive",
    },
    { onConflict: "user_id" }
  );

  return customer.id;
}
