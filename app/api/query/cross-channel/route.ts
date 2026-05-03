import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import OpenAI from "openai";
import { TIER_LIMITS, type SubscriptionTier } from "@/lib/tiers";
import { getCollectionsByCategory } from "@/lib/categories";
import { getCachedCollections } from "@/lib/collections-cache";
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

const PER_CHANNEL_TIMEOUT_MS = 25000;
const BATCH_SIZE = 3;
const GLOBAL_TOP_SOURCES = 15;
const RELEVANCE_THRESHOLD_RATIO = 0.5; // 50% of max score

const CROSS_CHANNEL_SYSTEM_PROMPT = `You are synthesizing answers from multiple YouTube creators about the user's question. Follow these rules strictly:

1. ALWAYS mention each creator BY NAME when referencing their content. Example: "Andrew Huberman recommends...", "According to Dr. Eric Berg..."
2. Include SHORT direct quotes from the transcripts when impactful. Format: Creator Name says: "exact short quote". Keep quotes under 20 words.
3. Structure your response to COMPARE expert opinions:
   - Start with what the experts AGREE on
   - Then highlight key DIFFERENCES in their recommendations
   - Note any unique insights from individual creators
4. Only discuss creators whose content is actually relevant to the question. If only 2 out of 10 channels have relevant content, only mention those 2.
5. Be comprehensive but concise. Aim for 200-400 words.
6. End with a brief summary: "In summary, [X] experts discussed this topic. They agree on [Y] but differ on [Z]."

Format example:
"Multiple experts have weighed in on [topic]:

Andrew Huberman emphasizes [point], noting: "[short quote]". He specifically recommends [action].

Dr. Eric Berg takes a similar approach but adds [different angle]. He says: "[short quote]".

Bryan Johnson differs from both, focusing on [alternative]. His protocol involves [specifics].

**Where they agree:** All three emphasize [common ground].
**Where they differ:** Huberman focuses on [X] while Berg prioritizes [Y]."`;

// Lazy-init OpenAI client (only if key is set)
let openaiClient: OpenAI | null = null;
function getOpenAI(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) return null;
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

async function queryInBatches<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  batchSize: number
): Promise<PromiseSettledResult<R>[]> {
  const results: PromiseSettledResult<R>[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(batch.map(fn));
    results.push(...batchResults);
  }
  return results;
}

interface ChannelResult {
  collection: Collection;
  answer: string;
  sources: CrossChannelSource[];
}

/**
 * Build a synthesis prompt from the per-channel answers and top sources.
 */
