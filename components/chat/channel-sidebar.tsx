"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { LogOut, Menu, X, Globe, Crown, Settings, RefreshCw, Lock, ChevronRight } from "lucide-react";
import type { Collection } from "@/lib/api";
import type { SubscriptionTier } from "@/lib/tiers";
import { TIER_LIMITS } from "@/lib/tiers";

interface ChannelSidebarProps {
  collections: Collection[];
  selectedChannel: string | null;
  onSelectChannel: (name: string) => void;
  userEmail: string;
  onLogout: () => void;
  tier: SubscriptionTier;
  pickedChannels: string[];
  lockedUntil: string | null;
  canChange: boolean;
  onChangeChannels?: () => void;
  onSearchAll?: () => void;
  searchAllActive?: boolean;
  questionsRemaining?: number | null;
  questionLimit?: number | null;
}

function ChannelAvatar({ col }: { col: Collection }) {
  const avatarUrl = col.logo
    ? col.logo.startsWith("/")
      ? `https://mindvault.ikigai-dynamics.com${col.logo}`
      : col.logo
    : null;
  const initials = col.display_name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

  return avatarUrl ? (
    <Image
      src={avatarUrl}
      alt={col.display_name}
      width={32}
      height={32}
      className="h-8 w-8 shrink-0 rounded-lg object-cover"
      unoptimized
    />
  ) : (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-[10px] font-bold text-gray-text">
      {initials}
    </div>
  );
}

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function ChannelSidebar({
  collections,
  selectedChannel,
  onSelectChannel,
  userEmail,
  onLogout,
  tier,
  pickedChannels,
  lockedUntil,
  canChange,
  onChangeChannels,
  onSearchAll,
  searchAllActive,
  questionsRemaining,
  questionLimit,
}: ChannelSidebarProps) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const limits = TIER_LIMITS[tier];
  const canCrossSearch = limits.hasCrossChannelSearch;
  const hasUnlimitedChannels = limits.maxChannels === Infinity;

  const sidebarChannels = hasUnlimitedChannels
    ? collections
    : collections.filter((c) => pickedChannels.includes(c.name));

  const lockDays = lockedUntil ? daysUntil(lockedUntil) : 0;
  const hasQuestionLimit = questionLimit !== null && questionLimit !== undefined && questionLimit > 0;
  const qRemaining = questionsRemaining ?? 0;

  const sidebar = (
    <div className="relative flex h-full flex-col bg-[#0A0A0B]">
      {/* Logo */}
      <div className="border-b border-white/[0.06] px-4 py-2.5">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <Image
            src="/TubeVault_Logo_round.png"
            alt="TubeVault"
            width={24}
            height={24}
            className="h-6 w-6"
          />
          <Image
            src="/TubeVault_Font_cropped.png"
            alt="TubeVault"
            width={90}
            height={16}
            className="h-4 w-auto"
          />
        </Link>
      </div>

      {/* Header + lock info */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium uppercase tracking-wider text-gray-text/50">
            My Channels
          </span>
          {!hasUnlimitedChannels && (
            <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium text-gray-text/60">
              {pickedChannels.length}/{limits.maxChannels}
            </span>
          )}
        </div>
        <button
          onClick={() => setMobileOpen(false)}
          className="text-gray-text hover:text-cream md:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Lock timer or change button */}
      {!hasUnlimitedChannels && pickedChannels.length > 0 && (
        <div className="px-4 pb-2">
          {canChange ? (
            <button
              onClick={onChangeChannels}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-primary/20 py-1.5 text-[11px] font-medium text-primary transition-all duration-200 hover:bg-primary/10 hover:border-primary/30"
            >
              <RefreshCw className="h-3 w-3" />
              Change channels
            </button>
          ) : (
            <div className="flex items-center justify-center gap-1.5 rounded-lg bg-white/[0.03] py-1.5 text-[10px] text-gray-text/40">
              <Lock className="h-3 w-3" />
              Resets in {lockDays}d
            </div>
          )}
        </div>
      )}

      {/* Search All */}
      <div className="px-2 pb-1">
        <button
          onClick={() => {
            if (canCrossSearch) {
              onSearchAll?.();
              setMobileOpen(false);
            } else {
              router.push("/pricing");
            }
          }}
          className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-all duration-200 ${
            searchAllActive
              ? "bg-primary/10 text-cream"
              : "text-gray-text hover:bg-white/[0.04] hover:text-cream"
          }`}
        >
          <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
            searchAllActive ? "bg-primary/20" : "bg-primary/[0.08]"
          }`}>
            <Globe className="h-3.5 w-3.5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-medium">Search All</p>
          </div>
          {!canCrossSearch && (
            <span className="shrink-0 rounded-full border border-primary/20 px-1.5 py-px text-[8px] font-medium text-primary/60">
              PRO
            </span>
          )}
          {searchAllActive && (
            <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
          )}
        </button>
      </div>

      {/* Divider */}
      <div className="mx-4 border-b border-white/[0.05]" />

      {/* Channel list */}
      <div className="flex-1 overflow-y-auto px-2 pt-2 pb-1">
        {sidebarChannels.length === 0 && !hasUnlimitedChannels ? (
          <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
            <p className="text-[11px] text-gray-text/40">
              No channels selected yet.
            </p>
          </div>
        ) : (
          sidebarChannels.map((col) => {
            const active = selectedChannel === col.name;
            return (
              <button
                key={col.name}
                onClick={() => {
                  onSelectChannel(col.name);
                  setMobileOpen(false);
                }}
                className={`group mb-0.5 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-all duration-150 ${
                  active
                    ? "bg-primary/[0.08] text-cream shadow-[inset_0_0_0_1px_rgba(101,174,76,0.15)]"
                    : "text-gray-text hover:bg-white/[0.04] hover:text-cream"
                }`}
              >
                <ChannelAvatar col={col} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-medium">
                    {col.display_name}
                  </p>
                  <p className="text-[10px] text-gray-text/40">
                    {col.video_count
                      ? `${col.video_count.toLocaleString()} videos`
                      : `${col.point_count.toLocaleString()} chunks`}
                  </p>
                </div>
                {active && (
                  <ChevronRight className="h-3 w-3 shrink-0 text-primary/50" />
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Question counter (free tier) */}
      {hasQuestionLimit && (
        <div className="px-4 pb-1">
          <div className="flex items-center gap-2">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-primary/60 transition-all duration-500"
                style={{ width: `${(qRemaining / (questionLimit ?? 1)) * 100}%` }}
              />
            </div>
            <span className={`text-[9px] font-medium tabular-nums ${
              qRemaining <= 1 ? "text-red-400/70" : "text-gray-text/40"
            }`}>
              {qRemaining}/{questionLimit}
            </span>
          </div>
        </div>
      )}

      {/* User section */}
      <div className="border-t border-white/[0.06] px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/settings"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/[0.05] text-[10px] font-bold text-gray-text/70 transition-colors hover:bg-white/[0.1]"
            title="Account settings"
          >
            {userEmail[0]?.toUpperCase() || "?"}
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] leading-tight text-gray-text/70">
              {userEmail}
            </p>
            <div className="flex items-center gap-1">
              {tier === "creator" && <Crown className="h-2.5 w-2.5 text-primary" />}
              <span className="text-[9px] font-medium uppercase tracking-wider text-primary/60">
                {tier}
              </span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Link
              href="/dashboard/settings"
              className="rounded-md p-1 text-gray-text/30 transition-colors hover:bg-white/[0.06] hover:text-cream"
              title="Settings"
            >
              <Settings className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/pricing"
              className="rounded-md border border-primary/15 px-2 py-0.5 text-[9px] font-medium text-primary/70 transition-all duration-200 hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
            >
              {tier === "free" ? "Upgrade" : "Plans"}
            </Link>
            <button
              onClick={onLogout}
              className="rounded-md p-1 text-gray-text/30 transition-colors hover:bg-white/[0.06] hover:text-red-400"
              title="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-3 top-3 z-50 rounded-lg border border-white/[0.08] bg-[#0A0A0B] p-2 text-gray-text transition-colors hover:text-cream md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebar}
      </div>

      <div className="hidden w-64 shrink-0 border-r border-white/[0.06] md:block">
        {sidebar}
      </div>
    </>
  );
}
