import Link from "next/link";
import { Navbar } from "@/components/shared/navbar";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar />
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold text-cream">Terms of Service</h1>
        <p className="mt-2 text-sm text-gray-text">Last updated: April 2026</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-cream/80">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">1. Acceptance of Terms</h2>
            <p>
              By accessing or using TubeVault (&ldquo;the Service&rdquo;), operated by IkigAI Dynamics,
              you agree to be bound by these Terms of Service. If you do not agree, you may not use the Service.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">2. Description of Service</h2>
            <p>
              TubeVault provides AI-powered semantic search across indexed YouTube channel transcripts.
              Users can ask natural-language questions and receive answers with timestamped video sources.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">3. User Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials.
              You must provide accurate information when creating an account and promptly update it if it changes.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">4. Subscriptions &amp; Payments</h2>
            <p>
              Paid plans are billed monthly via Stripe. You may cancel at any time; access continues until
              the end of the current billing period. Refunds are handled on a case-by-case basis.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">5. Acceptable Use</h2>
            <p>
              You may not use the Service to scrape, redistribute, or commercially exploit the indexed content.
              Automated bulk querying without prior written consent is prohibited.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">6. Intellectual Property</h2>
            <p>
              All video content belongs to the respective YouTube creators. TubeVault indexes publicly
              available transcripts to facilitate search. The TubeVault platform, branding, and software
              are the property of IkigAI Dynamics.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">7. Disclaimer</h2>
            <p>
              The Service is provided &ldquo;as is&rdquo; without warranties of any kind. AI-generated
              answers may contain inaccuracies &mdash; always verify using the provided source links.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">8. Limitation of Liability</h2>
            <p>
              IkigAI Dynamics shall not be liable for any indirect, incidental, or consequential damages
              arising from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">9. Changes to Terms</h2>
            <p>
              We may update these terms at any time. Continued use of the Service after changes
              constitutes acceptance of the revised terms.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">10. Contact</h2>
            <p>
              Questions about these terms? Reach us at{" "}
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
