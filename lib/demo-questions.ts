/**
 * Per-channel demo questions shown in the "Try asking" section.
 * Falls back to category-based defaults if a channel has no custom entry.
 */

type QuestionSet = [string, string, string];

const CHANNEL_QUESTIONS: Record<string, QuestionSet> = {
  // ── Health & Longevity ──
  andrew_huberman: [
    "Best science-backed morning routine?",
    "How does cold exposure affect dopamine?",
    "Recommended supplements for focus and sleep?",
  ],
  anthony_chaffee_md: [
    "Why does he recommend a carnivore diet?",
    "What does he say about plant toxins?",
    "Carnivore diet results for autoimmune conditions?",
  ],
  dr_brad_stanfield: [
    "Top evidence-based longevity interventions?",
    "What supplements does he actually recommend?",
    "His take on NMN and resveratrol?",
  ],
  dr_william_li: [
    "Best foods to starve cancer through angiogenesis?",
    "How does food affect the immune system?",
    "Top gut microbiome boosting foods?",
  ],
  foundmyfitness: [
    "Key benefits of sauna use for longevity?",
    "What does Rhonda Patrick say about sulforaphane?",
    "How does exercise affect brain health?",
  ],
  bryan_johnson: [
    "What is the Blueprint longevity protocol?",
    "His daily supplement and nutrition stack?",
    "Most surprising anti-aging results so far?",
  ],
  nick_norwitz_md_phd: [
    "How do ketones affect metabolic health?",
    "His take on LDL cholesterol on keto?",
    "Best dietary strategies for brain health?",
  ],
  nathan_sages: [
    "How to naturally optimize testosterone levels?",
    "Best exercises for hormonal health?",
    "What affects testosterone the most?",
  ],
  healthy_immune_doc: [
    "Best ways to strengthen the immune system?",
    "How does vitamin D affect immunity?",
    "Foods that fight inflammation?",
  ],
  jeremy_london_md: [
    "What causes heart disease according to him?",
    "How to reduce cardiovascular risk factors?",
    "His opinion on statins and cholesterol?",
  ],
  the_primal_podcast: [
    "Key principles of metabolic health?",
    "What does she say about seed oils?",
    "Best dietary approach for energy and health?",
  ],

  // ── History & Ancient Knowledge ──
  unchartedx: [
    "Evidence for advanced ancient machining?",
    "Most mysterious ancient site he's visited?",
    "What does the evidence at Giza suggest?",
  ],
  bright_insight: [
    "What is the case for Atlantis being real?",
    "Most compelling lost civilization evidence?",
    "What does he say about the Eye of the Sahara?",
  ],
  the_randall_carlson: [
    "Evidence for the Younger Dryas impact event?",
    "How did ancient floods shape the landscape?",
    "His take on sacred geometry in ancient structures?",
  ],
  geocosmic_rex: [
    "Evidence for ancient catastrophic events?",
    "How does catastrophism challenge mainstream history?",
    "Most compelling ancient anomalies discussed?",
  ],
  history_with_kayleigh: [
    "Most mysterious archaeological discoveries?",
    "What ancient structures defy conventional explanation?",
    "Overlooked civilizations from the ancient world?",
  ],
  funny_olde_world: [
    "Strangest anomalies in ancient history?",
    "What old world evidence challenges the timeline?",
    "Most fascinating ancient maps or artifacts?",
  ],
  wes_huff: [
    "Key arguments for the reliability of the Bible?",
    "How does he respond to common objections to Christianity?",
    "Most interesting interfaith debate moments?",
  ],

  // ── Interviews & Business ──
  the_diary_of_a_ceo: [
    "Most impactful life advice from a guest?",
    "What do top entrepreneurs say about failure?",
    "Best episode insights on mental health?",
  ],

  // ── Spirituality ──
  katie_clarke: [
    "How to develop spiritual awareness?",
    "Her take on manifesting and energy work?",
    "Best practices for personal transformation?",
  ],
  metanoia: [
    "What hidden knowledge is explored on this channel?",
    "Most fascinating mystery covered?",
    "Connections between ancient wisdom and modern life?",
  ],

  // ── Science & Technology ──
  lex_fridman: [
    "Most thought-provoking ideas from recent guests?",
    "What do AI researchers predict about the future?",
    "Best life philosophy discussed on the podcast?",
  ],
};

// Category-level fallbacks
const CATEGORY_DEFAULTS: Record<string, QuestionSet> = {
  "Health & Longevity": [
    "Key health recommendations from this channel?",
    "Most surprising insight from recent videos?",
    "Best actionable health advice shared?",
  ],
  "History & Ancient Knowledge": [
    "Most compelling historical evidence discussed?",
    "What challenges mainstream historical narratives?",
    "Most fascinating ancient sites or artifacts covered?",
  ],
  Other: [
    "Most interesting topics covered on this channel?",
    "Most surprising insight from recent videos?",
    "Best takeaway from a recent episode?",
  ],
};

const GENERIC_FALLBACK: QuestionSet = [
  "Most interesting topics covered on this channel?",
  "Most surprising insight from recent videos?",
  "What are the key takeaways from this channel?",
];

/**
 * Get three demo questions for a given channel.
 * Checks per-channel map first, then category defaults, then generic fallback.
 */
export function getDemoQuestions(
  channelSlug: string,
  category?: string
): [string, string, string] {
  if (CHANNEL_QUESTIONS[channelSlug]) {
    return CHANNEL_QUESTIONS[channelSlug];
  }
  if (category && CATEGORY_DEFAULTS[category]) {
    return CATEGORY_DEFAULTS[category];
  }
  return GENERIC_FALLBACK;
}

/** Cross-channel demo questions */
export const CROSS_CHANNEL_QUESTIONS: QuestionSet = [
  "What do experts say about intermittent fasting?",
  "Compare views on ancient civilizations",
  "Most recommended supplements across channels?",
];
