"use client";

export const dynamic = "force-dynamic";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Send, AlertCircle, Globe, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { queryCollection, type Collection, type HistoryMessage, type Source } from "@/lib/api";
import { ChannelSidebar } from "@/components/chat/channel-sidebar";
import { ChatMessage } from "@/components/chat/chat-message";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { UpgradeModal } from "@/components/chat/upgrade-modal";
import { ChannelPickerModal } from "@/components/chat/channel-picker-modal";
import { TIER_LIMITS, type SubscriptionTier } from "@/lib/tiers";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://mindvault.ikigai-dynamics.com/api";

function getDefaults(collections: Collection[], n: number): string[] {
  return [...collections]
    .sort((a, b) => (b.video_count || 0) - (a.video_count || 0))
    .slice(0, n)
    .map((c) => c.name);
}

export default function DashboardPage() {
  const router = useRouter();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [collectionsLoading, setCollectionsLoading] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [tier, setTier] = useState<SubscriptionTier>("free");
  const [questionsRemaining, setQuestionsRemaining] = useState<number | null>(null);
  const [questionLimit, setQuestionLimit] = useState<number | null>(null);
  const [upgradeModal, setUpgradeModal] = useState<{ open: boolean; title?: string; message?: string }>({ open: false });
  const [searchAllActive, setSearchAllActive] = useState(false);

  const [pickedChannels, setPickedChannels] = useState<string[]>([]);
  const [lockedUntil, setLockedUntil] = useState<string | null>(null);
  const [canChange, setCanChange] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [channelDataLoaded, setChannelDataLoaded] = useState(false);

  const hasUnlimitedChannels = TIER_LIMITS[tier].maxChannels === Infinity;
  const maxChannels = TIER_LIMITS[tier].maxChannels;

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/login");
        return;
      }
      setUserEmail(user.email || "");
      setUserAvatar(user.user_metadata?.avatar_url || null);
    });

    fetch("/api/questions/check")
      .then((r) => r.json())
      .then((data) => {
        if (data.tier) setTier(data.tier);
        if (data.remaining !== undefined && data.remaining >= 0) {
          setQuestionsRemaining(data.remaining);
          setQuestionLimit(data.limit);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_BASE_URL}/collections`);
        if (!res.ok) throw new Error("Failed to fetch");
        setCollections(await res.json());
      } catch {
        setError("Failed to load channels. Please refresh.");
      } finally {
        setCollectionsLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    fetch("/api/channels/select")
      .then((r) => r.json())
      .then((data) => {
        if (data.tier) setTier(data.tier);
        if (data.selectedChannels) setPickedChannels(data.selectedChannels);
        if (data.lockedUntil) setLockedUntil(data.lockedUntil);
        if (data.canChange !== undefined) setCanChange(data.canChange);
        setChannelDataLoaded(true);
      })
      .catch(() => setChannelDataLoaded(true));
  }, []);

  // Auto-open picker on first visit
  useEffect(() => {
    if (channelDataLoaded && !collectionsLoading && collections.length > 0 && !hasUnlimitedChannels && pickedChannels.length === 0) {
      setPickerOpen(true);
    }
  }, [channelDataLoaded, collectionsLoading, collections.length, hasUnlimitedChannels, pickedChannels.length]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const getHistory = useCallback((): HistoryMessage[] => {
    return messages.slice(-10).map((m) => ({ role: m.role, content: m.content }));
  }, [messages]);

  async function handleConfirmChannels(channels: string[]) {
    try {
      const res = await fetch("/api/channels/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channels }),
      });
      const data = await res.json();
      if (data.selectedChannels) setPickedChannels(data.selectedChannels);
      if (data.lockedUntil) setLockedUntil(data.lockedUntil);
      if (data.canChange !== undefined) setCanChange(data.canChange);
    } catch { /* keep current */ }
    setPickerOpen(false);
  }

  async function handleSend() {
    if (!input.trim() || (!selectedChannel && !searchAllActive) || loading) return;

    if (questionsRemaining !== null && questionsRemaining <= 0) {
      setUpgradeModal({ open: true, title: "Daily Limit Reached", message: "You've used all 3 free questions today. Upgrade to Starter for more questions." });
      return;
    }

    const question = input.trim();
    setInput("");
    setError(null);
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setLoading(true);

    try {
      if (questionLimit !== null && questionLimit > 0) {
        const incRes = await fetch("/api/questions/increment", { method: "POST" });
        if (incRes.status === 429) {
          setMessages((prev) => prev.slice(0, -1));
          setInput(question);
          setQuestionsRemaining(0);
          setUpgradeModal({ open: true, title: "Daily Limit Reached", message: "You've used all 3 free questions today. Upgrade to Starter for more questions." });
          setLoading(false);
          return;
        }
        const incData = await incRes.json();
        if (incData.remaining !== undefined) setQuestionsRemaining(incData.remaining);
      }

      const channelName = searchAllActive ? "_all" : selectedChannel!;
      const data = await queryCollection(channelName, question, getHistory());

      setMessages((prev) => [...prev, { role: "assistant", content: data.answer, sources: data.sources }]);
    } catch {
      setError("Failed to get a response. Please try again.");
      setMessages((prev) => prev.slice(0, -1));
      setInput(question);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  function handleSelectChannel(name: string) {
    setSearchAllActive(false);
    if (name !== selectedChannel) { setSelectedChannel(name); setMessages([]); setError(null); }
  }

  function handleSearchAll() {
    setSearchAllActive(true); setSelectedChannel(null); setMessages([]); setError(null);
  }

  const selectedCollection = collections.find((c) => c.name === selectedChannel);
  const hasActiveChat = selectedChannel || searchAllActive;
  const chatLabel = searchAllActive ? "all channels" : selectedCollection?.display_name || selectedChannel;

  return (
    <div className="flex h-screen bg-[#0A0A0B]">
      <UpgradeModal open={upgradeModal.open} onClose={() => setUpgradeModal({ open: false })} title={upgradeModal.title} message={upgradeModal.message} />

      <ChannelPickerModal
        open={pickerOpen}
        collections={collections}
        maxChannels={maxChannels === Infinity ? collections.length : maxChannels}
        defaults={pickedChannels.length > 0 ? pickedChannels : getDefaults(collections, maxChannels === Infinity ? collections.length : maxChannels)}
        onConfirm={handleConfirmChannels}
        onClose={() => setPickerOpen(false)}
        canClose={pickedChannels.length > 0}
      />

      <ChannelSidebar
        collections={collections}
        selectedChannel={selectedChannel}
        onSelectChannel={handleSelectChannel}
        userEmail={userEmail}
        onLogout={handleLogout}
        tier={tier}
        pickedChannels={pickedChannels}
        lockedUntil={lockedUntil}
        canChange={canChange}
        onChangeChannels={() => setPickerOpen(true)}
        onSearchAll={handleSearchAll}
        searchAllActive={searchAllActive}
        questionsRemaining={questionsRemaining}
        questionLimit={questionLimit}
      />

      {/* Main area */}
      <div className="flex flex-1 flex-col">
        {/* Top bar — breadcrumb */}
        <header className="flex items-center gap-2 border-b border-white/[0.06] bg-[#0A0A0B]/95 px-6 py-2.5 pl-14 backdrop-blur-sm md:pl-6">
          <Link href="/" className="text-[12px] text-gray-text/40 transition-colors hover:text-cream">
            TubeVault
          </Link>
          {hasActiveChat ? (
            <>
              <span className="text-[10px] text-gray-text/20">/</span>
              <span className="text-[12px] font-medium text-cream/80">
                {searchAllActive ? "Cross-Channel" : selectedCollection?.display_name || "..."}
              </span>
            </>
          ) : (
            <>
              <span className="text-[10px] text-gray-text/20">/</span>
              <span className="text-[12px] text-gray-text/50">Welcome</span>
            </>
          )}
          {selectedCollection && (
            <span className="ml-1 text-[10px] text-gray-text/30">
              {selectedCollection.video_count ? `${selectedCollection.video_count} videos` : ""}
            </span>
          )}
          {hasActiveChat && (
            <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_6px_rgba(101,174,76,0.4)]" />
          )}
        </header>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto">
          {!hasActiveChat ? (
            /* ── Welcome screen with featured creator cards ── */
            <div className="relative flex h-full items-center justify-center px-6">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_40%,rgba(101,174,76,0.03)_0%,transparent_70%)]" />

              <div className="relative flex w-full max-w-[860px] animate-[fadeUp_0.6s_ease-out] flex-col items-center gap-10 md:flex-row md:items-start md:gap-0">
                {/* Left — golden major */}
                <div className="flex flex-[0_0_61.8%] flex-col gap-4 text-center md:pr-12 md:text-left">
                  <div className="flex items-center justify-center gap-3 md:justify-start">
                    <Image
                      src="/TubeVault_Logo_noBG.png"
                      alt="TubeVault"
                      width={48}
                      height={48}
                      className="h-12 w-12"
                    />
                    <h2 className="text-2xl font-semibold text-cream">
                      Welcome to TubeVault
                    </h2>
                  </div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-gray-text/35">
                    Your AI search engine
                  </p>
                  <p className="text-[13px] leading-relaxed text-gray-text/50">
                    {collectionsLoading
                      ? "Loading channels..."
                      : "Pick a channel from the sidebar to start searching, or try one of these creators:"}
                  </p>
                </div>

                {/* Right — golden minor: featured creator cards */}
                {!collectionsLoading && (
                  <div className="flex w-full flex-[0_0_38.2%] flex-col gap-2.5 md:w-auto">
                    <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-gray-text/35">
                      Try a creator
                    </p>
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
                          onClick={() => {
                            handleSelectChannel(creator.slug);
                            setInput(creator.question);
                            setTimeout(() => inputRef.current?.focus(), 100);
                          }}
                          className="group flex w-full items-center gap-3 rounded-xl border border-[#2E2F31] bg-[#141416] px-4 py-3 text-left transition-all duration-200 hover:border-primary/20 hover:shadow-[0_4px_20px_rgba(101,174,76,0.06)]"
                        >
                          {logoUrl ? (
                            <Image
                              src={logoUrl}
                              alt={creator.name}
                              width={40}
                              height={40}
                              className="h-10 w-10 shrink-0 rounded-xl object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-xs font-bold text-gray-text">
                              {creator.name.split(" ").map((w) => w[0]).join("")}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-[12px] font-semibold text-cream/80">{creator.name}</p>
                            <p className="truncate text-[10px] text-gray-text/40">
                              &ldquo;{creator.question}&rdquo;
                            </p>
                          </div>
                          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-primary/0 transition-colors group-hover:text-primary/60" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : messages.length === 0 && !loading ? (
            /* ── Channel welcome ── */
            <div className="flex h-full animate-[fadeUp_0.5s_ease-out] items-center justify-center px-6 md:px-12">
              <div className="flex w-full max-w-[860px] flex-col items-center gap-8 md:flex-row md:items-start md:gap-0">
                <div className="flex flex-[0_0_61.8%] flex-col gap-4 text-center md:pr-12 md:text-left">
                  {searchAllActive ? (
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 md:mx-0">
                      <Globe className="h-6 w-6 text-primary" />
                    </div>
                  ) : (() => {
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
                  <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-gray-text/35">
                    {searchAllActive ? "Cross-Channel Intelligence" : "Creator Intelligence"}
                  </p>
                  <h2 className="text-[1.6rem] font-normal leading-tight text-cream/90">
                    {searchAllActive ? (
                      <>Search across all <span className="text-cream">{collections.length} channels</span></>
                    ) : (
                      <>Explore <span className="text-cream">{selectedCollection?.display_name}</span></>
                    )}
                  </h2>
                  <p className="text-[13px] leading-relaxed text-gray-text/50">
                    {searchAllActive
                      ? "Get answers from all creators with source links."
                      : `${selectedCollection?.video_count || "All"} videos indexed. Every answer linked to the source.`}
                  </p>
                </div>

                <div className="flex w-full flex-[0_0_38.2%] flex-col gap-2.5 md:w-auto">
                  <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-gray-text/35">
                    Try asking
                  </p>
                  {(searchAllActive
                    ? ["What do experts say about intermittent fasting?", "Compare views on ancient civilizations", "Most recommended supplements?"]
                    : [`Main topics ${selectedCollection?.display_name} covers?`, "Most surprising insight from recent videos?", "Key health recommendations?"]
                  ).map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setInput(s);
                        // Auto-submit after state update
                        setTimeout(() => {
                          setInput(s);
                          const fakeEvent = { trim: () => s } as unknown;
                          void fakeEvent;
                          // Directly trigger send logic
                          setInput("");
                          setError(null);
                          setMessages((prev) => [...prev, { role: "user", content: s }]);
                          setLoading(true);
                          const channelName = searchAllActive ? "_all" : selectedChannel!;
                          queryCollection(channelName, s, getHistory())
                            .then((data) => {
                              setMessages((prev) => [...prev, { role: "assistant", content: data.answer, sources: data.sources }]);
                            })
                            .catch(() => {
                              setError("Failed to get a response. Please try again.");
                              setMessages((prev) => prev.slice(0, -1));
                              setInput(s);
                            })
                            .finally(() => {
                              setLoading(false);
                              inputRef.current?.focus();
                            });
                        }, 0);
                      }}
                      className="w-full rounded-xl border border-[#2E2F31] bg-[#141416] px-3.5 py-2.5 text-left text-[12px] leading-relaxed text-gray-text/60 transition-all duration-200 hover:translate-x-1 hover:border-primary/20 hover:text-cream/80 hover:shadow-[0_4px_20px_rgba(101,174,76,0.06)]"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* ── Messages ── */
            <div className="mx-auto max-w-3xl space-y-5 px-6 py-6 md:px-12">
              {messages.map((msg, i) => (
                <div key={i} className="animate-[fadeUp_0.3s_ease-out]">
                  <ChatMessage role={msg.role} content={msg.content} sources={msg.sources} userAvatar={userAvatar} />
                </div>
              ))}
              {loading && <TypingIndicator />}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mb-2 flex items-center gap-2 rounded-xl bg-red-500/[0.08] px-4 py-2.5 text-[13px] text-red-400/80 md:mx-12">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Input */}
        <div className="border-t border-[#1E1F21] bg-[#0A0A0B] px-6 py-4 md:px-10 lg:px-14">
          <div className="mx-auto max-w-3xl">
            <div
              className={`flex items-end gap-3 rounded-2xl border bg-[#141416] px-5 py-2 transition-all duration-200 ${
                input
                  ? "border-primary/30 shadow-[0_0_0_3px_rgba(101,174,76,0.08),0_0_20px_rgba(101,174,76,0.04)]"
                  : "border-white/[0.07] hover:border-white/[0.12]"
              }`}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                }}
                onKeyDown={handleKeyDown}
                placeholder={hasActiveChat ? `Ask anything about ${chatLabel}...` : "Pick a channel to start asking questions..."}
                disabled={!hasActiveChat || loading}
                rows={1}
                className="max-h-[120px] min-h-[24px] flex-1 resize-none overflow-hidden bg-transparent py-2.5 text-[14px] leading-[1.6] text-cream placeholder:text-gray-text/35 focus:outline-none disabled:opacity-30"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || !hasActiveChat || loading}
                className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white transition-all duration-150 hover:scale-105 hover:bg-primary-hover hover:shadow-[0_0_12px_rgba(101,174,76,0.3)] disabled:opacity-20 disabled:hover:scale-100 disabled:hover:shadow-none"
              >
                <Send className="h-4 w-4" />
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
