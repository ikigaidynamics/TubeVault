"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { LogOut, X, Globe, Crown, Settings, RefreshCw, Lock, ChevronRight, ArrowRight, Zap, FileText, Plus, MessageSquare, Trash2, Pencil } from "lucide-react";
import type { Collection, ConversationSummary } from "@/lib/api";
import type { SubscriptionTier } from "@/lib/tiers";
import { TIER_LIMITS } from "@/lib/tiers";
import { track } from "@/lib/analytics/tracker";
import { relativeTime } from "@/lib/relative-time";

interface ChannelSidebarProps {
  collections: Collection[];
  selectedChannel: string | null;
  onSelectChannel: (name: string) => void;
  userEmail: string;
  userAvatar?: string | null;
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
  conversations?: ConversationSummary[];
  activeConversationId?: string | null;
  onSelectConversation?: (id: string) => void;
  onNewChat?: () => void;
  onDeleteConversation?: (id: string) => void;
  onRenameConversation?: (id: string, title: string) => void;
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
}

function normalizeAvatarUrl(url: string): string {
  // YouTube avatar URLs with =s0 return original (huge) image — cap at 240px
  if (url.includes("yt3.googleusercontent.com") && url.endsWith("=s0")) {
    return url.slice(0, -2) + "s240";
  }
  return url;
}

