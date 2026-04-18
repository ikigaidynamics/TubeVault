/**
 * Landing page variant system for traffic-source-specific copy.
 *
 * RESERVED SLUGS — these are handled by static routes and must never
 * be used as variant slugs: pricing, login, signup, channels, terms,
 * privacy, admin, api, dashboard, try, auth, tos
 */

export interface LandingVariant {
  slug: string;
  heroEyebrow: string;
  heroHeadline: string;
  heroHeadlineAccent: string;
  heroSubheadline: string;
  defaultDemoChannel: string;
  defaultDemoQuestionShort: string;
  defaultDemoQuestionLong: string;
  primaryCtaText: string;
  secondaryCtaText: string;
  belowHeroSection?: { title: string; body: string };
  comparisonSection?: {
    title: string;
    subtitle: string | null;
    genericAiPoints: string[];
    tubeVaultPoints: string[];
  };
  metaTitle: string;
  metaDescription: string;
}

export const VARIANTS: Record<string, LandingVariant> = {
  default: {
    slug: "default",
    heroEyebrow: "Finally: Searchable YouTube.",
    heroHeadline: "Find the exact answer from your favorite creators \u2014",
    heroHeadlineAccent: "without hours of searching.",
    heroSubheadline:
      'No more "where did they say that?" \u2014 TubeVault searches 30+ trusted experts and gives you the exact quote, the exact moment, and the exact source.',
    defaultDemoChannel: "andrew_huberman",
    defaultDemoQuestionShort: "Magnesium for sleep?",
    defaultDemoQuestionLong: "What does Huberman say about magnesium for sleep?",
    primaryCtaText: "Start searching \u2014 it\u2019s free",
    secondaryCtaText: "See pricing",
    metaTitle: "TubeVault \u2014 AI-Powered YouTube Search",
    metaDescription:
      "Search YouTube channels by meaning. Ask questions, get answers from creator videos with exact timestamps.",
  },

  archive: {
    slug: "archive",
    heroEyebrow: "FOR SERIOUS RESEARCHERS OF THE ANCIENT PAST",
    heroHeadline: "Every claim, every source, every timestamp \u2014",
    heroHeadlineAccent: "in seconds.",
    heroSubheadline:
      "Search UnchartedX, Randall Carlson, Bright Insight, and 40+ more channels worth taking seriously. Ask a question, get the exact quote \u2014 with a timestamp that jumps straight to the source.",
    defaultDemoChannel: "unchartedx",
    defaultDemoQuestionShort: "Ancient high tech in Egypt?",
    defaultDemoQuestionLong:
      "What evidence does UnchartedX present for high technology in ancient Egypt?",
    primaryCtaText: "Start searching \u2014 it\u2019s free",
    secondaryCtaText: "See pricing",
    belowHeroSection: {
      title: "Built for the way you actually research.",
      body: "You don\u2019t just watch these channels \u2014 you compare them, verify them, follow the citations. You\u2019ve spent hours hunting for the episode where Carlson mentioned the Younger Dryas carbon dates, or where UnchartedX laid out the granite vase measurements. TubeVault puts every one of those moments one question away.",
    },
    comparisonSection: {
      title: "Why not just ask ChatGPT?",
      subtitle: null,
      genericAiPoints: [
        "Makes things up \u2014 no way to verify",
        "Can\u2019t cite the episode or timestamp",
        "Training data is a black box",
      ],
      tubeVaultPoints: [
        "Only what the creator actually said \u2014 word for word",
        "Every answer includes a clickable timestamp",
        "You can verify every quote at the original source",
      ],
    },
    metaTitle:
      "TubeVault \u2014 Search UnchartedX, Randall Carlson, and 40+ more",
    metaDescription:
      "Ask a question across the best ancient history and alternative research channels on YouTube. Get exact quotes with timestamps that jump straight to the source.",
  },
};

export const RESERVED_SLUGS = new Set([
  "pricing", "login", "signup", "channels", "terms", "privacy",
  "admin", "api", "dashboard", "try", "auth", "tos",
]);
