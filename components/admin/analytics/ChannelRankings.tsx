import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function ChannelRankings() {
  const since = new Date(Date.now() - 7 * 86_400_000).toISOString();

  const { data: events } = await supabase
    .from("analytics_events")
    .select("event_type, channel_id, user_id, session_id")
    .in("event_type", ["search", "timestamp_click"])
    .gte("created_at", since)
    .not("channel_id", "is", null)
    .limit(5000);

  const rows = events ?? [];

  const byChannel = new Map<
    string,
    { searches: number; users: Set<string>; clicks: number }
  >();

  for (const row of rows) {
    const ch = row.channel_id!;
    const existing = byChannel.get(ch);
    const uid = row.user_id ?? row.session_id;
    if (existing) {
      if (row.event_type === "search") existing.searches++;
      if (row.event_type === "timestamp_click") existing.clicks++;
      existing.users.add(uid);
    } else {
      const users = new Set<string>();
      users.add(uid);
      byChannel.set(ch, {
        searches: row.event_type === "search" ? 1 : 0,
        users,
        clicks: row.event_type === "timestamp_click" ? 1 : 0,
      });
    }
  }

  const rankings = Array.from(byChannel.entries())
    .map(([ch, d]) => ({
      channel: ch,
      searches: d.searches,
      uniqueUsers: d.users.size,
      clicks: d.clicks,
    }))
    .sort((a, b) => b.searches - a.searches);

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-cream">Channel Rankings (7d)</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] text-left text-xs text-gray-text/50">
              <th className="pb-2 pr-4">#</th>
              <th className="pb-2 pr-4">Channel</th>
              <th className="pb-2 pr-4">Searches</th>
              <th className="pb-2 pr-4">Unique Users</th>
              <th className="pb-2 pr-4">Timestamp Clicks</th>
            </tr>
          </thead>
          <tbody>
            {rankings.map((r, i) => (
              <tr key={r.channel} className="border-b border-white/[0.03]">
                <td className="py-2 pr-4 text-gray-text/40">{i + 1}</td>
                <td className="py-2 pr-4 font-medium text-cream">{r.channel}</td>
                <td className="py-2 pr-4 text-cream">{r.searches}</td>
                <td className="py-2 pr-4 text-cream">{r.uniqueUsers}</td>
                <td className="py-2 pr-4 text-primary">{r.clicks}</td>
              </tr>
            ))}
            {rankings.length === 0 && (
              <tr>
                <td colSpan={5} className="py-4 text-center text-gray-text/40">
                  No channel data yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
