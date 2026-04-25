import { createClient } from "@supabase/supabase-js";
import { MiniLineChart } from "./MiniChart";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function SearchVolume() {
  const since = new Date(Date.now() - 30 * 86_400_000).toISOString();

  const { data: events } = await supabase
    .from("analytics_events")
    .select("created_at")
    .eq("event_type", "search")
    .gte("created_at", since);

  const rows = events ?? [];

  // Group by date
  const byDate = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10);
    byDate.set(d, 0);
  }
  for (const row of rows) {
    const d = row.created_at.slice(0, 10);
    byDate.set(d, (byDate.get(d) ?? 0) + 1);
  }

  const chartData = Array.from(byDate.entries()).map(([date, value]) => ({ date, value }));
  const total = rows.length;

  // Trend: last 7d vs previous 7d
  const now = Date.now();
  const last7 = rows.filter((r) => new Date(r.created_at).getTime() > now - 7 * 86_400_000).length;
  const prev7 = rows.filter((r) => {
    const t = new Date(r.created_at).getTime();
    return t > now - 14 * 86_400_000 && t <= now - 7 * 86_400_000;
  }).length;
  const trendPct = prev7 > 0 ? Math.round(((last7 - prev7) / prev7) * 100) : last7 > 0 ? 100 : 0;

  // Peak day
  let peakDay = "";
  let peakCount = 0;
  byDate.forEach((count, date) => {
    if (count > peakCount) { peakCount = count; peakDay = date; }
  });

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
      <div className="mb-1 flex items-baseline justify-between">
        <h2 className="text-lg font-semibold text-cream">Search Volume</h2>
        <span className="text-2xl font-bold text-cream">{total}</span>
      </div>
      <p className="mb-4 text-xs text-gray-text/60">
        {trendPct > 0 && <span className="text-primary">&#8593; {trendPct}%</span>}
        {trendPct < 0 && <span className="text-red-400">&#8595; {Math.abs(trendPct)}%</span>}
        {trendPct === 0 && <span>&#8212;</span>}
        {" "}vs previous 7 days
      </p>
      <MiniLineChart data={chartData} />
      {peakCount > 0 && (
        <p className="mt-3 text-[11px] text-gray-text/50">
          Peak: <span className="text-cream">{peakDay}</span> with <span className="text-cream">{peakCount}</span> searches
        </p>
      )}
    </div>
  );
}
