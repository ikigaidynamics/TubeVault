"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  setConsent,
  getConsent,
  hasConsented,
  getConsentMethod,
  getOrCreateAuditSessionId,
  POLICY_VERSION,
  type ConsentCategories,
  type ConsentMethod,
} from "@/lib/consent";
import { captureAttribution } from "@/lib/attribution";
import { VARIANTS } from "@/lib/landing-variants";

// ---------------------------------------------------------------------------
// Variant slug lookup — maps pathname to the landing variant slug used by
// the attribution system. Only known variant slugs are used; everything
// else falls back to "default".
// ---------------------------------------------------------------------------

function getVariantSlug(pathname: string): string {
  if (pathname === "/") return "default";
  const slug = pathname.replace(/^\//, "").split("/")[0];
  return slug in VARIANTS ? slug : "default";
}

// ---------------------------------------------------------------------------
// Global open trigger — Footer link dispatches this event.
// ---------------------------------------------------------------------------

const OPEN_EVENT = "open-cookie-banner";

export function openCookieBanner(): void {
  window.dispatchEvent(new CustomEvent(OPEN_EVENT));
}

// ---------------------------------------------------------------------------
// Audit log helper (fire-and-forget)
// ---------------------------------------------------------------------------

function logConsent(
  categories: ConsentCategories,
  method: ConsentMethod
): void {
  const sessionId = getOrCreateAuditSessionId();

  fetch("/api/consent/log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session_id: sessionId,
      consent_categories: {
        necessary: true,
        analytics: categories.analytics,
        attribution: categories.attribution,
      },
      consent_method: method,
      policy_version: POLICY_VERSION,
    }),
    keepalive: true,
  }).catch(() => {});
}

// ---------------------------------------------------------------------------
// Legal pages where the banner should never appear
// ---------------------------------------------------------------------------

