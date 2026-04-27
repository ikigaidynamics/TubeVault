import { createClient } from "@supabase/supabase-js";
import { Info } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ---------------------------------------------------------------------------
// Human-readable labels for upgrade triggers
// ---------------------------------------------------------------------------

const TRIGGER_LABELS: Record<string, { label: string; tip: string }> = {
  transcripts: {
    label: "Transcript view limit",
    tip: "User wanted to see full transcript, hit the paywall.",
  },
  channel_limit: {
    label: "Channel selection limit",
    tip: "User tried to add a channel beyond their tier\u2019s limit.",
  },
  search_limit: {
    label: "Daily search limit",
    tip: "User exhausted their daily question quota.",
  },
  manual: {
    label: "Direct pricing visit",
    tip: "User clicked an Upgrade button without triggering a wall.",
  },
  direct: {
    label: "Direct /pricing URL",
    tip: "User navigated to /pricing directly.",
  },
};

function triggerLabel(key: string): { label: string; tip: string } {
  return TRIGGER_LABELS[key] ?? { label: key, tip: "" };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

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

  const registeredSteps: FunnelStep[] = [
    { label: "Signups", count: signups },
    { label: "Total Searches", count: searchCount },
    {
      label: "Upgrade Clicks",
      count: upgradeClicks,
      tip: "Clicks on any \u2018Upgrade\u2019 button \u2014 see trigger breakdown below for context.",
    },
    { label: "Paid Subscriptions", count: subscriptions },
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

  const anonSteps: FunnelStep[] = [
    { label: "Anonymous sessions", count: anonSessions.size },
    { label: "Hit trial limit (3 questions)", count: limitHitSessions.size },
    {
      label: "Signed up (within 24 h)",
      count: convertedFromLimit,
      tip: "Anonymous users who created an account within 24 hours of their first session.",
    },
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

  return (
    <div className="space-y-8" id="funnel">
      <div>
        <h2 className="text-lg font-semibold text-cream">Conversion Funnel (30d)</h2>
        <p className="mt-1 text-xs text-gray-text/60">
          Aggregate funnel for all users in the last 30 days.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {renderFunnel(
          registeredSteps,
          "Registered Users",
          "Users who completed signup.",
        )}
        {renderFunnel(
          anonSteps,
          "Anonymous Trial Users",
          "Visitors using the free demo without signing up.",
        )}
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
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 sm:col-span-2 lg:col-span-2">
            <p className="text-xs font-medium text-cream">What triggered upgrade clicks</p>
            <p className="mt-0.5 mb-3 text-[11px] text-gray-text/50">
              Which friction point caused the user to click {"\u201C"}Upgrade{"\u201D"}? Higher = stronger conversion driver.
            </p>
            <div className="space-y-1.5">
              {triggers.map(([key, count]) => {
                const { label, tip } = triggerLabel(key);
                return (
                  <div key={key} className="flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1 text-cream">
                      {label}
                      {tip && (
                        <span title={tip}>
                          <Info size={14} className="text-gray-text/60" />
                        </span>
                      )}
                    </span>
                    <span className="font-semibold text-cream">{count}</span>
                  </div>
                );
              })}
            </div>
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

// ---------------------------------------------------------------------------
// Funnel renderer
// ---------------------------------------------------------------------------

interface FunnelStep {
  label: string;
  count: number;
  tip?: string;
}

function renderFunnel(steps: FunnelStep[], title: string, titleTip: string) {
  const max = steps.length > 0 ? Math.max(...steps.map((s) => s.count), 1) : 1;
  return (
    <div>
      <h3 className="mb-3 text-sm font-medium text-cream">
        <span className="inline-flex items-center gap-1" title={titleTip}>
          {title} <Info size={14} className="text-gray-text/60" />
        </span>
      </h3>
      <div className="space-y-2">
        {steps.map((step, i) => {
          const prevCount = i > 0 ? steps[i - 1].count : step.count;
          const dropoff = prevCount > 0 && i > 0
            ? Math.round(((prevCount - step.count) / prevCount) * 100)
            : null;
          const widthPct = Math.max(8, Math.round((step.count / max) * 100));

          return (
            <div key={step.label} className="flex items-center gap-4">
              <div className="w-48 shrink-0 text-right text-xs text-gray-text">
                {step.tip ? (
                  <span className="inline-flex items-center justify-end gap-1" title={step.tip}>
                    {step.label} <Info size={12} className="text-gray-text/60" />
                  </span>
                ) : (
                  step.label
                )}
              </div>
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
