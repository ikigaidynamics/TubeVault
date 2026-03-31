"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
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
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { type Collection } from "@/lib/api";
import { type SubscriptionTier } from "@/lib/tiers";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://mindvault.ikigai-dynamics.com/api";

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
}

interface VideoItem {
  video_id: string;
  title: string;
  video_url?: string;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function TranscriptsPage() {
  const [tier, setTier] = useState<SubscriptionTier>("free");
  const [creatorChannels, setCreatorChannels] = useState<string[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingChunk, setEditingChunk] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [saving, setSaving] = useState(false);

  const hasAccess = tier === "pro" || tier === "premium" || tier === "creator";

  // Fetch tier info
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
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
  }, []);

  // Fetch collections
  useEffect(() => {
    fetch(`${API_BASE_URL}/collections`)
      .then((r) => r.json())
      .then((data: Collection[]) => setCollections(data))
      .catch(() => {});
  }, []);

  // Fetch videos when channel selected (via search endpoint)
  useEffect(() => {
    if (!selectedChannel || !hasAccess) return;
    setVideos([]);
    setSelectedVideo(null);
    setTranscript(null);

    fetch(`${API_BASE_URL}/search/${selectedChannel}?q=*&limit=100`)
      .then((r) => r.json())
      .then((data) => {
        // Extract unique videos from search results
        const videoMap = new Map<string, VideoItem>();
        if (Array.isArray(data)) {
          for (const item of data) {
            if (item.video_id && !videoMap.has(item.video_id)) {
              videoMap.set(item.video_id, {
                video_id: item.video_id,
                title: item.video_title || item.video_id,
                video_url: item.video_url,
              });
            }
          }
        }
        setVideos(Array.from(videoMap.values()));
      })
      .catch(() => {});
  }, [selectedChannel, hasAccess]);

  // Fetch transcript when video selected
  useEffect(() => {
    if (!selectedVideo || !hasAccess) return;
    setLoading(true);
    setTranscript(null);

    fetch(`${API_BASE_URL}/transcript/${selectedVideo}`)
      .then((r) => r.json())
      .then((data: TranscriptData) => setTranscript(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedVideo, hasAccess]);

  const isCreatorForChannel =
    tier === "creator" && selectedChannel !== null && creatorChannels.includes(selectedChannel);

  async function handleSaveEdit(chunkIndex: number) {
    if (!selectedVideo || !editText.trim()) return;
    setSaving(true);

    try {
      const res = await fetch("/api/transcript/edit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          video_id: selectedVideo,
          chunk_index: chunkIndex,
          text: editText.trim(),
        }),
      });

      if (res.ok) {
        // Update local state
        setTranscript((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            chunks: prev.chunks.map((c) =>
              c.chunk_index === chunkIndex ? { ...c, text: editText.trim() } : c
            ),
          };
        });
        setEditingChunk(null);
      }
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  }

  // Filter transcript chunks by search
  const filteredChunks = transcript?.chunks.filter((c) =>
    searchQuery
      ? c.text.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  // No access: blurred preview with upgrade overlay
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-[#0A0A0B]">
        <header className="border-b border-white/[0.06] px-6 py-4">
          <div className="mx-auto flex max-w-5xl items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-sm text-gray-text transition-colors hover:text-cream"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to chat
            </Link>
            <span className="text-gray-text/30">|</span>
            <FileText className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-cream">Transcripts</span>
          </div>
        </header>

        <div className="relative mx-auto max-w-5xl px-6 py-12">
          {/* Blurred fake transcript */}
          <div className="pointer-events-none select-none blur-[6px]">
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <div className="h-3 w-12 rounded bg-primary/20" />
                    <div className="h-3 w-16 rounded bg-white/10" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-3 w-full rounded bg-white/[0.06]" />
                    <div className="h-3 w-4/5 rounded bg-white/[0.06]" />
                    <div className="h-3 w-3/5 rounded bg-white/[0.06]" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upgrade overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="mx-4 w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#1C1D1F]/95 p-8 text-center shadow-2xl backdrop-blur-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <Lock className="h-7 w-7 text-primary" />
              </div>
              <h2 className="mt-5 text-xl font-semibold text-cream">
                Transcript Access
              </h2>
              <p className="mt-2 text-sm text-gray-text">
                Full transcript access with search, timestamps, and direct YouTube links
                is available on Pro and above.
              </p>
              <Link
                href="/pricing"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
              >
                Upgrade to Pro
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      <header className="border-b border-white/[0.06] px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-gray-text transition-colors hover:text-cream"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to chat
          </Link>
          <span className="text-gray-text/30">|</span>
          <FileText className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-cream">Transcripts</span>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex flex-col gap-6 md:flex-row">
          {/* Left: Channel + video picker */}
          <div className="w-full md:w-64 shrink-0 space-y-4">
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-gray-text/50">
                Channel
              </label>
              <select
                value={selectedChannel || ""}
                onChange={(e) => setSelectedChannel(e.target.value || null)}
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-cream focus:border-primary/30 focus:outline-none"
              >
                <option value="">Select a channel</option>
                {collections.map((col) => (
                  <option key={col.name} value={col.name}>
                    {col.display_name}
                  </option>
                ))}
              </select>
            </div>

            {videos.length > 0 && (
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-gray-text/50">
                  Video ({videos.length})
                </label>
                <div className="max-h-[60vh] space-y-1 overflow-y-auto">
                  {videos.map((v) => (
                    <button
                      key={v.video_id}
                      onClick={() => setSelectedVideo(v.video_id)}
                      className={`w-full rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                        selectedVideo === v.video_id
                          ? "bg-primary/10 text-cream"
                          : "text-gray-text hover:bg-white/[0.04] hover:text-cream"
                      }`}
                    >
                      <p className="line-clamp-2">{v.title}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Transcript view */}
          <div className="flex-1 min-w-0">
            {!selectedChannel ? (
              <div className="flex h-64 items-center justify-center text-center">
                <div>
                  <FileText className="mx-auto h-8 w-8 text-gray-text/30" />
                  <p className="mt-3 text-sm text-gray-text/60">
                    Select a channel to browse transcripts
                  </p>
                </div>
              </div>
            ) : !selectedVideo ? (
              <div className="flex h-64 items-center justify-center text-center">
                <div>
                  <FileText className="mx-auto h-8 w-8 text-gray-text/30" />
                  <p className="mt-3 text-sm text-gray-text/60">
                    Select a video to view its transcript
                  </p>
                </div>
              </div>
            ) : loading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : transcript ? (
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <h2 className="flex-1 text-lg font-semibold text-cream">
                    {transcript.video_title}
                  </h2>
                  {isCreatorForChannel && (
                    <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">
                      Creator Mode
                    </span>
                  )}
                </div>

                {/* Search within transcript */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-text/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search in transcript..."
                    className="w-full rounded-lg border border-white/[0.06] bg-white/[0.03] py-2.5 pl-9 pr-3 text-sm text-cream placeholder:text-gray-text/40 focus:border-primary/30 focus:outline-none"
                  />
                </div>

                {/* Chunks */}
                <div className="space-y-2">
                  {filteredChunks?.map((chunk) => (
                    <div
                      key={chunk.chunk_index}
                      className="group rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 transition-colors hover:border-white/[0.1]"
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <a
                          href={`https://youtube.com/watch?v=${selectedVideo}&t=${Math.floor(chunk.start_time)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary transition-colors hover:bg-primary/20"
                        >
                          <Clock className="h-3 w-3" />
                          {formatTime(chunk.start_time)}
                        </a>
                        <span className="text-[10px] text-gray-text/30">
                          to {formatTime(chunk.end_time)}
                        </span>

                        {/* Creator edit button */}
                        {isCreatorForChannel && editingChunk !== chunk.chunk_index && (
                          <button
                            onClick={() => {
                              setEditingChunk(chunk.chunk_index);
                              setEditText(chunk.text);
                            }}
                            className="ml-auto hidden items-center gap-1 rounded px-2 py-0.5 text-[10px] text-gray-text/50 transition-colors hover:bg-white/[0.06] hover:text-cream group-hover:flex"
                          >
                            <Pencil className="h-3 w-3" />
                            Edit
                          </button>
                        )}
                      </div>

                      {editingChunk === chunk.chunk_index ? (
                        <div>
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            rows={4}
                            className="w-full rounded-lg border border-primary/30 bg-white/[0.03] p-3 text-sm text-cream focus:outline-none"
                          />
                          <div className="mt-2 flex items-center gap-2">
                            <button
                              onClick={() => handleSaveEdit(chunk.chunk_index)}
                              disabled={saving}
                              className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
                            >
                              {saving ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )}
                              Save
                            </button>
                            <button
                              onClick={() => setEditingChunk(null)}
                              className="flex items-center gap-1 rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs text-gray-text transition-colors hover:text-cream"
                            >
                              <X className="h-3 w-3" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed text-gray-text/80">
                          {chunk.text}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {filteredChunks?.length === 0 && (
                  <p className="py-8 text-center text-sm text-gray-text/50">
                    No matches found for &ldquo;{searchQuery}&rdquo;
                  </p>
                )}
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center text-center">
                <p className="text-sm text-gray-text/60">
                  Failed to load transcript.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
