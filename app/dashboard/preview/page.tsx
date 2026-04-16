"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, AlertCircle, Globe, ArrowRight, ChevronRight } from "lucide-react";
import { ChannelSidebar } from "@/components/chat/channel-sidebar";
import { ChatMessage } from "@/components/chat/chat-message";
import type { Collection, Source } from "@/lib/api";
import type { SubscriptionTier } from "@/lib/tiers";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://mindvault.ikigai-dynamics.com/api";

// Mock messages to preview chat UI
const MOCK_MESSAGES: { role: "user" | "assistant"; content: string; sources?: Source[] }[] = [
  {
    role: "user",
    content: "How do I get better sleep?",
  },
  {
    role: "assistant",
    content:
      "According to Andrew Huberman, getting better sleep involves several key strategies. He emphasizes the importance of **morning sunlight exposure** within the first 30-60 minutes of waking to set your circadian rhythm. He also recommends:\n\n- **Keep your room cool** (around 65-67°F / 18-19°C)\n- **Avoid bright lights** in the evening, especially overhead lights\n- **Delay caffeine** 90-120 minutes after waking\n- **Consistent sleep schedule** — same wake time every day",
    sources: [
      {
        title: "Master Your Sleep & Be More Alert When Awake",
        video_id: "nm1TxQj9IsQ",
        timestamp: "6:12",
        url: "https://www.youtube.com/watch?v=nm1TxQj9IsQ&t=372",
        snippet: "Sleep and wakefulness are governed by two forces: adenosine buildup and the circadian clock.",
        text: "So what determines how well we sleep? Turns out, that's governed by two forces.",
      },
      {
        title: "Sleep Toolkit: Tools for Optimizing Sleep",
        video_id: "h2aWYjSA1Jc",
        timestamp: "16:29",
        url: "https://www.youtube.com/watch?v=h2aWYjSA1Jc&t=989",
        snippet: "Get bright light in your eyes within 30-60 minutes of waking.",
        text: "You do want cortisol to reach its peak early in the day.",
      },
    ],
  },
];

const TIER_OPTIONS: { label: string; tier: SubscriptionTier; remaining: number; limit: number }[] = [
  { label: "Free", tier: "free", remaining: 1, limit: 3 },
  { label: "Starter", tier: "starter", remaining: 50, limit: 0 },
  { label: "Pro", tier: "pro", remaining: 0, limit: 0 },
  { label: "Premium", tier: "premium", remaining: 0, limit: 0 },
];

