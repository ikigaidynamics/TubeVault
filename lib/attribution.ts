/**
 * Landing page attribution tracking.
 *
 * Uses its OWN persistent session_id (localStorage UUID) — completely
 * independent from the daily-rotating analytics_events session_id.
 * These are two separate tracking systems by design.
 */

const SESSION_KEY = "tv_session_id";
const ATTR_KEY = "tv_attribution";
const ATTR_EXPIRY_DAYS = 30;

export interface AttributionData {
  variant_slug: string;
  landing_path: string;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  captured_at: number; // timestamp ms
}

/** Persistent session ID — survives across days, stored in localStorage */
export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "server";
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

/** Read stored attribution (SSR-safe) */
export function getStoredAttribution(): AttributionData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ATTR_KEY);
    if (!raw) return null;
    const data: AttributionData = JSON.parse(raw);
    // Check expiry
    if (Date.now() - data.captured_at > ATTR_EXPIRY_DAYS * 86_400_000) {
      localStorage.removeItem(ATTR_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

/**
 * First-touch attribution capture.
 * Stores UTM params + referrer on first visit (or after expiry).
 * Fires a page_view event every visit.
 */
export function captureAttribution(variantSlug: string): void {
  if (typeof window === "undefined") return;

  try {
    const params = new URLSearchParams(window.location.search);

    // Only overwrite stored attribution if expired or missing
    const existing = getStoredAttribution();
    if (!existing) {
      const referrer = document.referrer || null;
      const data: AttributionData = {
        variant_slug: variantSlug,
        landing_path: window.location.pathname,
        referrer,
        utm_source: params.get("utm_source") || null,
        utm_medium: params.get("utm_medium") || null,
        utm_campaign: params.get("utm_campaign") || null,
        utm_content: params.get("utm_content") || null,
        utm_term: params.get("utm_term") || null,
        captured_at: Date.now(),
      };
      localStorage.setItem(ATTR_KEY, JSON.stringify(data));
    }

    // Fire page_view on every visit
    trackEvent("page_view", { path: window.location.pathname });
  } catch {
    // Silent
  }
}

/**
 * Fire-and-forget attribution event.
 * Pulls variant + UTMs from stored attribution automatically.
 */
export function trackEvent(
  eventType: string,
  metadata?: Record<string, unknown>
): void {
  if (typeof window === "undefined") return;

  try {
    const sessionId = getOrCreateSessionId();
    const attr = getStoredAttribution();

    const body = {
      session_id: sessionId,
      variant_slug: attr?.variant_slug || "default",
      landing_path: attr?.landing_path || window.location.pathname,
      referrer: attr?.referrer || null,
      utm_source: attr?.utm_source || null,
      utm_medium: attr?.utm_medium || null,
      utm_campaign: attr?.utm_campaign || null,
      utm_content: attr?.utm_content || null,
      utm_term: attr?.utm_term || null,
      event_type: eventType,
      event_metadata: metadata || null,
    };

    fetch("/api/attribution/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Never throw
  }
}
