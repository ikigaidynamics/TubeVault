"use client";

import { AnimateOnScroll } from "./animate-on-scroll";

interface Channel {
  name: string;
  display: string;
  category: string;
  videoCount: number;
  color: string;
}

const CHANNELS: Channel[] = [
  // Health & Nutrition
  {
    name: "andrew_huberman",
    display: "Andrew Huberman",
    category: "Health & Nutrition",
    videoCount: 468,
    color: "#4A90D9",
  },
  {
    name: "foundmyfitness",
    display: "FoundMyFitness",
    category: "Health & Nutrition",
    videoCount: 186,
    color: "#E8573A",
  },
  {
    name: "bryan_johnson",
    display: "Bryan Johnson",
    category: "Health & Nutrition",
    videoCount: 911,
    color: "#8B5CF6",
  },
  {
    name: "the_diary_of_a_ceo",
    display: "Diary of a CEO",
    category: "Health & Nutrition",
    videoCount: 675,
    color: "#F59E0B",
  },
  {
    name: "dr_brad_stanfield",
    display: "Dr Brad Stanfield",
    category: "Health & Nutrition",
    videoCount: 422,
    color: "#10B981",
  },
  {
    name: "dr_william_li",
    display: "Dr. William Li",
    category: "Health & Nutrition",
    videoCount: 997,
    color: "#EF4444",
  },
  {
    name: "anthony_chaffee_md",
    display: "Anthony Chaffee MD",
    category: "Health & Nutrition",
    videoCount: 1485,
    color: "#06B6D4",
  },
  {
    name: "nick_norwitz_md_phd",
    display: "Nick Norwitz MD PhD",
    category: "Health & Nutrition",
    videoCount: 509,
    color: "#F97316",
  },
  {
    name: "jeremy_london_md",
    display: "Jeremy London MD",
    category: "Health & Nutrition",
    videoCount: 454,
    color: "#EC4899",
  },
  {
    name: "the_primal_podcast",
    display: "The Primal Podcast",
    category: "Health & Nutrition",
    videoCount: 135,
    color: "#84CC16",
  },
  // Ancient History & Exploration
  {
    name: "unchartedx",
    display: "UnchartedX",
    category: "Ancient History",
    videoCount: 245,
    color: "#D97706",
  },
  {
    name: "bright_insight",
    display: "Bright Insight",
    category: "Ancient History",
    videoCount: 164,
    color: "#FBBF24",
  },
  {
    name: "the_randall_carlson",
    display: "Randall Carlson",
    category: "Ancient History",
    videoCount: 1662,
    color: "#78716C",
  },
  {
    name: "geocosmic_rex",
    display: "GeoCosmic REX",
    category: "Ancient History",
    videoCount: 210,
    color: "#2DD4BF",
  },
  {
    name: "history_with_kayleigh",
    display: "History with Kayleigh",
    category: "Ancient History",
    videoCount: 387,
    color: "#A78BFA",
  },
  {
    name: "funny_olde_world",
    display: "Funny Olde World",
    category: "Ancient History",
    videoCount: 139,
    color: "#FB923C",
  },
  // More
  {
    name: "wes_huff",
    display: "Wes Huff",
    category: "Theology",
    videoCount: 320,
    color: "#60A5FA",
  },
  {
    name: "katie_clarke",
    display: "Katie Clarke",
    category: "Spirituality",
    videoCount: 192,
    color: "#C084FC",
  },
  {
    name: "metanoia",
    display: "Metanoia",
    category: "Spirituality",
    videoCount: 57,
    color: "#34D399",
  },
  {
    name: "nathan_sages",
    display: "Nathan Sages",
    category: "Health & Nutrition",
    videoCount: 199,
    color: "#FB7185",
  },
];

function ChannelCard({ channel, index }: { channel: Channel; index: number }) {
  const initials = channel.display
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

  return (
    <AnimateOnScroll delay={Math.min(index * 50, 400)}>
      <div className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all duration-300 hover:border-primary/20 hover:bg-white/[0.04]">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white transition-transform duration-300 group-hover:scale-110"
            style={{ backgroundColor: channel.color + "20", color: channel.color }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-cream">
              {channel.display}
            </p>
            <p className="text-[11px] text-gray-text/60">
              {channel.videoCount.toLocaleString()} videos
            </p>
          </div>
        </div>
        <div className="absolute right-3 top-3">
          <span className="rounded-full bg-white/[0.04] px-2 py-0.5 text-[10px] text-gray-text/50">
            {channel.category}
          </span>
        </div>
      </div>
    </AnimateOnScroll>
  );
}

export function ChannelGrid() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {CHANNELS.map((channel, i) => (
        <ChannelCard key={channel.name} channel={channel} index={i} />
      ))}
    </div>
  );
}
