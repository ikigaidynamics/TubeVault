"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Search, ArrowRight, Lock, ChevronLeft, ChevronRight } from "lucide-react";
import type { Collection } from "@/lib/api";

const TYPEWRITER_QUESTIONS = [
  "How do I optimize my sleep?",
  "What caused the Younger Dryas?",
  "What is the Blueprint protocol?",
  "Best cold exposure protocol?",
  "Evidence for ancient civilizations?",
];

const CATEGORIES = ["All", "Health & Longevity", "History & Ancient Knowledge", "Other"] as const;

const POPULAR_QUESTIONS = [
  { q: "How do I get better sleep?", ch: "andrew_huberman", name: "Andrew Huberman", cat: "Health", featured: true },
  { q: "What caused the great floods?", ch: "the_randall_carlson", name: "Randall Carlson", cat: "History" },
  { q: "What is the Blueprint protocol?", ch: "bryan_johnson", name: "Bryan Johnson", cat: "Health" },
  { q: "Best supplements for longevity?", ch: "andrew_huberman", name: "Andrew Huberman", cat: "Health" },
  { q: "Sacred geometry explained?", ch: "the_randall_carlson", name: "Randall Carlson", cat: "History" },
  { q: "Evidence for lost ancient technology?", ch: "unchartedx", name: "UnchartedX", cat: "History" },
];

interface WelcomeScreenProps {
  collections: Collection[];
  collectionsLoading: boolean;
  selectedChannel: string | null;
  pickedChannels: string[];
  hasUnlimitedChannels: boolean;
  onSelectChannel: (name: string) => void;
  onSubmitQuestion: (channel: string, question: string) => void;
}

function getLogoUrl(col: Collection | undefined): string | null {
  if (!col?.logo) return null;
  return col.logo.startsWith("/")
    ? `https://mindvault.ikigai-dynamics.com${col.logo}`
    : col.logo;
}

function getCategory(col: Collection | undefined): string {
  if (!col?.description) return "Other";
  const d = col.description.toLowerCase();
  if (d.includes("health") || d.includes("nutrition") || d.includes("longevity") || d.includes("neuroscience") || d.includes("medicine") || d.includes("fitness") || d.includes("biohacking"))
    return "Health & Longevity";
  if (d.includes("history") || d.includes("ancient") || d.includes("geology") || d.includes("archaeology") || d.includes("apologetics") || d.includes("theology"))
    return "History & Ancient Knowledge";
  return "Other";
}

