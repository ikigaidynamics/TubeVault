import type { Collection } from "@/lib/api";

export const CATEGORIES = [
  "All",
  "Health & Longevity",
  "History & Ancient Knowledge",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

const CATEGORY_MAP: Record<string, Category> = {
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
  the_diary_of_a_ceo: "Health & Longevity",
  doctor_sethi: "Health & Longevity",
  unchartedx: "History & Ancient Knowledge",
  bright_insight: "History & Ancient Knowledge",
  the_randall_carlson: "History & Ancient Knowledge",
  geocosmic_rex: "History & Ancient Knowledge",
  history_with_kayleigh: "History & Ancient Knowledge",
  funny_olde_world: "History & Ancient Knowledge",
  wes_huff: "History & Ancient Knowledge",
  katie_clarke: "Other",
  metanoia: "Other",
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
