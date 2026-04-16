import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Aggregate yesterday's analytics_events into analytics_daily.
 * Returns the number of rows upserted.
 */
export async function aggregateDaily(
  supabase: SupabaseClient,
  date: string // YYYY-MM-DD
): Promise<number> {
  // Fetch all events for the given date
  const dayStart = `${date}T00:00:00Z`;
  const dayEnd = `${date}T23:59:59.999Z`;

  const { data: events, error } = await supabase
    .from("analytics_events")
    .select("event_type, channel_id, user_id, session_id")
    .gte("created_at", dayStart)
    .lte("created_at", dayEnd);

  if (error) {
    console.warn("aggregate fetch error:", error.message);
    return 0;
  }
  if (!events || events.length === 0) return 0;

  // Group by (event_type, channel_id)
  const buckets = new Map<
    string,
    { event_type: string; channel_id: string | null; users: Set<string>; sessions: Set<string>; count: number }
  >();

  for (const e of events) {
    const key = `${e.event_type}|${e.channel_id ?? "_null"}`;
    const existing = buckets.get(key);
    if (existing) {
      existing.count++;
      if (e.user_id) existing.users.add(e.user_id);
      existing.sessions.add(e.session_id);
    } else {
      const users = new Set<string>();
      if (e.user_id) users.add(e.user_id);
      const sessions = new Set<string>();
      sessions.add(e.session_id);
      buckets.set(key, {
        event_type: e.event_type,
        channel_id: e.channel_id ?? null,
        users,
        sessions,
        count: 1,
      });
    }
  }

  // Upsert into analytics_daily
  const rows = Array.from(buckets.values()).map((b) => ({
    date,
    event_type: b.event_type,
    channel_id: b.channel_id,
    total_count: b.count,
    unique_users: b.users.size,
    unique_sessions: b.sessions.size,
  }));

  const { error: upsertError } = await supabase
    .from("analytics_daily")
    .upsert(rows, { onConflict: "date,channel_id,event_type" });

  if (upsertError) {
    console.warn("aggregate upsert error:", upsertError.message);
    return 0;
  }

  return rows.length;
}
