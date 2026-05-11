import type { Collection } from "@/lib/api";

export const CATEGORIES = [
  "All",
  "Health & Longevity",
  "History & Ancient Knowledge",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

const CATEGORY_MAP: Record<string, Category> = {
  // ── Health & Longevity ──
  andrew_huberman: "Health & Longevity",
  anthony_chaffee_md: "Health & Longevity",
  dr_brad_stanfield: "Health & Longevity",
  dr_william_li: "Health & Longevity",
  foundmyfitness: "Health & Longevity",
  bryan_johnson: "Health & Longevity",
  nick_norwitz_md_phd: "Health & Longevity",
  nathan_sages: "Health & Longevity",
  healthy_immune_doc: "Health & Longevity",
  jeremy_london_md: "Health & Longevity",
  the_primal_podcast: "Health & Longevity",
  doctor_sethi: "Health & Longevity",
  dr_eric_berg_dc: "Health & Longevity",
  dr_mindy_pelz: "Health & Longevity",
  squat_university: "Health & Longevity",
  wim_hof: "Health & Longevity",
  peter_attia_md: "Health & Longevity",
  doctor_mike_diamonds: "Health & Longevity",
  dr_rangan_chatterjee: "Health & Longevity",
  mark_hyman_md: "Health & Longevity",
  jeremy_ethier: "Health & Longevity",
  dr_eric_westman_adapt_your_life: "Health & Longevity",
  kendberrymd: "Health & Longevity",
  doctor_mike: "Health & Longevity",
  thomas_delauer: "Health & Longevity",
  dr_tracey_marks: "Health & Longevity",

  // ── History & Ancient Knowledge ──
  unchartedx: "History & Ancient Knowledge",
  bright_insight: "History & Ancient Knowledge",
  the_randall_carlson: "History & Ancient Knowledge",
  geocosmic_rex: "History & Ancient Knowledge",
  history_with_kayleigh: "History & Ancient Knowledge",
  funny_olde_world: "History & Ancient Knowledge",
  wes_huff: "History & Ancient Knowledge",
  predictive_history: "History & Ancient Knowledge",

  // ── Other ──
  the_diary_of_a_ceo: "Other",
  tony_robbins: "Other",
  jordan_b_peterson: "Other",
  lewis_howes: "Other",
  jay_shetty_podcast: "Other",
  mel_robbins: "Other",
  powerfuljre: "Other",
  graham_stephan: "Other",
  mark_tilbury: "Other",
  starter_story: "Other",
  danny_jones: "Other",
  katie_clarke: "Other",
  metanoia: "Other",
  thewizardliz: "Other",
  lex_fridman: "Other",
  startalk: "Other",
  kurzgesagt_in_a_nutshell: "Other",
};

/** Get the category for a collection by slug or description fallback. */
export function getCollectionCategory(col: Collection): Category {
  if (CATEGORY_MAP[col.name]) return CATEGORY_MAP[col.name];
  if (!col.description) return "Other";
  const d = col.description.toLowerCase();
  if (
    d.includes("health") ||
    d.includes("nutrition") ||
    d.includes("longevity") ||
    d.includes("neuroscience") ||
    d.includes("medicine") ||
    d.includes("fitness") ||
    d.includes("biohacking")
  )
    return "Health & Longevity";
  if (
    d.includes("history") ||
    d.includes("ancient") ||
    d.includes("geology") ||
    d.includes("archaeology") ||
    d.includes("apologetics") ||
    d.includes("theology")
  )
    return "History & Ancient Knowledge";
  return "Other";
}

/** Return all slugs in CATEGORY_MAP matching a given category. */
export function getCollectionNamesByCategory(
  category: Category | string
): string[] {
  if (category === "All") return Object.keys(CATEGORY_MAP);
  return Object.entries(CATEGORY_MAP)
    .filter(([, cat]) => cat === category)
    .map(([slug]) => slug);
}

/** Filter collections by category. "All" returns everything. */
export function getCollectionsByCategory(
  collections: Collection[],
  category: Category | string
): Collection[] {
  if (category === "All") return collections;
  return collections.filter(
    (c) => getCollectionCategory(c) === category
  );
}
