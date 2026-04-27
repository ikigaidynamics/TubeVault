import { createClient } from "@supabase/supabase-js";
import { Info } from "lucide-react";

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

  // (b) UTM breakdown — separate columns per parameter
  const utmKey = (s: string, m: string, c: string) => `${s}||${m}||${c}`;
  const utmMap = new Map<string, { source: string; medium: string; campaign: string; views: number; signups: number }>();
  for (const e of events) {
    if (!e.utm_source) continue;
    const source = e.utm_source;
    const medium = e.utm_medium || "";
    const campaign = e.utm_campaign || "";
    const key = utmKey(source, medium, campaign);
    const u = utmMap.get(key) || { source, medium, campaign, views: 0, signups: 0 };
    if (e.event_type === "page_view") u.views++;
    if (e.event_type === "signup_completed") u.signups++;
    utmMap.set(key, u);
  }
  const utmRows = Array.from(utmMap.values())
    .sort((a, b) => b.views - a.views)
    .slice(0, 20);
  const utmAllBasic = utmRows.length > 0 && utmRows.every((r) => !r.medium && !r.campaign);

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

  // (d) First-touch attribution sources
  const sourceMap = new Map<string, { views: number; signups: number; paid: number }>();
  for (const e of events) {
    let source = "direct";
    if (e.utm_source) {
      source = e.utm_source;
    } else if (e.referrer) {
      try { source = new URL(e.referrer).hostname.replace("www.", ""); } catch { source = e.referrer; }
    }
    const s = sourceMap.get(source) || { views: 0, signups: 0, paid: 0 };
    if (e.event_type === "page_view") s.views++;
    if (e.event_type === "signup_completed") s.signups++;
    if (e.event_type === "subscription_started") s.paid++;
    sourceMap.set(source, s);
  }
  const sourceRows = Array.from(sourceMap.entries())
    .sort((a, b) => b[1].signups - a[1].signups)
    .slice(0, 15);

  return (
    <div className="space-y-10" id="attribution">
      <h2 className="text-lg font-semibold text-cream">Attribution ({days}d)</h2>

      {/* (a) Funnel by variant */}
      <div>
        <h3 className="text-sm font-medium text-cream">Funnel by Variant</h3>
        <p className="mt-1 mb-3 text-xs text-gray-text/60">
          Conversion through the funnel, broken down by which landing page variant the user first saw.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-left text-xs text-gray-text/50">
                <th className="pb-2 pr-4">Landing Variant</th>
                <th className="pb-2 pr-4">Page Views</th>
                <th className="pb-2 pr-4">Demo Questions</th>
                <th className="pb-2 pr-4">Signups</th>
                <th className="pb-2 pr-4">Paid Conversions</th>
                <th className="pb-2 pr-4">
                  <span className="inline-flex items-center gap-1" title="Share of visitors who interacted with the demo (asked their own question).">
                    Engagement % <Info size={14} className="text-gray-text/60" />
                  </span>
                </th>
                <th className="pb-2 pr-4">
                  <span className="inline-flex items-center gap-1" title="Signups divided by Page Views.">
                    Signup Rate <Info size={14} className="text-gray-text/60" />
                  </span>
                </th>
                <th className="pb-2 pr-4">
                  <span className="inline-flex items-center gap-1" title="Paid conversions divided by Page Views.">
                    Paid Rate <Info size={14} className="text-gray-text/60" />
                  </span>
                </th>
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
                  <td className="py-2 pr-4 text-gray-text">{v.views > 0 ? Math.round((v.paid / v.views) * 100) : 0}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* (b) UTM breakdown */}
      {utmRows.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-cream">UTM Breakdown</h3>
          <p className="mt-1 mb-3 text-xs text-gray-text/60">
            UTM parameters are tags appended to URLs (like ?utm_source=reddit) to track marketing
            sources. The values shown are set by you when creating campaign links &mdash; only
            sessions with at least one UTM parameter set appear here.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-left text-xs text-gray-text/50">
                  <th className="pb-2 pr-4">
                    <span className="inline-flex items-center gap-1" title="Where the traffic originated (e.g. 'reddit', 'youtube', 'newsletter').">
                      Source <Info size={14} className="text-gray-text/60" />
                    </span>
                  </th>
                  <th className="pb-2 pr-4">
                    <span className="inline-flex items-center gap-1" title="Type of marketing channel (e.g. 'post', 'email', 'social').">
                      Medium <Info size={14} className="text-gray-text/60" />
                    </span>
                  </th>
                  <th className="pb-2 pr-4">
                    <span className="inline-flex items-center gap-1" title="Specific campaign name (e.g. 'launch', 'creator-outreach').">
                      Campaign <Info size={14} className="text-gray-text/60" />
                    </span>
                  </th>
                  <th className="pb-2 pr-4">Page Views</th>
                  <th className="pb-2 pr-4">Signups</th>
                </tr>
              </thead>
              <tbody>
                {utmRows.map((r) => (
                  <tr key={`${r.source}|${r.medium}|${r.campaign}`} className="border-b border-white/[0.03]">
                    <td className="py-2 pr-4 text-cream">{r.source}</td>
                    <td className="py-2 pr-4">
                      {r.medium ? <span className="text-cream">{r.medium}</span> : <span className="text-gray-text/40">{"\u2014"}</span>}
                    </td>
                    <td className="py-2 pr-4">
                      {r.campaign ? <span className="text-cream">{r.campaign}</span> : <span className="text-gray-text/40">{"\u2014"}</span>}
                    </td>
                    <td className="py-2 pr-4 text-cream">{r.views}</td>
                    <td className="py-2 pr-4 text-cream">{r.signups}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {utmAllBasic && (
            <p className="mt-3 text-xs text-gray-text/40">
              No marketing campaigns tracked yet. Add UTM parameters to your promotional links
              (e.g. tubevault.io?utm_source=reddit&amp;utm_medium=post&amp;utm_campaign=launch)
              to see traffic attribution here.
            </p>
          )}
        </div>
      )}

      {/* (c) Top referrers */}
      <div>
        <h3 className="text-sm font-medium text-cream">Top Referrers</h3>
        <p className="mt-1 mb-3 text-xs text-gray-text/60">
          External domains that linked to TubeVault. {"\u201C"}Direct{"\u201D"} means no referrer (typed URL, bookmark, or referrer blocked by browser).
        </p>
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

      {/* (d) First-Touch Attribution Sources */}
      <div>
        <h3 className="text-sm font-medium text-cream">First-Touch Attribution Sources</h3>
        <p className="mt-1 mb-3 text-xs text-gray-text/60">
          Where each user first arrived from. If they later returned directly or via different
          sources, they are still credited to their first touch. This shows which marketing
          channels actually bring converting users.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-left text-xs text-gray-text/50">
                <th className="pb-2 pr-4">
                  <span className="inline-flex items-center gap-1" title="First marketing source the user encountered (or 'direct' if none).">
                    Source <Info size={14} className="text-gray-text/60" />
                  </span>
                </th>
                <th className="pb-2 pr-4">
                  <span className="inline-flex items-center gap-1" title="Total visits from this source.">
                    Page Views <Info size={14} className="text-gray-text/60" />
                  </span>
                </th>
                <th className="pb-2 pr-4">
                  <span className="inline-flex items-center gap-1" title="Signups attributed to this source via first-touch.">
                    Signups <Info size={14} className="text-gray-text/60" />
                  </span>
                </th>
                <th className="pb-2 pr-4">
                  <span className="inline-flex items-center gap-1" title="Signups divided by Page Views for this source.">
                    Conv. Rate <Info size={14} className="text-gray-text/60" />
                  </span>
                </th>
                <th className="pb-2 pr-4">
                  <span className="inline-flex items-center gap-1" title="Paid subscriptions attributed to this source.">
                    Paid <Info size={14} className="text-gray-text/60" />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sourceRows.map(([source, d]) => (
                <tr key={source} className="border-b border-white/[0.03]">
                  <td className="py-2 pr-4 font-medium text-cream">{source}</td>
                  <td className="py-2 pr-4 text-cream">{d.views}</td>
                  <td className="py-2 pr-4 text-cream">{d.signups}</td>
                  <td className="py-2 pr-4 text-gray-text">{d.views > 0 ? Math.round((d.signups / d.views) * 100) : 0}%</td>
                  <td className="py-2 pr-4 text-primary">{d.paid}</td>
                </tr>
              ))}
              {sourceRows.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-gray-text/40">
                    No attribution data yet
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
