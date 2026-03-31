"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, Loader2, X } from "lucide-react";
import type { Collection } from "@/lib/api";

interface ChannelPickerModalProps {
  open: boolean;
  collections: Collection[];
  maxChannels: number;
  defaults: string[];
  onConfirm: (channels: string[]) => void;
  onClose?: () => void;
  canClose?: boolean;
}

export function ChannelPickerModal({
  open,
  collections,
  maxChannels,
  defaults,
  onConfirm,
  onClose,
  canClose = false,
}: ChannelPickerModalProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(defaults));
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  if (!open) return null;

  const sorted = [...collections].sort((a, b) =>
    a.display_name.localeCompare(b.display_name)
  );

  const filtered = sorted.filter(
    (c) =>
      c.display_name.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase())
  );

  function toggle(name: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else if (next.size < maxChannels) {
        next.add(name);
      }
      return next;
    });
  }

  async function handleConfirm() {
    setSaving(true);
    await onConfirm(Array.from(selected));
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={canClose ? onClose : undefined} />
      <div className="relative mx-4 flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-white/[0.08] bg-[#141416] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-cream">
              Choose your channels
            </h2>
            <p className="mt-0.5 text-sm text-gray-text/60">
              Select up to {maxChannels} channels. Locked for 30 days after confirming.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                selected.size === maxChannels
                  ? "bg-primary/20 text-primary"
                  : "bg-white/[0.06] text-gray-text/60"
              }`}
            >
              {selected.size}/{maxChannels}
            </span>
            {canClose && (
              <button onClick={onClose} className="text-gray-text/50 hover:text-cream">
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="border-b border-white/[0.06] px-6 py-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search channels..."
            className="w-full rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-sm text-cream placeholder:text-gray-text/40 focus:border-primary/30 focus:outline-none"
          />
        </div>

        {/* Channel grid */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="grid gap-2 sm:grid-cols-2">
            {filtered.map((col) => {
              const isSelected = selected.has(col.name);
              const isFull = selected.size >= maxChannels && !isSelected;
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
                  onClick={() => toggle(col.name)}
                  disabled={isFull}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all ${
                    isSelected
                      ? "border-primary/40 bg-primary/[0.06]"
                      : isFull
                        ? "border-white/[0.04] bg-white/[0.01] opacity-40 cursor-not-allowed"
                        : "border-white/[0.06] bg-white/[0.02] hover:border-primary/20 hover:bg-white/[0.04]"
                  }`}
                >
                  {/* Checkbox */}
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-white/[0.15] bg-white/[0.03]"
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3 text-white" />}
                  </div>

                  {/* Avatar */}
                  {logoUrl ? (
                    <Image
                      src={logoUrl}
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
                  )}

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-cream/80">
                      {col.display_name}
                    </p>
                    <p className="text-[10px] text-gray-text/50">
                      {col.video_count
                        ? `${col.video_count.toLocaleString()} videos`
                        : `${col.point_count.toLocaleString()} chunks`}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/[0.06] px-6 py-4">
          <button
            onClick={handleConfirm}
            disabled={selected.size === 0 || saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Confirm selection
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px]">
                  locked for 30 days
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
