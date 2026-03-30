"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ArrowRight, Sparkles, Play } from "lucide-react";
import {
  CHANNELS,
  CATEGORIES,
  getChannelsByCategory,
  type Category,
} from "@/lib/channels";

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
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-base font-bold"
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
      width={56}
      height={56}
      className="h-14 w-14 shrink-0 rounded-xl object-cover"
      onError={() => setImgError(true)}
    />
  );
}

export default function ChannelsPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = getChannelsByCategory(activeCategory).filter(
    (c) =>
      c.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#1d1d1d]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-gray-text">
              AI-powered semantic search for YouTube
            </span>
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            <Link
              href="/pricing"
              className="text-sm text-gray-text transition-colors hover:text-cream"
            >
              Pricing
            </Link>
            <Link
              href="/login"
              className="text-sm text-gray-text transition-colors hover:text-cream"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
            >
              Get Started
            </Link>
          </div>
          <Link
            href="/signup"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover md:hidden"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-cream">Browse Channels</h1>
            <p className="mt-2 text-gray-text">
              {CHANNELS.length} indexed YouTube channels available for
              AI-powered search.
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-text/50" />
            <input
              type="text"
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-cream placeholder:text-gray-text/50 focus:border-primary/40 focus:outline-none"
            />
          </div>
        </div>

        {/* Category tabs */}
        <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => {
            const count =
              cat === "All"
                ? CHANNELS.length
                : CHANNELS.filter((c) => c.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-primary text-white"
                    : "bg-white/[0.04] text-gray-text hover:bg-white/[0.08] hover:text-cream"
                }`}
              >
                {cat}
                <span
                  className={`ml-1.5 text-xs ${
                    activeCategory === cat
                      ? "text-white/70"
                      : "text-gray-text/50"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Channel grid */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((channel) => (
            <Link
              key={channel.slug}
              href={`/login?redirect=/dashboard?channel=${channel.slug}`}
              className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all duration-300 hover:border-primary/20 hover:bg-white/[0.04]"
            >
              <div className="flex gap-4">
                <ChannelAvatar channel={channel} />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-semibold text-cream">
                    {channel.displayName}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-gray-text/70">
                    {channel.description}
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-xs text-gray-text/50">
                      <Play className="h-3 w-3 shrink-0" />
                      {channel.videoCount.toLocaleString()} videos
                    </span>
                    <span className="rounded-full bg-white/[0.04] px-2 py-0.5 text-[11px] text-gray-text/50">
                      {channel.category}
                    </span>
                    <span className="ml-auto flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                      Search channel
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-16 text-center">
            <p className="text-gray-text">
              No channels found matching &ldquo;{searchQuery}&rdquo;
            </p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 rounded-xl border border-white/[0.06] bg-white/[0.02] p-8 text-center">
          <h2 className="text-xl font-semibold text-cream">
            Ready to search these channels?
          </h2>
          <p className="mt-2 text-sm text-gray-text">
            Free plan includes 3 channels and 5 questions per day.
          </p>
          <Link
            href="/signup"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            Start searching — it&apos;s free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
