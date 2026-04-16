import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function SearchIntelligence() {
  const since = new Date(Date.now() - 7 * 86_400_000).toISOString();

  const { data: searches } = await supabase
    .from("analytics_events")
    .select("query_hash, query_raw, channel_id, result_count")
    .eq("event_type", "search")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(2000);

  const rows = searches ?? [];

  // Aggregate by query_hash
  const byHash = new Map<
    string,
    { raw: string | null; count: number; channels: Set<string>; totalResults: number; zeroCount: number }
  >();

  for (const row of rows) {
    const hash = row.query_hash ?? "unknown";
    const existing = byHash.get(hash);
    if (existing) {
      existing.count++;
      if (row.query_raw) existing.raw = row.query_raw;
      if (row.channel_id) existing.channels.add(row.channel_id);
      existing.totalResults += row.result_count ?? 0;
      if (row.result_count === 0) existing.zeroCount++;
    } else {
      const channels = new Set<string>();
      if (row.channel_id) channels.add(row.channel_id);
      byHash.set(hash, {
        raw: row.query_raw,
        count: 1,
        channels,
        totalResults: row.result_count ?? 0,
        zeroCount: row.result_count === 0 ? 1 : 0,
      });
    }
  }

  const topSearches = Array.from(byHash.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 20);

  // No-result channels ranking
  const channelNoResult = new Map<string, { total: number; noResult: number }>();
  for (const row of rows) {
    const ch = row.channel_id ?? "unknown";
    const existing = channelNoResult.get(ch);
    if (existing) {
      existing.total++;
      if (row.result_count === 0) existing.noResult++;
    } else {
      channelNoResult.set(ch, { total: 1, noResult: row.result_count === 0 ? 1 : 0 });
    }
  }

  const noResultRanking = Array.from(channelNoResult.entries())
    .map(([ch, d]) => ({ channel: ch, total: d.total, noResult: d.noResult, rate: Math.round((d.noResult / d.total) * 100) }))
    .filter((r) => r.noResult > 0)
    .sort((a, b) => b.rate - a.rate);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-4 text-lg font-semibold text-cream">Top Searches (7d)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-left text-xs text-gray-text/50">
                <th className="pb-2 pr-4">Query</th>
                <th className="pb-2 pr-4">Count</th>
                <th className="pb-2 pr-4">Channels</th>
                <th className="pb-2 pr-4">Avg Results</th>
              </tr>
            </thead>
            <tbody>
              {topSearches.map(([hash, d]) => {
                const avgResults = d.count > 0 ? Math.round(d.totalResults / d.count) : 0;
                const isZero = d.zeroCount > 0;
                return (
                  <tr
                    key={hash}
                    className={`border-b border-white/[0.03] ${isZero ? "bg-red-500/[0.05]" : ""}`}
                  >
                    <td className="py-2 pr-4 text-cream">
                      {d.raw ?? hash.slice(0, 12) + "..."}
                    </td>
                    <td className="py-2 pr-4 text-cream">{d.count}</td>
                    <td className="py-2 pr-4 text-gray-text">
                      {Array.from(d.channels).join(", ") || "-"}
                    </td>
                    <td className={`py-2 pr-4 ${avgResults === 0 ? "font-semibold text-red-400" : "text-cream"}`}>
                      {avgResults}
                    </td>
                  </tr>
                );
              })}
              {topSearches.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-gray-text/40">
                    No search data yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-cream">No-Result Channels</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-left text-xs text-gray-text/50">
                <th className="pb-2 pr-4">Channel</th>
                <th className="pb-2 pr-4">Total Searches</th>
                <th className="pb-2 pr-4">No-Result</th>
                <th className="pb-2 pr-4">Rate</th>
              </tr>
            </thead>
            <tbody>
              {noResultRanking.map((r) => (
                <tr key={r.channel} className="border-b border-white/[0.03]">
                  <td className="py-2 pr-4 text-cream">{r.channel}</td>
                  <td className="py-2 pr-4 text-cream">{r.total}</td>
                  <td className="py-2 pr-4 text-red-400">{r.noResult}</td>
                  <td className={`py-2 pr-4 font-semibold ${r.rate > 25 ? "text-red-400" : r.rate > 15 ? "text-yellow-400" : "text-cream"}`}>
                    {r.rate}%
                  </td>
                </tr>
              ))}
              {noResultRanking.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-gray-text/40">
                    No no-result data yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
