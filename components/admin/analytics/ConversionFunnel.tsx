import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function ConversionFunnel() {
  const since = new Date(Date.now() - 30 * 86_400_000).toISOString();

  const { data: events } = await supabase
    .from("analytics_events")
    .select("event_type, session_id, user_id, metadata, created_at")
    .in("event_type", ["signup", "search", "upgrade_click", "subscription_start", "channel_request"])
    .gte("created_at", since)
    .limit(10000);

  const rows = events ?? [];

  // Registered user funnel
  const signups = rows.filter((e) => e.event_type === "signup").length;
  const searchCount = rows.filter((e) => e.event_type === "search").length;
  const upgradeClicks = rows.filter((e) => e.event_type === "upgrade_click").length;
  const subscriptions = rows.filter((e) => e.event_type === "subscription_start").length;

  const registeredSteps = [
    { label: "Signups", count: signups },
    { label: "Searches", count: searchCount },
    { label: "Upgrade Clicks", count: upgradeClicks },
    { label: "Subscriptions", count: subscriptions },
  ];

  // Anonymous trial funnel
  const anonSessions = new Set(
    rows.filter((e) => e.event_type === "search" && !e.user_id).map((e) => e.session_id)
  );
  const limitHitSessions = new Set(
    rows.filter((e) => {
      if (e.event_type !== "upgrade_click") return false;
      const meta = e.metadata as Record<string, unknown> | null;
      return meta?.trigger === "search_limit" && !e.user_id;
    }).map((e) => e.session_id)
  );

  // Sessions that hit limit then signed up within 24h
  const signupTimes = rows
    .filter((e) => e.event_type === "signup")
    .map((e) => ({ session: e.session_id, time: new Date(e.created_at).getTime() }));
  const limitHitTimes = rows
    .filter((e) => e.event_type === "upgrade_click" && limitHitSessions.has(e.session_id))
    .map((e) => ({ session: e.session_id, time: new Date(e.created_at).getTime() }));

  let convertedFromLimit = 0;
  for (const lh of limitHitTimes) {
    if (signupTimes.some((s) => s.time > lh.time && s.time - lh.time < 86_400_000)) {
      convertedFromLimit++;
    }
  }

  const anonSteps = [
    { label: "Anonymous sessions", count: anonSessions.size },
    { label: "Hit trial limit", count: limitHitSessions.size },
    { label: "Signed up (within 24h)", count: convertedFromLimit },
  ];

  // Upgrade trigger breakdown
  const triggerCounts = new Map<string, number>();
  for (const e of rows) {
    if (e.event_type !== "upgrade_click") continue;
    const meta = e.metadata as Record<string, unknown> | null;
    const trigger = (meta?.trigger as string) ?? "unknown";
    triggerCounts.set(trigger, (triggerCounts.get(trigger) ?? 0) + 1);
  }
  const triggers = Array.from(triggerCounts.entries()).sort((a, b) => b[1] - a[1]);

  // Avg time from signup to subscription
  const signupByUser = new Map<string, number>();
  const subByUser = new Map<string, number>();
  for (const e of rows) {
    if (e.event_type === "signup" && e.user_id) signupByUser.set(e.user_id, new Date(e.created_at).getTime());
    if (e.event_type === "subscription_start" && e.user_id) subByUser.set(e.user_id, new Date(e.created_at).getTime());
  }
  const conversionDays: number[] = [];
  subByUser.forEach((subTime, uid) => {
    const signupTime = signupByUser.get(uid);
    if (signupTime) conversionDays.push((subTime - signupTime) / 86_400_000);
  });
  const avgConversion = conversionDays.length > 0
    ? (conversionDays.reduce((a, b) => a + b, 0) / conversionDays.length).toFixed(1)
    : null;

  // Channel requests
  const requests = rows.filter((e) => e.event_type === "channel_request");
  const byUrl = new Map<string, number>();
  for (const r of requests) {
    const url = (r.metadata as Record<string, unknown>)?.requested_channel_url as string ?? "unknown";
    byUrl.set(url, (byUrl.get(url) ?? 0) + 1);
  }
  const requestRanking = Array.from(byUrl.entries()).sort((a, b) => b[1] - a[1]);

  function renderFunnel(steps: { label: string; count: number }[], title: string) {
    const max = steps.length > 0 ? Math.max(...steps.map((s) => s.count), 1) : 1;
    return (
      <div>
        <h3 className="mb-3 text-sm font-medium text-cream">{title}</h3>
        <div className="space-y-2">
          {steps.map((step, i) => {
            const prevCount = i > 0 ? steps[i - 1].count : step.count;
            const dropoff = prevCount > 0 && i > 0
              ? Math.round(((prevCount - step.count) / prevCount) * 100)
              : null;
            const widthPct = Math.max(8, Math.round((step.count / max) * 100));

            return (
              <div key={step.label} className="flex items-center gap-4">
                <div className="w-40 shrink-0 text-right text-xs text-gray-text">{step.label}</div>
                <div className="flex-1">
                  <div
                    className="flex h-9 items-center rounded-lg bg-primary/20 px-3 text-sm font-semibold text-cream"
                    style={{ width: `${widthPct}%` }}
                  >
                    {step.count}
                    {dropoff !== null && dropoff > 0 && dropoff < 100 && (
                      <span className="ml-2 text-xs font-normal text-red-400/70">-{dropoff}%</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8" id="funnel">
      <h2 className="text-lg font-semibold text-cream">Conversion Funnel (30d)</h2>

      <div className="grid gap-8 lg:grid-cols-2">
        {renderFunnel(registeredSteps, "Registered Users")}
        {renderFunnel(anonSteps, "Anonymous Trial Users")}
      </div>

      {/* Extra metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {avgConversion && (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <p className="text-xs text-gray-text/60">Avg signup-to-subscription</p>
            <p className="mt-1 text-2xl font-bold text-cream">{avgConversion}<span className="text-sm font-normal text-gray-text"> days</span></p>
          </div>
        )}
        {triggers.length > 0 && (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <p className="mb-2 text-xs text-gray-text/60">Upgrade trigger breakdown</p>
            {triggers.map(([trigger, count]) => (
              <div key={trigger} className="flex items-center justify-between text-xs">
                <span className="text-cream">{trigger}</span>
                <span className="text-gray-text">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {requestRanking.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-medium text-cream">Requested Channels (not yet indexed)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-left text-xs text-gray-text/50">
                  <th className="pb-2 pr-4">Channel URL</th>
                  <th className="pb-2 pr-4">Requests</th>
                </tr>
              </thead>
              <tbody>
                {requestRanking.map(([url, count]) => (
                  <tr key={url} className="border-b border-white/[0.03]">
                    <td className="py-2 pr-4 text-cream">
                      <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{url}</a>
                    </td>
                    <td className="py-2 pr-4 font-semibold text-cream">{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
