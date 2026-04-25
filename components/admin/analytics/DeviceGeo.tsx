import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DeviceGeo() {
  const since = new Date(Date.now() - 30 * 86_400_000).toISOString();

  const { data: events } = await supabase
    .from("analytics_events")
    .select("metadata")
    .gte("created_at", since)
    .limit(5000);

  const rows = events ?? [];

  // Device breakdown
  const devices = { mobile: 0, desktop: 0, tablet: 0 };
  const countries = new Map<string, number>();

  for (const row of rows) {
    const meta = row.metadata as Record<string, unknown> | null;
    if (!meta) continue;

    const dt = (meta.device_type as string) ?? "desktop";
    if (dt === "mobile") devices.mobile++;
    else if (dt === "tablet") devices.tablet++;
    else devices.desktop++;

    const c = (meta.country as string) ?? "Unknown";
    countries.set(c, (countries.get(c) ?? 0) + 1);
  }

  const totalDevices = Math.max(devices.mobile + devices.desktop + devices.tablet, 1);
  const deviceCards = [
    { icon: "\uD83D\uDCF1", label: "Mobile", count: devices.mobile, pct: Math.round((devices.mobile / totalDevices) * 100) },
    { icon: "\uD83D\uDCBB", label: "Desktop", count: devices.desktop, pct: Math.round((devices.desktop / totalDevices) * 100) },
    { icon: "\uD83D\uDCDF", label: "Tablet", count: devices.tablet, pct: Math.round((devices.tablet / totalDevices) * 100) },
  ];

  const topCountries = Array.from(countries.entries())
    .filter(([c]) => c !== "Unknown")
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  const maxCountry = topCountries.length > 0 ? topCountries[0][1] : 1;

  return (
    <div className="space-y-8" id="devices">
      <h2 className="text-lg font-semibold text-cream">Devices &amp; Geography (30d)</h2>

      {rows.length === 0 ? (
        <p className="text-sm text-gray-text/40">No data yet</p>
      ) : (
        <>
          {/* Device cards */}
          <div className="grid grid-cols-3 gap-4">
            {deviceCards.map((d) => (
              <div key={d.label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
                <p className="text-2xl">{d.icon}</p>
                <p className="mt-1 text-xs text-gray-text/60">{d.label}</p>
                <p className="mt-1 text-xl font-bold text-cream">{d.pct}%</p>
                <div className="mx-auto mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                  <div className="h-full rounded-full bg-primary/60" style={{ width: `${d.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Top countries */}
          {topCountries.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-medium text-cream">
                Top Countries
                <span className="ml-2 text-[10px] font-normal text-gray-text/40">Based on browser language settings</span>
              </h3>
              <div className="space-y-2">
                {topCountries.map(([country, count]) => (
                  <div key={country} className="flex items-center gap-3">
                    <span className="w-28 shrink-0 truncate text-xs text-cream">{country}</span>
                    <div className="h-5 flex-1 overflow-hidden rounded bg-white/[0.04]">
                      <div
                        className="h-full rounded bg-primary/30"
                        style={{ width: `${Math.round((count / maxCountry) * 100)}%` }}
                      />
                    </div>
                    <span className="w-10 shrink-0 text-right text-xs text-gray-text">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
