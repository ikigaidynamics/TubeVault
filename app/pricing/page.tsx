"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Check,
  ChevronDown,
  Zap,
  Loader2,
  Crown,
  Mail,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
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
  microcopy: string | null;
}

const tiers: Tier[] = [
  {
    name: "Free",
    slug: "free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: "Get started with AI-powered search",
    features: [
      "3 channels accessible (locked 30 days)",
      "3 questions per day",
      "Chat search only",
      "7-day search history",
      "Community support",
    ],
    cta: "Start free",
    highlighted: false,
    badge: null,
    microcopy: null,
  },
  {
    name: "Starter",
    slug: "starter",
    monthlyPrice: 9,
    yearlyPrice: 90,
    description: "For curious minds who want more",
    features: [
      "10 channels accessible (locked 14 days)",
      "30 questions per day",
      "Chat search",
      "30-day search history",
      "Email support",
      "Request channels",
    ],
    cta: "Get Starter",
    highlighted: false,
    badge: null,
    microcopy: null,
  },
  {
    name: "Pro",
    slug: "pro",
    monthlyPrice: 19,
    yearlyPrice: 190,
    description: "Full access for power users",
    features: [
      "All 30+ channels accessible",
      "Unlimited questions",
      "Chat search",
      "Full transcript access",
      "Translation to 10+ languages",
      "Forever search history",
      "Priority email support",
      "Request channels (priority)",
    ],
    cta: "Unlock Pro",
    highlighted: true,
    badge: "Most Popular \u2014 Recommended",
    microcopy: "for unlimited expert answers",
  },
  {
    name: "Premium",
    slug: "premium",
    monthlyPrice: 39,
    yearlyPrice: 390,
    description: "Everything, plus exclusive features",
    features: [
      "Everything in Pro, plus:",
      "Cross-channel search across all creators",
      "Priority support (chat + email)",
      "Early access to new features",
      "Custom creator requests",
      "Request channels (top priority)",
    ],
    cta: "Get Premium",
    highlighted: false,
    badge: null,
    microcopy: "for cross-channel insights",
  },
];

const TRUST_CREATORS = [
  { name: "Andrew Huberman", logo: "/static/andrew_huberman_avatar.jpg" },
  { name: "Dr Brad Stanfield", logo: "/static/dr_brad_stanfield_avatar.jpg" },
  { name: "Anthony Chaffee MD", logo: "/static/anthony_chaffee_md_avatar.jpg" },
  { name: "Bryan Johnson", logo: "/static/bryan_johnson_avatar.jpg" },
  { name: "FoundMyFitness", logo: "/static/foundmyfitness_avatar.jpg" },
  { name: "Bright Insight", logo: "/static/bright_insight_avatar.jpg" },
  { name: "UnchartedX", logo: "/static/UnchartedX.jpg" },
  { name: "Randall Carlson", logo: "/static/the_randall_carlson_avatar.jpg" },
];

