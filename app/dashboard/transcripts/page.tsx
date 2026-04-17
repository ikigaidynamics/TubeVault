"use client";

export const dynamic = "force-dynamic";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  FileText,
  Lock,
  Pencil,
  Check,
  X,
  Loader2,
  Clock,
  ChevronRight,
  ExternalLink,
  Languages,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { type Collection } from "@/lib/api";
import { type SubscriptionTier } from "@/lib/tiers";
import { ChannelSidebar } from "@/components/chat/channel-sidebar";
import { UpgradeModal } from "@/components/chat/upgrade-modal";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://mindvault.ikigai-dynamics.com/api";

const HIDDEN = ["industrie_und_handelskammer_cottbus", "btu_cottbus_senftenberg", "doctor_sethi"];

const LANGUAGES = [
  { code: "de", label: "Deutsch" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "pt", label: "Português" },
  { code: "ja", label: "日本語" },
  { code: "zh", label: "中文" },
  { code: "ko", label: "한국어" },
  { code: "hi", label: "हिन्दी" },
  { code: "ar", label: "العربية" },
  { code: "ru", label: "Русский" },
];

interface TranscriptChunk {
  text: string;
  text_raw?: string;
  start_time: number;
  end_time: number;
  chunk_index: number;
}

interface TranscriptData {
  video_id: string;
  video_title: string;
  chunks: TranscriptChunk[];
  available_translations?: string[];
}

interface VideoItem {
  video_id: string;
  title: string;
  video_url?: string;
  duration_str?: string;
  upload_date?: string;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function TranscriptsPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-[#0A0A0B]"><Loader2 className="h-5 w-5 animate-spin text-primary/50" /></div>}>
      <TranscriptsContent />
    </Suspense>
  );
}

function TranscriptsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tier, setTier] = useState<SubscriptionTier>("free");
  const [creatorChannels, setCreatorChannels] = useState<string[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(searchParams.get("channel"));
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(searchParams.get("video"));
  const [transcript, setTranscript] = useState<TranscriptData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [videoSearch, setVideoSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [videosLoading, setVideosLoading] = useState(false);
  const [editingChunk, setEditingChunk] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [saving, setSaving] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [upgradeModal, setUpgradeModal] = useState({ open: false });
  const [pickedChannels, setPickedChannels] = useState<string[]>([]);
  const [mobileShowTranscript, setMobileShowTranscript] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const hasAccess = tier === "pro" || tier === "premium" || tier === "creator";

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/login"); return; }
      setUserEmail(user.email || "");
      supabase
        .from("subscriptions")
        .select("tier, creator_channels")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single()
        .then(({ data }) => {
          if (data) {
            setTier(data.tier as SubscriptionTier);
            setCreatorChannels(data.creator_channels || []);
          }
        });
    });
  }, [router]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/collections`)
      .then((r) => r.json())
      .then((data: Collection[]) => setCollections(data.filter((c) => !HIDDEN.includes(c.name))))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/channels/select")
      .then((r) => r.json())
      .then((data) => { if (data.selectedChannels) setPickedChannels(data.selectedChannels); })
      .catch(() => {});
  }, []);

  // Fetch videos
  useEffect(() => {
    if (!selectedChannel) return;
    setVideos([]);
    setSelectedVideo(null);
    setTranscript(null);
    setMobileShowTranscript(false);
    setVideosLoading(true);

    fetch(`${API_BASE_URL}/all-videos?collection=${selectedChannel}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setVideos(data.map((v) => ({
            video_id: v.video_id,
            title: v.video_title || v.video_id,
            video_url: v.video_url,
            duration_str: v.duration_str,
            upload_date: v.upload_date,
          })));
        }
      })
      .catch(() => {})
      .finally(() => setVideosLoading(false));
  }, [selectedChannel]);

  // Fetch transcript
  useEffect(() => {
    if (!selectedVideo || !selectedChannel) return;
    setLoading(true);
    setTranscript(null);

    fetch(`${API_BASE_URL}/transcript/${selectedVideo}?collection=${selectedChannel}`)
      .then((r) => { if (!r.ok) throw new Error("Failed"); return r.json(); })
      .then((data) => { if (data && data.chunks) setTranscript(data as TranscriptData); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedVideo, selectedChannel]);

  function handleSelectChannel(name: string) {
    setSelectedChannel(name);
    router.replace(`/dashboard/transcripts?channel=${name}`, { scroll: false });
  }

  function handleSelectVideo(id: string) {
    setSelectedVideo(id);
    setMobileShowTranscript(true);
    router.replace(`/dashboard/transcripts?channel=${selectedChannel}&video=${id}`, { scroll: false });
    setTimeout(() => transcriptRef.current?.scrollTo({ top: 0 }), 100);
  }

  function seekTo(seconds: number) {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: "command", func: "seekTo", args: [seconds, true] }),
        "*"
      );
      iframeRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  async function handleTranslate(lang: string) {
    if (!selectedVideo || !selectedChannel || translating) return;
    setTranslating(true);
    setShowLangPicker(false);
    try {
      const res = await fetch(
        `${API_BASE_URL}/transcript/${selectedVideo}/translate?collection=${selectedChannel}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ target_lang: lang }),
        }
      );
      if (res.ok) {
        // Refetch transcript to get translated chunks
        const tRes = await fetch(`${API_BASE_URL}/transcript/${selectedVideo}?collection=${selectedChannel}`);
        if (tRes.ok) {
          const data = await tRes.json();
          if (data?.chunks) setTranscript(data as TranscriptData);
        }
      }
    } catch { /* silent */ }
    finally { setTranslating(false); }
  }

  const isCreatorForChannel = tier === "creator" && selectedChannel !== null && creatorChannels.includes(selectedChannel);

  async function handleSaveEdit(chunkIndex: number) {
    if (!selectedVideo || !editText.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/transcript/edit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ video_id: selectedVideo, chunk_index: chunkIndex, text: editText.trim() }),
      });
      if (res.ok) {
        setTranscript((prev) => prev ? {
          ...prev,
          chunks: prev.chunks.map((c) => c.chunk_index === chunkIndex ? { ...c, text: editText.trim() } : c),
        } : prev);
        setEditingChunk(null);
      }
    } catch { /* silent */ } finally { setSaving(false); }
  }

  const filteredChunks = (transcript?.chunks ?? []).filter((c) =>
    searchQuery ? c.text.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  const filteredVideos = videos.filter((v) =>
    videoSearch ? v.title.toLowerCase().includes(videoSearch.toLowerCase()) : true
  );

  const selectedCollection = collections.find((c) => c.name === selectedChannel);

  return (
    <div className="flex h-screen bg-[#0A0A0B]">
      <UpgradeModal open={upgradeModal.open} onClose={() => setUpgradeModal({ open: false })} />

      <ChannelSidebar
        collections={collections}
        selectedChannel={selectedChannel}
        onSelectChannel={handleSelectChannel}
        userEmail={userEmail}
        onLogout={async () => { const s = createClient(); await s.auth.signOut(); router.push("/"); }}
        tier={tier}
        pickedChannels={pickedChannels}
        lockedUntil={null}
        canChange={false}
        onSearchAll={() => {}}
        searchAllActive={false}
        questionsRemaining={null}
        questionLimit={null}
      />

      <div className="flex flex-1 flex-col">
        {/* Breadcrumb */}
        <header className="flex items-center gap-1.5 border-b border-white/[0.04] bg-[#0F1011]/95 px-6 py-2.5 pl-14 backdrop-blur-sm md:pl-6">
          <Link href="/dashboard" className="text-[12px] text-gray-text/50 transition-colors hover:text-cream">TubeVault</Link>
          <ChevronRight className="h-3 w-3 text-gray-text/20" />
          <Link href="/dashboard/transcripts" className="text-[12px] text-gray-text/50 transition-colors hover:text-cream">Transcripts</Link>
          {selectedCollection && (
            <>
              <ChevronRight className="h-3 w-3 text-gray-text/20" />
              <span className="text-[12px] font-medium text-cream">{selectedCollection.display_name}</span>
            </>
          )}
          {transcript && (
            <>
              <ChevronRight className="h-3 w-3 text-gray-text/20" />
              <span className="max-w-[200px] truncate text-[12px] text-cream/70">{transcript.video_title}</span>
            </>
          )}
        </header>

        {/* Main content */}
        <div className="flex flex-1 overflow-hidden">
          {!hasAccess ? (
            <div className="flex flex-1 items-center justify-center px-6">
              <div className="w-full max-w-md rounded-2xl border border-[#2E2F31] bg-[#141516] p-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                  <Lock className="h-7 w-7 text-primary" />
                </div>
                <h2 className="mt-5 text-xl font-semibold text-cream">Transcript Access</h2>
                <p className="mt-2 text-sm text-gray-text">Browse full transcripts with search, timestamps, and translations. Available on Pro and above.</p>
                <Link href="/pricing" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover">Upgrade to Pro</Link>
              </div>
            </div>
          ) : !selectedChannel ? (
            <div className="flex flex-1 items-center justify-center px-6">
              <div className="text-center">
                <FileText className="mx-auto h-10 w-10 text-gray-text/20" />
                <p className="mt-4 text-sm text-gray-text/50">Select a channel from the sidebar to browse transcripts</p>
              </div>
            </div>
          ) : (
            <>
              {/* Video list panel */}
              <div className={`w-full border-r border-white/[0.04] md:w-[40%] md:max-w-[380px] ${mobileShowTranscript ? "hidden md:flex" : "flex"} flex-col`}>
                <div className="border-b border-white/[0.04] p-3">
                  <div className="flex items-center gap-2 rounded-xl border border-[#2E2F31] bg-[#1C1D1F] px-3 py-2">
                    <Search className="h-3.5 w-3.5 shrink-0 text-gray-text/30" />
                    <input
                      type="text"
                      value={videoSearch}
                      onChange={(e) => setVideoSearch(e.target.value)}
                      placeholder="Search videos..."
                      className="flex-1 bg-transparent text-sm text-cream placeholder:text-gray-text/35 focus:outline-none"
                    />
                  </div>
                  {!videosLoading && (
                    <p className="mt-2 text-[10px] text-gray-text/30">
                      {filteredVideos.length} video{filteredVideos.length !== 1 ? "s" : ""}
                      {selectedCollection ? ` in ${selectedCollection.display_name}` : ""}
                    </p>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto">
                  {videosLoading ? (
                    <div className="space-y-1 p-3">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="flex items-start gap-3 rounded-lg px-3 py-3 animate-pulse">
                          <div className="h-[52px] w-[92px] shrink-0 rounded-lg bg-white/[0.04]" />
                          <div className="flex-1 space-y-2 pt-1">
                            <div className="h-3 w-full rounded bg-white/[0.04]" />
                            <div className="h-3 w-2/3 rounded bg-white/[0.04]" />
                            <div className="h-2 w-1/3 rounded bg-white/[0.03]" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : filteredVideos.length === 0 ? (
                    <p className="py-12 text-center text-xs text-gray-text/40">No videos found</p>
                  ) : (
                    filteredVideos.map((v) => {
                      const active = selectedVideo === v.video_id;
                      return (
                        <button
                          key={v.video_id}
                          onClick={() => handleSelectVideo(v.video_id)}
                          className={`flex w-full items-start gap-3 border-b border-white/[0.03] px-3 py-3 text-left transition-all duration-150 ${
                            active
                              ? "border-l-[3px] border-l-primary bg-primary/[0.06]"
                              : "border-l-[3px] border-l-transparent hover:bg-white/[0.03]"
                          }`}
                        >
                          <Image
                            src={`https://img.youtube.com/vi/${v.video_id}/default.jpg`}
                            alt=""
                            width={120}
                            height={68}
                            className="h-[52px] w-[92px] shrink-0 rounded-lg object-cover"
                            unoptimized
                          />
                          <div className="min-w-0 flex-1">
                            <p className={`line-clamp-2 text-xs font-medium leading-relaxed ${active ? "text-cream" : "text-gray-text/80"}`}>
                              {v.title}
                            </p>
                            <div className="mt-1 flex items-center gap-2 text-[10px] text-gray-text/40">
                              {v.duration_str && <span>{v.duration_str}</span>}
                              {v.upload_date && (
                                <span>{v.upload_date.slice(0, 4)}-{v.upload_date.slice(4, 6)}-{v.upload_date.slice(6, 8)}</span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Transcript panel */}
              <div
                ref={transcriptRef}
                className={`flex-1 overflow-y-auto ${mobileShowTranscript ? "flex" : "hidden md:flex"} flex-col`}
              >
                {!selectedVideo ? (
                  <div className="flex flex-1 items-center justify-center px-6">
                    <div className="text-center">
                      <FileText className="mx-auto h-8 w-8 text-gray-text/20" />
                      <p className="mt-3 text-sm text-gray-text/50">Select a video to view its transcript</p>
                    </div>
                  </div>
                ) : loading ? (
                  <div className="flex flex-1 items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : transcript ? (
                  <div className="p-4 md:p-6">
                    {/* Mobile back */}
                    <button
                      onClick={() => setMobileShowTranscript(false)}
                      className="mb-3 flex items-center gap-1 text-xs text-gray-text/50 transition-colors hover:text-cream md:hidden"
                    >
                      <ArrowLeft className="h-3 w-3" />
                      Back to videos
                    </button>

                    {/* Embedded YouTube player */}
                    <div className="mb-4 aspect-video w-full overflow-hidden rounded-xl border border-[#2E2F31]">
                      <iframe
                        ref={iframeRef}
                        src={`https://www.youtube.com/embed/${selectedVideo}?enablejsapi=1&rel=0&modestbranding=1`}
                        title={transcript.video_title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="h-full w-full"
                      />
                    </div>

                    {/* Video header */}
                    <div className="mb-4">
                      <h2 className="text-lg font-semibold text-cream">{transcript.video_title}</h2>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="text-xs text-gray-text/50">{selectedCollection?.display_name}</span>
                        {isCreatorForChannel && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">Creator Mode</span>
                        )}
                        <a
                          href={`https://youtube.com/watch?v=${selectedVideo}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary/60 transition-colors hover:text-primary"
                        >
                          YouTube <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      </div>
                    </div>

                    {/* Toolbar: search + translate */}
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                      <div className="flex flex-1 items-center gap-2 rounded-xl border border-[#2E2F31] bg-[#1C1D1F] px-3 py-2">
                        <Search className="h-3.5 w-3.5 shrink-0 text-gray-text/30" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search in transcript..."
                          className="flex-1 bg-transparent text-sm text-cream placeholder:text-gray-text/35 focus:outline-none"
                        />
                        {searchQuery && (
                          <button onClick={() => setSearchQuery("")} className="text-gray-text/40 hover:text-cream">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Translate button */}
                      <div className="relative">
                        <button
                          onClick={() => setShowLangPicker(!showLangPicker)}
                          disabled={translating}
                          className="flex items-center gap-1.5 rounded-xl border border-[#2E2F31] bg-[#1C1D1F] px-3 py-2 text-xs font-medium text-gray-text/60 transition-colors hover:border-primary/20 hover:text-cream disabled:opacity-50"
                        >
                          {translating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Languages className="h-3.5 w-3.5" />}
                          Translate
                        </button>
                        {showLangPicker && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowLangPicker(false)} />
                            <div className="absolute right-0 top-full z-20 mt-1 max-h-60 w-48 overflow-y-auto rounded-xl border border-white/[0.08] bg-[#1C1D1F] py-1 shadow-xl">
                              {LANGUAGES.map((lang) => {
                                const available = transcript.available_translations?.includes(lang.code);
                                return (
                                  <button
                                    key={lang.code}
                                    onClick={() => handleTranslate(lang.code)}
                                    className="flex w-full items-center justify-between px-3 py-2 text-left text-xs text-gray-text/80 transition-colors hover:bg-white/[0.06] hover:text-cream"
                                  >
                                    {lang.label}
                                    {available && <span className="text-[9px] text-primary/60">cached</span>}
                                  </button>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Chunks */}
                    <div className="space-y-0.5">
                      {filteredChunks.map((chunk) => (
                        <div
                          key={chunk.chunk_index}
                          className="group border-b border-white/[0.03] py-3 transition-colors"
                        >
                          <div className="mb-1.5 flex items-center gap-2">
                            <button
                              onClick={() => seekTo(Math.floor(chunk.start_time))}
                              className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary transition-colors hover:bg-primary/20"
                            >
                              <Clock className="h-2.5 w-2.5" />
                              {formatTime(chunk.start_time)}
                            </button>
                            <span className="text-[10px] text-gray-text/25">— {formatTime(chunk.end_time)}</span>

                            {isCreatorForChannel && editingChunk !== chunk.chunk_index && (
                              <button
                                onClick={() => { setEditingChunk(chunk.chunk_index); setEditText(chunk.text); }}
                                className="ml-auto hidden items-center gap-1 rounded px-2 py-0.5 text-[10px] text-gray-text/40 transition-colors hover:bg-white/[0.06] hover:text-cream group-hover:flex"
                              >
                                <Pencil className="h-3 w-3" /> Edit
                              </button>
                            )}
                          </div>

                          {editingChunk === chunk.chunk_index ? (
                            <div>
                              <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                rows={4}
                                className="w-full rounded-lg border border-primary/30 bg-[#1C1D1F] p-3 text-sm text-cream focus:outline-none"
                              />
                              <div className="mt-2 flex items-center gap-2">
                                <button
                                  onClick={() => handleSaveEdit(chunk.chunk_index)}
                                  disabled={saving}
                                  className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
                                >
                                  {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />} Save
                                </button>
                                <button
                                  onClick={() => setEditingChunk(null)}
                                  className="flex items-center gap-1 rounded-lg border border-[#2E2F31] px-3 py-1.5 text-xs text-gray-text transition-colors hover:text-cream"
                                >
                                  <X className="h-3 w-3" /> Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm leading-relaxed text-cream/80">
                              {searchQuery
                                ? chunk.text.split(new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")).map((part, j) =>
                                    part.toLowerCase() === searchQuery.toLowerCase()
                                      ? <mark key={j} className="rounded bg-primary/20 px-0.5 text-cream">{part}</mark>
                                      : part
                                  )
                                : chunk.text}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    {searchQuery && filteredChunks.length === 0 && (
                      <p className="py-8 text-center text-sm text-gray-text/50">
                        No matches for &ldquo;{searchQuery}&rdquo;
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-1 items-center justify-center">
                    <p className="text-sm text-gray-text/50">Failed to load transcript.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
