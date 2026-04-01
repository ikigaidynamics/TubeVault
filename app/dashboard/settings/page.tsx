"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Camera,
  Check,
  Crown,
  Loader2,
  Lock,
  Settings,
  Trash2,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { type Collection } from "@/lib/api";
import { TIER_LIMITS, type SubscriptionTier } from "@/lib/tiers";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://mindvault.ikigai-dynamics.com/api";

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tier, setTier] = useState<SubscriptionTier>("free");
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<string | null>(null);

  const [collections, setCollections] = useState<Collection[]>([]);
  const [pickedChannels, setPickedChannels] = useState<string[]>([]);
  const [lockedUntil, setLockedUntil] = useState<string | null>(null);
  const [canChange, setCanChange] = useState(true);
  const [channelsLoading, setChannelsLoading] = useState(true);

  const limits = TIER_LIMITS[tier];
  const hasUnlimitedChannels = limits.maxChannels === Infinity;
  const lockDays = lockedUntil ? daysUntil(lockedUntil) : 0;
  const isLocked = !canChange && lockDays > 0;

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setUserId(user.id);
      setEmail(user.email || "");
      setDisplayName(user.user_metadata?.display_name || user.user_metadata?.full_name || "");
      setAvatarUrl(user.user_metadata?.avatar_url || null);

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
        if (data.lockedUntil) setLockedUntil(data.lockedUntil);
        if (data.canChange !== undefined) setCanChange(data.canChange);
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

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
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

  const pickedCollections = collections.filter((c) =>
    pickedChannels.includes(c.name)
  );

  return (
    <div className="flex min-h-screen flex-col bg-[#0A0A0B]">
      {/* Header */}
      <header className="border-b border-white/[0.06] px-6 py-4">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-1.5 text-sm text-gray-text transition-colors hover:text-cream"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to chat
          </button>
          <span className="text-gray-text/30">|</span>
          <Settings className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-cream">Account Settings</span>
        </div>
      </header>

      {/* Content — centered */}
      <div className="flex flex-1 justify-center px-6 py-10">
        <div className="w-full max-w-xl space-y-10">
          {/* ── Profile ── */}
          <section>
            <h2 className="text-lg font-semibold text-cream">Profile</h2>
            <p className="mt-1 text-sm text-gray-text/60">
              Your display name and avatar.
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
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-cream placeholder:text-gray-text/40 focus:border-primary/30 focus:outline-none"
                />
              </div>

              {/* Email */}
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

          {/* ── Subscription ── */}
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

          {/* ── My Channels (read-only, shows lock state) ── */}
          {!hasUnlimitedChannels && (
            <section>
              <h2 className="text-lg font-semibold text-cream">My Channels</h2>
              <p className="mt-1 text-sm text-gray-text/60">
                Your selected channels ({pickedChannels.length}/{limits.maxChannels}).
                {isLocked && (
                  <span className="ml-1 inline-flex items-center gap-1 text-gray-text/40">
                    <Lock className="inline h-3 w-3" />
                    Locked for {lockDays} more day{lockDays !== 1 ? "s" : ""}
                  </span>
                )}
                {canChange && pickedChannels.length > 0 && (
                  <span className="ml-1 text-primary/60">
                    — change via the channel picker in the dashboard
                  </span>
                )}
              </p>

              {channelsLoading ? (
                <div className="mt-6 flex justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : pickedCollections.length > 0 ? (
                <div className="mt-6 space-y-2">
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
                        {isLocked && (
                          <Lock className="h-3.5 w-3.5 shrink-0 text-gray-text/30" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-6 rounded-xl border border-dashed border-white/[0.08] py-8 text-center">
                  <p className="text-sm text-gray-text/40">
                    No channels selected yet. Go to the{" "}
                    <button
                      onClick={() => router.push("/dashboard")}
                      className="text-primary hover:text-primary-hover"
                    >
                      dashboard
                    </button>
                    {" "}to pick your channels.
                  </p>
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