const faqs = [
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes, cancel with one click. No questions asked.",
  },
  {
    question: "What if I'm not satisfied?",
    answer:
      "We offer a 7-day money-back guarantee on all paid plans.",
  },
  {
    question: "Can I change plans later?",
    answer:
      "Yes, upgrade or downgrade anytime. Pro-rated billing.",
  },
  {
    question: "What counts as a 'channel'?",
    answer:
      "Each YouTube creator's channel = one channel. We currently index 30+ trusted creators across health, history, and more.",
  },
  {
    question: "Do you offer discounts?",
    answer:
      "Annual plans save you ~17% (2 months free). For students or non-profits, contact us.",
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
          ? "border-2 border-primary bg-primary/[0.04] shadow-[0_0_30px_rgba(101,174,76,0.2)] z-10 -translate-y-2 lg:-translate-y-3"
          : "border-white/[0.08] bg-white/[0.02] hover:border-primary/20 hover:shadow-md"
      }`}
    >
      {tier.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-white shadow-lg shadow-primary/30">
            <Zap className="h-3 w-3" />
            {tier.badge}
          </span>
        </div>
      )}

      <div className={tier.badge ? "pt-2" : ""}>
        <h3 className="text-base font-semibold text-cream">{tier.name}</h3>
        <p className="mt-1 text-xs text-gray-text/60">{tier.description}</p>
      </div>

      {tier.monthlyPrice === 0 ? (
        <div className="mt-5 flex items-baseline gap-1">
          <span className="text-4xl font-bold text-cream">$0</span>
        </div>
      ) : yearly ? (
        <>
          <div className="mt-5 flex items-baseline gap-1">
            <span className="mr-1 text-lg text-gray-text/40 line-through">
              ${tier.monthlyPrice}
            </span>
            <span className="text-4xl font-bold text-cream">
              ${(tier.yearlyPrice / 12).toFixed(2).replace(/\.00$/, "")}
            </span>
            <span className="text-sm text-gray-text">/mo</span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <p className="text-xs text-gray-text/50">
              (${tier.yearlyPrice}/year)
            </p>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
              Save ${tier.monthlyPrice * 12 - tier.yearlyPrice}/year
            </span>
          </div>
        </>
      ) : (
        <>
          <div className="mt-5 flex items-baseline gap-1">
            <span className="text-4xl font-bold text-cream">${tier.monthlyPrice}</span>
            <span className="text-sm text-gray-text">/mo</span>
          </div>
          <p className="mt-1 text-xs text-gray-text/40">
            or ${tier.yearlyPrice}/year (save ${tier.monthlyPrice * 12 - tier.yearlyPrice})
          </p>
        </>
      )}
      {tier.microcopy && tier.monthlyPrice > 0 && (
        <p className="mt-2 text-[11px] font-medium text-primary/70">
          Less than ${(yearly ? tier.yearlyPrice / 365 : tier.monthlyPrice / 30).toFixed(2)}/day {tier.microcopy}
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
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export default function PricingPage() {
  const [yearly, setYearly] = useState(true);

  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar />

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
                Save ~17%
              </span>
            </button>
          </div>
        </div>
      </section>

      <section className="px-6 py-12">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2 lg:grid-cols-4 lg:items-stretch">
          {tiers.map((tier) => (
            <PricingCard key={tier.slug} tier={tier} yearly={yearly} />
          ))}
        </div>
      </section>

      {/* Money-back guarantee */}
      <section className="px-6 pb-12">
        <div className="mx-auto max-w-2xl">
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-primary/20 bg-primary/[0.04] px-6 py-6 text-center">
            <ShieldCheck className="h-7 w-7 text-primary" />
            <p className="text-sm font-semibold text-cream">
              7-Day Money-Back Guarantee
            </p>
            <p className="max-w-md text-xs leading-relaxed text-gray-text">
              Try Pro or Premium risk-free. Not satisfied? Full refund within 7
              days. No questions asked.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
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

      {/* Trust strip */}
      <section className="border-t border-white/[0.06] px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <p className="mb-8 text-center text-xs font-medium uppercase tracking-[0.2em] text-gray-text/50">
            Trusted by fans of
          </p>
          <div className="flex items-center justify-start gap-6 overflow-x-auto pb-2 md:justify-center md:gap-8">
            {TRUST_CREATORS.map((c) => (
              <div
                key={c.name}
                className="flex shrink-0 flex-col items-center gap-2"
              >
                <Image
                  src={`https://mindvault.ikigai-dynamics.com${c.logo}`}
                  alt={c.name}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full object-cover opacity-70 transition-opacity hover:opacity-100"
                  unoptimized
                />
                <span className="max-w-[72px] text-center text-[10px] leading-tight text-gray-text/60">
                  {c.name}
                </span>
              </div>
            ))}
            <Link
              href="/channels"
              className="flex shrink-0 flex-col items-center gap-2"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-xs font-bold text-primary transition-colors hover:bg-white/[0.06]">
                +22
              </div>
              <span className="text-[10px] text-primary">more</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
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
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Creator tier */}
      <section className="border-t border-white/[0.06] px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-primary/20 bg-primary/[0.03] px-8 py-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Crown className="h-7 w-7 text-primary" />
            </div>
            <h3 className="mt-5 text-xl font-bold text-cream">
              Are you a creator?
            </h3>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-gray-text">
              Get your channel on TubeVault and let your audience search your
              entire video library by meaning. Creator accounts include full
              platform access plus transcript editing and analytics (coming soon).
            </p>
            <a
              href="mailto:creators@ikigai-dynamics.com?subject=TubeVault Creator Account"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              <Mail className="h-4 w-4" />
              Contact us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
