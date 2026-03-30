"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Layers,
  MessageCircleQuestion,
  Timer,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { HeroDemo } from "@/components/landing/hero-demo";
import { ChannelGrid } from "@/components/landing/channel-grid";
import { AnimateOnScroll } from "@/components/landing/animate-on-scroll";

const STEPS = [
  {
    icon: Layers,
    number: "01",
    title: "Pick your channels",
    description:
      "Choose from 20+ indexed YouTube channels across health, history, science, and more.",
  },
  {
    icon: MessageCircleQuestion,
    number: "02",
    title: "Ask anything",
    description:
      "Type a natural question. Our AI searches through thousands of hours of video content by meaning.",
  },
  {
    icon: Timer,
    number: "03",
    title: "Get answers with timestamps",
    description:
      "Receive AI-synthesized answers with clickable timestamps that jump straight to the source.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-dark-bg">
      {/* ── Navigation ── */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/[0.06] bg-[#1d1d1d]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-gray-text">
              AI-powered semantic search for YouTube
            </span>
          </Link>
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
          </div>
          {/* Mobile: just CTA */}
          <Link
            href="/signup"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover md:hidden"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero-gradient grid-pattern relative overflow-hidden pt-20 pb-8 md:pt-28 md:pb-16">
        {/* Decorative orb behind hero center */}
        <div className="pointer-events-none absolute left-1/2 top-[20%] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/[0.04] blur-[140px]" />

        <div className="relative mx-auto max-w-7xl px-6">
          {/* Logo + Headline side by side, centered as a unit */}
          <AnimateOnScroll delay={150}>
            <div className="flex flex-col items-center gap-6 md:flex-row md:justify-center md:gap-12 lg:gap-16">
              {/* Logo */}
              <div className="shrink-0">
                <Image
                  src="/TubeVault_Logo_noBG.png"
                  alt="TubeVault"
                  width={500}
                  height={500}
                  priority
                  className="w-44 sm:w-52 md:w-60 lg:w-72 xl:w-80"
                />
              </div>

              {/* Headline */}
              <h1 className="text-center text-4xl font-bold leading-[1.08] tracking-tight text-cream sm:text-5xl md:text-left md:text-6xl lg:text-7xl">
                Every answer.
                <br />
                Every creator.
                <br />
                <span className="bg-gradient-to-r from-primary to-[#7bc361] bg-clip-text text-transparent">
                  One search.
                </span>
              </h1>
            </div>
          </AnimateOnScroll>

          {/* Subheadline + CTAs — centered below */}
          <div className="mx-auto mt-10 max-w-2xl text-center">
            <AnimateOnScroll delay={300}>
              <p className="text-base leading-relaxed text-gray-text md:text-lg">
                Search across 20+ YouTube channels by meaning. Get answers from
                your favorite creators with exact timestamps.
              </p>
            </AnimateOnScroll>

            <AnimateOnScroll delay={400}>
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                <Link
                  href="/signup"
                  className="glow-pulse inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover sm:w-auto"
                >
                  Start searching — it&apos;s free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] px-7 py-3.5 text-sm font-medium text-cream transition-colors hover:bg-white/[0.04] sm:w-auto"
                >
                  See pricing
                </Link>
              </div>
            </AnimateOnScroll>
          </div>

          {/* Demo */}
          <AnimateOnScroll delay={500}>
            <div className="mt-16 md:mt-20">
              <HeroDemo />
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="relative border-t border-white/[0.06] px-6 py-24 md:py-32">
        <div className="mx-auto max-w-5xl">
          <AnimateOnScroll>
            <div className="text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/70">
                How it works
              </span>
              <h2 className="mt-3 text-3xl font-bold text-cream md:text-4xl">
                Three steps to any answer
              </h2>
            </div>
          </AnimateOnScroll>

          <div className="relative mt-16 grid gap-8 md:grid-cols-3 md:gap-6">
            {/* Connector lines (desktop) */}
            <div className="step-connector pointer-events-none absolute left-[20%] right-[20%] top-12 hidden h-px md:block" />

            {STEPS.map((step, i) => (
              <AnimateOnScroll key={step.number} delay={i * 150}>
                <div className="group relative text-center">
                  {/* Number circle */}
                  <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
                    <div className="absolute inset-0 rounded-2xl bg-primary/[0.06] transition-colors duration-300 group-hover:bg-primary/[0.12]" />
                    <div className="relative flex flex-col items-center">
                      <step.icon className="h-7 w-7 text-primary" />
                      <span className="mt-1 text-[10px] font-bold tracking-widest text-primary/50">
                        {step.number}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-cream">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-text">
                    {step.description}
                  </p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Channels ── */}
      <section className="border-t border-white/[0.06] px-6 py-24 md:py-32">
        <div className="mx-auto max-w-6xl">
          <AnimateOnScroll>
            <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/70">
                  Indexed channels
                </span>
                <h2 className="mt-3 text-3xl font-bold text-cream md:text-4xl">
                  20+ channels and growing
                </h2>
                <p className="mt-2 max-w-lg text-sm text-gray-text">
                  From neuroscience to ancient history. Every video transcribed,
                  chunked, and semantically indexed for instant search.
                </p>
              </div>
              <Link
                href="/channels"
                className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary-hover"
              >
                View all channels
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </AnimateOnScroll>

          <ChannelGrid />

          <AnimateOnScroll>
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-text/60">
                New channels added regularly. Have a request?{" "}
                <Link
                  href="/signup"
                  className="text-primary transition-colors hover:text-primary-hover"
                >
                  Let us know
                </Link>
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="border-t border-white/[0.06] px-6 py-24 md:py-32">
        <AnimateOnScroll>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-cream md:text-4xl">
              Stop scrubbing through videos.
              <br />
              <span className="text-primary">Start finding answers.</span>
            </h2>
            <p className="mt-4 text-gray-text">
              Free to start. No credit card required.
            </p>
            <div className="mt-8">
              <Link
                href="/signup"
                className="glow-pulse inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 font-semibold text-white transition-colors hover:bg-primary-hover"
              >
                Start searching — it&apos;s free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </AnimateOnScroll>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.06] px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 md:grid-cols-4">
            {/* Brand */}
            <div className="md:col-span-2">
              <Image
                src="/TubeVault_Logo_noBG.png"
                alt="TubeVault"
                width={40}
                height={40}
              />
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-gray-text/70">
                AI-powered semantic search for YouTube. Ask questions, get
                answers with timestamps.
              </p>
              <p className="mt-4 text-xs text-gray-text/40">
                Built by IkigAI Dynamics
              </p>
            </div>

            {/* Product links */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-text/50">
                Product
              </h4>
              <ul className="mt-4 space-y-2.5">
                <li>
                  <Link
                    href="/channels"
                    className="text-sm text-gray-text transition-colors hover:text-cream"
                  >
                    Channels
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="text-sm text-gray-text transition-colors hover:text-cream"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="text-sm text-gray-text transition-colors hover:text-cream"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    href="/signup"
                    className="text-sm text-gray-text transition-colors hover:text-cream"
                  >
                    Sign up
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal links */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-text/50">
                Legal
              </h4>
              <ul className="mt-4 space-y-2.5">
                <li>
                  <Link
                    href="/impressum"
                    className="text-sm text-gray-text transition-colors hover:text-cream"
                  >
                    Impressum
                  </Link>
                </li>
                <li>
                  <Link
                    href="/datenschutz"
                    className="text-sm text-gray-text transition-colors hover:text-cream"
                  >
                    Datenschutz
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 sm:flex-row">
            <p className="text-xs text-gray-text/40">
              &copy; {new Date().getFullYear()} IkigAI Dynamics. All rights
              reserved.
            </p>
            <div className="flex items-center gap-1.5">
              <div className="h-4 w-4 rounded bg-primary/80" />
              <span className="text-xs font-medium text-gray-text/40">
                IkigAI Dynamics
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
