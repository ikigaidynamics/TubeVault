import Link from "next/link";
import { Check } from "lucide-react";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: [
      "3 channels",
      "5 questions per day",
      "AI chat interface",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Starter",
    price: "$9",
    period: "/month",
    features: [
      "10 channels",
      "Unlimited questions",
      "AI chat interface",
      "Conversation history",
    ],
    cta: "Subscribe",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    features: [
      "All channels",
      "Unlimited questions",
      "Full transcripts",
      "Translation support",
      "Conversation history",
    ],
    cta: "Subscribe",
    highlighted: true,
  },
  {
    name: "Premium",
    price: "$39",
    period: "/month",
    features: [
      "All channels",
      "Unlimited questions",
      "Full transcripts",
      "Translation support",
      "Cross-channel search",
      "Priority support",
    ],
    cta: "Subscribe",
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-dark-bg">
      <nav className="border-b border-white/10 px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="text-xl font-bold text-cream">
            TubeVault
          </Link>
          <Link
            href="/login"
            className="text-sm text-gray-text hover:text-cream transition-colors"
          >
            Log in
          </Link>
        </div>
      </nav>

      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-cream">
              Simple, transparent pricing
            </h1>
            <p className="mt-4 text-gray-text">
              Choose the plan that fits your curiosity
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-xl border p-8 ${
                  tier.highlighted
                    ? "border-primary bg-primary/5"
                    : "border-white/10 bg-dark-surface"
                }`}
              >
                <h3 className="text-lg font-semibold text-cream">
                  {tier.name}
                </h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-cream">
                    {tier.price}
                  </span>
                  <span className="text-gray-text">{tier.period}</span>
                </div>
                <ul className="mt-8 space-y-3">
                  {tier.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm text-gray-text"
                    >
                      <Check className="h-4 w-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`mt-8 block rounded-lg py-2.5 text-center text-sm font-medium transition-colors ${
                    tier.highlighted
                      ? "bg-primary text-white hover:bg-primary-hover"
                      : "border border-white/10 text-cream hover:bg-white/5"
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
