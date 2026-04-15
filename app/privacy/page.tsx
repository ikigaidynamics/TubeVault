import Link from "next/link";
import { Navbar } from "@/components/shared/navbar";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar />
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold text-cream">Privacy Policy</h1>
        <p className="mt-2 text-sm text-gray-text">Last updated: April 2026</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-cream/80">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">1. Data Controller</h2>
            <p>
              IkigAI Dynamics is the data controller for personal data processed through TubeVault.
              We are committed to protecting your privacy in accordance with the EU General Data
              Protection Regulation (GDPR).
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">2. Data We Collect</h2>
            <ul className="ml-4 list-disc space-y-1.5">
              <li>Account data: email address, name (when you sign up)</li>
              <li>Usage data: search queries, pages visited, timestamps</li>
              <li>Payment data: processed securely by Stripe &mdash; we do not store card details</li>
              <li>Technical data: IP address, browser type, device information</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">3. How We Use Your Data</h2>
            <ul className="ml-4 list-disc space-y-1.5">
              <li>To provide and improve the search service</li>
              <li>To manage your account and subscriptions</li>
              <li>To communicate service updates</li>
              <li>To prevent abuse and ensure platform security</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">4. Legal Basis (GDPR)</h2>
            <p>
              We process your data based on: (a) your consent, (b) performance of our contract with you,
              (c) our legitimate interests in operating and improving the Service, and (d) compliance with
              legal obligations.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">5. Third-Party Services</h2>
            <ul className="ml-4 list-disc space-y-1.5">
              <li>Supabase &mdash; authentication and user data storage</li>
              <li>Stripe &mdash; payment processing</li>
              <li>Hetzner &mdash; server hosting (EU-based)</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">6. Data Retention</h2>
            <p>
              We retain your data for as long as your account is active. Upon account deletion,
              personal data is removed within 30 days, except where retention is required by law.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">7. Your Rights</h2>
            <p>Under the GDPR, you have the right to:</p>
            <ul className="ml-4 mt-2 list-disc space-y-1.5">
              <li>Access your personal data</li>
              <li>Rectify inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Restrict or object to processing</li>
              <li>Data portability</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">8. Cookies</h2>
            <p>
              We use essential cookies for authentication and session management. No third-party
              tracking cookies are used.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">9. Contact</h2>
            <p>
              For privacy-related requests, contact us at{" "}
              <a href="mailto:contact@ikigai-dynamics.com" className="text-primary hover:text-primary-hover">
                contact@ikigai-dynamics.com
              </a>
            </p>
          </section>
        </div>

        <div className="mt-12 border-t border-white/[0.06] pt-6">
          <Link href="/" className="text-sm text-gray-text transition-colors hover:text-cream">
            &larr; Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
