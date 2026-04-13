import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";

const TRIAL_LIMIT = 3;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function computeFingerprint(request: Request): string {
  const ua = request.headers.get("user-agent") || "";
  const lang = request.headers.get("accept-language") || "";
  const encoding = request.headers.get("accept-encoding") || "";
  const screen = request.headers.get("x-screen-info") || "";

  const raw = `${ua}|${lang}|${encoding}|${screen}`;
  return createHash("sha256").update(raw).digest("hex");
}

// In-memory fallback if Supabase table doesn't exist yet
const memoryStore = new Map<string, number>();

async function getUsed(hash: string): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from("anonymous_trials")
    .select("questions_used")
    .eq("fingerprint_hash", hash)
    .single();

  if (error && error.code === "PGRST116") {
    // No row found — 0 used
    return memoryStore.get(hash) || 0;
  }
  if (error) {
    // Table probably doesn't exist — fall back to memory
    console.warn("anonymous_trials table error:", error.message);
    return memoryStore.get(hash) || 0;
  }

  return data?.questions_used || 0;
}

async function setUsed(hash: string, count: number): Promise<void> {
  // Always update memory store
  memoryStore.set(hash, count);

  const { error: upsertError } = await supabaseAdmin
    .from("anonymous_trials")
    .upsert(
      {
        fingerprint_hash: hash,
        questions_used: count,
        last_seen: new Date().toISOString(),
      },
      { onConflict: "fingerprint_hash" }
    );

  if (upsertError) {
    console.warn("anonymous_trials upsert error:", upsertError.message);
  }
}

// GET: check remaining trial questions
export async function GET(request: Request) {
  const hash = computeFingerprint(request);
  const used = await getUsed(hash);
  const remaining = Math.max(0, TRIAL_LIMIT - used);

  return NextResponse.json({ remaining, limit: TRIAL_LIMIT, used });
}

// DELETE: reset trial questions (dev convenience)
export async function DELETE(request: Request) {
  const hash = computeFingerprint(request);
  memoryStore.delete(hash);

  await supabaseAdmin
    .from("anonymous_trials")
    .delete()
    .eq("fingerprint_hash", hash);

  return NextResponse.json({ remaining: TRIAL_LIMIT, limit: TRIAL_LIMIT, used: 0 });
}

// POST: increment trial question count
export async function POST(request: Request) {
  const hash = computeFingerprint(request);
  const used = await getUsed(hash);

  if (used >= TRIAL_LIMIT) {
    return NextResponse.json(
      { error: "Trial limit reached", remaining: 0, limit: TRIAL_LIMIT },
      { status: 429 }
    );
  }

  const newCount = used + 1;
  await setUsed(hash, newCount);

  return NextResponse.json({
    remaining: Math.max(0, TRIAL_LIMIT - newCount),
    limit: TRIAL_LIMIT,
    used: newCount,
  });
}
