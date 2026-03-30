"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Send, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { queryCollection, type Collection, type HistoryMessage, type Source } from "@/lib/api";
import { ChannelSidebar } from "@/components/chat/channel-sidebar";
import { ChatMessage } from "@/components/chat/chat-message";
import { TypingIndicator } from "@/components/chat/typing-indicator";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://mindvault.ikigai-dynamics.com/api";

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

  // Get user info
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserEmail(user.email || "");
        setUserAvatar(user.user_metadata?.avatar_url || null);
      }
    });
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

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Build conversation history for API
  const getHistory = useCallback((): HistoryMessage[] => {
    return messages.slice(-10).map((m) => ({
      role: m.role,
      content: m.content,
    }));
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || !selectedChannel || loading) return;

    const question = input.trim();
    setInput("");
    setError(null);

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setLoading(true);

    try {
      const history = getHistory();
      const data = await queryCollection(selectedChannel, question, history);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
          sources: data.sources,
        },
      ]);
    } catch {
      setError("Failed to get a response. Please try again.");
      // Remove the user message on error so they can retry
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
    if (name !== selectedChannel) {
      setSelectedChannel(name);
      setMessages([]);
      setError(null);
    }
  }

  const selectedCollection = collections.find(
    (c) => c.name === selectedChannel
  );

  return (
    <div className="flex h-screen bg-[#151515]">
      {/* Sidebar */}
      <ChannelSidebar
        collections={collections}
        selectedChannel={selectedChannel}
        onSelectChannel={handleSelectChannel}
        userEmail={userEmail}
        onLogout={handleLogout}
      />

      {/* Main chat area */}
      <div className="flex flex-1 flex-col">
        {/* Creator bar */}
        <header className="flex items-center gap-2.5 border-b border-white/[0.06] bg-[#151515] px-6 py-3 pl-14 md:pl-6">
          {selectedCollection ? (
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
          {!selectedChannel ? (
            /* ── No channel selected: TubeVault welcome ── */
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
            /* ── Channel selected, no messages: MindVault-style welcome ── */
            <div className="flex h-full animate-[fadeUp_0.6s_ease-out] items-center justify-center px-2">
              <div className="flex w-full max-w-[900px] flex-col items-center gap-8 md:flex-row md:items-start md:gap-0">
                {/* Left: Creator info (61.8%) */}
                <div className="flex flex-[0_0_61.8%] flex-col gap-4 text-center md:pr-12 md:text-left">
                  {(() => {
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
                    Creator Intelligence Platform
                  </p>
                  <h2 className="text-2xl font-normal leading-tight text-cream/90 md:text-[2rem]">
                    Explore the knowledge
                    <br />
                    of{" "}
                    <span className="text-cream">
                      {selectedCollection?.display_name}
                    </span>
                  </h2>
                  <p className="text-[14px] leading-relaxed text-gray-text/60">
                    Get source-based answers from{" "}
                    {selectedCollection?.video_count || "all"} indexed videos.
                    Every statement linked to the original source.
                  </p>
                </div>

                {/* Right: Suggestions (38.2%) */}
                <div className="flex w-full flex-[0_0_38.2%] flex-col gap-3 md:w-auto">
                  <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-gray-text/40 md:pl-0.5">
                    Try asking
                  </p>
                  {[
                    `What are the main topics ${selectedCollection?.display_name} covers?`,
                    `What's the most interesting insight from recent videos?`,
                    `Summarize the key health recommendations`,
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setInput(suggestion);
                        inputRef.current?.focus();
                      }}
                      className="w-full rounded-xl border border-white/[0.08] bg-dark-surface px-3.5 py-2.5 text-left text-[13px] leading-relaxed text-gray-text/70 transition-all duration-200 hover:translate-x-1 hover:border-primary/30 hover:bg-[#242527] hover:text-cream hover:shadow-[0_0_20px_rgba(61,122,53,0.08)]"
                    >
                      {suggestion}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      /* future: link to channel browse */
                    }}
                    className="mt-1 w-full rounded-xl border border-white/[0.08] bg-dark-surface px-3.5 py-2.5 text-center text-[12px] font-medium text-gray-text/50 transition-all duration-200 hover:translate-x-1 hover:border-primary/30 hover:text-cream"
                  >
                    Browse channel database
                  </button>
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

        {/* Error banner */}
        {error && (
          <div className="mx-6 mb-2 flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-400 md:mx-12 lg:mx-16">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Input area */}
        <div className="border-t border-white/[0.06] px-6 py-4 md:px-12 lg:px-16">
          <div className="mx-auto max-w-3xl">
            <div
              className={`flex items-end gap-2 rounded-2xl border bg-[#1d1d1d] px-4 py-1.5 transition-all ${
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
                  // Auto-resize
                  e.target.style.height = "auto";
                  e.target.style.height =
                    Math.min(e.target.scrollHeight, 120) + "px";
                }}
                onKeyDown={handleKeyDown}
                placeholder={
                  selectedChannel
                    ? `Ask a question about ${selectedCollection?.display_name || selectedChannel}...`
                    : "Select a channel first..."
                }
                disabled={!selectedChannel || loading}
                rows={1}
                className="max-h-[120px] min-h-[22px] flex-1 resize-none bg-transparent py-2.5 text-[14px] leading-[1.5] text-cream placeholder:text-gray-text/40 focus:outline-none disabled:opacity-40"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || !selectedChannel || loading}
                className="mb-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-primary text-cream transition-all hover:scale-[1.04] hover:bg-primary-hover disabled:opacity-30 disabled:hover:scale-100"
              >
                <Send className="h-[18px] w-[18px]" />
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-gray-text/30">
              Answers are AI-generated from video transcripts. Always verify
              with the source.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
