"use client";

import Link from "next/link";
import { Lock, CheckCircle } from "lucide-react";

interface TranscriptUpgradeWallProps {
  totalChunks: number;
  channelName?: string;
  videoTitle?: string;
}

export function TranscriptUpgradeWall({ totalChunks, channelName }: TranscriptUpgradeWallProps) {
  const benefits = [
    "Full transcripts for every video",
    "Translation to 10+ languages",
    "Exact timestamps you can click",
  ];

  return (
    <div className="relative mt-4">
      {/* Upgrade card */}
      <div className="animate-[fadeUp_0.5s_ease-out] rounded-2xl border border-primary/20 bg-gradient-to-b from-[#141516] to-primary/[0.03] p-8 text-center md:p-12">
        <Lock className="mx-auto h-12 w-12 text-primary/40" />

        <h3 className="mt-4 text-2xl font-bold text-cream">
          Unlock the full transcript
        </h3>
        <p className="mt-2 text-base text-gray-text">
          This video has <span className="text-cream font-semibold">{totalChunks} searchable moments</span>.
          You&apos;re seeing 5 of them.
          {channelName && (
            <span className="block mt-1 text-sm text-gray-text/60">
              Full access to {channelName}&apos;s entire archive.
            </span>
          )}
        </p>

        <div className="mx-auto mt-6 max-w-xs space-y-2.5 text-left">
          {benefits.map((b, i) => (
            <div
              key={b}
              className="flex items-center gap-2.5 opacity-0 animate-[fadeUp_0.4s_ease-out_forwards]"
              style={{ animationDelay: `${i * 50 + 200}ms` }}
            >
              <CheckCircle className="h-4 w-4 shrink-0 text-primary" />
              <span className="text-sm text-cream/80">{b}</span>
            </div>
          ))}
        </div>

        <Link
          href="/pricing"
          className="glow-pulse mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary-hover"
        >
          Upgrade to Pro
        </Link>

        <div className="mt-3">
          <Link
            href="/pricing"
            className="text-sm text-primary transition-colors hover:text-primary-hover"
          >
            See all plans &rarr;
          </Link>
        </div>

        <p className="mt-4 text-xs text-gray-text/40">
          7-day money-back guarantee &middot; Cancel anytime
        </p>
      </div>
    </div>
  );
}
