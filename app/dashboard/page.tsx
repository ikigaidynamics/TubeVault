"use client";

export const dynamic = "force-dynamic";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Send, AlertCircle } from "lucide-react";
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

/** Return top N collections by video_count as default picks */
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

  // Tier state
  const [tier, setTier] = useState<SubscriptionTier>("free");
  const [questionsRemaining, setQuestionsRemaining] = useState<number | null>(null);
  const [questionLimit, setQuestionLimit] = useState<number | null>(null);
  const [upgradeModal, setUpgradeModal] = useState<{
    open: boolean;
    title?: string;
    message?: string;
  }>({ open: false });
  const [searchAllActive, setSearchAllActive] = useState(false);

  // Channel selection state
  const [pickedChannels, setPickedChannels] = useState<string[]>([]);
  const [lockedUntil, setLockedUntil] = useState<string | null>(null);
  const [canChange, setCanChange] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [channelDataLoaded, setChannelDataLoaded] = useState(false);

  const hasUnlimitedChannels = TIER_LIMITS[tier].maxChannels === Infinity;
  const maxChannels = TIER_LIMITS[tier].maxChannels;

  // Get user info + tier
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserEmail(user.email || "");
        setUserAvatar(user.user_metadata?.avatar_url || null);
      }
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

  // Fetch collections
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_BASE_URL}/collections`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data: Collection[] = await res.json();
        setCollections(data);
      } catch {
        setError("Failed to load channels. Please refresh.");
      } finally {
        setCollectionsLoading(false);
      }
    }
    load();
  }, []);

  // Fetch channel selection (after tier is known)
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

  // Auto-open picker for Free/Starter users who haven't selected yet
  useEffect(() => {
    if (
      channelDataLoaded &&
      !collectionsLoading &&
      collections.length > 0 &&
      !hasUnlimitedChannels &&
      pickedChannels.length === 0
    ) {
      setPickerOpen(true);
    }
  }, [channelDataLoaded, collectionsLoading, collections.length, hasUnlimitedChannels, pickedChannels.length]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const getHistory = useCallback((): HistoryMessage[] => {
    return messages.slice(-10).map((m) => ({
      role: m.role,
      content: m.content,
    }));
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
    } catch {
      // keep current state
    }
    setPickerOpen(false);
  }

  async function handleSend() {
    if (!input.trim() || (!selectedChannel && !searchAllActive) || loading) return;

    if (questionsRemaining !== null && questionsRemaining <= 0) {
      setUpgradeModal({
        open: true,
        title: "Daily Limit Reached",
        message: "You've used all 5 free questions today. Upgrade to Starter for unlimited questions.",
      });
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
          setUpgradeModal({
            open: true,
            title: "Daily Limit Reached",
            message: "You've used all 5 free questions today. Upgrade to Starter for unlimited questions.",
          });
          setLoading(false);
          return;
        }
        const incData = await incRes.json();
        if (incData.remaining !== undefined) setQuestionsRemaining(incData.remaining);
      }

      const channelName = searchAllActive ? "_all" : selectedChannel!;
      const history = getHistory();
      const data = await queryCollection(channelName, question, history);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer, sources: data.sources },
      ]);
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
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  function handleSelectChannel(name: string) {
    setSearchAllActive(false);
    if (name !== selectedChannel) {
      setSelectedChannel(name);
      setMessages([]);
      setError(null);
    }
  }

  function handleSearchAll() {
    setSearchAllActive(true);
    setSelectedChannel(null);
    setMessages([]);
    setError(null);
  }

  const selectedCollection = collections.find((c) => c.name === selectedChannel);
  const hasActiveChat = selectedChannel || searchAllActive;
  const chatLabel = searchAllActive
    ? "all channels"
    : selectedCollection?.display_name || selectedChannel;

  return (
    <div className="flex h-screen bg-[#0A0A0B]">
      {/* Upgrade modal */}
      <UpgradeModal
        open={upgradeModal.open}
        onClose={() => setUpgradeModal({ open: false })}
        title={upgradeModal.title}
        message={upgradeModal.message}
      />

      {/* Channel picker modal */}
      <ChannelPickerModal
        open={pickerOpen}
        collections={collections}
        maxChannels={maxChannels === Infinity ? collections.length : maxChannels}
        defaults={
          pickedChannels.length > 0
            ? pickedChannels
            : getDefaults(collections, maxChannels === Infinity ? collections.length : maxChannels)
        }
        onConfirm={handleConfirmChannels}
        onClose={() => setPickerOpen(false)}
        canClose={pickedChannels.length > 0}
      />

      {/* Sidebar */}
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
      />

      {/* Main chat area */}
      <div className="flex flex-1 flex-col">
        {/* Creator bar */}
        <header className="flex items-center gap-2.5 border-b border-white/[0.06] bg-[#0A0A0B] px-6 py-3 pl-14 md:pl-6">
          {searchAllActive ? (
            <>
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
              </div>
              <div className="flex flex-col gap-px">
                <p className="text-[13px] font-medium text-cream/90">Cross-Channel Search</p>
                <p className="text-[11px] text-gray-text/40">
                  Search across all {collections.length} channels
                </p>
              </div>
              <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_6px_rgba(61,122,53,0.5)]" />
            </>
          ) : selectedCollection ? (
            <>
              {(() => {
                const logoUrl = selectedCollection.logo
                  ? selectedCollection.logo.startsWith("/")
                    ? `https://mindvault.ikigai-dynamics.com${selectedCollection.logo}`
                    : selectedCollection.logo
                  : null;
                const initials = selectedCollection.display_name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2);
                return logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt={selectedCollection.display_name}
                    width={28}
                    height={28}
                    className="h-7 w-7 shrink-0 rounded-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2E2F31] to-[#424F4A] text-[10px] font-semibold text-gray-text">
                    {initials}
                  </div>
                );
              })()}
              <div className="flex flex-col gap-px">
                <p className="text-[13px] font-medium text-cream/90">
                  {selectedCollection.display_name}
                </p>
                <p className="text-[11px] text-gray-text/40">
                  {selectedCollection.video_count
                    ? `${selectedCollection.video_count} episodes indexed`
                    : `${selectedCollection.point_count} chunks indexed`}
                </p>
              </div>
              <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_6px_rgba(61,122,53,0.5)]" />
            </>
          ) : (
            <p className="text-[13px] text-gray-text/50">Select a channel to start</p>
          )}
        </header>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-6 py-6 md:px-12 lg:px-16">
          {!hasActiveChat ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="relative flex flex-col items-center">
                <Image
                  src="/TubeVault_Logo_noBG.png"
                  alt="TubeVault"
                  width={160}
                  height={160}
                  className="-mb-6"
                />
                <h2 className="relative z-10 text-xl font-semibold text-cream">
                  Welcome to TubeVault
                </h2>
              </div>
              <p className="mt-2 max-w-sm text-sm text-gray-text">
                {collectionsLoading
                  ? "Loading channels..."
                  : "Select a channel from the sidebar to start asking questions."}
              </p>
            </div>
          ) : messages.length === 0 && !loading ? (
            <div className="flex h-full animate-[fadeUp_0.6s_ease-out] items-center justify-center px-2">
              <div className="flex w-full max-w-[900px] flex-col items-center gap-8 md:flex-row md:items-start md:gap-0">
                <div className="flex flex-[0_0_61.8%] flex-col gap-4 text-center md:pr-12 md:text-left">
                  {searchAllActive ? (
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 md:mx-0">
                      <svg className="h-7 w-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                      </svg>
                    </div>
                  ) : (() => {
                    const logoUrl = selectedCollection?.logo
                      ? selectedCollection.logo.startsWith("/")
                        ? `https://mindvault.ikigai-dynamics.com${selectedCollection.logo}`
                        : selectedCollection.logo
                      : null;
                    return logoUrl ? (
                      <Image
                        src={logoUrl}
                        alt={selectedCollection?.display_name || ""}
                        width={56}
                        height={56}
                        className="mx-auto h-14 w-14 rounded-2xl object-cover md:mx-0"
                        unoptimized
                      />
                    ) : (
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2E2F31] to-[#424F4A] text-lg font-bold text-gray-text md:mx-0">
                        {selectedCollection?.display_name
                          .split(" ")
                          .map((w) => w[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                    );
                  })()}
                  <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-gray-text/40">
                    {searchAllActive ? "Cross-Channel Intelligence" : "Creator Intelligence Platform"}
                  </p>
                  <h2 className="text-2xl font-normal leading-tight text-cream/90 md:text-[2rem]">
                    {searchAllActive ? (
                      <>Search across<br />all <span className="text-cream">{collections.length} channels</span></>
                    ) : (
                      <>
                        Explore the knowledge<br />of{" "}
                        <span className="text-cream">{selectedCollection?.display_name}</span>
                      </>
                    )}
                  </h2>
                  <p className="text-[14px] leading-relaxed text-gray-text/60">
                    {searchAllActive
                      ? "Ask a question and get answers from all indexed creators. Every statement linked to the original source."
                      : `Get source-based answers from ${selectedCollection?.video_count || "all"} indexed videos. Every statement linked to the original source.`}
                  </p>
                </div>

                <div className="flex w-full flex-[0_0_38.2%] flex-col gap-3 md:w-auto">
                  <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-gray-text/40 md:pl-0.5">
                    Try asking
                  </p>
                  {(searchAllActive
                    ? [
                        "What do experts say about intermittent fasting?",
                        "Compare different views on ancient civilizations",
                        "What are the most recommended supplements?",
                      ]
                    : [
                        `What are the main topics ${selectedCollection?.display_name} covers?`,
                        `What's the most interesting insight from recent videos?`,
                        `Summarize the key health recommendations`,
                      ]
                  ).map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setInput(suggestion);
                        inputRef.current?.focus();
                      }}
                      className="w-full rounded-xl border border-[#2E2F31] bg-[#1C1D1F] px-3.5 py-2.5 text-left text-[13px] leading-relaxed text-gray-text/70 transition-all duration-200 hover:translate-x-1 hover:border-primary/30 hover:bg-[#242527] hover:text-cream hover:shadow-[0_0_20px_rgba(61,122,53,0.08)]"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-6">
              {messages.map((msg, i) => (
                <ChatMessage
                  key={i}
                  role={msg.role}
                  content={msg.content}
                  sources={msg.sources}
                  userAvatar={userAvatar}
                />
              ))}
              {loading && <TypingIndicator />}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mb-2 flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-400 md:mx-12 lg:mx-16">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Input */}
        <div className="border-t border-[#1E1F21] bg-[#0A0A0B] px-6 py-4 md:px-12 lg:px-16">
          <div className="mx-auto max-w-3xl">
            {questionsRemaining !== null && questionLimit !== null && questionLimit > 0 && (
              <div className="mb-2 flex items-center justify-center">
                <span className={`text-[11px] font-medium ${
                  questionsRemaining <= 1 ? "text-red-400/80" : "text-gray-text/50"
                }`}>
                  {questionsRemaining} of {questionLimit} questions remaining today
                </span>
              </div>
            )}
            <div
              className={`flex items-end gap-2 rounded-2xl border bg-[#141416] px-4 py-1.5 transition-all ${
                input
                  ? "border-primary/40 shadow-[0_0_0_3px_rgba(61,122,53,0.12)]"
                  : "border-white/[0.08]"
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
                placeholder={
                  hasActiveChat
                    ? `Ask a question about ${chatLabel}...`
                    : "Select a channel first..."
                }
                disabled={!hasActiveChat || loading}
                rows={1}
                className="max-h-[120px] min-h-[22px] flex-1 resize-none bg-transparent py-2.5 text-[14px] leading-[1.5] text-cream placeholder:text-gray-text/40 focus:outline-none disabled:opacity-40"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || !hasActiveChat || loading}
                className="mb-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-primary text-cream transition-all hover:scale-[1.04] hover:bg-primary-hover disabled:opacity-30 disabled:hover:scale-100"
              >
                <Send className="h-[18px] w-[18px]" />
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-gray-text/30">
              Answers are AI-generated from video transcripts. Always verify with the source.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
