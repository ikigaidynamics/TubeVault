import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function ConversionFunnel() {
  const since = new Date(Date.now() - 30 * 86_400_000).toISOString();

  const { data: events } = await supabase
    .from("analytics_events")
    .select("event_type, metadata")
    .in("event_type", ["signup", "search", "upgrade_click", "subscription_start", "channel_request"])
    .gte("created_at", since)
    .limit(5000);

  const rows = events ?? [];

  const signups = rows.filter((e) => e.event_type === "signup").length;
  const firstSearches = rows.filter((e) => e.event_type === "search").length;
  const upgradeClicks = rows.filter((e) => e.event_type === "upgrade_click").length;
  const subscriptions = rows.filter((e) => e.event_type === "subscription_start").length;

  const steps = [
    { label: "Signups", count: signups },
    { label: "First Search", count: firstSearches },
    { label: "Upgrade Clicks", count: upgradeClicks },
    { label: "Subscriptions", count: subscriptions },
  ];

  // Channel requests
  const requests = rows.filter((e) => e.event_type === "channel_request");
  const byUrl = new Map<string, number>();
  for (const r of requests) {
    const url = (r.metadata as Record<string, unknown>)?.requested_channel_url as string ?? "unknown";
    byUrl.set(url, (byUrl.get(url) ?? 0) + 1);
  }
  const requestRanking = Array.from(byUrl.entries())
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-4 text-lg font-semibold text-cream">Conversion Funnel (30d)</h2>
        <div className="space-y-2">
          {steps.map((step, i) => {
            const prevCount = i > 0 ? steps[i - 1].count : step.count;
            const dropoff = prevCount > 0 && i > 0
              ? Math.round(((prevCount - step.count) / prevCount) * 100)
              : null;
            const widthPct = steps[0].count > 0
              ? Math.max(8, Math.round((step.count / steps[0].count) * 100))
              : 100;

            return (
              <div key={step.label} className="flex items-center gap-4">
                <div className="w-32 shrink-0 text-right text-sm text-gray-text">
                  {step.label}
                </div>
                <div className="flex-1">
                  <div
                    className="flex h-10 items-center rounded-lg bg-primary/20 px-3 text-sm font-semibold text-cream transition-all"
                    style={{ width: `${widthPct}%` }}
                  >
                    {step.count}
                    {dropoff !== null && dropoff > 0 && dropoff < 100 && (
                      <span className="ml-2 text-xs font-normal text-red-400/70">
                        -{dropoff}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {requestRanking.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-cream">
            Requested Channels (not yet indexed)
          </h2>
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
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {url}
                      </a>
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