const HIDDEN_PATHS = new Set(["/privacy", "/terms", "/impressum", "/datenschutz"]);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CookieBanner() {
  const pathname = usePathname();

  // SSR-safe: start invisible, check consent client-side only
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // DSGVO/TTDSG: Toggles must default to OFF (Opt-In, not Opt-Out).
  // EuGH C-673/17 (Planet49).
  const [analyticsOn, setAnalyticsOn] = useState(false);
  const [attributionOn, setAttributionOn] = useState(false);

  const slideOutTimer = useRef<ReturnType<typeof setTimeout>>();

  // --- Initial check: show banner if user has not yet consented ---------
  useEffect(() => {
    if (HIDDEN_PATHS.has(pathname)) return;
    if (!hasConsented()) {
      setVisible(true);
    }
  }, [pathname]);

  // --- Slide-in with delay after visible becomes true -------------------
  useEffect(() => {
    if (visible) {
      const id = setTimeout(() => setMounted(true), 300);
      return () => clearTimeout(id);
    }
  }, [visible]);

  // --- Listen for footer "Cookie settings" link --------------------------
  useEffect(() => {
    function handleOpen() {
      // Defensive: cancel any in-flight slide-out timer so slide-in starts clean
      clearTimeout(slideOutTimer.current);
      setMounted(false);

      // Read current consent, pre-fill toggles, open settings panel directly
      const current = getConsent();
      if (current) {
        setAnalyticsOn(current.analytics);
        setAttributionOn(current.attribution);
      } else {
        setAnalyticsOn(false);
        setAttributionOn(false);
      }
      setShowSettings(true);
      setVisible(true);
    }
    window.addEventListener(OPEN_EVENT, handleOpen);
    return () => window.removeEventListener(OPEN_EVENT, handleOpen);
  }, []);

  // --- Slide-out animation, then remove from DOM ------------------------
  const closeBanner = useCallback(() => {
    setMounted(false);
    clearTimeout(slideOutTimer.current);
    slideOutTimer.current = setTimeout(() => {
      setVisible(false);
      setShowSettings(false);
    }, 300);
  }, []);

  // --- Consent handlers -------------------------------------------------

  function handleAcceptAll() {
    const cats: ConsentCategories = {
      necessary: true,
      analytics: true,
      attribution: true,
    };
    setConsent(cats);
    logConsent(cats, "accept_all");

    // Retroactive attribution for the current session
    captureAttribution(getVariantSlug(pathname));

    closeBanner();
  }

  function handleNecessaryOnly() {
    const cats: ConsentCategories = {
      necessary: true,
      analytics: false,
      attribution: false,
    };
    setConsent(cats);
    logConsent(cats, "necessary_only");
    closeBanner();
  }

  function handleSaveSettings() {
    const cats: ConsentCategories = {
      necessary: true,
      analytics: analyticsOn,
      attribution: attributionOn,
    };
    setConsent(cats);
    logConsent(cats, getConsentMethod(cats));

    if (attributionOn) {
      captureAttribution(getVariantSlug(pathname));
    }

    closeBanner();
  }

  // --- Don't render on legal pages or when not visible ------------------
  if (HIDDEN_PATHS.has(pathname) || !visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className={`fixed bottom-0 left-0 right-0 z-[50] max-h-[280px] overflow-y-auto border-t border-white/[0.08] bg-[#1a1a1b] shadow-[0_-4px_20px_rgba(0,0,0,0.3)] transition-transform duration-300 ease-out ${
        mounted ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6 sm:py-5">
        {!showSettings ? (
          /* ── Main view: info text + 3 buttons ── */
          <>
            <p className="text-sm leading-relaxed text-cream/80">
              We use cookies and local storage for analytics and
              attribution.{" "}
              <Link
                href="/privacy"
                className="text-primary underline underline-offset-2 hover:text-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-[#1a1a1b]"
              >
                Privacy Policy
              </Link>
            </p>

            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <button
                onClick={handleAcceptAll}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-[#1a1a1b]"
              >
                Accept all
              </button>
              <button
                onClick={handleNecessaryOnly}
                className="rounded-lg border border-white/[0.12] px-4 py-2 text-sm font-medium text-cream transition-colors hover:bg-white/[0.04] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-[#1a1a1b]"
              >
                Necessary only
              </button>
              <button
                onClick={() => {
                  setAnalyticsOn(false);
                  setAttributionOn(false);
                  setShowSettings(true);
                }}
                className="text-sm text-gray-text underline underline-offset-2 transition-colors hover:text-cream focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-[#1a1a1b]"
              >
                Settings
              </button>
            </div>
          </>
        ) : (
          /* ── Settings panel: category toggles ── */
          <>
            <h3 className="text-sm font-semibold text-cream">
              Cookie settings
            </h3>

            <div className="mt-3 space-y-3">
              {/* Necessary — always on */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-cream">Necessary</p>
                  <p className="text-xs text-gray-text/60">
                    Authentication and consent storage.
                  </p>
                </div>
                <span className="text-xs font-medium text-gray-text/40">
                  always on
                </span>
              </div>

              {/* Analytics toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-cream">Analytics</p>
                  <p className="text-xs text-gray-text/60">
                    Pseudonymized usage statistics.
                  </p>
                </div>
                <button
                  role="switch"
                  aria-checked={analyticsOn}
                  onClick={() => setAnalyticsOn((v) => !v)}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-[#1a1a1b] ${
                    analyticsOn ? "bg-primary" : "bg-white/[0.12]"
                  }`}
                >
                  <span
                    className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                      analyticsOn ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Attribution toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-cream">Attribution</p>
                  <p className="text-xs text-gray-text/60">
                    Source and conversion tracking.
                  </p>
                </div>
                <button
                  role="switch"
                  aria-checked={attributionOn}
                  onClick={() => setAttributionOn((v) => !v)}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-[#1a1a1b] ${
                    attributionOn ? "bg-primary" : "bg-white/[0.12]"
                  }`}
                >
                  <span
                    className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                      attributionOn ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={handleSaveSettings}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-[#1a1a1b]"
              >
                Save choices
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="text-sm text-gray-text underline underline-offset-2 transition-colors hover:text-cream focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-[#1a1a1b]"
              >
                Back
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