function buildSynthesisContext(
  question: string,
  channelResults: ChannelResult[],
  topSources: CrossChannelSource[]
): string {
  let context = `User question: "${question}"\n\n`;
  context += "=== PER-CHANNEL ANSWERS ===\n\n";

  for (const cr of channelResults) {
    if (!cr.answer) continue;
    context += `--- ${cr.collection.display_name} ---\n`;
    context += `${cr.answer}\n\n`;
  }

  context += "=== TOP TRANSCRIPT EXCERPTS ===\n\n";

  for (const src of topSources) {
    context += `[${src.collection_display_name}] (score: ${src.relevance_score.toFixed(3)})\n`;
    const text = src.text || src.snippet || "";
    if (text) {
      context += `"${text.slice(0, 300)}"\n`;
    }
    context += "\n";
  }

  return context;
}

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
  const { question, category, channels, history } = body as {
    question: string;
    category?: string;
    channels?: string[];
    history?: { role: string; content: string }[];
  };

  if (!question?.trim()) {
    return NextResponse.json(
      { error: "Question is required" },
      { status: 400 }
    );
  }

  const startTime = Date.now();

  // Fetch collections (from shared cache)
  let collections: Collection[];
  try {
    collections = await getCachedCollections();
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch channels" },
      { status: 502 }
    );
  }

  // Filter hidden
  collections = collections.filter((c) => !HIDDEN.includes(c.name));

  // Filter by explicit channel list (takes priority) or category fallback
  if (channels && channels.length > 0) {
    const channelSet = new Set(channels);
    collections = collections.filter((c) => channelSet.has(c.name));
  } else if (category && category !== "All") {
    collections = getCollectionsByCategory(collections, category);
  }

  if (collections.length === 0) {
    return NextResponse.json(
      { error: "No channels found for the selected filters" },
      { status: 404 }
    );
  }

  // Query collections in batches
  const results = await queryInBatches(
    collections,
    async (col) => {
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
    },
    BATCH_SIZE
  );

  // ── Collect all sources into a single pool ──
  const allSources: CrossChannelSource[] = [];
  const channelResults: ChannelResult[] = [];

  for (const result of results) {
    if (result.status !== "fulfilled" || !result.value) continue;

    const { collection, data } = result.value;
    const logoUrl = collection.logo
      ? collection.logo.startsWith("/")
        ? `https://mindvault.ikigai-dynamics.com${collection.logo}`
        : collection.logo
      : null;

    const channelSources: CrossChannelSource[] = [];

    if (data.sources && Array.isArray(data.sources)) {
      for (const src of data.sources) {
        const score = src.relevance_score ?? src.score ?? 0;
        const crossSrc: CrossChannelSource = {
          ...src,
          collection_name: collection.name,
          collection_display_name: collection.display_name,
          collection_logo: logoUrl,
          relevance_score: score,
        };
        allSources.push(crossSrc);
        channelSources.push(crossSrc);
      }
    }

    if (data.answer && channelSources.length > 0) {
      channelResults.push({
        collection,
        answer: data.answer,
        sources: channelSources,
      });
    }
  }

  // ── RELEVANCE FILTERING ──
  // Dynamic threshold: 50% of the best score
  let filteredSources = allSources;
  if (allSources.length > 0) {
    const maxScore = Math.max(...allSources.map((s) => s.relevance_score));
    const threshold = maxScore * RELEVANCE_THRESHOLD_RATIO;
    filteredSources = allSources.filter((s) => s.relevance_score >= threshold);
  }

  // Sort by relevance and take global top N
  filteredSources.sort((a, b) => b.relevance_score - a.relevance_score);
  const topSources = filteredSources.slice(0, GLOBAL_TOP_SOURCES);

  // Filter channel results to only include channels with sources in topSources
  const relevantChannelNames = new Set(topSources.map((s) => s.collection_name));
  const relevantChannelResults = channelResults.filter((cr) =>
    relevantChannelNames.has(cr.collection.name)
  );

  // ── GROUP BY CHANNEL (only relevant ones) ──
  const groupMap = new Map<string, ChannelSourceGroup>();
  for (const src of topSources) {
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

  // ── LLM SYNTHESIS ──
  let synthesizedAnswer = "";
  const openai = getOpenAI();

  if (openai && relevantChannelResults.length > 0) {
    try {
      const context = buildSynthesisContext(
        question,
        relevantChannelResults,
        topSources
      );

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: CROSS_CHANNEL_SYSTEM_PROMPT },
          { role: "user", content: context },
        ],
        max_tokens: 1200,
        temperature: 0.4,
      });

      synthesizedAnswer = completion.choices[0]?.message?.content || "";
    } catch {
      // LLM synthesis failed — fall back to best single-channel answer
    }
  }

  // Fallback: pick best single-channel answer
  if (!synthesizedAnswer) {
    let bestAnswer = "";
    let bestScore = -1;
    for (const cr of relevantChannelResults) {
      const topScore = cr.sources[0]?.relevance_score ?? 0;
      if (topScore > bestScore) {
        bestScore = topScore;
        bestAnswer = cr.answer;
      }
    }
    synthesizedAnswer = bestAnswer;
  }

  const queryTimeMs = Date.now() - startTime;

  const response: CrossChannelResponse = {
    answer:
      synthesizedAnswer ||
      "No relevant results found across the selected channels.",
    channelGroups,
    allSources: topSources,
    channelsQueried: collections.length,
    queryTimeMs,
  };

  return NextResponse.json(response);
}
