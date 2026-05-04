"use client";

export const dynamic = "force-dynamic";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Search, AlertCircle, Globe, ChevronRight, ChevronDown, Plus, Menu } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { queryCollection, resolveLogoUrl, type Collection, type HistoryMessage, type CrossChannelResponse, type Message, type ConversationSummary } from "@/lib/api";
import { listConversations, createConversation, loadConversation, appendMessages, deleteConversation, renameConversation } from "@/lib/conversations";
import { ChannelSidebar } from "@/components/chat/channel-sidebar";
import { WelcomeScreen } from "@/components/chat/welcome-screen";
import { ChatMessage } from "@/components/chat/chat-message";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { UpgradeModal } from "@/components/chat/upgrade-modal";
import { InlineUpgradeWall } from "@/components/chat/inline-upgrade-wall";
import { track } from "@/lib/analytics/tracker";
import { ChannelPickerModal } from "@/components/chat/channel-picker-modal";
import { TruncatedText } from "@/components/chat/truncated-text";
import { cleanDescription } from "@/lib/clean-description";
import { TIER_LIMITS, type SubscriptionTier } from "@/lib/tiers";
import { CATEGORIES, getCollectionCategory, getCollectionNamesByCategory } from "@/lib/categories";
import { getDemoQuestions, CROSS_CHANNEL_QUESTIONS } from "@/lib/demo-questions";

function getDefaults(collections: Collection[], n: number): string[] {
  return [...collections]
    .sort((a, b) => (b.video_count || 0) - (a.video_count || 0))
    .slice(0, n)
    .map((c) => c.name);
}

interface CrossChannelProgress {
  phase: string;
  completed: number;
  total: number;
  channels: {
    name: string;
    display_name: string;
    relevant: boolean;
    timeout?: boolean;
  }[];
}

async function streamCrossChannel(
  question: string,
  channels: string[],
  history: HistoryMessage[],
  onProgress: (progress: CrossChannelProgress) => void
): Promise<CrossChannelResponse> {
  const res = await fetch("/api/query/cross-channel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, channels, history }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || "Cross-channel query failed");
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let result: CrossChannelResponse | null = null;
  const completedChannels: CrossChannelProgress["channels"] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // SSE messages are separated by double newlines
    const parts = buffer.split("\n\n");
    buffer = parts.pop() || "";

    for (const part of parts) {
      if (!part.trim()) continue;
      const lines = part.split("\n");
      let eventType = "";
      let dataStr = "";

      for (const line of lines) {
        if (line.startsWith("event: ")) {
          eventType = line.slice(7).trim();
        } else if (line.startsWith("data: ")) {
          dataStr = line.slice(6);
        }
      }

      if (!eventType || !dataStr) continue;

      try {
        const data = JSON.parse(dataStr);

        if (eventType === "status") {
          onProgress({
            phase: data.phase,
            completed: data.completed || 0,
            total: data.total || 0,
            channels: [...completedChannels],
          });
        } else if (eventType === "channel_done") {
          completedChannels.push({
            name: data.name,
            display_name: data.display_name,
            relevant: data.relevant,
            timeout: data.timeout,
          });
          onProgress({
            phase: "querying",
            completed: data.completed,
            total: data.total,
            channels: [...completedChannels],
          });
        } else if (eventType === "result") {
          result = data as CrossChannelResponse;
        }
      } catch {
        // Skip malformed SSE events
      }
    }
  }

  if (!result) throw new Error("No result received from cross-channel search");
  return result;
}

export default function DashboardPageWrapper() {
  return (
    <Suspense fallback={
      <div className="flex h-dvh items-center justify-center bg-[#0A0A0B]">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
      </div>
    }>
      <DashboardPage />
    </Suspense>
  );
}

