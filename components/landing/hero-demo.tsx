"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Search,
  Play,
  Clock,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

const QUERY = "What does Huberman say about cold exposure benefits?";
const TYPING_SPEED = 45;
const PAUSE_BEFORE_RESULT = 600;

const DEMO_ANSWER =
  "According to Dr. Andrew Huberman, deliberate cold exposure triggers a significant and sustained release of dopamine and norepinephrine. A cold plunge at 50\u00b0F for 1\u20133 minutes can increase dopamine levels by 250% above baseline, lasting for several hours. He recommends ending showers cold rather than warm to maximize the catecholamine response.";

const DEMO_SOURCES = [
  {
    title: "Using Deliberate Cold Exposure for Health and Performance",
    channel: "Andrew Huberman",
    timestamp: "14:32",
    videoId: "x3MgDtZovks",
    snippet:
      "...deliberate cold exposure causes a 250% increase in dopamine that lasts for hours...",
  },
  {
    title: "How to Use Cold & Heat Exposure to Improve Your Health",
    channel: "Andrew Huberman",
    timestamp: "8:17",
    videoId: "pq6WHJzOkno",
    snippet:
      "...end your shower cold, not warm. The catecholamine response is what gives you that lasting energy...",
  },
];

export function HeroDemo() {
  const [typedText, setTypedText] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [startedTyping, setStartedTyping] = useState(false);

  useEffect(() => {
    const startDelay = setTimeout(() => setStartedTyping(true), 800);
    return () => clearTimeout(startDelay);
  }, []);

  useEffect(() => {
    if (!startedTyping) return;

    if (typedText.length < QUERY.length) {
      const timeout = setTimeout(() => {
        setTypedText(QUERY.slice(0, typedText.length + 1));
      }, TYPING_SPEED);
      return () => clearTimeout(timeout);
    }

    const resultTimeout = setTimeout(
      () => setShowResult(true),
      PAUSE_BEFORE_RESULT
    );
    return () => clearTimeout(resultTimeout);
  }, [typedText, startedTyping]);

  useEffect(() => {
    if (showResult) {
      const timeout = setTimeout(() => setShowSources(true), 400);
      return () => clearTimeout(timeout);
    }
  }, [showResult]);

  return (
    <div className="relative mx-auto w-full max-w-2xl">
      {/* Glow backdrop */}
      <div className="absolute -inset-4 rounded-3xl bg-primary/5 blur-2xl" />

      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-dark-darker shadow-2xl shadow-black/40">
        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
            <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
            <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
          </div>
          <div className="ml-2 flex items-center gap-1.5 rounded-md bg-white/[0.04] px-3 py-1">
            <Image
              src="/channels/andrew_huberman_avatar.jpg"
              alt="Andrew Huberman"
              width={16}
              height={16}
              className="h-4 w-4 rounded-full object-cover"
            />
            <span className="text-[11px] text-gray-text">
              Andrew Huberman
            </span>
            <ChevronRight className="h-3 w-3 text-gray-text/40" />
          </div>
        </div>

        {/* Search input */}
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
            <Search className="h-4 w-4 shrink-0 text-gray-text/60" />
            <span className="flex-1 text-sm text-cream">
              {typedText}
              {typedText.length < QUERY.length && (
                <span className="ml-px inline-block h-4 w-[2px] translate-y-[1px] animate-pulse bg-primary" />
              )}
            </span>
            <button
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-300 ${
                typedText.length === QUERY.length
                  ? "bg-primary text-white"
                  : "bg-white/[0.06] text-gray-text/40"
              }`}
            >
              Search
            </button>
          </div>
        </div>

        {/* Result area */}
        <div
          className={`transition-all duration-500 ${
            showResult
              ? "max-h-[500px] opacity-100"
              : "max-h-0 opacity-0"
          } overflow-hidden`}
        >
          <div className="px-4 pb-4">
            {/* AI Answer */}
            <div className="mb-3 rounded-xl bg-white/[0.03] p-4">
              <div className="mb-2 flex items-center gap-2">
                <Image
                  src="/TubeVault_Symbol.png"
                  alt="TubeVault"
                  width={20}
                  height={20}
                  className="h-5 w-5 rounded-md object-cover"
                />
                <span className="text-xs font-medium text-gray-text">
                  Answer
                </span>
              </div>
              <p className="text-[13px] leading-relaxed text-cream/90">
                {DEMO_ANSWER}
              </p>
            </div>

            {/* Sources */}
            <div
              className={`space-y-2 transition-all duration-500 ${
                showSources
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              }`}
            >
              <span className="text-[11px] font-medium uppercase tracking-wider text-gray-text/60">
                Sources
              </span>
              {DEMO_SOURCES.map((source, i) => (
                <div
                  key={i}
                  className="group flex items-start gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 transition-colors hover:border-primary/20"
                  style={{
                    transitionDelay: `${i * 150}ms`,
                    opacity: showSources ? 1 : 0,
                    transform: showSources
                      ? "translateY(0)"
                      : "translateY(8px)",
                    transition:
                      "opacity 0.4s ease, transform 0.4s ease, border-color 0.2s ease",
                  }}
                >
                  <div className="relative h-[45px] w-[80px] shrink-0 overflow-hidden rounded-lg bg-black/30">
                    <Image
                      src={`https://img.youtube.com/vi/${source.videoId}/mqdefault.jpg`}
                      alt={source.title}
                      fill
                      sizes="80px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-xs font-medium text-cream">
                        {source.title}
                      </span>
                      <ExternalLink className="h-3 w-3 shrink-0 text-gray-text/30 transition-colors group-hover:text-primary/60" />
                    </div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="text-[11px] text-gray-text/70">
                        {source.channel}
                      </span>
                      <span className="text-[11px] text-gray-text/30">
                        |
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-primary/70">
                        <Clock className="h-2.5 w-2.5" />
                        {source.timestamp}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-gray-text/60">
                      {source.snippet}
                    </p>
                  </div>
                </div>
              ))}
              <div
                className="flex items-center justify-center rounded-lg border border-white/[0.04] bg-white/[0.01] py-2 text-[11px] text-gray-text/40"
                style={{
                  transitionDelay: "300ms",
                  opacity: showSources ? 1 : 0,
                  transform: showSources ? "translateY(0)" : "translateY(8px)",
                  transition: "opacity 0.4s ease, transform 0.4s ease",
                }}
              >
                +3 more sources
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
