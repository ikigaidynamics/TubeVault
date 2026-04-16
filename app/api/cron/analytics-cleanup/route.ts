import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { aggregateDaily } from "@/lib/analytics/aggregate";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  // Auth: Bearer token must match CRON_SECRET
  const auth = request.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const results = {
    cleaned_raw_queries: 0,
    aggregated_buckets: 0,
    deleted_old_events: 0,
  };

  // 1. Null out raw queries older than 7 days (GDPR)
  const { error: cleanupError } = await supabase.rpc("cleanup_raw_queries");
  if (cleanupError) {
    console.warn("cleanup_raw_queries error:", cleanupError.message);
  } else {
    results.cleaned_raw_queries = 1; // function ran successfully
  }

  // 2. Aggregate yesterday into analytics_daily
  const yesterday = new Date(Date.now() - 86_400_000)
    .toISOString()
    .slice(0, 10);
  results.aggregated_buckets = await aggregateDaily(supabase, yesterday);

  // 3. Delete events older than 30 days (raw data no longer needed)
  const cutoff = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const { count, error: deleteError } = await supabase
    .from("analytics_events")
    .delete({ count: "exact" })
    .lt("created_at", cutoff);

  if (deleteError) {
    console.warn("delete old events error:", deleteError.message);
  } else {
    results.deleted_old_events = count ?? 0;
  }

  return NextResponse.json(results);
}
