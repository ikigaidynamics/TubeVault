const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://mindvault.ikigai-dynamics.com/api";

export interface Source {
  title: string;
  timestamp: string | null;
  url: string | null;
  snippet: string;
  text: string;
  video_id: string;
}

export interface HistoryMessage {
  role: "user" | "assistant";
  content: string;
}

export interface QueryResponse {
  answer: string;
  sources: Source[];
}

export interface Collection {
  name: string;
  display_name: string;
  description: string;
  video_count: number;
  point_count: number;
  logo: string | null;
  visible_on_homepage: boolean;
}

/**
 * Resolve a collection logo URL to a usable image src.
 * Paths starting with /channels/ are local TubeVault assets.
 * Other / paths are on the mindvault backend.
 * YouTube avatar URLs with =s0 are capped to 240px.
 */
export function resolveLogoUrl(logo: string | null | undefined): string | null {
  if (!logo) return null;
  if (logo.startsWith("/channels/")) return logo;
  if (logo.startsWith("/")) return `https://mindvault.ikigai-dynamics.com${logo}`;
  if (logo.includes("yt3.googleusercontent.com") && logo.endsWith("=s0")) {
    return logo.slice(0, -2) + "s240";
  }
  return logo;
}

export interface CrossChannelSource extends Source {
  collection_name: string;
  collection_display_name: string;
  collection_logo: string | null;
  relevance_score: number;
}

export interface ChannelSourceGroup {
  collection_name: string;
  display_name: string;
  logo: string | null;
  sources: CrossChannelSource[];
}

export interface CrossChannelResponse {
  answer: string;
  channelGroups: ChannelSourceGroup[];
  allSources: CrossChannelSource[];
  channelsQueried: number;
  queryTimeMs: number;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  crossChannelGroups?: ChannelSourceGroup[];
  channelsQueried?: number;
  queryTimeMs?: number;
}

export interface ConversationSummary {
  id: string;
  title: string;
  channel_name: string | null;
  is_cross_channel: boolean;
  message_count: number;
  updated_at: string;
}

export interface ConversationFull extends ConversationSummary {
  cross_channel_selection: string[];
  messages: Message[];
}

export async function fetchCollections(): Promise<Collection[]> {
  const res = await fetch(`${API_BASE_URL}/collections`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error("Failed to fetch collections");
  return res.json();
}

export async function queryCollection(
  collectionName: string,
  question: string,
  history: HistoryMessage[] = []
): Promise<QueryResponse> {
  const res = await fetch(`${API_BASE_URL}/query/${collectionName}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, history }),
  });
  if (!res.ok) throw new Error("Failed to query collection");
  return res.json();
}

export async function checkHealth(): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE_URL}/health`);
  if (!res.ok) throw new Error("API health check failed");
  return res.json();
}

export function formatTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}