export function WelcomeScreen({
  collections,
  collectionsLoading,
  selectedChannel,
  pickedChannels,
  hasUnlimitedChannels,
  onSelectChannel,
  onSubmitQuestion,
}: WelcomeScreenProps) {
  // Typewriter state
  const [displayText, setDisplayText] = useState("");
  const [qIndex, setQIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Category filter
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const carouselRef = useRef<HTMLDivElement>(null);

  // Typewriter effect
  useEffect(() => {
    if (isFocused) return;
    const currentQ = TYPEWRITER_QUESTIONS[qIndex];

    if (!isDeleting && charIndex <= currentQ.length) {
      const timer = setTimeout(() => {
        setDisplayText(currentQ.slice(0, charIndex));
        setCharIndex((c) => c + 1);
      }, charIndex === currentQ.length ? 2000 : 45);
      return () => clearTimeout(timer);
    }

    if (!isDeleting && charIndex > currentQ.length) {
      setIsDeleting(true);
      return;
    }

    if (isDeleting && charIndex > 0) {
      const timer = setTimeout(() => {
        setCharIndex((c) => c - 1);
        setDisplayText(currentQ.slice(0, charIndex - 1));
      }, 25);
      return () => clearTimeout(timer);
    }

    if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setQIndex((i) => (i + 1) % TYPEWRITER_QUESTIONS.length);
    }
  }, [charIndex, isDeleting, qIndex, isFocused]);

  const isUnlocked = useCallback(
    (slug: string) => hasUnlimitedChannels || pickedChannels.includes(slug),
    [hasUnlimitedChannels, pickedChannels]
  );

  const filteredCollections =
    activeCategory === "All"
      ? collections
      : collections.filter((c) => getCategory(c) === activeCategory);

  const scrollCarousel = (dir: number) => {
    carouselRef.current?.scrollBy({ left: dir * 240, behavior: "smooth" });
  };

  if (collectionsLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-gray-text/40">Loading channels...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-full overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(101,174,76,0.025),transparent_60%)]" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative mx-auto max-w-4xl">
        {/* Section 1: Animated Search */}
        <div className="animate-[fadeUp_0.5s_ease-out] pt-2 text-center sm:pt-6 lg:pt-10">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-primary/40">
            Your AI Search Engine
          </p>
          <h2 className="mt-2 text-2xl font-bold text-cream sm:text-3xl">
            What would you like to know?
          </h2>

          <div className="mx-auto mt-6 max-w-2xl">
            <div
              className={`flex items-center gap-3 rounded-2xl border bg-[#141516] px-5 transition-all duration-200 ${
                isFocused
                  ? "border-primary/30 ring-2 ring-primary/20 shadow-[0_0_20px_rgba(101,174,76,0.06)]"
                  : "border-[#2E2F31] hover:border-white/[0.12]"
              }`}
            >
              <Search className="h-5 w-5 shrink-0 text-gray-text/30" />
              <div className="relative h-14 flex-1">
                {!isFocused && !selectedChannel && (
                  <div className="pointer-events-none absolute inset-0 flex items-center">
                    <span className="text-lg text-gray-text/35">{displayText}</span>
                    <span className="ml-px inline-block h-5 w-[2px] animate-pulse bg-primary/50" />
                  </div>
                )}
                <input
                  type="text"
                  className="h-full w-full bg-transparent text-lg text-cream placeholder:text-gray-text/35 focus:outline-none"
                  placeholder={isFocused || selectedChannel ? "Ask anything..." : ""}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  readOnly
                />
              </div>
              <button
                disabled
                className="shrink-0 rounded-xl bg-primary px-5 py-2 text-sm font-medium text-white opacity-40"
              >
                Search
              </button>
            </div>
            {!selectedChannel && (
              <p className="mt-2 text-xs text-gray-text/30">
                Pick a channel below to start searching
              </p>
            )}
          </div>
        </div>

        {/* Section 2: Creator Carousel */}
        <div className="mt-12" style={{ animationDelay: "150ms" }}>
          <p className="text-center text-[10px] font-medium uppercase tracking-[0.15em] text-gray-text/40">
            Browse Creators
          </p>

          {/* Category pills */}
          <div className="mt-4 flex justify-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-3 py-1 text-[11px] font-medium transition-all duration-200 ${
                  activeCategory === cat
                    ? "bg-primary/10 text-primary"
                    : "text-gray-text/50 hover:text-cream"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Carousel */}
          <div className="relative mt-5">
            <button
              onClick={() => scrollCarousel(-1)}
              className="absolute -left-3 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/[0.08] bg-[#141516] text-gray-text/50 transition-colors hover:text-cream md:flex"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scrollCarousel(1)}
              className="absolute -right-3 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/[0.08] bg-[#141516] text-gray-text/50 transition-colors hover:text-cream md:flex"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            <div
              ref={carouselRef}
              className="flex gap-5 overflow-x-auto py-4 scrollbar-hide sm:gap-6"
              style={{ scrollSnapType: "x mandatory" }}
            >
              {filteredCollections.map((col, i) => {
                const logo = getLogoUrl(col);
                const active = selectedChannel === col.name;
                const locked = !isUnlocked(col.name);

                return (
                  <button
                    key={col.name}
                    onClick={() => {
                      if (!locked) onSelectChannel(col.name);
                    }}
                    className="group flex shrink-0 flex-col items-center gap-2 opacity-0 animate-[fadeUp_0.4s_ease-out_forwards]"
                    style={{
                      scrollSnapAlign: "center",
                      animationDelay: `${i * 50}ms`,
                    }}
                  >
                    <div className="relative">
                      {logo ? (
                        <Image
                          src={logo}
                          alt={col.display_name}
                          width={64}
                          height={64}
                          className={`h-14 w-14 rounded-full object-cover transition-all duration-200 sm:h-16 sm:w-16 ${
                            active
                              ? "ring-2 ring-primary scale-105"
                              : "ring-1 ring-transparent group-hover:ring-2 group-hover:ring-primary/30 group-hover:scale-110"
                          } ${locked ? "opacity-50" : ""}`}
                          unoptimized
                        />
                      ) : (
                        <div
                          className={`flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.06] text-sm font-bold text-gray-text transition-all duration-200 sm:h-16 sm:w-16 ${
                            active
                              ? "ring-2 ring-primary scale-105"
                              : "ring-1 ring-transparent group-hover:ring-2 group-hover:ring-primary/30 group-hover:scale-110"
                          } ${locked ? "opacity-50" : ""}`}
                        >
                          {col.display_name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                        </div>
                      )}
                      {locked && (
                        <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#141516] ring-1 ring-[#2E2F31]">
                          <Lock className="h-2.5 w-2.5 text-gray-text/50" />
                        </div>
                      )}
                    </div>
                    <span
                      className={`max-w-[72px] truncate text-center text-[10px] transition-colors duration-200 ${
                        active ? "font-semibold text-primary" : "text-gray-text/50 group-hover:text-cream"
                      }`}
                    >
                      {col.display_name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 3: Popular Questions */}
        <div className="mt-10">
          <p className="text-center text-[10px] font-medium uppercase tracking-[0.15em] text-gray-text/40">
            Popular Questions
          </p>

          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
            {POPULAR_QUESTIONS.map((item, i) => {
              const col = collections.find((c) => c.name === item.ch);
              const logo = getLogoUrl(col);
              const locked = !isUnlocked(item.ch);

              return (
                <button
                  key={item.q}
                  onClick={() => {
                    if (!locked) onSubmitQuestion(item.ch, item.q);
                  }}
                  className={`group flex flex-col rounded-2xl border border-[#2E2F31] bg-[#141516] p-5 text-left opacity-0 animate-[fadeUp_0.4s_ease-out_forwards] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-[0_0_20px_rgba(101,174,76,0.06)] ${
                    item.featured ? "md:col-span-2 bg-gradient-to-br from-primary/[0.03] to-transparent" : ""
                  }`}
                  style={{ animationDelay: `${300 + i * 100}ms` }}
                >
                  <p className={`font-medium text-cream/90 ${item.featured ? "text-base" : "text-sm"}`}>
                    &ldquo;{item.q}&rdquo;
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    {logo ? (
                      <Image src={logo} alt="" width={24} height={24} className="h-6 w-6 rounded-full object-cover" unoptimized />
                    ) : (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.06] text-[8px] font-bold text-gray-text">
                        {item.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                      </div>
                    )}
                    <span className="text-xs text-gray-text/50">{item.name}</span>
                    <span className="rounded-full bg-white/[0.04] px-2 py-0.5 text-[9px] text-gray-text/30">
                      {item.cat}
                    </span>
                    {locked && <Lock className="ml-auto h-3 w-3 text-gray-text/30" />}
                    {!locked && (
                      <ArrowRight className="ml-auto h-3 w-3 text-gray-text/20 transition-colors group-hover:text-primary" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 4: Stats footer */}
        <div className="mt-12 pb-4 text-center">
          <p className="text-xs text-gray-text/30">
            50+ creators &middot; 10,000+ videos &middot; 300,000+ searchable moments
          </p>
        </div>
      </div>
    </div>
  );
}
