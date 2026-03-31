"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Camera,
  Check,
  Crown,
  Loader2,
  Plus,
  Settings,
  Trash2,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { type Collection } from "@/lib/api";
import { TIER_LIMITS, type SubscriptionTier } from "@/lib/tiers";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://mindvault.ikigai-dynamics.com/api";

export default function SettingsPage() {
  const supabase = createClient();

  // Profile state
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tier state
  const [tier, setTier] = useState<SubscriptionTier>("free");
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<string | null>(null);

  // Channel state
  const [collections, setCollections] = useState<Collection[]>([]);
  const [pickedChannels, setPickedChannels] = useState<string[]>([]);
  const [channelsLoading, setChannelsLoading] = useState(true);

  const limits = TIER_LIMITS[tier];
  const hasUnlimitedChannels = limits.maxChannels === Infinity;

  // Load user profile
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setUserId(user.id);
      setEmail(user.email || "");
      setDisplayName(user.user_metadata?.display_name || user.user_metadata?.full_name || "");
      setAvatarUrl(user.user_metadata?.avatar_url || null);
    });

    // Load subscription
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("subscriptions")
        .select("tier, current_period_end")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single()
        .then(({ data }) => {
          if (data) {
            setTier(data.tier as SubscriptionTier);
            setCurrentPeriodEnd(data.current_period_end);
          }
        });
    });
  }, []);

  // Load collections + channel picks
  useEffect(() => {
    fetch(`${API_BASE_URL}/collections`)
      .then((r) => r.json())
      .then((data: Collection[]) => setCollections(data))
      .catch(() => {});

    fetch("/api/channels/select")
      .then((r) => r.json())
      .then((data) => {
        if (data.selectedChannels) setPickedChannels(data.selectedChannels);
        if (data.tier) setTier(data.tier);
      })
      .catch(() => {})
      .finally(() => setChannelsLoading(false));
  }, []);

  async function handleSaveProfile() {
    setSaving(true);
    setSaved(false);

    const { error } = await supabase.auth.updateUser({
      data: {
        display_name: displayName.trim(),
        full_name: displayName.trim(),
      },
    });

    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    setUploadingAvatar(true);

    const ext = file.name.split(".").pop();
    const filePath = `avatars/${userId}.${ext}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      // If bucket doesn't exist, fall back to data URL
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        await supabase.auth.updateUser({
          data: { avatar_url: dataUrl },
        });
        setAvatarUrl(dataUrl);
        setUploadingAvatar(false);
      };
      reader.readAsDataURL(file);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    await supabase.auth.updateUser({
      data: { avatar_url: publicUrl },
    });

    setAvatarUrl(publicUrl);
    setUploadingAvatar(false);
  }

  async function handleRemoveAvatar() {
    await supabase.auth.updateUser({
      data: { avatar_url: null },
    });
    setAvatarUrl(null);
  }

  async function handleAddChannel(channel: string) {
    setPickedChannels((prev) => [...prev, channel]);
    try {
      const res = await fetch("/api/channels/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, action: "add" }),
      });
      const data = await res.json();
      if (data.selectedChannels) setPickedChannels(data.selectedChannels);
    } catch {
      setPickedChannels((prev) => prev.filter((c) => c !== channel));
    }
  }

  async function handleRemoveChannel(channel: string) {
    setPickedChannels((prev) => prev.filter((c) => c !== channel));
    try {
      const res = await fetch("/api/channels/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, action: "remove" }),
      });
      const data = await res.json();
      if (data.selectedChannels) setPickedChannels(data.selectedChannels);
    } catch {
      setPickedChannels((prev) => [...prev, channel]);
    }
  }

  const pickedCollections = collections.filter((c) =>
    pickedChannels.includes(c.name)
  );
  const availableCollections = collections
    .filter((c) => !pickedChannels.includes(c.name))
    .sort((a, b) => a.display_name.localeCompare(b.display_name));

  const slotsFull =
    !hasUnlimitedChannels && pickedChannels.length >= limits.maxChannels;

  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      {/* Header */}
      <header className="border-b border-white/[0.06] px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-gray-text transition-colors hover:text-cream"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to chat
          </Link>
          <span className="text-gray-text/30">|</span>
          <Settings className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-cream">Account Settings</span>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-8 space-y-10">
        {/* ── Profile Section ── */}
        <section>
          <h2 className="text-lg font-semibold text-cream">Profile</h2>
          <p className="mt-1 text-sm text-gray-text/60">
            Your public display name and avatar.
          </p>

          <div className="mt-6 space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-5">
              <div className="relative">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="Avatar"
                    width={64}
                    height={64}
                    className="h-16 w-16 rounded-2xl object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.06] text-xl font-bold text-gray-text">
                    {displayName?.[0]?.toUpperCase() || email?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
                {uploadingAvatar && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50">
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs font-medium text-cream transition-colors hover:bg-white/[0.04]"
                >
                  <Camera className="h-3.5 w-3.5" />
                  Change photo
                </button>
                {avatarUrl && (
                  <button
                    onClick={handleRemoveAvatar}
                    className="flex items-center gap-1.5 text-xs text-gray-text/50 transition-colors hover:text-red-400"
                  >
                    <Trash2 className="h-3 w-3" />
                    Remove
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Display Name */}
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-gray-text/50">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="w-full max-w-sm rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-cream placeholder:text-gray-text/40 focus:border-primary/30 focus:outline-none"
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-gray-text/50">
                Email
              </label>
              <p className="text-sm text-gray-text">{email}</p>
            </div>

            {/* Save */}
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : saved ? (
                <Check className="h-3.5 w-3.5" />
              ) : null}
              {saved ? "Saved" : "Save Changes"}
            </button>
          </div>
        </section>

        {/* ── Subscription Section ── */}
        <section>
          <h2 className="text-lg font-semibold text-cream">Subscription</h2>
          <p className="mt-1 text-sm text-gray-text/60">
            Your current plan and billing.
          </p>

          <div className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {tier === "creator" && <Crown className="h-5 w-5 text-primary" />}
                <div>
                  <p className="text-sm font-semibold capitalize text-cream">{tier} Plan</p>
                  <p className="mt-0.5 text-xs text-gray-text/60">
                    {limits.maxChannels === Infinity
                      ? "All channels"
                      : `${limits.maxChannels} channels`}
                    {" · "}
                    {limits.maxQuestionsPerDay === Infinity
                      ? "Unlimited questions"
                      : `${limits.maxQuestionsPerDay} questions/day`}
                  </p>
                  {currentPeriodEnd && (
                    <p className="mt-1 text-[11px] text-gray-text/40">
                      Renews {new Date(currentPeriodEnd).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>
              </div>
              <Link
                href="/pricing"
                className="rounded-lg border border-primary/20 px-4 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
              >
                {tier === "free" ? "Upgrade" : "Manage Plan"}
              </Link>
            </div>
          </div>
        </section>

        {/* ── My Channels Section ── */}
        {!hasUnlimitedChannels && (
          <section>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-cream">My Channels</h2>
                <p className="mt-1 text-sm text-gray-text/60">
                  Choose which channels appear in your sidebar ({pickedChannels.length}/{limits.maxChannels} slots used).
                </p>
              </div>
            </div>

            {channelsLoading ? (
              <div className="mt-6 flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : (
              <div className="mt-6 space-y-6">
                {/* Selected channels */}
                {pickedCollections.length > 0 && (
                  <div>
                    <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-gray-text/50">
                      Selected
                    </p>
                    <div className="space-y-2">
                      {pickedCollections.map((col) => {
                        const logoUrl = col.logo
                          ? col.logo.startsWith("/")
                            ? `https://mindvault.ikigai-dynamics.com${col.logo}`
                            : col.logo
                          : null;
                        const initials = col.display_name
                          .split(" ")
                          .map((w) => w[0])
                          .join("")
                          .slice(0, 2);

                        return (
                          <div
                            key={col.name}
                            className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
                          >
                            {logoUrl ? (
                              <Image
                                src={logoUrl}
                                alt={col.display_name}
                                width={36}
                                height={36}
                                className="h-9 w-9 rounded-lg object-cover"
                                unoptimized
                              />
                            ) : (
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06] text-[10px] font-bold text-gray-text">
                                {initials}
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-cream">
                                {col.display_name}
                              </p>
                              <p className="text-[11px] text-gray-text/50">
                                {col.video_count
                                  ? `${col.video_count.toLocaleString()} videos`
                                  : `${col.point_count.toLocaleString()} chunks`}
                              </p>
                            </div>
                            <button
                              onClick={() => handleRemoveChannel(col.name)}
                              className="shrink-0 rounded-lg p-1.5 text-gray-text/40 transition-colors hover:bg-white/[0.06] hover:text-red-400"
                              title="Remove channel"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Available channels */}
                <div>
                  <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-gray-text/50">
                    Available ({availableCollections.length})
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {availableCollections.map((col) => {
                      const logoUrl = col.logo
                        ? col.logo.startsWith("/")
                          ? `https://mindvault.ikigai-dynamics.com${col.logo}`
                          : col.logo
                        : null;
                      const initials = col.display_name
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2);

                      return (
                        <button
                          key={col.name}
                          onClick={() => handleAddChannel(col.name)}
                          disabled={slotsFull}
                          className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-left transition-colors hover:border-primary/20 hover:bg-white/[0.04] disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {logoUrl ? (
                            <Image
                              src={logoUrl}
                              alt={col.display_name}
                              width={32}
                              height={32}
                              className="h-8 w-8 rounded-lg object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06] text-[10px] font-bold text-gray-text">
                              {initials}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-medium text-cream/80">
                              {col.display_name}
                            </p>
                          </div>
                          <Plus className="h-4 w-4 shrink-0 text-primary/60" />
                        </button>
                      );
                    })}
                  </div>
                  {slotsFull && (
                    <p className="mt-3 text-center text-xs text-gray-text/50">
                      All slots used.{" "}
                      <Link href="/pricing" className="text-primary hover:text-primary-hover">
                        Upgrade for more
                      </Link>
                    </p>
                  )}
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
