"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Video, ArrowRight } from "lucide-react";
import { CHANNELS } from "@/lib/channels";
import { AnimateOnScroll } from "./animate-on-scroll";

// 11 channels + 1 "more" card = 12 total = fills 3 rows of 4 (lg) / 6 rows of 2 (sm)
const VISIBLE_COUNT = 11;

function ChannelAvatar({
  channel,
}: {
  channel: { displayName: string; avatar: string; color: string };
}) {
  const [imgError, setImgError] = useState(false);
  const initials = channel.displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

  if (!channel.avatar || imgError) {
    return (
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold"
        style={{
          backgroundColor: channel.color + "20",
          color: channel.color,
        }}
      >
        {initials}
      </div>
    );
  }

  return (
    <Image
      src={channel.avatar}
      alt={channel.displayName}
      width={40}
      height={40}
      className="h-10 w-10 shrink-0 rounded-lg object-cover"
      onError={() => setImgError(true)}
    />
  );
}

export function ChannelGrid() {
  const visible = CHANNELS.slice(0, VISIBLE_COUNT);
  const remaining = CHANNELS.length - VISIBLE_COUNT;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {visible.map((channel, i) => (
        <AnimateOnScroll key={channel.slug} delay={Math.min(i * 50, 400)}>
          <div className="group overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all duration-300 hover:border-primary/20 hover:bg-white/[0.04]">
            <div className="flex items-center gap-3">
              <div className="transition-transform duration-300 group-hover:scale-110">
                <ChannelAvatar channel={channel} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-cream">
                  {channel.displayName}
                </p>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="flex items-center gap-1 text-[11px] text-gray-text/60">
                    <Video className="h-2.5 w-2.5 shrink-0" />
                    {channel.videoCount.toLocaleString()} Videos
                  </span>
                  <span className="truncate rounded-md border border-white/[0.08] px-1.5 py-0.5 text-[10px] text-gray-text/50">
                    {channel.category}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </AnimateOnScroll>
      ))}
      {remaining > 0 && (
        <AnimateOnScroll delay={500}>
          <Link
            href="/channels"
            className="group flex items-center justify-center gap-2 overflow-hidden rounded-xl border border-dashed border-white/[0.08] bg-white/[0.01] p-4 transition-all duration-300 hover:border-primary/30 hover:bg-white/[0.04]"
          >
            <span className="text-sm font-medium text-gray-text/60 transition-colors group-hover:text-primary">
              +{remaining} more channels
            </span>
            <ArrowRight className="h-3.5 w-3.5 text-gray-text/40 transition-colors group-hover:text-primary" />
          </Link>
        </AnimateOnScroll>
      )}
    </div>
  );
}
