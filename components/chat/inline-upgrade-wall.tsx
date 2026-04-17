"use client";

import { X, CheckCircle } from "lucide-react";
import Link from "next/link";
import { UpgradeButton } from "@/components/shared/upgrade-button";

interface InlineUpgradeWallProps {
  context: "daily_limit" | "trial_limit";
  onDismiss?: () => void;
}

export function InlineUpgradeWall({ context, onDismiss }: InlineUpgradeWallProps) {
  const isTrialLimit = context === "trial_limit";

  return (
    <div className="animate-[fadeUp_0.4s_ease-out] rounded-2xl border border-primary/15 bg-gradient-to-b from-primary/[0.04] to-transparent p-5 md:p-6">
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="float-right text-gray-text/30 transition-colors hover:text-cream"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      <p className="text-base font-semibold text-cream">
        {isTrialLimit
          ? "You've used your 3 free questions"
          : "You've asked great questions today!"}
      </p>
      <p className="mt-1 text-sm text-gray-text">
        {isTrialLimit
          ? "Create an account to keep finding answers."
          : "Your 3 daily questions reset tomorrow at midnight."}
      </p>

      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-sm text-cream/80">
          <CheckCircle className="h-4 w-4 shrink-0 text-primary" />
          Unlimited questions
        </div>
        <div className="flex items-center gap-2 text-sm text-cream/80">
          <CheckCircle className="h-4 w-4 shrink-0 text-primary" />
          All 30+ channels
        </div>
        <div className="flex items-center gap-2 text-sm text-cream/80">
          <CheckCircle className="h-4 w-4 shrink-0 text-primary" />
          Full transcripts + translation
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
        {isTrialLimit ? (
          <>
            <Link
              href="/signup?bonus=trial"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] px-5 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-white/[0.04]"
            >
              Sign up free
            </Link>
            <UpgradeButton priceKey="pro_monthly" label="Go Pro — $19/mo" size="md" />
          </>
        ) : (
          <>
            <UpgradeButton priceKey="pro_monthly" label="Unlock Pro — $19/mo" size="md" />
            <Link
              href="/pricing"
              className="text-center text-sm text-primary transition-colors hover:text-primary-hover"
            >
              See all plans
            </Link>
          </>
        )}
      </div>

      <p className="mt-3 text-xs text-gray-text/40">
        {isTrialLimit
          ? "No credit card needed for free plan"
          : "7-day money-back guarantee · Cancel anytime"}
      </p>
    </div>
  );
}
