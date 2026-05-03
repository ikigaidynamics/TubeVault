import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { TIER_LIMITS, type SubscriptionTier } from "@/lib/tiers";
import { getCollectionsByCategory } from "@/lib/categories";
import type {
  Collection,
  CrossChannelSource,
  ChannelSourceGroup,
  CrossChannelResponse,
} from "@/lib/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://mindvault.ikigai-dynamics.com/api";

const HIDDEN = [
  "industrie_und_handelskammer_cottbus",
  "btu_cottbus_senftenberg",
  "doctor_sethi",
  "personal_communications",
  "3blue1brown",
];

const PER_CHANNEL_TIMEOUT_MS = 8000;

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createServerClient(
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check tier
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("tier")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  const tier: SubscriptionTier = (sub?.tier as SubscriptionTier) || "free";
  if (!TIER_LIMITS[tier].hasCrossChannelSearch) {
    return NextResponse.json(
      { error: "Cross-channel search requires Premium" },
      { status: 403 }
    );
  }

  const body = await req.json();
  const { question, category, history } = body as {
    question: string;
    category?: string;
    history?: { role: string; content: string }[];
  };

  if (!question?.trim()) {
    return NextResponse.json(
      { error: "Question is required" },
      { status: 400 }
    );
  }

  const startTime = Date.now();

  // Fetch collections
  let collections: Collection[];
  try {
    const colRes = await fetch(`${API_BASE_URL}/collections`);
    if (!colRes.ok) throw new Error("Failed to fetch collections");
    collections = await colRes.json();
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch channels" },
      { status: 502 }
    );
  }

  // Filter hidden
  collections = collections.filter((c) => !HIDDEN.includes(c.name));

  // Filter by category
  if (category && category !== "All") {
    collections = getCollectionsByCategory(collections, category);
  }

  if (collections.length === 0) {
    return NextResponse.json(
      { error: "No channels found for the selected category" },
      { status: 404 }
    );
  }

  // Query each collection in parallel
  const results = await Promise.allSettled(
    collections.map(async (col) => {
      const controller = new AbortController();
      const timeout = setTimeout(
        () => controller.abort(),
        PER_CHANNEL_TIMEOUT_MS
      );

      try {
        const res = await fetch(`${API_BASE_URL}/query/${col.name}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question,
            history: history || [],
          }),
          signal: controller.signal,
        });

        if (!res.ok) return null;

        const data = await res.json();
        return { collection: col, data };
      } catch {
        return null;
      } finally {
        clearTimeout(timeout);
      }
    })
  );

  // Merge sources from all successful results
  const allSources: CrossChannelSource[] = [];
  let bestAnswer = "";
  let bestScore = -1;

  for (const result of results) {
    if (result.status !== "fulfilled" || !result.value) continue;

    const { collection, data } = result.value;
    const logoUrl = collection.logo
      ? collection.logo.startsWith("/")
        ? `https://mindvault.ikigai-dynamics.com${collection.logo}`
        : collection.logo
      : null;

    if (data.sources && Array.isArray(data.sources)) {
      for (const src of data.sources) {
        const score = src.relevance_score ?? src.score ?? 0;
        allSources.push({
          ...src,
          collection_name: collection.name,
          collection_display_name: collection.display_name,
          collection_logo: logoUrl,
          relevance_score: score,
        });
      }
    }

    // Pick the answer from the channel with the highest-scoring source
    const topScore =
      data.sources?.[0]?.relevance_score ??
      data.sources?.[0]?.score ??
      0;
    if (data.answer && topScore > bestScore) {
      bestScore = topScore;
      bestAnswer = data.answer;
    }
  }

  // Sort all sources by relevance
  allSources.sort((a, b) => b.relevance_score - a.relevance_score);

  // Group by channel
  const groupMap = new Map<string, ChannelSourceGroup>();
  for (const src of allSources) {
    if (!groupMap.has(src.collection_name)) {
      groupMap.set(src.collection_name, {
        collection_name: src.collection_name,
        display_name: src.collection_display_name,
        logo: src.collection_logo,
        sources: [],
      });
    }
    groupMap.get(src.collection_name)!.sources.push(src);
  }

  // Sort groups by their best source score
  const channelGroups = Array.from(groupMap.values()).sort(
    (a, b) =>
      (b.sources[0]?.relevance_score ?? 0) -
      (a.sources[0]?.relevance_score ?? 0)
  );

  const queryTimeMs = Date.now() - startTime;

  const response: CrossChannelResponse = {
    answer:
      bestAnswer ||
      "No relevant results found across the selected channels.",
    channelGroups,
    allSources: allSources.slice(0, 30), // Cap at 30 total sources
    channelsQueried: collections.length,
    queryTimeMs,
  };

  return NextResponse.json(response);
}
