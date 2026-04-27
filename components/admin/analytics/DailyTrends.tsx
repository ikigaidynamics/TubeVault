import { createClient } from "@supabase/supabase-js";
import { MiniLineChart } from "./MiniChart";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DailyTrends() {
  const since = new Date(Date.now() - 14 * 86_400_000).toISOString();

  const { data: events } = await supabase
    .from("analytics_events")
    .select("event_type, session_id, created_at")
    .gte("created_at", since)
    .limit(20000);

  const rows = events ?? [];

  // Initialize 14-day date buckets
  const days: string[] = [];
  for (let i = 13; i >= 0; i--) {
    days.push(new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10));
  }

  const sessionsByDay = new Map<string, Set<string>>();
  const signupsByDay = new Map<string, number>();
  const searchesByDay = new Map<string, number>();
  const upgradesByDay = new Map<string, number>();

  for (const d of days) {
    sessionsByDay.set(d, new Set());
    signupsByDay.set(d, 0);
    searchesByDay.set(d, 0);
    upgradesByDay.set(d, 0);
  }

  for (const row of rows) {
    const d = row.created_at.slice(0, 10);
    if (!sessionsByDay.has(d)) continue;

    if (row.session_id) sessionsByDay.get(d)!.add(row.session_id);
    if (row.event_type === "signup") signupsByDay.set(d, (signupsByDay.get(d) ?? 0) + 1);
    if (row.event_type === "search") searchesByDay.set(d, (searchesByDay.get(d) ?? 0) + 1);
    if (row.event_type === "upgrade_click") upgradesByDay.set(d, (upgradesByDay.get(d) ?? 0) + 1);
  }

  const toChart = (map: Map<string, number>) =>
    days.map((d) => ({ date: d.slice(5), value: map.get(d) ?? 0 }));

  const sessionData = days.map((d) => ({ date: d.slice(5), value: sessionsByDay.get(d)?.size ?? 0 }));

  const charts = [
    { label: "Sessions", data: sessionData, color: "#65ae4c" },
    { label: "Searches", data: toChart(searchesByDay), color: "#65ae4c" },
    { label: "Signups", data: toChart(signupsByDay), color: "#60a5fa" },
    { label: "Upgrade Clicks", data: toChart(upgradesByDay), color: "#f59e0b" },
  ];

  return (
    <div id="trends">
      <h2 className="text-lg font-semibold text-cream">Daily Trends</h2>
      <p className="mt-1 text-xs text-gray-text/60">Last 14 days, day-by-day breakdown.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {charts.map((chart) => (
          <div key={chart.label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <p className="mb-2 text-xs text-gray-text/60">{chart.label}</p>
            <MiniLineChart data={chart.data} color={chart.color} />
          </div>
        ))}
      </div>
    </div>
  );
}
