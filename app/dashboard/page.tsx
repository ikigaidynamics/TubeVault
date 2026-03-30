"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [message, setMessage] = useState("");

  return (
    <div className="flex h-screen flex-col bg-dark-bg">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-cream">
            TubeVault
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-text">Select a channel</span>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold text-cream">
              What would you like to know?
            </h2>
            <p className="mt-2 text-gray-text">
              Select a channel and ask any question. Get answers with exact
              video timestamps.
            </p>
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-white/10 px-6 py-4">
          <div className="mx-auto max-w-2xl">
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-dark-surface px-4 py-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 bg-transparent text-cream placeholder:text-gray-text/50 focus:outline-none"
              />
              <button
                type="button"
                className="rounded-lg bg-primary p-2 text-white hover:bg-primary-hover transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
