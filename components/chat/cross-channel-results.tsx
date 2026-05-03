"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, Globe } from "lucide-react";
import { SourceCard } from "./source-card";
import type { ChannelSourceGroup } from "@/lib/api";

interface CrossChannelResultsProps {
  channelGroups: ChannelSourceGroup[];
  channelsQueried: number;
  queryTimeMs: number;
}

export function CrossChannelResults({
  channelGroups,
  channelsQueried,
  queryTimeMs,
}: CrossChannelResultsProps) {
  // All groups collapsed by default — user clicks to expand
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (name: string) =>
    setExpanded((prev) => ({ ...prev, [name]: !prev[name] }));

  if (channelGroups.length === 0) return null;

  const totalSources = channelGroups.reduce(
    (acc, g) => acc + g.sources.length,
    0
  );

  return (
    <div className="space-y-2 pt-1">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2">
        <Globe className="h-3 w-3 shrink-0 text-primary/50" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-text/40">
          Sources from {channelGroups.length} channel{channelGroups.length !== 1 ? "s" : ""}
        </span>
        <span className="text-[10px] text-gray-text/25">
          {totalSources} results &middot; {channelsQueried} queried &middot;{" "}
          {(queryTimeMs / 1000).toFixed(1)}s
        </span>
      </div>

      {/* Channel groups */}
      {channelGroups.map((group) => {
        const isOpen = expanded[group.collection_name] ?? false;
        return (
          <div
            key={group.collection_name}
            className="rounded-xl border border-[#1E1F21] bg-[#111213] overflow-hidden"
          >
            {/* Group header */}
            <button
              onClick={() => toggle(group.collection_name)}
              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-white/[0.02]"
            >
              {group.logo ? (
                <Image
                  src={group.logo.includes("yt3.googleusercontent.com") && group.logo.endsWith("=s0") ? group.logo.slice(0, -2) + "s240" : group.logo}
                  alt={group.display_name}
                  width={24}
                  height={24}
                  className="h-6 w-6 shrink-0 rounded-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-[8px] font-bold text-gray-text">
                  {group.display_name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)}
                </div>
              )}
              <span className="min-w-0 truncate text-[12px] font-medium text-cream">
                {group.display_name}
              </span>
              <span className="rounded-full bg-white/[0.06] px-1.5 py-0.5 text-[9px] font-medium text-gray-text/50">
                {group.sources.length}
              </span>
              <ChevronDown
                className={`ml-auto h-3.5 w-3.5 text-gray-text/30 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Sources */}
            {isOpen && (
              <div className="space-y-1.5 border-t border-white/[0.04] px-3 py-2.5 animate-[fadeUp_0.2s_ease-out]">
                {group.sources.map((source, i) => (
                  <SourceCard
                    key={i}
                    source={source}
                    index={i}
                    channelId={group.collection_name}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
