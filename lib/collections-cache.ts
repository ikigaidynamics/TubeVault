import type { Collection } from "./api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://mindvault.ikigai-dynamics.com/api";

const HIDDEN = [
  "industrie_und_handelskammer_cottbus",
  "btu_cottbus_senftenberg",
  "doctor_sethi",
];

// In-memory cache with 5-minute TTL (shared across all server-side callers)
let cachedData: Collection[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Get collections with server-side in-memory caching.
 * Use this from API routes that need the collections list.
 */
export async function getCachedCollections(): Promise<Collection[]> {
  const now = Date.now();

  if (cachedData && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedData;
  }

  const res = await fetch(`${API_BASE_URL}/collections`, {
    signal: AbortSignal.timeout(60000),
  });

  if (!res.ok) {
    if (cachedData) return cachedData; // serve stale
    throw new Error("Failed to fetch collections");
  }

  const all: Collection[] = await res.json();
  const filtered = all.filter((c) => !HIDDEN.includes(c.name));

  cachedData = filtered;
  cacheTimestamp = now;

  return filtered;
}