function ChannelAvatar({ col }: { col: Collection }) {
  const avatarUrl = col.logo
    ? col.logo.startsWith("/channels/")
      ? col.logo
      : col.logo.startsWith("/")
        ? `https://mindvault.ikigai-dynamics.com${col.logo}`
        : normalizeAvatarUrl(col.logo)
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
      className="h-8 w-8 shrink-0 rounded-lg object-cover ring-1 ring-transparent transition-all duration-200 group-hover:ring-primary/20"
      unoptimized
    />
  ) : (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-[10px] font-bold text-gray-text ring-1 ring-transparent transition-all duration-200 group-hover:ring-primary/20">
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
  userAvatar,
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
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onRenameConversation,
  mobileOpen: mobileOpenProp,
  onMobileOpenChange,
}: ChannelSidebarProps) {
  const router = useRouter();
  const [mobileOpenInternal, setMobileOpenInternal] = useState(false);
  const mobileOpen = mobileOpenProp ?? mobileOpenInternal;
  const setMobileOpen = onMobileOpenChange ?? setMobileOpenInternal;
  const [avatarError, setAvatarError] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  const limits = TIER_LIMITS[tier];
  const canCrossSearch = limits.hasCrossChannelSearch;
  const hasUnlimitedChannels = limits.maxChannels === Infinity;

  const sidebarChannels = hasUnlimitedChannels
    ? collections
    : collections.filter((c) => pickedChannels.includes(c.name));

  const lockDays = lockedUntil ? daysUntil(lockedUntil) : 0;
  const hasQuestionLimit = questionLimit !== null && questionLimit !== undefined && questionLimit > 0;
  const qRemaining = questionsRemaining ?? 0;
  const qUsed = hasQuestionLimit ? (questionLimit ?? 0) - qRemaining : 0;

  const sidebar = (
    <div className="relative flex h-full flex-col bg-[#0F1011]">
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

      {/* New Chat + Recent Chats */}
      {conversations && conversations.length > 0 && (
        <>
          <div className="px-3 pt-3 pb-1">
            <button
              onClick={() => {
                onNewChat?.();
                setMobileOpen(false);
              }}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-primary/20 py-2 text-[11px] font-medium text-primary transition-all duration-200 hover:bg-primary/10 hover:border-primary/30"
            >
              <Plus className="h-3.5 w-3.5" />
              New Chat
            </button>
          </div>

          <div className="px-2 pb-2">
            <div className="flex items-center gap-2 px-2 pb-1.5">
              <MessageSquare className="h-3 w-3 text-gray-text/30" />
              <span className="text-[10px] font-medium uppercase tracking-wider text-gray-text/35">
                Recent Chats
              </span>
            </div>
            <div className="max-h-[200px] overflow-y-auto scrollbar-hide">
              {conversations.slice(0, 8).map((conv) => {
                const isActive = activeConversationId === conv.id;
                const channelCol = conv.channel_name
                  ? collections.find((c) => c.name === conv.channel_name)
                  : null;
                return (
                  <div
                    key={conv.id}
                    className={`group mb-0.5 flex items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "border-l-[3px] border-l-primary bg-primary/[0.08] pl-1.5"
                        : "border-l-[3px] border-l-transparent hover:bg-white/[0.04]"
                    }`}
                    onClick={() => {
                      onSelectConversation?.(conv.id);
                      setMobileOpen(false);
                    }}
                  >
                    {conv.is_cross_channel ? (
                      <Globe className="h-4 w-4 shrink-0 text-primary/40" />
                    ) : channelCol ? (
                      <div className="shrink-0">
                        <ChannelAvatar col={channelCol} />
                      </div>
                    ) : (
                      <MessageSquare className="h-4 w-4 shrink-0 text-gray-text/30" />
                    )}
                    <div className="min-w-0 flex-1">
                      {editingId === conv.id ? (
                        <input
                          ref={editInputRef}
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onBlur={() => {
                            const trimmed = editingTitle.trim();
                            if (trimmed && trimmed !== conv.title) {
                              onRenameConversation?.(conv.id, trimmed);
                            }
                            setEditingId(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              (e.target as HTMLInputElement).blur();
                            } else if (e.key === "Escape") {
                              setEditingId(null);
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full rounded bg-white/10 px-1 py-0.5 text-[11px] leading-tight text-cream outline-none ring-1 ring-primary/40"
                          maxLength={80}
                        />
                      ) : (
                        <p
                          className={`truncate text-[11px] leading-tight cursor-pointer ${isActive ? "font-medium text-cream" : "text-gray-text/70"}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(conv.id);
                            setEditingTitle(conv.title);
                          }}
                          title="Click to rename"
                        >
                          {conv.title}
                        </p>
                      )}
                      <p className="text-[9px] text-gray-text/30">
                        {conv.is_cross_channel ? "Cross-Channel" : channelCol?.display_name || conv.channel_name}
                        {" \u00B7 "}
                        {relativeTime(conv.updated_at)}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col gap-0.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingId(conv.id);
                          setEditingTitle(conv.title);
                        }}
                        className="shrink-0 rounded p-0.5 text-gray-text/0 transition-colors group-hover:text-gray-text/30 hover:!text-primary/70"
                        title="Rename conversation"
                      >
                        <Pencil className="h-2.5 w-2.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteConversation?.(conv.id);
                        }}
                        className="shrink-0 rounded p-0.5 text-gray-text/0 transition-colors group-hover:text-gray-text/30 hover:!text-red-400/70"
                        title="Delete conversation"
                      >
                        <Trash2 className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mx-4 border-b border-white/[0.05]" />
        </>
      )}

      {/* Header + lock info */}
      <div className="flex items-center justify-between px-4 py-3">
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
        <div className="px-4 pb-3">
          {canChange ? (
            <button
              onClick={onChangeChannels}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-primary/20 py-1.5 text-[11px] font-medium text-primary transition-all duration-200 hover:bg-primary/10 hover:border-primary/30"
            >
              <RefreshCw className="h-3 w-3" />
              Change channels
            </button>
          ) : pickedChannels.length < limits.maxChannels ? (
            <button
              onClick={onChangeChannels}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-primary/20 py-1.5 text-[11px] font-medium text-primary transition-all duration-200 hover:bg-primary/10 hover:border-primary/30"
            >
              <Plus className="h-3 w-3" />
              Add {limits.maxChannels - pickedChannels.length} more channel{limits.maxChannels - pickedChannels.length !== 1 ? "s" : ""}
            </button>
          ) : (
            <div className="flex items-center justify-center gap-1.5 rounded-lg bg-white/[0.03] py-1.5 text-[10px] text-gray-text/40">
              <Lock className="h-3 w-3" />
              Change channels in {lockDays}d
            </div>
          )}
        </div>
      )}

      {/* Divider */}
      <div className="mx-4 border-b border-white/[0.05]" />

      {/* Channel list */}
      <div className="flex-1 overflow-y-auto px-2 pt-3 pb-2">
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
                className={`group mb-1 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-left transition-all duration-200 ${
                  active
                    ? "border-l-[3px] border-l-primary bg-primary/[0.08] pl-2 text-cream"
                    : "border-l-[3px] border-l-transparent text-gray-text hover:bg-white/[0.04] hover:text-cream"
                }`}
              >
                <ChannelAvatar col={col} />
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-[12px] ${active ? "font-semibold text-cream" : "font-medium"}`}>
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

      {/* Divider */}
      <div className="mx-4 border-b border-white/[0.05]" />

      {/* Search All — bottom, subtle */}
      <div className="px-3 py-2">
        <button
          onClick={() => {
            if (canCrossSearch) {
              onSearchAll?.();
              setMobileOpen(false);
            } else {
              // analytics
              track("upgrade_click", { metadata: { trigger: "cross_channel_upgrade", current_tier: tier } });
              router.push("/pricing");
            }
          }}
          className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-all duration-200 ${
            searchAllActive
              ? "bg-primary/10 text-cream"
              : "text-gray-text/60 hover:bg-white/[0.04] hover:text-cream"
          }`}
        >
          <Globe className="h-3.5 w-3.5 text-primary/60" />
          <span className="text-[11px] font-medium">
            {canCrossSearch ? "Search all channels" : "Search all channels"}
          </span>
          {!canCrossSearch && (
            <span className="ml-auto shrink-0 rounded-full border border-primary/20 px-1.5 py-px text-[8px] font-medium text-primary/60">
              PREMIUM
            </span>
          )}
        </button>
      </div>

      {/* Transcripts link */}
      <div className="px-3 pb-1">
        {limits.hasTranscripts ? (
          <Link
            href="/dashboard/transcripts"
            onClick={() => setMobileOpen(false)}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-gray-text/60 transition-all duration-200 hover:bg-white/[0.04] hover:text-cream"
          >
            <FileText className="h-3.5 w-3.5 text-primary/60" />
            <span className="text-[11px] font-medium">Browse transcripts</span>
          </Link>
        ) : (
          <button
            onClick={() => {
              track("upgrade_click", { metadata: { trigger: "transcripts", current_tier: tier } });
              router.push("/pricing");
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-gray-text/60 transition-all duration-200 hover:bg-white/[0.04] hover:text-cream"
          >
            <FileText className="h-3.5 w-3.5 text-gray-text/30" />
            <span className="text-[11px] font-medium">Browse transcripts</span>
            <span className="ml-auto shrink-0 rounded-full border border-primary/20 px-1.5 py-px text-[8px] font-medium text-primary/60">
              PRO
            </span>
          </button>
        )}
      </div>

      {/* Question counter */}
      {hasQuestionLimit && (
        <div className="px-4 py-2">
          <p className="mb-1.5 text-[10px] font-medium text-gray-text/40">
            {qRemaining > 0
              ? `Daily questions: ${qUsed}/${questionLimit} used`
              : "Daily limit reached"}
          </p>
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                qRemaining <= 0 ? "bg-red-400/60" : "bg-primary/60"
              }`}
              style={{ width: `${((questionLimit ?? 0) - qRemaining) / (questionLimit ?? 1) * 100}%` }}
            />
          </div>
          {qRemaining <= 0 && (
            <Link
              href="/pricing"
              // analytics
              onClick={() => track("upgrade_click", { metadata: { trigger: "search_limit", current_tier: tier } })}
              className="mt-2 flex items-center justify-center gap-1.5 rounded-lg bg-primary/10 py-1.5 text-[10px] font-medium text-primary transition-colors hover:bg-primary/20"
            >
              Upgrade for unlimited
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      )}

      {/* Upgrade CTA for free users */}
      {tier === "free" && (
        <div className="px-3 pb-2">
          <Link
            href="/pricing"
            // analytics
            onClick={() => track("upgrade_click", { metadata: { trigger: "manual", current_tier: "free" } })}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary/40 py-2.5 text-[12px] font-semibold text-primary transition-all duration-200 hover:bg-primary/10 hover:shadow-[0_0_20px_rgba(101,174,76,0.15)]"
          >
            <Zap className="h-3.5 w-3.5" />
            Upgrade to Pro
          </Link>
        </div>
      )}

      {/* User section */}
      <div className="border-t border-white/[0.06] px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/settings"
            className="shrink-0"
            title="Account settings"
          >
            {userAvatar && !avatarError ? (
              <Image
                src={userAvatar}
                alt="You"
                width={28}
                height={28}
                className="h-7 w-7 rounded-full object-cover ring-1 ring-white/[0.08]"
                unoptimized
                onError={() => setAvatarError(true)}
              />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.05] text-[10px] font-bold text-gray-text/70 transition-colors hover:bg-white/[0.1]">
                {userEmail[0]?.toUpperCase() || "?"}
              </div>
            )}
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
