"use client";

import { useState } from "react";
import { ChevronDown, Play, ExternalLink } from "lucide-react";
import type { Source } from "@/lib/api";

interface SourceCardProps {
  source: Source;
  index: number;
}

export function SourceCard({ source, index }: SourceCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`cursor-pointer rounded-lg border transition-all duration-200 ${
        expanded
          ? "border-white/[0.1] bg-[#1d1d1d]"
          : "border-white/[0.05] bg-[#1d1d1d] hover:border-white/[0.1] hover:bg-dark-surface"
      }`}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-3 py-2.5">
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
