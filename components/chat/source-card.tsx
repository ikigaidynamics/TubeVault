"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, Play, ExternalLink } from "lucide-react";
import type { Source } from "@/lib/api";

interface SourceCardProps {
  source: Source;
  index: number;
}

function getStartSeconds(url: string | null): number {
  if (!url) return 0;
  const match = url.match(/[?&]t=(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

export function SourceCard({ source, index }: SourceCardProps) {
  const [expanded, setExpanded] = useState(false);
  const thumbnailUrl = source.video_id
    ? `https://img.youtube.com/vi/${source.video_id}/mqdefault.jpg`
    : null;
  const startSeconds = getStartSeconds(source.url);

  return (
    <div
      className={`cursor-pointer rounded-lg border transition-all duration-200 ${
        expanded
          ? "border-white/[0.1] bg-[#111213]"
          : "border-white/[0.05] bg-[#111213] hover:border-white/[0.1] hover:bg-[#1C1D1F]"
      }`}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-3 py-2.5">
        {/* Thumbnail */}
        {thumbnailUrl && (
          <div className="relative h-[45px] w-[80px] shrink-0 overflow-hidden rounded-md bg-black/30">
            <Image
              src={thumbnailUrl}
              alt={source.title}
              fill
              sizes="80px"
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <Play className="h-4 w-4 fill-white text-white opacity-80" />
            </div>
          </div>
        )}
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[10px] font-semibold text-primary">
          {index + 1}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-cream">
            {source.title}
            {source.timestamp && (
              <span className="ml-1.5 text-primary/80">
                @ {source.timestamp}
              </span>
            )}
          </p>
          {!expanded && (
            <p className="mt-0.5 line-clamp-1 text-[11px] text-gray-text/50">
              {source.snippet}
            </p>
          )}
        </div>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-gray-text/40 transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Expanded */}
      {expanded && (
        <div
          className="border-t border-white/[0.05] px-3 pb-3 pt-2.5"
          onClick={(e) => e.stopPropagation()}
        >
          {/* YouTube Embed */}
          {source.video_id && (
            <div className="mb-3 w-full max-w-[560px]">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                <iframe
                  src={`https://www.youtube.com/embed/${source.video_id}?start=${startSeconds}`}
                  title={source.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              </div>
            </div>
          )}

          <p className="max-h-[160px] overflow-y-auto text-[12px] leading-relaxed text-gray-text/70">
            {source.text}
          </p>
          <div className="mt-2.5 flex items-center gap-2">
            {source.url && (
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1.5 text-[11px] font-medium text-primary transition-colors hover:bg-primary/20"
              >
                <Play className="h-3 w-3" />
                Watch at {source.timestamp || "start"}
                <ExternalLink className="h-2.5 w-2.5 opacity-50" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
