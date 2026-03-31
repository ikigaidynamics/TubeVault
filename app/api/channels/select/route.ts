import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { TIER_LIMITS, type SubscriptionTier } from "@/lib/tiers";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function getSupabase() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component
          }
        },
      },
    }
  );
}

// GET: return current selection, lock status, and whether user can change
export async function GET() {
  const supabase = getSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("tier, selected_channels, channels_locked_until")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  const tier: SubscriptionTier = (sub?.tier as SubscriptionTier) || "free";
  const maxChannels = TIER_LIMITS[tier].maxChannels;
  const selectedChannels: string[] = sub?.selected_channels || [];
  const lockedUntil: string | null = sub?.channels_locked_until || null;
  const canChange = !lockedUntil || new Date(lockedUntil) < new Date();

  return NextResponse.json({
    tier,
    maxChannels: maxChannels === Infinity ? -1 : maxChannels,
    selectedChannels,
    lockedUntil,
    canChange,
  });
}

// POST { channels: string[] }: replace all selected channels, set 30-day lock
export async function POST(request: Request) {
  const supabase = getSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { channels } = await request.json();
  if (!Array.isArray(channels)) {
    return NextResponse.json({ error: "channels must be an array" }, { status: 400 });
  }

  // Get current subscription
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("tier, channels_locked_until")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  const tier: SubscriptionTier = (sub?.tier as SubscriptionTier) || "free";
  const maxChannels = TIER_LIMITS[tier].maxChannels;

  // Pro+ don't need channel selection
  if (maxChannels === Infinity) {
    return NextResponse.json({
      selectedChannels: [],
      lockedUntil: null,
      canChange: true,
      maxChannels: -1,
    });
  }

  // Check lock
  const lockedUntil = sub?.channels_locked_until;
  if (lockedUntil && new Date(lockedUntil) > new Date()) {
    return NextResponse.json(
      {
        error: "Channels are locked",
        lockedUntil,
        canChange: false,
      },
      { status: 403 }
    );
  }

  // Validate count
  if (channels.length > maxChannels) {
    return NextResponse.json(
      { error: `Max ${maxChannels} channels for ${tier} tier` },
      { status: 400 }
    );
  }

  // Deduplicate
  const uniqueChannels = Array.from(new Set<string>(channels));

  // Set 30-day lock
  const newLockedUntil = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000
  ).toISOString();

  await supabaseAdmin
    .from("subscriptions")
    .upsert(
      {
        user_id: user.id,
        selected_channels: uniqueChannels,
        channels_locked_until: newLockedUntil,
        tier,
        status: "active",
      },
      { onConflict: "user_id" }
    );

  return NextResponse.json({
    selectedChannels: uniqueChannels,
    lockedUntil: newLockedUntil,
    canChange: false,
    maxChannels,
  });
}
