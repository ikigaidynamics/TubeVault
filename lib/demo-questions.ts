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
  dr_eric_berg_dc: [
    "Best keto tips for beginners?",
    "How does intermittent fasting work?",
    "His take on vitamin deficiencies?",
  ],
  dr_mindy_pelz: [
    "How does fasting benefit women specifically?",
    "Best fasting protocols by cycle phase?",
    "Her approach to hormonal health?",
  ],
  squat_university: [
    "How to fix squat form and depth?",
    "Best exercises for knee pain prevention?",
    "How to improve hip mobility?",
  ],
  wim_hof: [
    "How does the Wim Hof breathing method work?",
    "Benefits of cold exposure for health?",
    "How to build cold tolerance safely?",
  ],
  peter_attia_md: [
    "Key pillars of his longevity framework?",
    "His take on Zone 2 cardio training?",
    "Most important health metrics to track?",
  ],
  doctor_mike_diamonds: [
    "Best fat loss strategies that actually work?",
    "His approach to body recomposition?",
    "Biggest fitness myths debunked?",
  ],
  dr_rangan_chatterjee: [
    "His four-pillar approach to health?",
    "How does stress affect the body?",
    "Simple habits for better health?",
  ],
  mark_hyman_md: [
    "What is functional medicine?",
    "His take on sugar and chronic disease?",
    "Best foods for reducing inflammation?",
  ],
  jeremy_ethier: [
    "Most effective exercises for muscle growth?",
    "How to fix common posture problems?",
    "Science-based training splits?",
  ],
  dr_eric_westman_adapt_your_life: [
    "His clinical approach to the keto diet?",
    "How does low-carb help with diabetes?",
    "Best advice for starting keto?",
  ],
  kendberrymd: [
    "His take on the carnivore diet?",
    "Common medical myths debunked?",
    "How to talk to your doctor about nutrition?",
  ],
  doctor_mike: [
    "Most common health misconceptions?",
    "His take on trending health topics?",
    "Best general health advice?",
  ],
  thomas_delauer: [
    "Best intermittent fasting strategies?",
    "How to optimize nutrition for busy people?",
    "His take on keto vs other diets?",
  ],
  dr_tracey_marks: [
    "How to recognize signs of anxiety or depression?",
    "Best strategies for improving mental health?",
    "Her advice on sleep and emotional wellbeing?",
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
  predictive_history: [
    "How does psycho-history explain patterns?",
    "Most surprising historical prediction?",
    "Connections between past and future events?",
  ],

  // ── Interviews & Business ──
  the_diary_of_a_ceo: [
    "Most impactful life advice from a guest?",
    "What do top entrepreneurs say about failure?",
    "Best episode insights on mental health?",
  ],
  tony_robbins: [
    "His top strategies for peak performance?",
    "Best advice on building financial freedom?",
    "How to break through limiting beliefs?",
  ],
  jordan_b_peterson: [
    "His key advice for young people?",
    "What does he say about personal responsibility?",
    "Most thought-provoking psychological insight?",
  ],
  lewis_howes: [
    "Best success habits from top performers?",
    "Most impactful guest interview moment?",
    "His advice on building greatness?",
  ],
  jay_shetty_podcast: [
    "Best advice for dealing with stress?",
    "How to find purpose and meaning?",
    "Most powerful mindset shifts discussed?",
  ],
  mel_robbins: [
    "How does the 5-second rule work?",
    "Best strategies for building confidence?",
    "Her advice on overcoming self-doubt?",
  ],
  powerfuljre: [
    "Most controversial guest conversation?",
    "Best health and fitness discussions?",
    "Most mind-blowing topics covered?",
  ],
  graham_stephan: [
    "Best strategies for building wealth?",
    "His take on real estate investing?",
    "How to save money effectively?",
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
  thewizardliz: [
    "How to create the reality you want?",
    "Best advice on self-empowerment?",
    "Her take on confidence and self-worth?",
  ],

  // ── Science & Technology ──
  lex_fridman: [
    "Most thought-provoking ideas from recent guests?",
    "What do AI researchers predict about the future?",
    "Best life philosophy discussed on the podcast?",
  ],
  startalk: [
    "Most fascinating space discoveries discussed?",
    "How does Neil deGrasse Tyson explain black holes?",
    "Best astronomy facts shared on the show?",
  ],
  kurzgesagt_in_a_nutshell: [
    "Most mind-blowing science topic explained?",
    "How does the channel explain complex topics simply?",
    "Best episode on the future of humanity?",
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

/** Short 1-3 word taglines for sidebar display */
const CHANNEL_TAGLINES: Record<string, string> = {
  // ── Health & Longevity ──
  andrew_huberman: "Neuroscience & Health",
  anthony_chaffee_md: "Carnivore & Nutrition",
  dr_brad_stanfield: "Longevity Medicine",
  dr_william_li: "Nutrition & Disease",
  foundmyfitness: "Science & Longevity",
  bryan_johnson: "Biohacking & Longevity",
  nick_norwitz_md_phd: "Metabolic Health",
  nathan_sages: "Men's Health",
  healthy_immune_doc: "Immune Health",
  jeremy_london_md: "Cardiovascular Health",
  the_primal_podcast: "Metabolic Health",
  doctor_sethi: "Gut Health",
  dr_eric_berg_dc: "Health Expert (Keto)",
  dr_mindy_pelz: "Health Expert",
  squat_university: "Strength & Fitness",
  wim_hof: "The \"Iceman\"",
  peter_attia_md: "Longevity Expert",
  doctor_mike_diamonds: "Health & Fitness",
  dr_rangan_chatterjee: "Medical Doctor",
  mark_hyman_md: "Functional Medicine",
  jeremy_ethier: "Training & Nutrition",
  dr_eric_westman_adapt_your_life: "Keto Diet",
  kendberrymd: "Family Physician",
  doctor_mike: "Health Expert",
  thomas_delauer: "Fitness for Busy People",
  dr_tracey_marks: "Mental Health Expert",

  // ── History & Ancient Knowledge ──
  unchartedx: "Ancient Engineering",
  bright_insight: "Lost Civilizations",
  the_randall_carlson: "Geology & Cosmology",
  geocosmic_rex: "Catastrophism",
  history_with_kayleigh: "Archaeology",
  funny_olde_world: "Ancient Mysteries",
  wes_huff: "Christian Apologetics",
  predictive_history: "Psycho-History",

  // ── Interviews & Business ──
  the_diary_of_a_ceo: "Business & Interviews",
  tony_robbins: "Author & Coach",
  jordan_b_peterson: "Psychology",
  lewis_howes: "Athlete & Author",
  jay_shetty_podcast: "Mental Health",
  mel_robbins: "Mindset",
  powerfuljre: "Podcast",
  graham_stephan: "Real Estate Investor",

  // ── Spirituality ──
  katie_clarke: "Spirituality",
  metanoia: "Hidden Knowledge",
  thewizardliz: "Create your Reality",

  // ── Science & Technology ──
  lex_fridman: "Science & Philosophy",
  startalk: "Astronomy",
  kurzgesagt_in_a_nutshell: "Science",
};

/**
 * Get a short tagline for a channel (1-3 words).
 * Falls back to "Creator" if not found.
 */
export function getChannelTagline(channelSlug: string): string {
  return CHANNEL_TAGLINES[channelSlug] || "Creator";
}
