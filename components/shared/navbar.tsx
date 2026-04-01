"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase";

export function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    try {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data: { user } }) => {
        setLoggedIn(!!user);
      }).catch(() => {});
    } catch {
      // Supabase not configured — stay logged out
    }
  }, []);

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#1d1d1d]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        {/* Logo — always links home */}
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/TubeVault_Logo_round.png"
            alt="TubeVault"
            width={28}
            height={28}
            className="h-7 w-7"
          />
          <span className="font-[family-name:var(--font-alice)] text-[15px] text-cream">TubeVault</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="/channels"
            className="text-sm text-gray-text transition-colors hover:text-cream"
          >
            Channels
          </Link>
          <Link
            href="/pricing"
            className="text-sm text-gray-text transition-colors hover:text-cream"
          >
            Pricing
          </Link>
          {loggedIn ? (
            <Link
              href="/dashboard"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-gray-text transition-colors hover:text-cream"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile CTA */}
        {loggedIn ? (
          <Link
            href="/dashboard"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover md:hidden"
          >
            Dashboard
          </Link>
        ) : (
          <Link
            href="/signup"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover md:hidden"
          >
            Get Started
          </Link>
        )}
      </div>
    </nav>
  );
}
