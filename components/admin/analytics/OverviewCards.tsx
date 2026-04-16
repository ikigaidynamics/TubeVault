import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface Props {
  days: number;
}

export async function OverviewCards({ days }: Props) {
  const since = new Date(Date.now() - days * 86_400_000).toISOString();

  const { data: events } = await supabase
    .from("analytics_events")
    .select("event_type, user_id, session_id, result_count")
    .gte("created_at", since);

  const rows = events ?? [];

  const searches = rows.filter((e) => e.event_type === "search");
  const noResults = rows.filter((e) => e.event_type === "search_no_result");
  const upgrades = rows.filter((e) => e.event_type === "upgrade_click");
  const signups = rows.filter((e) => e.event_type === "signup");

  const registeredUsers = new Set(rows.filter((e) => e.user_id).map((e) => e.user_id)).size;
  const anonymousSessions = new Set(rows.filter((e) => !e.user_id).map((e) => e.session_id)).size;

  const noResultRate = searches.length > 0
    ? Math.round((noResults.length / searches.length) * 100)
    : 0;

  let noResultColor = "text-cream";
  if (noResultRate > 25) noResultColor = "text-red-400";
  else if (noResultRate > 15) noResultColor = "text-yellow-400";

  const cards = [
    { label: "Total Searches", value: String(searches.length) },
    {
      label: "Unique Users",
      value: `${registeredUsers} registered`,
      sub: `${anonymousSessions} anonymous`,
    },
    { label: "No-Result Rate", value: `${noResultRate}%`, color: noResultColor },
    { label: "Upgrade Clicks", value: String(upgrades.length) },
    { label: "New Signups", value: String(signups.length) },
  ];

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-cream">
        Overview
        <span className="ml-2 text-sm font-normal text-gray-text">last {days} days</span>
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
          >
            <p className="text-xs text-gray-text/60">{card.label}</p>
            <p className={`mt-1 text-2xl font-bold ${card.color ?? "text-cream"}`}>
              {card.value}
            </p>
            {"sub" in card && card.sub && (
              <p className="mt-0.5 text-xs text-gray-text/50">{card.sub}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
