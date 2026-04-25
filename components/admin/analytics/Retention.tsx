import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function Retention() {
  const since = new Date(Date.now() - 60 * 86_400_000).toISOString();

  // Get signups with dates
  const { data: signupEvents } = await supabase
    .from("analytics_events")
    .select("user_id, created_at")
    .eq("event_type", "signup")
    .gte("created_at", since)
    .not("user_id", "is", null);

  // Get all search events by user
  const { data: searchEvents } = await supabase
    .from("analytics_events")
    .select("user_id, session_id, created_at")
    .eq("event_type", "search")
    .gte("created_at", since)
    .limit(10000);

  const signups = signupEvents ?? [];
  const searches = searchEvents ?? [];

  // Build per-user search dates
  const userSearchDates = new Map<string, Set<string>>();
  for (const s of searches) {
    const uid = s.user_id;
    if (!uid) continue;
    const date = s.created_at.slice(0, 10);
    const existing = userSearchDates.get(uid);
    if (existing) existing.add(date);
    else userSearchDates.set(uid, new Set([date]));
  }

  // Retention cohort
  let day1 = 0, day7 = 0, day30 = 0;
  const totalSignups = signups.length;

  for (const signup of signups) {
    const uid = signup.user_id;
    if (!uid) continue;
    const signupDate = new Date(signup.created_at);
    const dates = userSearchDates.get(uid);
    if (!dates) continue;

    const d1 = new Date(signupDate.getTime() + 1 * 86_400_000).toISOString().slice(0, 10);
    const d7 = new Date(signupDate.getTime() + 7 * 86_400_000).toISOString().slice(0, 10);
    const d30 = new Date(signupDate.getTime() + 30 * 86_400_000).toISOString().slice(0, 10);

    if (dates.has(d1)) day1++;
    if (dates.has(d7)) day7++;
    if (dates.has(d30)) day30++;
  }

  const cohort = [
    { label: "Signed up", count: totalSignups, pct: 100 },
    { label: "Day 1 return", count: day1, pct: totalSignups > 0 ? Math.round((day1 / totalSignups) * 100) : 0 },
    { label: "Day 7 return", count: day7, pct: totalSignups > 0 ? Math.round((day7 / totalSignups) * 100) : 0 },
    { label: "Day 30 return", count: day30, pct: totalSignups > 0 ? Math.round((day30 / totalSignups) * 100) : 0 },
  ];

  // Average searches per session
  const sessionSearches = new Map<string, number>();
  for (const s of searches) {
    sessionSearches.set(s.session_id, (sessionSearches.get(s.session_id) ?? 0) + 1);
  }
  const sessionCounts = Array.from(sessionSearches.values());
  const avgPerSession = sessionCounts.length > 0
    ? (sessionCounts.reduce((a, b) => a + b, 0) / sessionCounts.length).toFixed(1)
    : "0";

  // Average session length (first to last event per session)
  const sessionTimes = new Map<string, { min: number; max: number }>();
  for (const s of searches) {
    const t = new Date(s.created_at).getTime();
    const existing = sessionTimes.get(s.session_id);
    if (existing) {
      if (t < existing.min) existing.min = t;
      if (t > existing.max) existing.max = t;
    } else {
      sessionTimes.set(s.session_id, { min: t, max: t });
    }
  }
  const durations = Array.from(sessionTimes.values())
    .map((t) => (t.max - t.min) / 60000)
    .filter((d) => d > 0);
  const avgDuration = durations.length > 0
    ? (durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(1)
    : "0";

  // Power users (>10 searches in last 7d)
  const last7 = Date.now() - 7 * 86_400_000;
  const recentByUser = new Map<string, number>();
  for (const s of searches) {
    if (!s.user_id || new Date(s.created_at).getTime() < last7) continue;
    recentByUser.set(s.user_id, (recentByUser.get(s.user_id) ?? 0) + 1);
  }
  let powerUsers = 0;
  recentByUser.forEach((count) => { if (count > 10) powerUsers++; });

  return (
    <div className="space-y-8" id="retention">
      <h2 className="text-lg font-semibold text-cream">Retention</h2>

      {totalSignups === 0 ? (
        <p className="text-sm text-gray-text/40">No signup data yet</p>
      ) : (
        <>
          {/* Cohort funnel */}
          <div className="space-y-2">
            {cohort.map((step) => (
              <div key={step.label} className="flex items-center gap-4">
                <div className="w-28 shrink-0 text-right text-sm text-gray-text">{step.label}</div>
                <div className="flex-1">
                  <div
                    className="flex h-9 items-center rounded-lg bg-primary/20 px-3 text-sm font-semibold text-cream"
                    style={{ width: `${Math.max(step.pct, 8)}%` }}
                  >
                    {step.count} <span className="ml-1.5 text-xs font-normal text-gray-text">({step.pct}%)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Engagement stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <p className="text-xs text-gray-text/60">Avg searches/session</p>
              <p className="mt-1 text-2xl font-bold text-cream">{avgPerSession}</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <p className="text-xs text-gray-text/60">Avg session length</p>
              <p className="mt-1 text-2xl font-bold text-cream">{avgDuration}<span className="text-sm font-normal text-gray-text"> min</span></p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <p className="text-xs text-gray-text/60">Power users (7d)</p>
              <p className="mt-1 text-2xl font-bold text-primary">{powerUsers}</p>
              <p className="text-[10px] text-gray-text/40">&gt;10 searches</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
