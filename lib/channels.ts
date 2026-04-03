export interface Channel {
  slug: string;
  displayName: string;
  description: string;
  videoCount: number;
  category: string;
  avatar: string;
  color: string;
}

export const CATEGORIES = [
  "All",
  "Health & Nutrition",
  "Ancient History",
  "Theology",
  "Spirituality",
  "Education",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CHANNELS: Channel[] = [
  // ── Health & Nutrition ──
  {
    slug: "andrew_huberman",
    displayName: "Andrew Huberman",
    description:
      "Neuroscience & science-based tools for everyday life from the Huberman Lab podcast.",
    videoCount: 468,
    category: "Health & Nutrition",
    avatar: "/channels/andrew_huberman_avatar.jpg",
    color: "#4A90D9",
  },
  {
    slug: "anthony_chaffee_md",
    displayName: "Anthony Chaffee MD",
    description:
      "American medical doctor exploring carnivore nutrition and optimal human diet.",
    videoCount: 1485,
    category: "Health & Nutrition",
    avatar: "/channels/anthony_chaffee_md_avatar.jpg",
    color: "#06B6D4",
  },
  {
    slug: "dr_brad_stanfield",
    displayName: "Dr Brad Stanfield",
    description:
      "Primary care physician sharing the latest research and clinical guidelines on longevity.",
    videoCount: 422,
    category: "Health & Nutrition",
    avatar: "/channels/dr_brad_stanfield_avatar.jpg",
    color: "#10B981",
  },
  {
    slug: "dr_william_li",
    displayName: "Dr. William Li",
    description:
      "World-renowned physician and scientist on nutrition, angiogenesis, and disease prevention.",
    videoCount: 997,
    category: "Health & Nutrition",
    avatar: "/channels/dr_william_li_avatar.jpg",
    color: "#EF4444",
  },
  {
    slug: "foundmyfitness",
    displayName: "FoundMyFitness",
    description:
      "Dr. Rhonda Patrick on health science, fitness protocols, and longevity research.",
    videoCount: 186,
    category: "Health & Nutrition",
    avatar: "/channels/foundmyfitness_avatar.jpg",
    color: "#E8573A",
  },
  {
    slug: "bryan_johnson",
    displayName: "Bryan Johnson",
    description:
      "The world's most measured human. Longevity, metabolic health, and Project Blueprint.",
    videoCount: 911,
    category: "Health & Nutrition",
    avatar: "/channels/bryan_johnson_avatar.jpg",
    color: "#8B5CF6",
  },
  {
    slug: "nick_norwitz_md_phd",
    displayName: "Nick Norwitz MD PhD",
    description:
      "MD from Harvard & PhD from Oxford. Metabolic health enthusiast — stay curious.",
    videoCount: 509,
    category: "Health & Nutrition",
    avatar: "/channels/nick_norwitz_md_phd_avatar.jpg",
    color: "#F97316",
  },
  {
    slug: "nathan_sages",
    displayName: "Nathan Sages",
    description:
      "Helping men step into their highest potential through testosterone and health optimization.",
    videoCount: 199,
    category: "Health & Nutrition",
    avatar: "/channels/nathan_sages_avatar.jpg",
    color: "#FB7185",
  },
  {
    slug: "healthy_immune_doc",
    displayName: "Healthy Immune Doc",
    description:
      "Dr. Liu on immune health, front-line medical insights, and wellness strategies.",
    videoCount: 314,
    category: "Health & Nutrition",
    avatar: "/channels/healthy_immune_doc_avatar.jpg",
    color: "#14B8A6",
  },
  {
    slug: "jeremy_london_md",
    displayName: "Jeremy London MD",
    description:
      "Board-certified cardiovascular surgeon on optimizing life for a better, longer health span.",
    videoCount: 454,
    category: "Health & Nutrition",
    avatar: "/channels/jeremy_london_md_avatar.jpg",
    color: "#EC4899",
  },
  {
    slug: "the_primal_podcast",
    displayName: "The Primal Podcast",
    description:
      "Health podcast focused on metabolic health, hosted by Rina Ahluwalia.",
    videoCount: 135,
    category: "Health & Nutrition",
    avatar: "/channels/the_primal_podcast_avatar.jpg",
    color: "#84CC16",
  },
  {
    slug: "the_diary_of_a_ceo",
    displayName: "The Diary of a CEO",
    description:
      "Deep conversations on business, health, and human performance with Steven Bartlett.",
    videoCount: 675,
    category: "Health & Nutrition",
    avatar: "/channels/the_diary_of_a_ceo_avatar.jpg",
    color: "#F59E0B",
  },
  {
    slug: "doctor_sethi",
    displayName: "Doctor Sethi",
    description:
      "Harvard & Stanford-trained gastroenterologist making gut health easy to understand.",
    videoCount: 22,
    category: "Health & Nutrition",
    avatar: "/channels/doctor_sethi_avatar.jpg",
    color: "#A3E635",
  },

  // ── Ancient History & Exploration ──
  {
    slug: "unchartedx",
    displayName: "UnchartedX",
    description:
      "Ben van Kerkwyk exploring ancient sites, precision engineering, and lost civilizations.",
    videoCount: 245,
    category: "Ancient History",
    avatar: "/channels/unchartedx_avatar.jpg",
    color: "#D97706",
  },
  {
    slug: "bright_insight",
    displayName: "Bright Insight",
    description:
      "Jimmy Corsetti investigating lost ancient history and forgotten civilizations.",
    videoCount: 164,
    category: "Ancient History",
    avatar: "/channels/bright_insight_avatar.jpg",
    color: "#FBBF24",
  },
  {
    slug: "the_randall_carlson",
    displayName: "Randall Carlson",
    description:
      "Exploring the profound mysteries of our world — science, sacred geometry, and catastrophism.",
    videoCount: 1662,
    category: "Ancient History",
    avatar: "/channels/the_randall_carlson_avatar.jpg",
    color: "#78716C",
  },
  {
    slug: "geocosmic_rex",
    displayName: "GeoCosmic REX",
    description:
      "Ice Age Floods, catastrophe and Earth change, mythology, symbolism, and ancient mysteries.",
    videoCount: 210,
    category: "Ancient History",
    avatar: "/channels/geocosmic_rex_avatar.jpg",
    color: "#2DD4BF",
  },
  {
    slug: "history_with_kayleigh",
    displayName: "History with Kayleigh",
    description:
      "Archaeology, ancient structures, and the untold stories of the ancient world.",
    videoCount: 387,
    category: "Ancient History",
    avatar: "/channels/history_with_kayleigh_avatar.jpg",
    color: "#A78BFA",
  },
  {
    slug: "funny_olde_world",
    displayName: "Funny Olde World",
    description:
      "Actress, comedian, and ancient history geek exploring our mysterious past.",
    videoCount: 139,
    category: "Ancient History",
    avatar: "/channels/funny_olde_world_avatar.jpg",
    color: "#FB923C",
  },

  // ── Theology ──
  {
    slug: "wes_huff",
    displayName: "Wes Huff",
    description:
      "Christian apologetics, interfaith dialogue, and theological scholarship (BA, MTS, PhD candidate).",
    videoCount: 320,
    category: "Theology",
    avatar: "/channels/wes_huff_avatar.jpg",
    color: "#60A5FA",
  },

  // ── Spirituality ──
  {
    slug: "katie_clarke",
    displayName: "Katie Clarke",
    description:
      "Helping you reconnect with your divine power — spirituality and self-development.",
    videoCount: 192,
    category: "Spirituality",
    avatar: "/channels/katie_clarke_avatar.jfif",
    color: "#C084FC",
  },
  {
    slug: "metanoia",
    displayName: "Metanoia",
    description:
      "Hidden knowledge, mysteries, and the Fibonacci sequence of consciousness.",
    videoCount: 57,
    category: "Spirituality",
    avatar: "/channels/metanoia_avatar.jpg",
    color: "#34D399",
  },

  // ── Education ──
  {
    slug: "btu_cottbus_senftenberg",
    displayName: "BTU Cottbus-Senftenberg",
    description:
      "Brandenburg Technical University — lectures, research talks, and academic content.",
    videoCount: 283,
    category: "Education",
    avatar: "/channels/btu_cottbus_senftenberg_avatar.jpg",
    color: "#0EA5E9",
  },
];

export function getChannelsByCategory(category: Category): Channel[] {
  if (category === "All") return CHANNELS;
  return CHANNELS.filter((c) => c.category === category);
}

export function getChannel(slug: string): Channel | undefined {
  return CHANNELS.find((c) => c.slug === slug);
}
