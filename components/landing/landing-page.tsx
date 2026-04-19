import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Layers,
  MessageCircleQuestion,
  Timer,
  XCircle,
  CheckCircle,
  Bot,
} from "lucide-react";
import { HeroLiveDemo } from "@/components/landing/hero-live-demo";
import { AnimateOnScroll } from "@/components/landing/animate-on-scroll";
import { Navbar } from "@/components/shared/navbar";
import { AttributionTracker } from "@/components/landing/attribution-tracker";
import type { LandingVariant } from "@/lib/landing-variants";

const STEPS = [
  {
    icon: Layers,
    number: "01",
    title: "Pick your channels",
    description:
      "Choose from 50+ indexed YouTube channels across health, history, science, and more \u2014 with new creators added regularly.",
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

const DEFAULT_COMPARISON = {
  title: "Wait \u2014 how is this different from other AI services?",
  subtitle: "ChatGPT, Gemini, Perplexity\u2026",
  genericAiPoints: [
    "Makes up answers that sound confident",
    "No way to verify the source",
    "Generic advice from unknown training data",
  ],
  tubeVaultPoints: [
    "Only what creators actually said \u2014 word for word",
    "Clickable timestamps to verify in the original video",
    "Real experts you trust \u2014 no hallucinations",
  ],
};

interface Props {
  variant: LandingVariant;
}

export function LandingPage({ variant }: Props) {
  const comparison = variant.comparisonSection ?? DEFAULT_COMPARISON;

  return (
    <div className="min-h-screen overflow-x-hidden bg-dark-bg">
      <AttributionTracker variantSlug={variant.slug} />
      {/* Navigation */}
      <div className="fixed top-0 z-50 w-full">
        <Navbar />
      </div>

      {/* Hero */}
      <section className="hero-gradient grid-pattern relative flex min-h-[calc(100vh-3.5rem)] flex-col overflow-hidden pb-10 pt-20 sm:pt-24 md:pb-16">
        <div className="pointer-events-none absolute left-1/2 top-[20%] hidden h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/[0.04] blur-[140px] sm:block" />

        <div className="relative mx-auto w-full max-w-7xl px-6">
          {/* Pre-headline */}
          <AnimateOnScroll delay={100}>
            <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.25em] text-[#65ae4c]">
              {variant.heroEyebrow}
            </p>
            <h2 className="mb-4 text-center text-lg font-bold text-cream sm:mb-6 sm:text-2xl md:text-3xl">
              Try it here.{" "}
              <span className="text-gray-text">No Signup.</span>
            </h2>
          </AnimateOnScroll>

          {/* Demo widget */}
          <AnimateOnScroll delay={200}>
            <HeroLiveDemo
              defaultChannel={variant.defaultDemoChannel}
              defaultQuestionShort={variant.defaultDemoQuestionShort}
              defaultQuestionLong={variant.defaultDemoQuestionLong}
            />
          </AnimateOnScroll>

          {/* Headline + subtitle + CTAs */}
          <AnimateOnScroll delay={400}>
            <h1 className="mx-auto mt-10 max-w-4xl text-center text-2xl font-bold leading-[1.12] tracking-tight text-cream sm:mt-12 sm:text-3xl md:text-4xl lg:text-5xl">
              {variant.heroHeadline}{" "}
              <span className="bg-gradient-to-r from-primary to-[#7bc361] bg-clip-text text-transparent">
                {variant.heroHeadlineAccent}
              </span>
            </h1>
          </AnimateOnScroll>

          <div className="mx-auto mt-4 max-w-2xl text-center sm:mt-6">
            <AnimateOnScroll delay={500}>
              <p className="text-sm leading-relaxed text-gray-text sm:text-base md:text-lg">
                {variant.heroSubheadline}
              </p>
            </AnimateOnScroll>

            <AnimateOnScroll delay={600}>
              <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:mt-6 sm:flex-row sm:gap-4">
                <Link
                  href="/try"
                  className="glow-pulse inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover sm:w-auto"
                >
                  {variant.primaryCtaText}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] px-7 py-3.5 text-sm font-medium text-cream transition-colors hover:bg-white/[0.04] sm:w-auto"
                >
                  {variant.secondaryCtaText}
                </Link>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Below-hero section (variant-specific, optional) */}
      {variant.belowHeroSection && (
        <section className="overflow-hidden border-t border-white/[0.06] px-6 py-16 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <AnimateOnScroll>
              <h2 className="text-2xl font-bold text-cream md:text-3xl">
                {variant.belowHeroSection.title}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-gray-text md:text-lg">
                {variant.belowHeroSection.body}
              </p>
            </AnimateOnScroll>
          </div>
        </section>
      )}

      {/* Trust Strip */}
      <section className="overflow-hidden border-t border-white/[0.06] px-6 py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <AnimateOnScroll>
            <p className="mb-8 text-center text-xs font-medium uppercase tracking-[0.2em] text-gray-text/50">
              Trusted by fans of
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll delay={150}>
            <div className="flex items-start justify-start gap-6 overflow-x-auto pb-2 md:justify-center md:gap-8">
              {[
                { name: "Andrew Huberman", logo: "/static/andrew_huberman_avatar.jpg" },
                { name: "Dr Brad Stanfield", logo: "/static/dr_brad_stanfield_avatar.jpg" },
                { name: "Anthony Chaffee MD", logo: "/static/anthony_chaffee_md_avatar.jpg" },
                { name: "Bryan Johnson", logo: "/static/bryan_johnson_avatar.jpg" },
                { name: "FoundMyFitness", logo: "/static/foundmyfitness_avatar.jpg" },
                { name: "Bright Insight", logo: "/static/bright_insight_avatar.jpg" },
                { name: "UnchartedX", logo: "/static/UnchartedX.jpg" },
                { name: "Randall Carlson", logo: "/static/the_randall_carlson_avatar.jpg" },
              ].map((c) => (
                <div key={c.name} className="flex shrink-0 flex-col items-center gap-2">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full">
                    <Image
                      src={`https://mindvault.ikigai-dynamics.com${c.logo}`}
                      alt={c.name}
                      width={48}
                      height={48}
                      className="h-full w-full object-cover opacity-70 transition-opacity hover:opacity-100"
                      unoptimized
                    />
                  </div>
                  <span className="max-w-[72px] text-center text-[10px] leading-tight text-gray-text/60">
                    {c.name}
                  </span>
                </div>
              ))}
              <Link href="/channels" className="flex shrink-0 flex-col items-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-xs font-bold text-primary transition-colors hover:bg-white/[0.06]">
                  +24
                </div>
                <span className="text-[10px] text-primary">more</span>
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="overflow-hidden border-t border-white/[0.06] px-6 py-20 md:py-24">
        <div className="mx-auto max-w-4xl">
          <AnimateOnScroll>
            <p className="mb-12 text-center text-xs font-semibold uppercase tracking-[0.2em] text-primary/70">
              The numbers speak for themselves
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll delay={150}>
            <div className="grid grid-cols-1 gap-10 text-center md:grid-cols-3 md:gap-6">
              <div>
                <p className="text-5xl font-bold text-primary md:text-6xl">50+</p>
                <p className="mt-2 text-sm uppercase tracking-wide text-gray-text">trusted creators</p>
              </div>
              <div>
                <p className="text-5xl font-bold text-primary md:text-6xl">10,000+</p>
                <p className="mt-2 text-sm uppercase tracking-wide text-gray-text">videos indexed</p>
              </div>
              <div>
                <p className="text-5xl font-bold text-primary md:text-6xl">300,000+</p>
                <p className="mt-2 text-sm uppercase tracking-wide text-gray-text">searchable moments</p>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative overflow-hidden border-t border-white/[0.06] px-6 py-24 md:py-32">
        <div className="mx-auto max-w-5xl">
          <AnimateOnScroll>
            <div className="text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/70">How it works</span>
              <h2 className="mt-3 text-3xl font-bold text-cream md:text-4xl">Three steps to any answer</h2>
            </div>
          </AnimateOnScroll>
          <div className="relative mt-16 grid gap-8 md:grid-cols-3 md:gap-6">
            <div className="step-connector pointer-events-none absolute left-[20%] right-[20%] top-12 -z-10 hidden h-px md:block" />
            {STEPS.map((step, i) => (
              <AnimateOnScroll key={step.number} delay={i * 150}>
                <div className="group relative text-center">
                  <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
                    <div className="absolute inset-0 rounded-2xl bg-primary/[0.06] transition-colors duration-300 group-hover:bg-primary/[0.12]" />
                    <div className="relative flex flex-col items-center">
                      <step.icon className="h-7 w-7 text-primary" />
                      <span className="mt-1 text-[10px] font-bold tracking-widest text-primary/50">{step.number}</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-cream">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-text">{step.description}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* How Is This Different */}
      <section className="overflow-hidden border-t border-white/[0.06] px-6 py-24 md:py-32">
        <div className="mx-auto max-w-4xl">
          <AnimateOnScroll>
            <h2 className="text-center text-2xl font-bold text-cream md:text-3xl">
              {comparison.title}
            </h2>
            {comparison.subtitle && (
              <p className="mt-2 text-center text-sm text-gray-text/60">
                {comparison.subtitle}
              </p>
            )}
          </AnimateOnScroll>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            <AnimateOnScroll delay={100}>
              <div className="rounded-2xl border border-red-500/10 bg-red-500/[0.03] p-6">
                <div className="mb-4 flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10">
                    <Bot className="h-4.5 w-4.5 text-red-400" />
                  </div>
                  <span className="text-sm font-semibold text-red-400">Generic AI</span>
                </div>
                <ul className="space-y-3">
                  {comparison.genericAiPoints.map((point) => (
                    <li key={point} className="flex items-start gap-2.5 text-sm leading-relaxed text-gray-text">
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400/50" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll delay={250}>
              <div className="rounded-2xl border border-primary/15 bg-primary/[0.04] p-6">
                <div className="mb-4 flex items-center gap-2.5">
                  <Image src="/TubeVault_Logo_noBG.png" alt="TubeVault" width={32} height={32} className="h-8 w-8" />
                  <span className="text-sm font-semibold text-primary">TubeVault</span>
                </div>
                <ul className="space-y-3">
                  {comparison.tubeVaultPoints.map((point) => (
                    <li key={point} className="flex items-start gap-2.5 text-sm leading-relaxed text-cream/80">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </AnimateOnScroll>
          </div>

          <AnimateOnScroll delay={400}>
            <p className="mt-8 text-center text-base leading-relaxed text-gray-text">
              No hallucinations. No generic AI advice.{" "}
              <span className="text-cream">Just the real expert talking.</span>
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="overflow-hidden border-t border-white/[0.06] px-6 py-24 md:py-32">
        <AnimateOnScroll>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-cream md:text-4xl">
              Stop scrubbing through videos.
              <br />
              <span className="text-primary">Start finding answers.</span>
            </h2>
            <p className="mt-4 text-gray-text">Free to start. No credit card required.</p>
            <div className="mt-8">
              <Link
                href="/try"
                className="glow-pulse inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 font-semibold text-white transition-colors hover:bg-primary-hover"
              >
                {variant.primaryCtaText}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </AnimateOnScroll>
      </section>

      {/* Footer */}
      <footer className="overflow-hidden border-t border-white/[0.06] px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 md:grid-cols-4">
            <div className="md:col-span-2">
              <Image src="/TubeVault_Logo_noBG.png" alt="TubeVault" width={40} height={40} />
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-gray-text/70">
                AI-powered semantic search for YouTube. Ask questions, get answers with timestamps.
              </p>
              <p className="mt-4 text-xs text-gray-text/40">Built by IkigAI Dynamics</p>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-text/50">Product</h4>
              <ul className="mt-4 space-y-2.5">
                <li><Link href="/channels" className="text-sm text-gray-text transition-colors hover:text-cream">Channels</Link></li>
                <li><Link href="/pricing" className="text-sm text-gray-text transition-colors hover:text-cream">Pricing</Link></li>
                <li><Link href="/login" className="text-sm text-gray-text transition-colors hover:text-cream">Login</Link></li>
                <li><Link href="/signup" className="text-sm text-gray-text transition-colors hover:text-cream">Sign up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-text/50">Legal</h4>
              <ul className="mt-4 space-y-2.5">
                <li><Link href="/terms" className="text-sm text-gray-text transition-colors hover:text-cream">Terms of Service</Link></li>
                <li><Link href="/privacy" className="text-sm text-gray-text transition-colors hover:text-cream">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 sm:flex-row">
            <p className="text-xs text-gray-text/40">&copy; 2026 IkigAI Dynamics. All rights reserved.</p>
            <Image src="/IkigAI_Logo_Transparent.png" alt="IkigAI Dynamics" width={120} height={40} className="h-24 w-auto opacity-40" />
          </div>
        </div>
      </footer>
    </div>
  );
}
