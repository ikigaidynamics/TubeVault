import { redirect } from "next/navigation";
import Image from "next/image";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { OverviewCards } from "@/components/admin/analytics/OverviewCards";
import { SearchVolume } from "@/components/admin/analytics/SearchVolume";
import { Attribution } from "@/components/admin/analytics/Attribution";
import { DeviceGeo } from "@/components/admin/analytics/DeviceGeo";
import { SearchIntelligence } from "@/components/admin/analytics/SearchIntelligence";
import { ChannelRankings } from "@/components/admin/analytics/ChannelRankings";
import { Retention } from "@/components/admin/analytics/Retention";
import { ConversionFunnel } from "@/components/admin/analytics/ConversionFunnel";

export const dynamic = "force-dynamic";

const NAV_ITEMS = [
  { label: "Overview", href: "#overview" },
  { label: "Volume", href: "#volume" },
  { label: "Attribution", href: "#attribution" },
  { label: "Devices", href: "#devices" },
  { label: "Search", href: "#search" },
  { label: "Channels", href: "#channels" },
  { label: "Retention", href: "#retention" },
  { label: "Funnel", href: "#funnel" },
];

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: { days?: string };
}) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!user || !adminEmail || user.email !== adminEmail) {
    redirect("/");
  }

  const days = searchParams.days === "30" ? 30 : 7;
  const now = new Date().toISOString();

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <header className="border-b border-white/[0.06] bg-[#151515] px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/TubeVault_Logo_round.png"
              alt="TubeVault"
              width={28}
              height={28}
              className="h-7 w-7"
            />
            <Image
              src="/TubeVault_Font_cropped.png"
              alt="TubeVault"
              width={108}
              height={19}
              className="h-[19px] w-auto"
            />
            <span className="ml-1 rounded bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium text-gray-text">
              Analytics
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <a
                href="/admin/analytics?days=7"
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  days === 7
                    ? "bg-primary text-white"
                    : "bg-white/[0.04] text-gray-text hover:text-cream"
                }`}
              >
                7d
              </a>
              <a
                href="/admin/analytics?days=30"
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  days === 30
                    ? "bg-primary text-white"
                    : "bg-white/[0.04] text-gray-text hover:text-cream"
                }`}
              >
                30d
              </a>
            </div>
            <a
              href={`/admin/analytics?days=${days}`}
              className="rounded-lg bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-gray-text transition-colors hover:text-cream"
            >
              Refresh
            </a>
          </div>
        </div>
      </header>

      {/* Sticky sub-nav */}
      <nav className="sticky top-0 z-40 border-b border-white/[0.04] bg-[#151515]/95 px-6 py-2 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-md px-2.5 py-1 text-[11px] font-medium text-gray-text/60 transition-colors hover:bg-white/[0.04] hover:text-cream"
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      {/* Last updated */}
      <div className="mx-auto max-w-7xl px-6 pt-4">
        <p className="text-[11px] text-gray-text/40">
          Last updated: {now.replace("T", " ").slice(0, 19)} UTC
        </p>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-7xl space-y-12 px-6 py-6">
        <div id="overview">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(OverviewCards as any)({ days })}
        </div>

        <div id="volume">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(SearchVolume as any)()}
        </div>

        <div id="attribution">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(Attribution as any)({ days })}
        </div>

        <div id="devices">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(DeviceGeo as any)()}
        </div>

        <div id="search">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(SearchIntelligence as any)()}
        </div>

        <div id="channels">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(ChannelRankings as any)()}
        </div>

        <div id="retention">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(Retention as any)()}
        </div>

        <div id="funnel">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(ConversionFunnel as any)()}
        </div>
      </main>
    </div>
  );
}
