import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface Props {
  days: number;
}

export async function Attribution({ days }: Props) {
  const since = new Date(Date.now() - days * 86_400_000).toISOString();

  const { data: rows } = await supabase
    .from("landing_attribution")
    .select("variant_slug, event_type, utm_source, utm_medium, utm_campaign, referrer, session_id, user_id")
    .gte("created_at", since)
    .limit(10000);

  const events = rows ?? [];

  if (events.length === 0) {
    return (
      <div id="attribution">
        <h2 className="text-lg font-semibold text-cream">Attribution ({days}d)</h2>
        <p className="mt-4 text-sm text-gray-text/40">
          No attribution data yet. Visit the landing page to start tracking.
        </p>
      </div>
    );
  }

  // (a) Funnel by variant
  const variants = new Map<string, { views: number; demos: number; signups: number; paid: number }>();
  for (const e of events) {
    const slug = e.variant_slug || "default";
    const v = variants.get(slug) || { views: 0, demos: 0, signups: 0, paid: 0 };
    if (e.event_type === "page_view") v.views++;
    if (e.event_type === "demo_question") v.demos++;
    if (e.event_type === "signup_completed") v.signups++;
    if (e.event_type === "subscription_started") v.paid++;
    variants.set(slug, v);
  }
  const variantRows = Array.from(variants.entries()).sort((a, b) => b[1].views - a[1].views);

  // (b) UTM breakdown
  const utmMap = new Map<string, { views: number; signups: number }>();
  for (const e of events) {
    if (!e.utm_source) continue;
    const key = [e.utm_source, e.utm_medium || "-", e.utm_campaign || "-"].join(" / ");
    const u = utmMap.get(key) || { views: 0, signups: 0 };
    if (e.event_type === "page_view") u.views++;
    if (e.event_type === "signup_completed") u.signups++;
    utmMap.set(key, u);
  }
  const utmRows = Array.from(utmMap.entries())
    .sort((a, b) => b[1].views - a[1].views)
    .slice(0, 20);

  // (c) Top referrers
  const refMap = new Map<string, { views: number; signups: number }>();
  for (const e of events) {
    let domain = "Direct";
    if (e.referrer) {
      try { domain = new URL(e.referrer).hostname.replace("www.", ""); } catch { domain = e.referrer; }
    }
    const r = refMap.get(domain) || { views: 0, signups: 0 };
    if (e.event_type === "page_view") r.views++;
    if (e.event_type === "signup_completed") r.signups++;
    refMap.set(domain, r);
  }
  const refRows = Array.from(refMap.entries())
    .sort((a, b) => b[1].views - a[1].views)
    .slice(0, 10);

  return (
    <div className="space-y-10" id="attribution">
      <h2 className="text-lg font-semibold text-cream">Attribution ({days}d)</h2>

      {/* (a) Funnel by variant */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-cream">Funnel by Variant</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-left text-xs text-gray-text/50">
                <th className="pb-2 pr-4">Variant</th>
                <th className="pb-2 pr-4">Page Views</th>
                <th className="pb-2 pr-4">Demo Qs</th>
                <th className="pb-2 pr-4">Signups</th>
                <th className="pb-2 pr-4">Paid</th>
                <th className="pb-2 pr-4">Engagement</th>
                <th className="pb-2 pr-4">Signup Rate</th>
                <th className="pb-2 pr-4">Paid Rate</th>
              </tr>
            </thead>
            <tbody>
              {variantRows.map(([slug, v]) => (
                <tr key={slug} className="border-b border-white/[0.03]">
                  <td className="py-2 pr-4 font-medium text-cream">{slug}</td>
                  <td className="py-2 pr-4 text-cream">{v.views}</td>
                  <td className="py-2 pr-4 text-cream">{v.demos}</td>
                  <td className="py-2 pr-4 text-cream">{v.signups}</td>
                  <td className="py-2 pr-4 text-primary">{v.paid}</td>
                  <td className="py-2 pr-4 text-gray-text">{v.views > 0 ? Math.round((v.demos / v.views) * 100) : 0}%</td>
                  <td className="py-2 pr-4 text-gray-text">{v.views > 0 ? Math.round((v.signups / v.views) * 100) : 0}%</td>
                  <td className="py-2 pr-4 text-gray-text">{v.signups > 0 ? Math.round((v.paid / v.signups) * 100) : 0}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* (b) UTM breakdown */}
      {utmRows.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-medium text-cream">UTM Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-left text-xs text-gray-text/50">
                  <th className="pb-2 pr-4">Source / Medium / Campaign</th>
                  <th className="pb-2 pr-4">Page Views</th>
                  <th className="pb-2 pr-4">Signups</th>
                </tr>
              </thead>
              <tbody>
                {utmRows.map(([key, d]) => (
                  <tr key={key} className="border-b border-white/[0.03]">
                    <td className="py-2 pr-4 text-cream">{key}</td>
                    <td className="py-2 pr-4 text-cream">{d.views}</td>
                    <td className="py-2 pr-4 text-cream">{d.signups}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* (c) Top referrers */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-cream">Top Referrers</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-left text-xs text-gray-text/50">
                <th className="pb-2 pr-4">Referrer</th>
                <th className="pb-2 pr-4">Page Views</th>
                <th className="pb-2 pr-4">Signups</th>
              </tr>
            </thead>
            <tbody>
              {refRows.map(([domain, d]) => (
                <tr key={domain} className="border-b border-white/[0.03]">
                  <td className="py-2 pr-4 text-cream">{domain}</td>
                  <td className="py-2 pr-4 text-cream">{d.views}</td>
                  <td className="py-2 pr-4 text-cream">{d.signups}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
