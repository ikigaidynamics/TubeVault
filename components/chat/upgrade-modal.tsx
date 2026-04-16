"use client";

import { X, Zap } from "lucide-react";
import Link from "next/link";
import { track } from "@/lib/analytics/tracker";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export function UpgradeModal({
  open,
  onClose,
  title = "Upgrade Required",
  message = "Upgrade your plan to access this feature.",
}: UpgradeModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative mx-4 w-full max-w-sm rounded-2xl border border-white/[0.08] bg-[#1C1D1F] p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-text/50 transition-colors hover:text-cream"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-cream">{title}</h3>
          <p className="mt-2 text-sm text-gray-text">{message}</p>
          <Link
            href="/pricing"
            // analytics
            onClick={() => track("upgrade_click", { metadata: { trigger: "manual" } })}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            View Plans
          </Link>
          <button
            onClick={onClose}
            className="mt-3 text-xs text-gray-text/60 transition-colors hover:text-cream"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
