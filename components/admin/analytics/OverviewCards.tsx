import { createClient } from "@supabase/supabase-js";
import { Info } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface Props {
  days: number;
}

export async function OverviewCards({ days }: Props) {
  const since = new Date(Date.now() - days * 86_400_000).toISOString();

  const [{ data: events }, { data: attrEvents }] = await Promise.all([
    supabase
      .from("analytics_events")
      .select("event_type, user_id, session_id, result_count")
      .gte("created_at", since),
    supabase
      .from("landing_attribution")
      .select("event_type")
      .eq("event_type", "demo_question")
      .gte("created_at", since),
  ]);

  const rows = events ?? [];

  const searches = rows.filter((e) => e.event_type === "search");
  const noResults = rows.filter((e) => e.event_type === "search_no_result");
  const upgrades = rows.filter((e) => e.event_type === "upgrade_click");
  const signups = rows.filter((e) => e.event_type === "signup");

  const registeredUsers = new Set(rows.filter((e) => e.user_id).map((e) => e.user_id)).size;
  const anonymousSessions = new Set(rows.filter((e) => !e.user_id).map((e) => e.session_id)).size;
  const uniqueUsers = registeredUsers + anonymousSessions;

  const noResultRate = searches.length > 0
    ? Math.round((noResults.length / searches.length) * 100)
    : 0;

  let noResultColor = "text-cream";
  if (noResultRate > 25) noResultColor = "text-red-400";
  else if (noResultRate > 15) noResultColor = "text-yellow-400";

  // New metrics
  const avgSearches = uniqueUsers > 0
    ? (searches.length / uniqueUsers).toFixed(1)
    : "\u2014";

  const demoQuestions = (attrEvents ?? []).length;
  const demoToSignup = demoQuestions > 0
    ? `${Math.round((signups.length / demoQuestions) * 100)}%`
    : "\u2014";

  const cards: {
    label: string;
    value: string;
    sub?: string;
    color?: string;
    tip?: string;
  }[] = [
    { label: "Total Searches", value: String(searches.length) },
    {
      label: "Unique Users",
      value: `${registeredUsers} registered`,
      sub: `${anonymousSessions} anonymous`,
    },
    { label: "No-Result Rate", value: `${noResultRate}%`, color: noResultColor },
    { label: "Upgrade Clicks", value: String(upgrades.length) },
    { label: "New Signups", value: String(signups.length) },
    {
      label: "Avg Searches per User",
      value: avgSearches,
      tip: "Average number of searches per unique user. Higher = better engagement.",
    },
    {
      label: "Demo-to-Signup Rate",
      value: demoToSignup,
      tip: "Share of visitors who, after asking a demo question, went on to sign up. Strongest conversion signal.",
    },
  ];

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-cream">
        Overview
        <span className="ml-2 text-sm font-normal text-gray-text">last {days} days</span>
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
          >
            <p className="text-xs text-gray-text/60">
              {card.tip ? (
                <span className="inline-flex items-center gap-1" title={card.tip}>
                  {card.label} <Info size={14} className="text-gray-text/60" />
                </span>
              ) : (
                card.label
              )}
            </p>
            <p className={`mt-1 text-2xl font-bold ${card.color ?? "text-cream"}`}>
              {card.value}
            </p>
            {card.sub && (
              <p className="mt-0.5 text-xs text-gray-text/50">{card.sub}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