export default function DashboardPreview() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [activeTier, setActiveTier] = useState(0);
  const [showMessages, setShowMessages] = useState(false);
  const [searchAllActive, setSearchAllActive] = useState(false);

  const tierConfig = TIER_OPTIONS[activeTier];

  useEffect(() => {
    fetch(`${API_BASE_URL}/collections`)
      .then((r) => r.json())
      .then((data: Collection[]) => {
        setCollections(data.sort((a, b) => a.display_name.localeCompare(b.display_name)));
      })
      .catch(() => {});
  }, []);

  const selectedCollection = collections.find((c) => c.name === selectedChannel);
  const hasActiveChat = selectedChannel || searchAllActive;
  const chatLabel = searchAllActive
    ? "all channels"
    : selectedCollection?.display_name || selectedChannel;

  // For free tier, only show top 3 channels in sidebar
  const pickedChannels =
    tierConfig.tier === "free"
      ? collections
          .sort((a, b) => (b.video_count || 0) - (a.video_count || 0))
          .slice(0, 3)
          .map((c) => c.name)
      : collections.map((c) => c.name);

  return (
    <div className="flex h-screen bg-[#0A0A0B]">
      {/* Tier switcher — fixed top-right */}
      <div className="fixed right-4 top-4 z-[200] flex items-center gap-1.5 rounded-xl border border-primary/30 bg-[#1C1D1F] p-1 shadow-lg">
        <span className="px-2 text-[10px] font-medium text-gray-text/50">PREVIEW TIER:</span>
        {TIER_OPTIONS.map((opt, i) => (
          <button
            key={opt.tier}
            onClick={() => setActiveTier(i)}
            className={`rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all ${
              i === activeTier
                ? "bg-primary text-white"
                : "text-gray-text hover:text-cream"
            }`}
          >
            {opt.label}
          </button>
        ))}
        <button
          onClick={() => setShowMessages(!showMessages)}
          className={`ml-1 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all ${
            showMessages
              ? "bg-white/10 text-cream"
              : "text-gray-text hover:text-cream"
          }`}
        >
          {showMessages ? "Hide Chat" : "Show Chat"}
        </button>
      </div>

      <ChannelSidebar
        collections={collections}
        selectedChannel={selectedChannel}
        onSelectChannel={(name) => {
          setSearchAllActive(false);
          setSelectedChannel(name);
        }}
        userEmail="preview@tubevault.io"
        onLogout={() => {}}
        tier={tierConfig.tier}
        pickedChannels={pickedChannels}
        lockedUntil={tierConfig.tier === "free" ? new Date(Date.now() + 7 * 86400000).toISOString() : null}
        canChange={tierConfig.tier !== "free"}
        onChangeChannels={() => {}}
        onSearchAll={() => { setSearchAllActive(true); setSelectedChannel(null); }}
        searchAllActive={searchAllActive}
        questionsRemaining={tierConfig.remaining > 0 ? tierConfig.remaining : null}
        questionLimit={tierConfig.limit > 0 ? tierConfig.limit : null}
      />

      {/* Main area */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="flex items-center gap-1.5 border-b border-white/[0.04] bg-[#0F1011]/95 px-6 py-2.5 pl-14 backdrop-blur-sm md:pl-6">
          <Link href="/" className="text-[12px] text-gray-text/50 transition-colors hover:text-cream">
            TubeVault
          </Link>
          <ChevronRight className="h-3 w-3 text-gray-text/20" />
          {hasActiveChat ? (
            <span className="text-[12px] font-medium text-cream">
              {searchAllActive ? "Cross-Channel" : selectedCollection?.display_name || "..."}
            </span>
          ) : (
            <span className="text-[12px] text-gray-text/50">Welcome</span>
          )}
          {hasActiveChat && (
            <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_6px_rgba(101,174,76,0.4)]" />
          )}
        </header>

        {/* Messages area */}
        <div
          className="flex-1 overflow-y-auto"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        >
          {!hasActiveChat ? (
            /* Welcome screen */
            <div className="relative flex h-full items-center justify-center px-6">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_40%,rgba(101,174,76,0.03)_0%,transparent_70%)]" />
              <div className="relative w-full max-w-3xl animate-[fadeUp_0.6s_ease-out] text-center">
                <div className="mb-2 flex items-center justify-center gap-3">
                  <Image src="/TubeVault_Logo_noBG.png" alt="TubeVault" width={48} height={48} className="h-12 w-12" />
                  <h2 className="text-2xl font-semibold text-cream">Welcome to TubeVault</h2>
                </div>
                <p className="text-sm text-gray-text/50">
                  Pick a channel from the sidebar, or try one of these:
                </p>
                <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {[
                    { slug: "andrew_huberman", name: "Andrew Huberman", question: "How do I get better sleep?" },
                    { slug: "the_randall_carlson", name: "Randall Carlson", question: "What caused the great floods?" },
                    { slug: "bryan_johnson", name: "Bryan Johnson", question: "What is the Blueprint protocol?" },
                  ].map((creator) => {
                    const col = collections.find((c) => c.name === creator.slug);
                    const logoUrl = col?.logo
                      ? col.logo.startsWith("/")
                        ? `https://mindvault.ikigai-dynamics.com${col.logo}`
                        : col.logo
                      : null;
                    return (
                      <button
                        key={creator.slug}
                        onClick={() => { setSelectedChannel(creator.slug); setSearchAllActive(false); }}
                        className="group flex flex-col items-center gap-4 rounded-2xl border border-[#2E2F31] bg-[#1C1D1F] px-5 py-7 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_0_20px_rgba(101,174,76,0.08)]"
                      >
                        {logoUrl ? (
                          <Image src={logoUrl} alt={creator.name} width={80} height={80} className="h-20 w-20 rounded-2xl object-cover ring-2 ring-primary/20" unoptimized />
                        ) : (
                          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/[0.06] text-xl font-bold text-gray-text ring-2 ring-white/[0.06]">
                            {creator.name.split(" ").map((w) => w[0]).join("")}
                          </div>
                        )}
                        <p className="text-sm font-semibold text-cream">{creator.name}</p>
                        <p className="text-[11px] italic leading-relaxed text-gray-text/60">
                          &ldquo;{creator.question}&rdquo;
                        </p>
                        <span className="mt-auto flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-[12px] font-medium text-primary transition-all duration-200 group-hover:bg-primary group-hover:text-white">
                          Try {creator.name.split(" ").pop()}
                          <ArrowRight className="h-3 w-3" />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : showMessages ? (
            /* Mock messages */
            <div className="mx-auto max-w-3xl space-y-5 px-6 py-6 md:px-12">
              {MOCK_MESSAGES.map((msg, i) => (
                <div key={i} className="animate-[fadeUp_0.3s_ease-out]">
                  <ChatMessage
                    role={msg.role}
                    content={msg.content}
                    sources={msg.sources}
                    userAvatar={null}
                    channelId={selectedChannel ?? undefined}
                  />
                </div>
              ))}
            </div>
          ) : (
            /* Channel welcome */
            <div className="flex h-full animate-[fadeUp_0.5s_ease-out] items-center justify-center px-6 md:px-12">
              <div className="flex w-full max-w-[860px] flex-col items-center gap-8 md:flex-row md:items-start md:gap-0">
                <div className="flex flex-[0_0_61.8%] flex-col gap-4 text-center md:pr-12 md:text-left">
                  {(() => {
                    const logoUrl = selectedCollection?.logo
                      ? selectedCollection.logo.startsWith("/")
                        ? `https://mindvault.ikigai-dynamics.com${selectedCollection.logo}`
                        : selectedCollection.logo
                      : null;
                    return logoUrl ? (
                      <Image src={logoUrl} alt={selectedCollection?.display_name || ""} width={48} height={48} className="mx-auto h-12 w-12 rounded-xl object-cover md:mx-0" unoptimized />
                    ) : (
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#2E2F31] to-[#424F4A] text-base font-bold text-gray-text md:mx-0">
                        {selectedCollection?.display_name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                      </div>
                    );
                  })()}
                  <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-gray-text/35">Creator Intelligence</p>
                  <h2 className="text-[1.6rem] font-normal leading-tight text-cream/90">
                    Explore <span className="text-cream">{selectedCollection?.display_name}</span>
                  </h2>
                  <p className="text-[13px] leading-relaxed text-gray-text/50">
                    {selectedCollection?.video_count || "All"} videos indexed. Every answer linked to the source.
                  </p>
                </div>
                <div className="flex w-full flex-[0_0_38.2%] flex-col gap-2.5 md:w-auto">
                  <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-gray-text/35">Try asking</p>
                  {[`Main topics ${selectedCollection?.display_name} covers?`, "Most surprising insight from recent videos?", "Key health recommendations?"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setShowMessages(true)}
                      className="w-full rounded-xl border border-[#2E2F31] bg-[#1C1D1F] px-3.5 py-2.5 text-left text-[12px] leading-relaxed text-gray-text/60 transition-all duration-200 hover:translate-x-1 hover:border-primary/20 hover:text-cream/80 hover:shadow-[0_4px_20px_rgba(101,174,76,0.06)]"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-[#2E2F31] bg-[#0F1011] px-6 py-4 md:px-10 lg:px-14">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-end gap-3 rounded-2xl border border-[#2E2F31] bg-[#1C1D1F] px-5 py-2">
              <Search className="mb-3 h-5 w-5 shrink-0 text-gray-text/30" />
              <div className="flex-1 py-2.5 text-base text-gray-text/35">
                {hasActiveChat ? `Ask anything about ${chatLabel}...` : "Pick a channel to start asking questions..."}
              </div>
              <button
                disabled
                className="mb-1 shrink-0 rounded-xl bg-primary px-5 py-2 text-sm font-medium text-white opacity-20"
              >
                Search
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-gray-text/25">
              AI-generated from video transcripts. Verify with the source.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
