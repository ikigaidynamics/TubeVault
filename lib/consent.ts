/**
 * Consent State Manager for GDPR/TTDSG compliance.
 *
 * Stores consent in both localStorage (client reads) and a cookie
 * (server-side reads in API routes). The cookie uses a compact JSON
 * format to minimise header size.
 *
 * Cookie format: {"n":1,"a":0,"at":0,"t":1714060800}
 *   n  = necessary (always 1)
 *   a  = analytics (0 or 1)
 *   at = attribution (0 or 1)
 *   t  = Unix timestamp (seconds)
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ConsentCategories {
  necessary: true; // always true, cannot be disabled
  analytics: boolean;
  attribution: boolean;
}

export interface ConsentState {
  categories: ConsentCategories;
  timestamp: number; // Unix seconds
}

export type ConsentMethod =
  | "accept_all"
  | "necessary_only"
  | "custom_settings";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LS_KEY = "tv_consent";
const COOKIE_NAME = "tv_consent";
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds
const POLICY_VERSION = "1.0";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isClient(): boolean {
  return typeof window !== "undefined";
}

/** Build compact cookie value from categories + timestamp. */
function encodeCookie(cats: ConsentCategories, ts: number): string {
  return JSON.stringify({
    n: 1,
    a: cats.analytics ? 1 : 0,
    at: cats.attribution ? 1 : 0,
    t: ts,
  });
}

/** Parse the compact cookie value back to ConsentCategories. */
export function decodeCookie(
  raw: string
): ConsentCategories | null {
  try {
    const obj = JSON.parse(raw);
    if (typeof obj.n !== "number") return null;
    return {
      necessary: true,
      analytics: obj.a === 1,
      attribution: obj.at === 1,
    };
  } catch {
    return null;
  }
}

function setCookie(value: string): void {
  const secure = location.protocol === "https:" ? ";Secure" : "";
  document.cookie =
    `${COOKIE_NAME}=${encodeURIComponent(value)}` +
    `;path=/` +
    `;max-age=${COOKIE_MAX_AGE}` +
    `;SameSite=Lax` +
    secure;
}

function deleteCookie(): void {
  document.cookie = `${COOKIE_NAME}=;path=/;max-age=0`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Read current consent state. Returns null if user has not yet consented.
 */
export function getConsent(): ConsentCategories | null {
  if (!isClient()) return null;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const state: ConsentState = JSON.parse(raw);
    return state.categories;
  } catch {
    return null;
  }
}

/**
 * Save consent. Writes to localStorage AND sets cookie for server-side reads.
 * `necessary` is always forced to true regardless of input.
 */
export function setConsent(
  categories: Partial<ConsentCategories>
): void {
  if (!isClient()) return;

  const cats: ConsentCategories = {
    necessary: true,
    analytics: categories.analytics ?? false,
    attribution: categories.attribution ?? false,
  };

  const ts = Math.floor(Date.now() / 1000);

  const state: ConsentState = { categories: cats, timestamp: ts };
  localStorage.setItem(LS_KEY, JSON.stringify(state));
  setCookie(encodeCookie(cats, ts));
}

/** Has the user made any consent decision (accept or reject)? */
export function hasConsented(): boolean {
  return getConsent() !== null;
}

/** Does the user allow analytics tracking? */
export function hasAnalyticsConsent(): boolean {
  return getConsent()?.analytics === true;
}

/** Does the user allow attribution tracking? */
export function hasAttributionConsent(): boolean {
  return getConsent()?.attribution === true;
}

/**
 * Clear all consent data. Used before re-prompting the user.
 */
export function resetConsent(): void {
  if (!isClient()) return;
  localStorage.removeItem(LS_KEY);
  deleteCookie();
}

/**
 * Determine the consent method label for the audit log.
 */
export function getConsentMethod(cats: ConsentCategories): ConsentMethod {
  if (cats.analytics && cats.attribution) return "accept_all";
  if (!cats.analytics && !cats.attribution) return "necessary_only";
  return "custom_settings";
}

/** Current policy version — bump when privacy policy changes materially. */
export { POLICY_VERSION };
