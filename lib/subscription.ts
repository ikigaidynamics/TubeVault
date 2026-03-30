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
    maxChannels: Infinity,
    maxQuestionsPerDay: Infinity,
    hasTranscripts: true,
    hasTranslation: true,
    hasCrossChannelSearch: false,
    hasPrioritySupport: false,
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
  const limits = getTierLimits(tier);
  return channelIndex < limits.maxChannels;
}

export function canAskQuestion(
  tier: SubscriptionTier,
  questionsToday: number
): boolean {
  const limits = getTierLimits(tier);
  return questionsToday < limits.maxQuestionsPerDay;
}
