import { redirect } from "next/navigation";
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

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <header className="border-b border-white/[0.06] bg-[#151515] px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <h1 className="text-xl font-bold text-cream">TubeVault Analytics</h1>
          <div className="flex gap-2">
            <a
              href="/admin/analytics?days=7"
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                days === 7
                  ? "bg-primary text-white"
                  : "bg-white/[0.04] text-gray-text hover:text-cream"
              }`}
            >
              7 days
            </a>
            <a
              href="/admin/analytics?days=30"
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                days === 30
                  ? "bg-primary text-white"
                  : "bg-white/[0.04] text-gray-text hover:text-cream"
              }`}
            >
              30 days
            </a>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-7xl space-y-12 px-6 py-8">
        {/* @ts-expect-error Async Server Component */}
        <OverviewCards days={days} />
        {/* @ts-expect-error Async Server Component */}
        <SearchIntelligence />
        {/* @ts-expect-error Async Server Component */}
        <ChannelRankings />
        {/* @ts-expect-error Async Server Component */}
        <ConversionFunnel />
      </main>
    </div>
  );
}
