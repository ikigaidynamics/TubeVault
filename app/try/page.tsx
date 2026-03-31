"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Send, AlertCircle, ArrowRight, ChevronDown } from "lucide-react";
import { queryCollection, type Collection, type HistoryMessage, type Source } from "@/lib/api";
import { ChatMessage } from "@/components/chat/chat-message";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { Navbar } from "@/components/shared/navbar";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://mindvault.ikigai-dynamics.com/api";

const TRIAL_LIMIT = 5;

function getScreenInfo(): string {
  if (typeof window === "undefined") return "";
  return `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
}

export default function TryPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(TRIAL_LIMIT);
  const [limitReached, setLimitReached] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Fetch collections
  useEffect(() => {
    fetch(`${API_BASE_URL}/collections`)
      .then((r) => r.json())
      .then((data: Collection[]) => {
        const sorted = data.sort((a, b) =>
          a.display_name.localeCompare(b.display_name)
        );
        setCollections(sorted);
      })
      .catch(() => {});
  }, []);

  // Check trial status
  useEffect(() => {
    const screen = getScreenInfo();
    fetch("/api/trial", {
      headers: { "x-screen-info": screen },
    })
      .then((r) => r.json())
      .then((data) => {
        setRemaining(data.remaining);
        if (data.remaining <= 0) setLimitReached(true);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const getHistory = useCallback((): HistoryMessage[] => {
    return messages.slice(-10).map((m) => ({
      role: m.role,
      content: m.content,
    }));
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || !selectedChannel || loading) return;

    if (limitReached || remaining <= 0) {
      setLimitReached(true);
      return;
    }

    const question = input.trim();
    setInput("");
    setError(null);
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setLoading(true);

    try {
      // Increment trial count server-side
      const screen = getScreenInfo();
      const incRes = await fetch("/api/trial", {
        method: "POST",
        headers: { "x-screen-info": screen },
      });

      if (incRes.status === 429) {
        setMessages((prev) => prev.slice(0, -1));
        setInput(question);
        setRemaining(0);
        setLimitReached(true);
        setLoading(false);
        return;
      }

      const incData = await incRes.json();
      setRemaining(incData.remaining);
      if (incData.remaining <= 0) setLimitReached(true);

      const history = getHistory();
      const data = await queryCollection(selectedChannel, question, history);

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

  const selectedCollection = collections.find(
    (c) => c.name === selectedChannel
  );

  return (
    <div className="flex min-h-screen flex-col bg-[#0A0A0B]">
      <Navbar />

      <div className="flex flex-1 flex-col">
        {/* Channel picker bar */}
        <div className="border-b border-white/[0.06] px-6 py-3">
          <div className="mx-auto flex max-w-3xl items-center gap-3">
            <span className="text-[11px] font-medium uppercase tracking-wider text-gray-text/50">
              Channel
            </span>
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-cream transition-colors hover:border-primary/30"
              >
                {selectedCollection ? (
                  <>
                    {(() => {
                      const logoUrl = selectedCollection.logo
                        ? selectedCollection.logo.startsWith("/")
                          ? `https://mindvault.ikigai-dynamics.com${selectedCollection.logo}`
                          : selectedCollection.logo
                        : null;
                      return logoUrl ? (
                        <Image
                          src={logoUrl}
                          alt=""
                          width={20}
                          height={20}
                          className="h-5 w-5 rounded object-cover"
                          unoptimized
                        />
                      ) : null;
                    })()}
                    {selectedCollection.display_name}
                  </>
                ) : (
                  <span className="text-gray-text/60">Pick a channel...</span>
                )}
                <ChevronDown className="h-3.5 w-3.5 text-gray-text/50" />
              </button>

              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute left-0 top-full z-20 mt-1 max-h-80 w-72 overflow-y-auto rounded-xl border border-white/[0.08] bg-[#1C1D1F] shadow-xl">
                    {collections.map((col) => {
                      const logoUrl = col.logo
                        ? col.logo.startsWith("/")
                          ? `https://mindvault.ikigai-dynamics.com${col.logo}`
                          : col.logo
                        : null;
                      return (
                        <button
                          key={col.name}
                          onClick={() => {
                            setSelectedChannel(col.name);
                            setDropdownOpen(false);
                            if (col.name !== selectedChannel) {
                              setMessages([]);
                              setError(null);
                            }
                          }}
                          className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-white/[0.06]"
                        >
                          {logoUrl ? (
                            <Image
                              src={logoUrl}
                              alt=""
                              width={24}
                              height={24}
                              className="h-6 w-6 rounded object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="flex h-6 w-6 items-center justify-center rounded bg-white/[0.06] text-[9px] font-bold text-gray-text">
                              {col.display_name
                                .split(" ")
                                .map((w) => w[0])
                                .join("")
                                .slice(0, 2)}
                            </div>
                          )}
                          <span className="text-cream/80">{col.display_name}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Trial counter */}
            <div className="ml-auto">
              <span
                className={`text-[11px] font-medium ${
                  remaining <= 1 ? "text-red-400/80" : "text-gray-text/50"
                }`}
              >
                {remaining} of {TRIAL_LIMIT} free questions
              </span>
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto px-6 py-6 md:px-12 lg:px-16">
          {!selectedChannel ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <Image
                src="/TubeVault_Logo_noBG.png"
                alt="TubeVault"
                width={120}
                height={120}
                className="-mb-4"
              />
              <h2 className="text-xl font-semibold text-cream">
                Try TubeVault
              </h2>
              <p className="mt-2 max-w-sm text-sm text-gray-text">
                Pick a channel above and ask any question. You have{" "}
                {remaining} free questions — no account needed.
              </p>
            </div>
          ) : limitReached ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mx-auto max-w-sm rounded-2xl border border-white/[0.08] bg-[#1C1D1F] p-8">
                <Image
                  src="/TubeVault_Logo_noBG.png"
                  alt="TubeVault"
                  width={80}
                  height={80}
                  className="mx-auto -mb-2"
                />
                <h2 className="mt-4 text-lg font-semibold text-cream">
                  You&apos;ve used your free trial
                </h2>
                <p className="mt-2 text-sm text-gray-text">
                  Create a free account to keep searching — no credit card
                  required.
                </p>
                <Link
                  href="/signup"
                  className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
                >
                  Create free account
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/pricing"
                  className="mt-3 block text-center text-xs text-gray-text/60 transition-colors hover:text-cream"
                >
                  View all plans
                </Link>
              </div>
              {/* Still show the conversation above */}
              {messages.length > 0 && (
                <div className="mx-auto mt-8 w-full max-w-3xl space-y-6 opacity-50">
                  {messages.map((msg, i) => (
                    <ChatMessage
                      key={i}
                      role={msg.role}
                      content={msg.content}
                      sources={msg.sources}
                      userAvatar={null}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : messages.length === 0 && !loading ? (
            <div className="flex h-full animate-[fadeUp_0.6s_ease-out] items-center justify-center px-2">
              <div className="flex w-full max-w-[700px] flex-col items-center gap-6 text-center">
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
                      className="h-14 w-14 rounded-2xl object-cover"
                      unoptimized
                    />
                  ) : null;
                })()}
                <div>
                  <h2 className="text-2xl font-normal text-cream/90">
                    Ask{" "}
                    <span className="text-cream">
                      {selectedCollection?.display_name}
                    </span>{" "}
                    anything
                  </h2>
                  <p className="mt-2 text-sm text-gray-text/60">
                    {selectedCollection?.video_count || "All"} videos indexed
                    and ready to search.
                  </p>
                </div>
                <div className="flex w-full max-w-sm flex-col gap-2">
                  {[
                    `What are the main topics ${selectedCollection?.display_name} covers?`,
                    `What's the most surprising insight from recent videos?`,
                  ].map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setInput(s);
                        inputRef.current?.focus();
                      }}
                      className="w-full rounded-xl border border-[#2E2F31] bg-[#1C1D1F] px-3.5 py-2.5 text-left text-[13px] leading-relaxed text-gray-text/70 transition-all duration-200 hover:translate-x-1 hover:border-primary/30 hover:text-cream"
                    >
                      {s}
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
                  userAvatar={null}
                />
              ))}
              {loading && <TypingIndicator />}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mb-2 flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-400 md:mx-12">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Input area */}
        <div className="border-t border-[#1E1F21] bg-[#0A0A0B] px-6 py-4 md:px-12 lg:px-16">
          <div className="mx-auto max-w-3xl">
            {limitReached ? (
              <div className="flex items-center justify-center gap-3 rounded-2xl border border-white/[0.08] bg-[#141416] px-4 py-4">
                <span className="text-sm text-gray-text/60">
                  Trial ended —
                </span>
                <Link
                  href="/signup"
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
                >
                  Sign up free to continue
                </Link>
              </div>
            ) : (
              <>
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
                      e.target.style.height =
                        Math.min(e.target.scrollHeight, 120) + "px";
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      selectedChannel
                        ? `Ask about ${selectedCollection?.display_name || selectedChannel}...`
                        : "Pick a channel first..."
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
                  AI-generated answers from video transcripts. Always verify with
                  the source.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
