import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export type SubscriptionTier = "free" | "starter" | "pro" | "premium";

export interface TierLimits {
  maxChannels: number;
  maxQuestionsPerDay: number;
  hasTranscripts: boolean;
  hasTranslation: boolean;
  hasCrossChannelSearch: boolean;
  hasPrioritySupport: boolean;
}

export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  free: {
    maxChannels: 3,
    maxQuestionsPerDay: 5,
    hasTranscripts: false,
    hasTranslation: false,
    hasCrossChannelSearch: false,
    hasPrioritySupport: false,
  },
  starter: {
    maxChannels: 10,
    maxQuestionsPerDay: Infinity,
    hasTranscripts: false,
    hasTranslation: false,
    hasCrossChannelSearch: false,
    hasPrioritySupport: false,
  },
  pro: {
    maxChannels: 30,
    maxQuestionsPerDay: Infinity,
    hasTranscripts: true,
    hasTranslation: true,
    hasCrossChannelSearch: false,
    hasPrioritySupport: true,
  },
  premium: {
    maxChannels: Infinity,
    maxQuestionsPerDay: Infinity,
    hasTranscripts: true,
    hasTranslation: true,
    hasCrossChannelSearch: true,
    hasPrioritySupport: true,
  },
};

export function getTierLimits(tier: SubscriptionTier): TierLimits {
  return TIER_LIMITS[tier];
}

export function canAccessChannel(
  tier: SubscriptionTier,
  channelIndex: number
): boolean {
  return channelIndex < TIER_LIMITS[tier].maxChannels;
}

export function canAskQuestion(
  tier: SubscriptionTier,
  questionsToday: number
): boolean {
  return questionsToday < TIER_LIMITS[tier].maxQuestionsPerDay;
}

export interface Subscription {
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  tier: SubscriptionTier;
  status: string;
  current_period_end: string | null;
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
    };
  }

  return data as Subscription;
}

/**
 * Get or create a Stripe customer ID for a user (server-side, uses service role).
 */
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string
): Promise<string> {
  const { createClient } = await import("@supabase/supabase-js");
  const supabaseAdmin = createClient(
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