function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [collectionsLoading, setCollectionsLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [tier, setTier] = useState<SubscriptionTier>("free");
  const [questionsRemaining, setQuestionsRemaining] = useState<number | null>(null);
  const [questionLimit, setQuestionLimit] = useState<number | null>(null);
  const [upgradeModal, setUpgradeModal] = useState<{ open: boolean; title?: string; message?: string }>({ open: false });
  const [searchAllActive, setSearchAllActive] = useState(false);
  const [showLimitWall, setShowLimitWall] = useState(false);
  const [crossChannelSelected, setCrossChannelSelected] = useState<Set<string>>(new Set());
  const [crossChannelProgress, setCrossChannelProgress] = useState<CrossChannelProgress | null>(null);
  const [channelSelectorOpen, setChannelSelectorOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [conversationList, setConversationList] = useState<ConversationSummary[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const activeConvIdRef = useRef<string | null>(null);

  function setActiveConv(id: string | null) {
    activeConvIdRef.current = id;
    setActiveConversationId(id);
  }

  const [pickedChannels, setPickedChannels] = useState<string[]>([]);
  const [lockedUntil, setLockedUntil] = useState<string | null>(null);
  const [canChange, setCanChange] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [channelDataLoaded, setChannelDataLoaded] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const hasUnlimitedChannels = TIER_LIMITS[tier].maxChannels === Infinity;
  const maxChannels = TIER_LIMITS[tier].maxChannels;

  // Admin tier toggle check
  useEffect(() => {
    fetch("/api/admin/tier").then((r) => {
      if (r.ok) setIsAdmin(true);
    }).catch(() => {});
  }, []);

  function handleAdminTierChange(newTier: SubscriptionTier) {
    fetch("/api/admin/tier", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier: newTier }),
    }).then(() => window.location.reload()).catch(() => {});
  }

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

  // After Stripe checkout redirect: sync subscription from Stripe → Supabase, then refresh tier
  useEffect(() => {
    if (searchParams.get("checkout") !== "success") return;

    let cancelled = false;

    async function syncAfterCheckout() {
      // Remove ?checkout=success from URL immediately
      window.history.replaceState({}, "", "/dashboard");

      // Try syncing up to 5 times (webhook might be slow)
      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          const syncRes = await fetch("/api/stripe/sync", { method: "POST" });
          const syncData = await syncRes.json();
          if (cancelled) return;

          if (syncData.tier && syncData.tier !== "free") {
            setTier(syncData.tier);
            setCheckoutSuccess(true);
            // Also refresh question limits
            const checkRes = await fetch("/api/questions/check");
            const checkData = await checkRes.json();
            if (!cancelled) {
              if (checkData.tier) setTier(checkData.tier);
              if (checkData.remaining !== undefined) {
                setQuestionsRemaining(checkData.remaining >= 0 ? checkData.remaining : null);
                setQuestionLimit(checkData.limit >= 0 ? checkData.limit : null);
              }
            }
            return;
          }
        } catch { /* retry */ }

        // Wait before retry (increasing delay)
        await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
      }

      // Even after retries, still show success (payment went through, webhook might just be slow)
      if (!cancelled) setCheckoutSuccess(true);
    }

    syncAfterCheckout();
    return () => { cancelled = true; };
  }, [searchParams]);

  // Auto-dismiss checkout success toast after 6s
  useEffect(() => {
    if (!checkoutSuccess) return;
    const t = setTimeout(() => setCheckoutSuccess(false), 6000);
    return () => clearTimeout(t);
  }, [checkoutSuccess]);

  const [collectionsWarming, setCollectionsWarming] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const MAX_RETRIES = 24; // up to ~2 min of retrying
      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          const res = await fetch("/api/collections");
          if (res.status === 503) {
            // Server is warming up — show hint and retry
            if (!cancelled) setCollectionsWarming(true);
            await new Promise((r) => setTimeout(r, 5000));
            continue;
          }
          if (!res.ok) throw new Error("Failed to fetch");
          const all: Collection[] = await res.json();
          if (!cancelled) {
            setCollections(all);
            setCollectionsWarming(false);
            setCollectionsLoading(false);
          }
          return;
        } catch {
          break;
        }
      }
      if (!cancelled) {
        setError("Failed to load channels. Please refresh.");
        setCollectionsWarming(false);
        setCollectionsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
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

  // Load conversation list on mount
  useEffect(() => {
    listConversations().then(setConversationList).catch(() => {});
  }, []);

  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role !== "assistant") return;

    // Wait for DOM to render the new message
    requestAnimationFrame(() => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const msgElements = container.querySelectorAll<HTMLElement>('[data-role="assistant"]');
      const lastElement = msgElements[msgElements.length - 1];
      if (!lastElement) return;

      // Scroll so the top of the answer is at the top of the container with 16px padding
      const containerTop = container.getBoundingClientRect().top;
      const elementTop = lastElement.getBoundingClientRect().top;
      const offset = elementTop - containerTop + container.scrollTop - 16;

      container.scrollTo({ top: offset, behavior: "smooth" });
    });
  }, [messages.length]);

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

  async function saveExchange(question: string, assistantMsg: Message) {
    let convId = activeConvIdRef.current;
    if (!convId) {
      try {
        convId = await createConversation({
          channel_name: searchAllActive ? null : selectedChannel,
          is_cross_channel: searchAllActive,
          cross_channel_selection: searchAllActive ? Array.from(crossChannelSelected) : undefined,
        });
        setActiveConv(convId);
      } catch {
        return;
      }
    }
    appendMessages(convId, [{ role: "user", content: question }, assistantMsg]);
    listConversations().then(setConversationList).catch(() => {});
    // Refresh again after a delay to pick up the LLM-generated title
    setTimeout(() => listConversations().then(setConversationList).catch(() => {}), 3000);
  }

  function handleNewChat() {
    setActiveConv(null);
    setMessages([]);
    setError(null);
  }

  async function handleSelectConversation(id: string) {
    try {
      const conv = await loadConversation(id);
      if (conv.is_cross_channel) {
        setSearchAllActive(true);
        setSelectedChannel(null);
        if (conv.cross_channel_selection.length > 0) {
          setCrossChannelSelected(new Set(conv.cross_channel_selection));
        }
      } else {
        setSearchAllActive(false);
        setSelectedChannel(conv.channel_name);
      }
      setMessages(conv.messages);
      setActiveConv(id);
      setError(null);
    } catch {
      // ignore
    }
  }

  function handleDeleteConversation(id: string) {
    deleteConversation(id);
    setConversationList((prev) => prev.filter((c) => c.id !== id));
    if (activeConvIdRef.current === id) {
      setActiveConv(null);
      setMessages([]);
    }
  }

  function handleRenameConversation(id: string, title: string) {
    renameConversation(id, title).catch(() => {});
    setConversationList((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title } : c))
    );
  }

  async function handleSend() {
    if (!input.trim() || (!selectedChannel && !searchAllActive) || loading) return;
    if (searchAllActive && crossChannelSelected.size === 0) return;

    if (questionsRemaining !== null && questionsRemaining <= 0) {
      // analytics
      track("upgrade_click", { metadata: { trigger: "search_limit", current_tier: "free" } });
      setShowLimitWall(true);
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
          // analytics
          track("upgrade_click", { metadata: { trigger: "search_limit", current_tier: "free" } });
          setShowLimitWall(true);
          setLoading(false);
          return;
        }
        const incData = await incRes.json();
        if (incData.remaining !== undefined) setQuestionsRemaining(incData.remaining);
      }

      if (searchAllActive) {
        // Cross-channel search via SSE stream
        setCrossChannelProgress(null);
        const data = await streamCrossChannel(
          question,
          Array.from(crossChannelSelected),
          getHistory(),
          (progress) => setCrossChannelProgress(progress)
        );
        track("search", { channelId: "_cross", query: question, resultCount: data.allSources?.length ?? 0 });
        const assistantMsg: Message = {
          role: "assistant",
          content: data.answer,
          sources: data.allSources,
          crossChannelGroups: data.channelGroups,
          channelsQueried: data.channelsQueried,
          queryTimeMs: data.queryTimeMs,
        };
        setMessages((prev) => [...prev, assistantMsg]);
        saveExchange(question, assistantMsg);
      } else {
        const channelName = selectedChannel!;
        const data = await queryCollection(channelName, question, getHistory());
        track("search", { channelId: channelName, query: question, resultCount: data.sources?.length ?? 0 });
        const assistantMsg: Message = { role: "assistant", content: data.answer, sources: data.sources };
        setMessages((prev) => [...prev, assistantMsg]);
        saveExchange(question, assistantMsg);
      }
    } catch {
      setError("Failed to get a response. Please try again.");
      setMessages((prev) => prev.slice(0, -1));
      setInput(question);
    } finally {
      setCrossChannelProgress(null);
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
    if (name !== selectedChannel) {
      setSelectedChannel(name);
      setMessages([]);
      setError(null);
      setActiveConv(null);

      // Auto-load most recent conversation for this channel
      const existing = conversationList.find(
        (c) => c.channel_name === name && !c.is_cross_channel
      );
      if (existing) {
        loadConversation(existing.id)
          .then((conv) => {
            setMessages(conv.messages);
            setActiveConv(conv.id);
          })
          .catch(() => {});
      }
    }
  }

  function handleSearchAll() {
    setSearchAllActive(true);
    setSelectedChannel(null);
    setMessages([]);
    setError(null);
    setActiveConv(null);
    setCrossChannelSelected(new Set());

    // Auto-load most recent cross-channel conversation
    const existing = conversationList.find((c) => c.is_cross_channel);
    if (existing) {
      loadConversation(existing.id)
        .then((conv) => {
          setMessages(conv.messages);
          setActiveConv(conv.id);
          if (conv.cross_channel_selection.length > 0) {
            setCrossChannelSelected(new Set(conv.cross_channel_selection));
          }
        })
        .catch(() => {});
    }
  }

  function handleWelcomeSubmit(channel: string, question: string) {
    handleSelectChannel(channel);
    setInput(question);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  const selectedCollection = collections.find((c) => c.name === selectedChannel);
  const hasActiveChat = selectedChannel || searchAllActive;
  const chatLabel = searchAllActive ? `${crossChannelSelected.size} channels` : selectedCollection?.display_name || selectedChannel;

  const renderChannelSelector = (compact = false) => (
    <>
      {/* Category preset pills */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.filter((cat) => cat !== "All").map((cat) => {
          const slugs = getCollectionNamesByCategory(cat).filter((s) => collections.some((c) => c.name === s));
          const allSelected = slugs.length > 0 && slugs.every((s) => crossChannelSelected.has(s));
          return (
            <button
              key={cat}
              onClick={() => {
                setCrossChannelSelected((prev) => {
                  const next = new Set(prev);
                  if (allSelected) { slugs.forEach((s) => next.delete(s)); } else { slugs.forEach((s) => next.add(s)); }
                  return next;
                });
              }}
              className={`rounded-full px-3 py-1 text-[11px] font-medium transition-all duration-200 ${
                allSelected
                  ? "bg-primary/15 text-primary border border-primary/30"
                  : "text-gray-text/50 border border-white/[0.06] hover:text-cream hover:border-white/[0.12]"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
      {/* Channel grid */}
      <div className={`mt-2 grid grid-cols-2 sm:grid-cols-3 gap-1.5 overflow-y-auto scrollbar-hide ${compact ? "lg:grid-cols-4 max-h-[200px]" : "max-h-[260px]"}`}>
        {collections.map((col) => {
          const selected = crossChannelSelected.has(col.name);
          const colLogo = resolveLogoUrl(col.logo);
          return (
            <button
              key={col.name}
              onClick={() => {
                setCrossChannelSelected((prev) => {
                  const next = new Set(prev);
                  if (next.has(col.name)) { next.delete(col.name); } else { next.add(col.name); }
                  return next;
                });
              }}
              className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-all duration-150 ${
                selected
                  ? "bg-primary/10 border border-primary/30"
                  : "border border-white/[0.04] hover:border-white/[0.1] hover:bg-white/[0.02]"
              }`}
            >
              {colLogo ? (
                <Image src={colLogo} alt="" width={24} height={24} className="h-6 w-6 shrink-0 rounded-full object-cover" unoptimized />
              ) : (
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-[8px] font-bold text-gray-text">
                  {col.display_name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                </div>
              )}
              <span className={`truncate text-[11px] ${selected ? "text-cream font-medium" : "text-gray-text/60"}`}>
                {col.display_name}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );

  return (
    <div className="flex h-dvh max-w-[100vw] overflow-hidden bg-[#0A0A0B]">
      <UpgradeModal open={upgradeModal.open} onClose={() => setUpgradeModal({ open: false })} title={upgradeModal.title} message={upgradeModal.message} />

      {/* Checkout success toast */}
      {checkoutSuccess && (
        <div className="fixed left-1/2 top-4 z-[200] -translate-x-1/2 animate-[fadeUp_0.3s_ease-out] rounded-xl border border-primary/30 bg-[#1C1D1F] px-5 py-3 shadow-lg"
          style={{ paddingTop: "max(0.75rem, calc(env(safe-area-inset-top, 0px) + 0.75rem))" }}
        >
          <p className="text-sm font-medium text-cream">
            Upgrade successful! You&apos;re now on the <span className="capitalize text-primary">{tier}</span> plan.
          </p>
        </div>
      )}

      {/* Admin tier toggle */}
      {isAdmin && (
        <div className="fixed right-2 top-2 z-[200] flex items-center gap-1 rounded-xl border border-primary/30 bg-[#1C1D1F] p-1 shadow-lg md:right-4 md:top-4">
          <span className="px-2 text-[10px] font-medium text-gray-text/50">TIER:</span>
          {(["free", "starter", "pro", "premium"] as SubscriptionTier[]).map((t) => (
            <button
              key={t}
              onClick={() => handleAdminTierChange(t)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
                t === tier ? "bg-primary text-white" : "text-gray-text hover:text-cream"
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      )}

      <ChannelPickerModal
        open={pickerOpen}
        collections={collections}
        maxChannels={maxChannels === Infinity ? collections.length : maxChannels}
        defaults={pickedChannels.length > 0 ? pickedChannels : getDefaults(collections, maxChannels === Infinity ? collections.length : maxChannels)}
        lockedChannels={!canChange && pickedChannels.length > 0 && pickedChannels.length < maxChannels ? pickedChannels : []}
        onConfirm={handleConfirmChannels}
        onClose={() => setPickerOpen(false)}
        canClose={pickedChannels.length > 0}
      />

      <ChannelSidebar
        collections={collections}
        selectedChannel={selectedChannel}
        onSelectChannel={handleSelectChannel}
        userEmail={userEmail}
        userAvatar={userAvatar}
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
        conversations={conversationList}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
        mobileOpen={sidebarOpen}
        onMobileOpenChange={setSidebarOpen}
      />

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar — mobile logo + breadcrumb (sticky so it stays visible during scroll) */}
        <header
          className="shrink-0 border-b border-white/[0.04] bg-[#0F1011]"
          style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
        >
          <div className="flex items-center gap-2 px-3 py-2 md:px-6 md:py-2.5">
            {/* Mobile: hamburger + icon + text logo — all flex-centered */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] text-gray-text transition-colors hover:text-cream md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link href="/" className="flex items-center gap-1.5 md:hidden">
              <Image
                src="/TubeVault_Image_noBG.png"
                alt=""
                width={24}
                height={24}
                className="h-6 w-6 shrink-0"
                priority
              />
              <Image
                src="/TubeVault.io_Logo_cropped.png"
                alt="TubeVault.io"
                width={660}
                height={100}
                className="h-[18px] w-auto shrink-0"
                priority
              />
            </Link>
          {/* Desktop: text breadcrumb */}
          <Link href="/" className="hidden shrink-0 text-[12px] text-gray-text/50 transition-colors hover:text-cream md:inline">
            TubeVault
          </Link>
          <ChevronRight className="hidden h-3 w-3 shrink-0 text-gray-text/20 md:block" />
          {hasActiveChat ? (
            <span className="hidden min-w-0 truncate text-[12px] font-medium text-cream md:inline">
              {searchAllActive ? "Cross-Channel" : selectedCollection?.display_name || "..."}
            </span>
          ) : (
            <span className="hidden text-[12px] text-gray-text/50 md:inline">Welcome</span>
          )}
          {selectedCollection && (
            <span className="hidden shrink-0 text-[10px] text-gray-text/30 sm:inline">
              {selectedCollection.video_count ? `${selectedCollection.video_count} videos` : ""}
            </span>
          )}
          {hasActiveChat && (
            <div className="ml-auto flex items-center gap-2 md:ml-auto">
              {messages.length > 0 && (
                <button
                  onClick={handleNewChat}
                  className="flex items-center gap-1 rounded-lg border border-primary/20 px-2 py-1 text-[10px] font-medium text-primary transition-all hover:bg-primary/10"
                >
                  <Plus className="h-3 w-3" />
                  <span className="hidden sm:inline">New Chat</span>
                </button>
              )}
              <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_6px_rgba(101,174,76,0.4)]" />
            </div>
          )}
          </div>
        </header>

        {/* Collapsible cross-channel selector (visible during active chat) */}
        {searchAllActive && messages.length > 0 && (
          <div className="border-b border-white/[0.04] bg-[#0F1011]">
            <button
              onClick={() => setChannelSelectorOpen((p) => !p)}
              className="flex w-full items-center gap-2 px-4 py-2 text-left transition-colors hover:bg-white/[0.02] md:px-12"
            >
              <Globe className="h-3.5 w-3.5 text-primary/50" />
              <span className="text-[12px] font-medium text-cream/70">
                {crossChannelSelected.size} channel{crossChannelSelected.size !== 1 ? "s" : ""} selected
              </span>
              <span className="text-[11px] text-gray-text/40">
                Edit selection
              </span>
              <ChevronDown
                className={`ml-auto h-3.5 w-3.5 text-gray-text/30 transition-transform duration-200 ${
                  channelSelectorOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {channelSelectorOpen && (
              <div className="px-4 pb-3 animate-[fadeUp_0.15s_ease-out] md:px-12">
                {renderChannelSelector(true)}
              </div>
            )}
          </div>
        )}

        {/* Messages area */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)", backgroundSize: "64px 64px" }}>
          {!hasActiveChat ? (
            <WelcomeScreen
              collections={collections}
              collectionsLoading={collectionsLoading}
              collectionsWarming={collectionsWarming}
              selectedChannel={selectedChannel}
              pickedChannels={pickedChannels}
              hasUnlimitedChannels={hasUnlimitedChannels}
              onSelectChannel={handleSelectChannel}
              onSubmitQuestion={handleWelcomeSubmit}
            />
          ) : messages.length === 0 && !loading ? (
            /* ── Channel welcome ── */
            <div className="flex h-full animate-[fadeUp_0.5s_ease-out] items-center justify-center px-4 md:px-12">
              <div className="flex w-full max-w-[860px] flex-col items-center gap-8 overflow-hidden md:flex-row md:items-center md:gap-0">
                <div className="flex flex-[0_0_61.8%] flex-col gap-4 text-center md:pr-12 md:text-left">
                  {searchAllActive ? (
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 md:mx-0">
                      <Globe className="h-6 w-6 text-primary" />
                    </div>
                  ) : (() => {
                    const logoUrl = resolveLogoUrl(selectedCollection?.logo);
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
                      <>Search across <span className="text-cream">{crossChannelSelected.size} channel{crossChannelSelected.size !== 1 ? "s" : ""}</span></>
                    ) : (
                      <>Explore <span className="text-cream">{selectedCollection?.display_name}</span></>
                    )}
                  </h2>
                  {searchAllActive ? (
                    <>
                      <p className="text-[13px] leading-relaxed text-gray-text/50">
                        Select channels to include in your search.
                      </p>
                      <div className="mt-1">
                        {renderChannelSelector()}
                      </div>
                    </>
                  ) : selectedCollection?.description ? (
                    <TruncatedText
                      text={cleanDescription(selectedCollection.name, selectedCollection.description)}
                      maxLength={200}
                      className="text-[13px] leading-relaxed text-gray-text/50"
                    />
                  ) : null}
                  {!searchAllActive && selectedCollection?.video_count && (
                    <p className="mt-1 text-[11px] text-gray-text/30">
                      {selectedCollection.video_count} videos indexed
                    </p>
                  )}
                </div>

                <div className="flex w-full flex-[0_0_38.2%] flex-col gap-2.5 md:w-auto">
                  <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-gray-text/35">
                    Try asking
                  </p>
                  {(searchAllActive
                    ? CROSS_CHANNEL_QUESTIONS
                    : selectedCollection
                      ? getDemoQuestions(selectedCollection.name, getCollectionCategory(selectedCollection))
                      : getDemoQuestions("", "Other")
                  ).map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setInput(s);
                        setTimeout(() => {
                          setInput("");
                          setError(null);
                          setMessages((prev) => [...prev, { role: "user", content: s }]);
                          setLoading(true);
                          if (searchAllActive) {
                            setCrossChannelProgress(null);
                            streamCrossChannel(s, Array.from(crossChannelSelected), getHistory(), (progress) => setCrossChannelProgress(progress))
                              .then((data) => {
                                track("search", { channelId: "_cross", query: s, resultCount: data.allSources?.length ?? 0 });
                                const aMsg: Message = { role: "assistant", content: data.answer, sources: data.allSources, crossChannelGroups: data.channelGroups, channelsQueried: data.channelsQueried, queryTimeMs: data.queryTimeMs };
                                setMessages((prev) => [...prev, aMsg]);
                                saveExchange(s, aMsg);
                              })
                              .catch(() => {
                                setError("Failed to get a response. Please try again.");
                                setMessages((prev) => prev.slice(0, -1));
                                setInput(s);
                              })
                              .finally(() => { setCrossChannelProgress(null); setLoading(false); inputRef.current?.focus(); });
                          } else {
                            queryCollection(selectedChannel!, s, getHistory())
                              .then((data) => {
                                const aMsg: Message = { role: "assistant", content: data.answer, sources: data.sources };
                                setMessages((prev) => [...prev, aMsg]);
                                saveExchange(s, aMsg);
                              })
                              .catch(() => {
                                setError("Failed to get a response. Please try again.");
                                setMessages((prev) => prev.slice(0, -1));
                                setInput(s);
                              })
                              .finally(() => { setLoading(false); inputRef.current?.focus(); });
                          }
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
            <div className="mx-auto max-w-3xl space-y-5 px-4 py-6 md:px-12">
              {messages.map((msg, i) => (
                <div key={i} data-role={msg.role} className="animate-[fadeUp_0.3s_ease-out]">
                  <ChatMessage role={msg.role} content={msg.content} sources={msg.sources} userAvatar={userAvatar} channelId={selectedChannel ?? undefined} crossChannelGroups={msg.crossChannelGroups} channelsQueried={msg.channelsQueried} queryTimeMs={msg.queryTimeMs} />
                </div>
              ))}
              {loading && (
                <TypingIndicator
                  label={searchAllActive
                    ? `Searching across ${crossChannelSelected.size} channel${crossChannelSelected.size !== 1 ? "s" : ""}...`
                    : undefined}
                  progress={crossChannelProgress}
                />
              )}
              {showLimitWall && (
                <InlineUpgradeWall context="daily_limit" onDismiss={() => setShowLimitWall(false)} />
              )}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mx-4 mb-2 flex items-center gap-2 rounded-xl bg-red-500/[0.08] px-4 py-2.5 text-[13px] text-red-400/80 md:mx-12">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Input */}
        <div className="border-t border-[#2E2F31] bg-[#0F1011] px-3 py-4 md:px-10 lg:px-14">
          <div className="mx-auto max-w-3xl">
            <div
              className={`flex items-end gap-2 rounded-2xl border bg-[#1C1D1F] px-3 py-2 transition-all duration-200 md:gap-3 md:px-5 ${
                input
                  ? "border-primary/30 ring-1 ring-primary/30 shadow-[0_0_20px_rgba(101,174,76,0.06)]"
                  : "border-[#2E2F31] hover:border-white/[0.12]"
              }`}
            >
              <Search className="mb-3 hidden h-5 w-5 shrink-0 text-gray-text/30 sm:block" />
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                }}
                onKeyDown={handleKeyDown}
                placeholder={hasActiveChat ? `Ask about ${chatLabel}...` : "Pick a channel to start..."}
                disabled={!hasActiveChat || loading}
                rows={1}
                className="max-h-[120px] min-h-[24px] min-w-0 flex-1 resize-none overflow-hidden bg-transparent py-2.5 text-base leading-[1.6] text-cream placeholder:text-gray-text/35 focus:outline-none disabled:opacity-30"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || !hasActiveChat || loading || (searchAllActive && crossChannelSelected.size === 0)}
                className="mb-1 shrink-0 rounded-xl bg-primary px-3 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-primary-hover hover:shadow-[0_0_12px_rgba(101,174,76,0.3)] disabled:opacity-20 disabled:hover:shadow-none md:px-5"
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
