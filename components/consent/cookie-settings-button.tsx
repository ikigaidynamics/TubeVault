"use client";

import { openCookieBanner } from "@/components/consent/cookie-banner";

export function CookieSettingsButton() {
  return (
    <button
      onClick={openCookieBanner}
      className="text-sm text-gray-text transition-colors hover:text-cream"
    >
      Cookie settings
    </button>
  );
}
