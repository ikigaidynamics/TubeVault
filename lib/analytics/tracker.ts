import { hasAnalyticsConsent } from "@/lib/consent";

export type AnalyticsEvent =
  | "search"
  | "search_no_result"
  | "timestamp_click"
  | "channel_view"
  | "channel_request"
  | "upgrade_click"
  | "signup"
  | "subscription_start"
  | "page_view";

export interface TrackOptions {
  channelId?: string;
  query?: string;
  resultCount?: number;
  metadata?: Record<string, unknown>;
}

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function getSessionId(): string {
  if (typeof window === "undefined") return "server";
  const ua = navigator.userAgent || "";
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  // Sync hash — same approach as the existing fingerprint system but
  // we only need a lightweight session id, not a crypto-grade fingerprint.
  let h = 0;
  const raw = `${ua}|${date}`;
  for (let i = 0; i < raw.length; i++) {
    h = (Math.imul(31, h) + raw.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}

export async function track(
  event: AnalyticsEvent,
  options: TrackOptions = {}
): Promise<void> {
  // GDPR/TTDSG: no tracking without explicit analytics consent
  if (!hasAnalyticsConsent()) return;

  try {
    const queryHash = options.query ? await sha256(options.query) : undefined;

    const body: Record<string, unknown> = {
      event_type: event,
      session_id: getSessionId(),
      channel_id: options.channelId,
      query_hash: queryHash,
      query_raw: options.query,
      result_count: options.resultCount,
      metadata: options.metadata,
    };

    // Fire-and-forget
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => {});

    // Auto-send search_no_result when resultCount is explicitly 0
    if (event === "search" && options.resultCount === 0) {
      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, event_type: "search_no_result" }),
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // Never throw
  }
}
