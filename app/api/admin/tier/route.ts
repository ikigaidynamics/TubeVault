import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const VALID_TIERS = ["free", "starter", "pro", "premium", "creator"];

async function getUser() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// GET: return current tier
export async function GET() {
  const user = await getUser();
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data } = await supabaseAdmin
    .from("subscriptions")
    .select("tier")
    .eq("user_id", user.id)
    .single();

  return NextResponse.json({ tier: data?.tier || "free", email: user.email });
}

// POST: set tier for admin user
export async function POST(request: Request) {
  const user = await getUser();
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { tier } = await request.json();
  if (!tier || !VALID_TIERS.includes(tier)) {
    return NextResponse.json({ error: "invalid tier" }, { status: 400 });
  }

  // Upsert subscription row
  const { error } = await supabaseAdmin
    .from("subscriptions")
    .upsert(
      { user_id: user.id, tier, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ tier, email: user.email });
}
