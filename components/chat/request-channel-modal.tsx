"use client";

import { useState } from "react";
import { X, Plus, Loader2, CheckCircle } from "lucide-react";

interface RequestChannelModalProps {
  open: boolean;
  onClose: () => void;
}

export function RequestChannelModal({ open, onClose }: RequestChannelModalProps) {
  const [url, setUrl] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  function handleClose() {
    setUrl("");
    setSubmitted(false);
    onClose();
  }

  async function handleSubmit() {
    const trimmed = url.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    try {
      await fetch("/api/channel-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      setSubmitted(true);
    } catch {
      // Still show success — request may have been stored
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={handleClose} />
      <div className="relative mx-4 w-full max-w-sm rounded-2xl border border-white/[0.08] bg-[#1C1D1F] p-6 shadow-2xl">
        <button
          onClick={handleClose}
          className="absolute right-3 top-3 text-gray-text/50 transition-colors hover:text-cream"
        >
          <X className="h-4 w-4" />
        </button>

        {submitted ? (
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-cream">Request submitted</h3>
            <p className="mt-2 text-sm text-gray-text">
              Thanks! We&apos;ll review your suggestion and consider adding it.
            </p>
            <button
              onClick={handleClose}
              className="mt-6 flex w-full items-center justify-center rounded-xl bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-cream">Request a channel</h3>
            <p className="mt-2 text-sm text-gray-text">
              Can&apos;t find the channel you&apos;re looking for? Paste the YouTube link and we&apos;ll consider adding it.
            </p>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="https://youtube.com/@channel"
              className="mt-4 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-cream placeholder:text-gray-text/30 focus:border-primary/30 focus:outline-none"
              autoFocus
            />
            <button
              onClick={handleSubmit}
              disabled={!url.trim() || submitting}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Submit request"
              )}
            </button>
            <button
              onClick={handleClose}
              className="mt-3 w-full text-xs text-gray-text/50 transition-colors hover:text-cream"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
