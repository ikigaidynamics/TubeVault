"use client";

import { useState } from "react";
import Image from "next/image";
import { LogOut, Menu, X, Search } from "lucide-react";
import type { Collection } from "@/lib/api";

interface ChannelSidebarProps {
  collections: Collection[];
  selectedChannel: string | null;
  onSelectChannel: (name: string) => void;
  userEmail: string;
  onLogout: () => void;
}

export function ChannelSidebar({
  collections,
  selectedChannel,
  onSelectChannel,
  userEmail,
  onLogout,
}: ChannelSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = collections.filter(
    (c) =>
      c.display_name.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase())
  );

  const sidebar = (
    <div className="flex h-full flex-col bg-[#0A0A0B]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
        <span className="text-sm font-semibold text-cream">Channels</span>
        <button
          onClick={() => setMobileOpen(false)}
          className="text-gray-text hover:text-cream md:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-text/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search channels..."
            className="w-full rounded-lg border border-white/[0.06] bg-white/[0.03] py-2 pl-8 pr-3 text-xs text-cream placeholder:text-gray-text/40 focus:border-primary/30 focus:outline-none"
          />
        </div>
      </div>

      {/* Channel list */}
      <div className="flex-1 overflow-y-auto px-2 py-1">
        {filtered.map((col) => {
          const active = selectedChannel === col.name;
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

          return (
            <button
              key={col.name}
              onClick={() => {
                onSelectChannel(col.name);
                setMobileOpen(false);
              }}
              className={`mb-0.5 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                active
                  ? "bg-primary/10 text-cream"
                  : "text-gray-text hover:bg-white/[0.04] hover:text-cream"
              }`}
            >
              {avatarUrl ? (
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
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium">
                  {col.display_name}
                </p>
                <p className="text-[10px] text-gray-text/50">
                  {col.video_count
                    ? `${col.video_count.toLocaleString()} videos`
                    : `${col.point_count.toLocaleString()} chunks`}
                </p>
              </div>
              {active && (
                <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>

      {/* User */}
      <div className="border-t border-white/[0.06] px-3 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-dark-surface text-[10px] font-bold text-gray-text">
            {userEmail[0]?.toUpperCase() || "?"}
          </div>
          <p className="min-w-0 flex-1 truncate text-[11px] text-gray-text">
            {userEmail}
          </p>
          <button
            onClick={onLogout}
            className="shrink-0 text-gray-text/50 transition-colors hover:text-red-400"
            title="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-3 top-3 z-50 rounded-lg border border-white/[0.08] bg-[#0A0A0B] p-2 text-gray-text transition-colors hover:text-cream md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebar}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden w-64 shrink-0 border-r border-white/[0.06] md:block">
        {sidebar}
      </div>
    </>
  );
}
