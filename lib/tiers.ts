export type SubscriptionTier = "free" | "starter" | "pro" | "premium" | "creator";

export interface TierLimits {
  maxChannels: number;
  maxQuestionsPerDay: number;
  hasTranscripts: boolean;
  hasTranslation: boolean;
  hasCrossChannelSearch: boolean;
  hasPrioritySupport: boolean;
  hasTranscriptEditing: boolean;
}

export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  free: {
    maxChannels: 3,
    maxQuestionsPerDay: 5,
    hasTranscripts: false,
    hasTranslation: false,
    hasCrossChannelSearch: false,
    hasPrioritySupport: false,
    hasTranscriptEditing: false,
  },
  starter: {
    maxChannels: 5,
    maxQuestionsPerDay: Infinity,
    hasTranscripts: false,
    hasTranslation: false,
    hasCrossChannelSearch: false,
    hasPrioritySupport: false,
    hasTranscriptEditing: false,
  },
  pro: {
    maxChannels: Infinity,
    maxQuestionsPerDay: Infinity,
    hasTranscripts: true,
    hasTranslation: true,
    hasCrossChannelSearch: false,
    hasPrioritySupport: false,
    hasTranscriptEditing: false,
  },
  premium: {
    maxChannels: Infinity,
    maxQuestionsPerDay: Infinity,
    hasTranscripts: true,
    hasTranslation: true,
    hasCrossChannelSearch: true,
    hasPrioritySupport: true,
    hasTranscriptEditing: false,
  },
  creator: {
    maxChannels: Infinity,
    maxQuestionsPerDay: Infinity,
    hasTranscripts: true,
    hasTranslation: true,
    hasCrossChannelSearch: true,
    hasPrioritySupport: true,
    hasTranscriptEditing: true,
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
