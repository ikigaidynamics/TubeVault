import { redirect } from "next/navigation";
import Image from "next/image";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { OverviewCards } from "@/components/admin/analytics/OverviewCards";
import { SearchIntelligence } from "@/components/admin/analytics/SearchIntelligence";
import { ChannelRankings } from "@/components/admin/analytics/ChannelRankings";
import { ConversionFunnel } from "@/components/admin/analytics/ConversionFunnel";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: { days?: string };
}) {
  // Server-side admin check
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

      {/* Last updated */}
      <div className="mx-auto max-w-7xl px-6 pt-4">
        <p className="text-[11px] text-gray-text/40">
          Last updated: {now.replace("T", " ").slice(0, 19)} UTC
        </p>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-7xl space-y-12 px-6 py-6">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {(OverviewCards as any)({ days })}
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {(SearchIntelligence as any)()}
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {(ChannelRankings as any)()}
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {(ConversionFunnel as any)()}
      </main>
    </div>
  );
}
