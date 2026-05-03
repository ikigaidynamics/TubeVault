import type { Collection } from "./api";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://mindvault.ikigai-dynamics.com/api";

const HIDDEN = [
  "industrie_und_handelskammer_cottbus",
  "btu_cottbus_senftenberg",
  "doctor_sethi",
];

// In-memory cache with 5-minute TTL
let cachedData: Collection[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

// Persistent disk cache path (survives PM2 restarts)
const DISK_CACHE_PATH = join(process.cwd(), ".cache", "collections.json");

function readDiskCache(): Collection[] | null {
  try {
    const raw = readFileSync(DISK_CACHE_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeDiskCache(data: Collection[]) {
  try {
    mkdirSync(join(process.cwd(), ".cache"), { recursive: true });
    writeFileSync(DISK_CACHE_PATH, JSON.stringify(data));
  } catch {
    // non-critical
  }
}

// Background refresh (fire-and-forget, never blocks the response)
let refreshInProgress = false;

function backgroundRefresh() {
  if (refreshInProgress) return;
  refreshInProgress = true;

  fetch(`${API_BASE_URL}/collections`, {
    signal: AbortSignal.timeout(300_000),
  })
    .then((res) => (res.ok ? res.json() : Promise.reject()))
    .then((all: Collection[]) => {
      const filtered = all.filter((c) => !HIDDEN.includes(c.name));
      cachedData = filtered;
      cacheTimestamp = Date.now();
      writeDiskCache(filtered);
    })
    .catch(() => {})
    .finally(() => {
      refreshInProgress = false;
    });
}

/**
 * Get collections with three-tier caching:
 * 1. In-memory (instant, 5 min TTL)
 * 2. Disk cache (survives restarts, serves stale + background refresh)
 * 3. API fetch (fallback, 10s timeout for fast path, background for slow APIs)
 */
export async function getCachedCollections(): Promise<Collection[]> {
  const now = Date.now();

  // Tier 1: in-memory cache (fresh)
  if (cachedData && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedData;
  }

  // Tier 2: disk cache (serve immediately, refresh in background)
  const diskData = readDiskCache();
  if (diskData && diskData.length > 0) {
    cachedData = diskData;
    cacheTimestamp = now;
    backgroundRefresh();
    return diskData;
  }

  // Tier 3: fresh API fetch (first-ever load, no disk cache)
  // Use a short timeout — if the API is cold-starting, we can't wait 3+ minutes
  try {
    const res = await fetch(`${API_BASE_URL}/collections`, {
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error("API error");
    const all: Collection[] = await res.json();
    const filtered = all.filter((c) => !HIDDEN.includes(c.name));
    cachedData = filtered;
    cacheTimestamp = now;
    writeDiskCache(filtered);
    return filtered;
  } catch {
    // API is cold-starting or unreachable — kick off background refresh
    backgroundRefresh();
    throw new Error("Collections not yet available");
  }
}
