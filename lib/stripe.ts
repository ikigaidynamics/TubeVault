import { loadStripe, type Stripe as StripeClient } from "@stripe/stripe-js";
import Stripe from "stripe";

// Server-side Stripe client (lazy-initialized)
let _stripe: Stripe | null = null;

export function getStripeServer(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }
  return _stripe;
}

// Re-export as `stripe` for convenience
export { getStripeServer as stripe };

// Client-side Stripe (singleton)
let stripePromise: Promise<StripeClient | null> | null = null;

export function getStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
    );
  }
  return stripePromise;
}

// Price ID mapping from env
export const PRICE_IDS = {
  starter_monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY!,
  starter_yearly: process.env.STRIPE_PRICE_STARTER_YEARLY!,
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY!,
  pro_yearly: process.env.STRIPE_PRICE_PRO_YEARLY!,
  premium_monthly: process.env.STRIPE_PRICE_PREMIUM_MONTHLY!,
  premium_yearly: process.env.STRIPE_PRICE_PREMIUM_YEARLY!,
} as const;

export type PriceKey = keyof typeof PRICE_IDS;

// Map Stripe price ID back to tier
export function getTierFromPriceId(
  priceId: string
): "starter" | "pro" | "premium" | null {
  for (const [key, id] of Object.entries(PRICE_IDS)) {
    if (id === priceId) {
      return key.split("_")[0] as "starter" | "pro" | "premium";
    }
  }
  return null;
}
