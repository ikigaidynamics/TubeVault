"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Sparkles, ChevronDown, Zap, Loader2 } from "lucide-react";
import type { PriceKey } from "@/lib/stripe";

interface Tier {
  name: string;
  slug: "free" | "starter" | "pro" | "premium";
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  features: string[];
  cta: string;
  highlighted: boolean;
  badge: string | null;
}

const tiers: Tier[] = [
  {
    name: "Free",
    slug: "free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: "Get started with AI-powered search",
    features: [
      "3 channels accessible",
      "5 questions per day",
      "Chat search only",
      "Community support",
    ],
    cta: "Get started free",
    highlighted: false,
    badge: null,
  },
  {
    name: "Starter",
    slug: "starter",
    monthlyPrice: 9,
    yearlyPrice: 90,
    description: "For curious minds who want more",
    features: [
      "10 channels accessible",
      "Unlimited questions",
      "Chat search",
      "Email support",
    ],
    cta: "Start searching",
    highlighted: false,
    badge: null,
  },
  {
    name: "Pro",
    slug: "pro",
    monthlyPrice: 19,
    yearlyPrice: 190,
    description: "Full access for power users",
    features: [
      "30 channels accessible",
      "Unlimited questions",
      "Chat search",
      "Full transcript access",
      "Translation to 100+ languages",
      "Priority support",
    ],
    cta: "Go Pro",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Premium",
    slug: "premium",
    monthlyPrice: 39,
    yearlyPrice: 390,
    description: "Everything, plus exclusive features",
    features: [
      "All channels accessible",
      "Unlimited questions",
      "Chat search",
      "Full transcript access",
      "Translation to 100+ languages",
      "Cross-channel search",
      "Priority support",
      "Early access to new features",
    ],
    cta: "Get Premium",
    highlighted: false,
    badge: null,
  },
];

const faqs = [
  {
    question: "Can I change plans later?",
    answer:
      "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate the difference.",
  },
  {
    question: "What counts as a channel?",
    answer:
      "Each YouTube channel we've indexed counts as one channel. For example, Andrew Huberman and Bryan Johnson are two separate channels.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "The Free tier is your trial — no credit card needed. Use it as long as you want, and upgrade when you need more.",
  },
  {
    question: "What is cross-channel search?",
    answer:
      "Cross-channel search lets you search across all indexed channels at once. Ask a question and get answers from multiple creators in a single query.",
  },
];

function FAQItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-white/[0.06]">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="text-sm font-medium text-cream">{question}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-gray-text/50 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? "max-h-40 pb-5" : "max-h-0"
        }`}
      >
        <p className="text-sm leading-relaxed text-gray-text">{answer}</p>
      </div>
    </div>
  );
}

function PricingCard({
  tier,
  yearly,
}: {
  tier: Tier;
  yearly: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const price = yearly ? tier.yearlyPrice : tier.monthlyPrice;
  const period = tier.monthlyPrice === 0 ? "" : yearly ? "/year" : "/mo";

  async function handleClick() {
    if (tier.slug === "free") {
      router.push("/signup");
      return;
    }

    setLoading(true);
    try {
      const priceKey: PriceKey = `${tier.slug}_${yearly ? "yearly" : "monthly"}` as PriceKey;
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceKey }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else if (res.status === 401) {
        router.push(`/login?redirect=/pricing`);
      } else {
        console.error("Checkout error:", data.error);
      }
    } catch {
      console.error("Failed to create checkout session");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-6 transition-all duration-300 ${
        tier.highlighted
          ? "scale-[1.03] border-primary/50 bg-primary/[0.04] ring-1 ring-primary/20 shadow-[0_0_40px_rgba(101,174,76,0.1)]"
          : "border-white/[0.08] bg-white/[0.02] hover:border-primary/20 hover:shadow-md"
      }`}
    >
      {tier.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-white shadow-lg shadow-primary/30">
            <Zap className="h-3 w-3" />
            {tier.badge}
          </span>
        </div>
      )}

      <div className={tier.badge ? "pt-2" : ""}>
        <h3 className="text-base font-semibold text-cream">{tier.name}</h3>
        <p className="mt-1 text-xs text-gray-text/60">{tier.description}</p>
      </div>

      <div className="mt-5 flex items-baseline gap-1">
        <span className="text-4xl font-bold text-cream">${price}</span>
        {period && <span className="text-sm text-gray-text">{period}</span>}
      </div>
      {yearly && tier.monthlyPrice > 0 && (
        <p className="mt-1 text-xs text-primary/70">
          ${tier.monthlyPrice * 12 - tier.yearlyPrice} saved per year
        </p>
      )}

      <ul className="mt-6 flex-1 space-y-3">
        {tier.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm">
            <Check
              className={`mt-0.5 h-4 w-4 shrink-0 ${
                tier.highlighted ? "text-primary" : "text-primary/60"
              }`}
            />
            <span className="text-gray-text">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={handleClick}
        disabled={loading}
        className={`mt-8 flex items-center justify-center gap-2 rounded-xl py-3 text-center text-sm font-semibold transition-all ${
          tier.highlighted
            ? "bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary-hover"
            : "border border-white/[0.1] text-cream hover:border-primary/30 hover:bg-primary/[0.04]"
        } disabled:opacity-50`}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {tier.cta}
      </button>
    </div>
  );
}

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);

  return (
    <div className="min-h-screen bg-dark-bg">
      <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#1d1d1d]">
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
          <Link
            href="/signup"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover md:hidden"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <section className="px-6 pt-20 pb-4 text-center">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight text-cream md:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-base text-gray-text">
            Choose the plan that fits your curiosity. Upgrade or downgrade
            anytime.
          </p>

          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-white/[0.08] bg-white/[0.03] p-1">
            <button
              onClick={() => setYearly(false)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                !yearly
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "text-gray-text hover:text-cream"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all ${
                yearly
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "text-gray-text hover:text-cream"
              }`}
            >
              Yearly
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  yearly
                    ? "bg-white/20 text-white"
                    : "bg-primary/10 text-primary"
                }`}
              >
                2 months free
              </span>
            </button>
          </div>
        </div>
      </section>

      <section className="px-6 py-12">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2 lg:grid-cols-4">
          {tiers.map((tier) => (
            <PricingCard key={tier.slug} tier={tier} yearly={yearly} />
          ))}
        </div>
      </section>

      <section className="border-t border-white/[0.06] px-6 py-20">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center text-2xl font-bold text-cream">
            Frequently asked questions
          </h2>
          <div className="mt-10">
            {faqs.map((faq) => (
              <FAQItem
                key={faq.question}
                question={faq.question}
                answer={faq.answer}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/[0.06] px-6 py-20">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-2xl font-bold text-cream">
            Ready to start searching?
          </h2>
          <p className="mt-3 text-sm text-gray-text">
            No credit card required. Start with the free plan today.
          </p>
          <Link
            href="/signup"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            Get started free
          </Link>
        </div>
      </section>
    </div>
  );
}
