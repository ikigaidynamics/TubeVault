"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, ExternalLink, Clock } from "lucide-react";
import type { Source } from "@/lib/api";
import { track } from "@/lib/analytics/tracker";

interface SourceCardProps {
  source: Source;
  index: number;
  channelId?: string;
}

function parseTimestamp(ts: string): number {
  const parts = ts.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] || 0;
}

function getYouTubeUrl(source: Source): string {
  if (source.url) return source.url;
  if (source.video_id) {
    const seconds = source.timestamp ? parseTimestamp(source.timestamp) : 0;
    return `https://youtube.com/watch?v=${source.video_id}&t=${seconds}`;
  }
  return "#";
}

function getYouTubeEmbedUrl(source: Source): string {
  const seconds = source.timestamp ? parseTimestamp(source.timestamp) : 0;
  return `https://www.youtube.com/embed/${source.video_id}?start=${seconds}&rel=0`;
}

export function SourceCard({ source, index, channelId }: SourceCardProps) {
  const [expanded, setExpanded] = useState(false);

  const thumbnailUrl = source.video_id
    ? `https://img.youtube.com/vi/${source.video_id}/mqdefault.jpg`
    : null;

  return (
    <div
      className={`rounded-lg border transition-all duration-200 ${
        expanded
          ? "border-white/[0.1] bg-[#111213]"
          : "border-white/[0.05] bg-[#111213] hover:border-white/[0.1] hover:bg-[#1C1D1F]"
      }`}
    >
      {/* Header — clickable */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 px-3 py-2.5 text-left"
      >
        {/* Thumbnail or index */}
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt=""
            width={80}
            height={45}
            className="h-[40px] w-[70px] shrink-0 rounded-md object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[10px] font-semibold text-primary">
            {index + 1}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-cream">
            {source.title}
          </p>
          <div className="mt-0.5 flex items-center gap-2">
            {source.timestamp && (
              <span className="flex items-center gap-1 text-[11px] text-primary/70">
                <Clock className="h-2.5 w-2.5" />
                {source.timestamp}
              </span>
            )}
            {!expanded && source.snippet && (
              <>
                {source.timestamp && (
                  <span className="text-[11px] text-gray-text/30">|</span>
                )}
                <span className="line-clamp-1 text-[11px] text-gray-text/50">
                  {source.snippet}
                </span>
              </>
            )}
          </div>
        </div>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-gray-text/40 transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-white/[0.05] px-3 pb-3 pt-2.5 animate-[fadeUp_0.3s_ease-out]">
          {/* YouTube embed */}
          {source.video_id && (
            <div className="mb-3 aspect-video w-full overflow-hidden rounded-lg">
              <iframe
                src={getYouTubeEmbedUrl(source)}
                title={source.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          )}

          {/* Transcript excerpt */}
          {source.text && (
            <div className="rounded-lg bg-white/[0.03] p-3">
              <span className="mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-gray-text/50">
                Transcript excerpt
              </span>
              <p className="max-h-[160px] overflow-y-auto text-[12px] leading-relaxed text-cream/70 italic">
                &ldquo;{source.text}&rdquo;
              </p>
            </div>
          )}

          {/* Link to YouTube */}
          <a
            href={getYouTubeUrl(source)}
            target="_blank"
            rel="noopener noreferrer"
            // analytics
            onClick={() => track("timestamp_click", { channelId, metadata: { videoId: source.video_id } })}
            className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-medium text-primary/80 transition-colors hover:text-primary"
          >
            Open on YouTube
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
    </div>
  );
}
