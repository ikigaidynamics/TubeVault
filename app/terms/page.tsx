import Link from "next/link";
import { Navbar } from "@/components/shared/navbar";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar />
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold text-cream">Terms of Service</h1>
        <p className="mt-2 text-sm text-gray-text">
          TubeVault &middot; tubevault.io
          <br />
          Effective date: June 2025 &middot; Operator: IkigAI Dynamics, Robin Jost, Cottbus, Germany
        </p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-cream/80">
          {/* 1 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">1. Operator and Scope</h2>
            <p>TubeVault (tubevault.io) is operated by:</p>
            <p className="mt-2">
              Robin Jost &middot; IkigAI Dynamics<br />
              Cottbus, Germany<br />
              Email:{" "}
              <a href="mailto:legal@ikigai-dynamics.com" className="text-primary hover:text-primary-hover">
                legal@ikigai-dynamics.com
              </a>
            </p>
            <p className="mt-2">
              These Terms apply to all users of the TubeVault platform, including the website
              tubevault.io, its API, and any associated applications. Conflicting terms and conditions
              of users are not accepted unless we have expressly agreed to them in writing.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">2. Description of Services</h2>
            <p>
              TubeVault is an AI-powered semantic search platform that enables users to search the
              content of YouTube channel archives using natural language queries and receive
              AI-generated answers with source references and timestamp links to the original videos
              on YouTube.
            </p>

            <h3 className="mb-2 mt-4 text-base font-medium text-cream">2.1 Core Features</h3>
            <ul className="ml-4 list-disc space-y-1.5">
              <li>Semantic search across indexed YouTube channel archives</li>
              <li>AI-generated answers based on transcript excerpts (GPT-4o-mini by OpenAI)</li>
              <li>Timestamp links to source videos on YouTube</li>
              <li>Access to transcripts (depending on subscription tier)</li>
              <li>Cross-channel search (Premium tier)</li>
            </ul>

            <h3 className="mb-2 mt-4 text-base font-medium text-cream">2.2 Important Disclaimer on AI-Generated Content</h3>
            <p>
              AI-generated answers are summaries based on indexed transcripts. They may contain
              inaccuracies, omissions or misinterpretations. Always verify answers using the provided
              source links. TubeVault answers are not a substitute for professional advice.
            </p>

            <h3 className="mb-2 mt-4 text-base font-medium text-cream">2.3 Availability</h3>
            <p>
              We strive for high platform availability but cannot guarantee uninterrupted service.
              Maintenance, technical issues or third-party service outages may temporarily affect
              usability. No guaranteed uptime level is warranted.
            </p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">3. Registration and User Account</h2>
            <p>
              A user account is required to access paid features. You may register using an email
              address or your Google account.
            </p>
            <p className="mt-2">By registering, you confirm that:</p>
            <ul className="ml-4 mt-1 list-disc space-y-1.5">
              <li>You are at least 16 years of age</li>
              <li>The information you provide is complete and accurate</li>
              <li>You will keep your login credentials secure and will not share them with third parties</li>
              <li>You will notify us immediately if you become aware of any unauthorised use of your account</li>
            </ul>
            <p className="mt-2">
              One account per person and email address is permitted. Sharing account credentials or
              using a single account for multiple people is not allowed.
            </p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">4. Pricing and Subscriptions</h2>

            <h3 className="mb-2 mt-4 text-base font-medium text-cream">4.1 Available Plans</h3>
            <p>
              Prices are shown in US Dollars (USD). The amount charged in your local currency may vary
              due to exchange rate fluctuations. Payment processing is handled by Stripe, Inc.
            </p>

            <h3 className="mb-2 mt-4 text-base font-medium text-cream">4.2 Subscription and Auto-Renewal</h3>
            <p>
              Subscriptions are billed monthly and renew automatically for successive monthly periods
              unless cancelled before the end of the current billing period. You may cancel at any time
              in your account settings or by emailing{" "}
              <a href="mailto:legal@ikigai-dynamics.com" className="text-primary hover:text-primary-hover">
                legal@ikigai-dynamics.com
              </a>.
            </p>

            <h3 className="mb-2 mt-4 text-base font-medium text-cream">4.3 Right of Withdrawal (EU Consumers)</h3>
            <p>
              As an EU consumer, you have a statutory right of withdrawal within 14 days of purchase.
              By using the service during the withdrawal period, you acknowledge that you may lose your
              right of withdrawal upon full performance of the contract.
            </p>

            <h3 className="mb-2 mt-4 text-base font-medium text-cream">4.4 Price Changes</h3>
            <p>
              We reserve the right to change prices. Existing subscribers will be notified by email at
              least 30 days before any price increase takes effect. Continued use of the platform after
              the effective date constitutes acceptance of the new price. You have the right to cancel
              your subscription before the change takes effect.
            </p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">5. Acceptable Use and Prohibited Activities</h2>
            <p>You agree to use TubeVault solely in accordance with these Terms and applicable law.</p>

            <h3 className="mb-2 mt-4 text-base font-medium text-cream">5.1 Prohibited Activities</h3>
            <p>The following activities are expressly prohibited:</p>
            <ul className="ml-4 mt-1 list-disc space-y-1.5">
              <li><strong className="text-cream">Automated querying:</strong> Use of bots, crawlers, scripts or other automated means to mass-query the platform</li>
              <li><strong className="text-cream">Circumventing usage limits:</strong> Technically bypassing query limits, e.g. through multiple accounts or manipulation of browser characteristics</li>
              <li><strong className="text-cream">Reverse engineering:</strong> Decompiling, disassembling or otherwise attempting to derive source code or underlying algorithms</li>
              <li><strong className="text-cream">Resale:</strong> Commercial resale of TubeVault answers or content without prior written authorisation</li>
              <li><strong className="text-cream">Harmful content:</strong> Submitting content that is unlawful, defamatory, harassing, threatening or otherwise objectionable</li>
              <li><strong className="text-cream">Security breaches:</strong> Attempts to compromise the platform&apos;s security infrastructure</li>
              <li><strong className="text-cream">AI misuse:</strong> Attempts to cause the AI to generate harmful, misleading or unlawful content</li>
            </ul>

            <h3 className="mb-2 mt-4 text-base font-medium text-cream">5.2 Consequences of Violations</h3>
            <p>
              In the event of a breach of these Terms, we reserve the right to suspend or permanently
              terminate your access to TubeVault without refund of amounts already paid.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">6. Intellectual Property</h2>

            <h3 className="mb-2 mt-4 text-base font-medium text-cream">6.1 Platform Rights</h3>
            <p>
              TubeVault, including its source code, user interface, search algorithms, database
              structure and branding, is the intellectual property of Robin Jost / IkigAI Dynamics
              and is protected by copyright. Use of the platform does not grant any right to copy,
              distribute or modify these elements.
            </p>

            <h3 className="mb-2 mt-4 text-base font-medium text-cream">6.2 Third-Party Content (Creator Content)</h3>
            <p>
              The content searchable through TubeVault (transcripts, videos) is owned by the respective
              YouTube creators and protected by their copyrights. TubeVault provides a search function
              only and links to original content on YouTube. Downloading, copying or otherwise using
              this content outside of TubeVault without the explicit permission of the respective rights
              holders is not permitted.
            </p>

            <h3 className="mb-2 mt-4 text-base font-medium text-cream">6.3 AI-Generated Answers</h3>
            <p>
              AI-generated answers produced by TubeVault are created from transcript excerpts. No
              copyright claims are asserted over these answers. Your use of the answers is limited to
              the scope of these Terms and your subscription plan.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">7. Limitation of Liability</h2>

            <h3 className="mb-2 mt-4 text-base font-medium text-cream">7.1 No Substitute for Professional Advice</h3>
            <p>
              TubeVault and its AI-generated answers do not replace professional medical, legal, tax or
              financial advice. This applies in particular to health and nutrition content. Never make
              decisions affecting your health or legal situation based solely on TubeVault answers.
            </p>

            <h3 className="mb-2 mt-4 text-base font-medium text-cream">7.2 Technical Limitations of Liability</h3>
            <p>We are not liable for:</p>
            <ul className="ml-4 mt-1 list-disc space-y-1.5">
              <li>Outages or interruptions to the platform</li>
              <li>Inaccuracies, incompleteness or errors in AI-generated answers</li>
              <li>Failures of third-party services (OpenAI, Supabase, Stripe, Hetzner, Google)</li>
              <li>Data loss, unless caused by gross negligence or wilful misconduct on our part</li>
              <li>Content on linked external websites (YouTube or other third-party sites)</li>
            </ul>

            <h3 className="mb-2 mt-4 text-base font-medium text-cream">7.3 Mandatory Liability</h3>
            <p>
              Nothing in these Terms limits or excludes liability for: death or personal injury caused
              by negligence; fraud or fraudulent misrepresentation; or any other liability that cannot
              be limited or excluded under applicable law (including the German Product Liability Act).
            </p>

            <h3 className="mb-2 mt-4 text-base font-medium text-cream">7.4 Liability Cap</h3>
            <p>
              To the fullest extent permitted by applicable law, our total aggregate liability to you
              in connection with these Terms shall not exceed the total amount paid by you to TubeVault
              in the 12 months preceding the claim.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">8. Termination and Account Deletion</h2>

            <h3 className="mb-2 mt-4 text-base font-medium text-cream">8.1 Cancellation by User</h3>
            <p>
              You may cancel your subscription at any time in your account settings. Your subscription
              will remain active until the end of the current billing period. Amounts already paid are
              not refunded on a pro-rata basis (except where the right of withdrawal applies under
              Section 4.3).
            </p>
            <p className="mt-2">
              To request full account deletion (including all personal data), use the
              &ldquo;Delete Account&rdquo; function in your settings or contact us at{" "}
              <a href="mailto:legal@ikigai-dynamics.com" className="text-primary hover:text-primary-hover">
                legal@ikigai-dynamics.com
              </a>.
            </p>

            <h3 className="mb-2 mt-4 text-base font-medium text-cream">8.2 Termination by TubeVault</h3>
            <p>We reserve the right to suspend or delete user accounts if:</p>
            <ul className="ml-4 mt-1 list-disc space-y-1.5">
              <li>You breach these Terms of Service</li>
              <li>Outstanding payments remain unsettled</li>
              <li>We are required to do so by law</li>
              <li>The service is discontinued (with reasonable notice of at least 30 days)</li>
            </ul>
          </section>

          {/* 9 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">9. Changes to These Terms</h2>
            <p>
              We reserve the right to amend these Terms. Material changes will be communicated to
              registered users by email at least 30 days before they take effect. Continued use of the
              platform after the effective date constitutes acceptance of the updated Terms. If you
              object to any change, you have the right to cancel your subscription with immediate
              effect and receive a pro-rata refund.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">10. Governing Law and Dispute Resolution</h2>

            <h3 className="mb-2 mt-4 text-base font-medium text-cream">10.1 Governing Law</h3>
            <p>
              These Terms are governed by the laws of the Federal Republic of Germany, excluding the
              UN Convention on Contracts for the International Sale of Goods (CISG). For consumers
              resident in another EU member state, the mandatory consumer protection provisions of
              that country continue to apply.
            </p>

            <h3 className="mb-2 mt-4 text-base font-medium text-cream">10.2 Jurisdiction</h3>
            <p>
              For disputes with users who are merchants, legal entities under public law or
              public-law special funds, the exclusive place of jurisdiction is Cottbus, Germany.
              For consumers, the statutory place of jurisdiction applies. We are not obliged to
              participate in consumer arbitration proceedings and do not generally do so.
            </p>

            <h3 className="mb-2 mt-4 text-base font-medium text-cream">10.3 EU Online Dispute Resolution</h3>
            <p>
              The European Commission provides an Online Dispute Resolution (ODR) platform:{" "}
              <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-hover">
                https://ec.europa.eu/consumers/odr
              </a>
            </p>
            <p className="mt-1">
              Our email address:{" "}
              <a href="mailto:legal@ikigai-dynamics.com" className="text-primary hover:text-primary-hover">
                legal@ikigai-dynamics.com
              </a>
            </p>
            <p className="mt-1">
              We are not obliged and do not undertake to participate in dispute resolution proceedings
              before a consumer arbitration board.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">11. General Provisions</h2>

            <h3 className="mb-2 mt-4 text-base font-medium text-cream">11.1 Severability</h3>
            <p>
              If any provision of these Terms is found to be invalid or unenforceable, the remaining
              provisions shall remain in full force and effect. The invalid provision shall be replaced
              by a valid provision that comes closest to the economic purpose of the invalid provision.
            </p>

            <h3 className="mb-2 mt-4 text-base font-medium text-cream">11.2 No Assignment</h3>
            <p>
              You may not assign or transfer your rights and obligations under these Terms to any third
              party without our prior written consent. We may assign our rights and obligations &mdash;
              in particular in the event of a business transfer &mdash; and will notify you accordingly.
            </p>

            <h3 className="mb-2 mt-4 text-base font-medium text-cream">11.3 Entire Agreement</h3>
            <p>
              These Terms of Service and the{" "}
              <Link href="/privacy" className="text-primary hover:text-primary-hover">
                Privacy Policy
              </Link>{" "}
              constitute the entire agreement between you and IkigAI Dynamics regarding your use of
              TubeVault and supersede all prior oral or written agreements.
            </p>

            <h3 className="mb-2 mt-4 text-base font-medium text-cream">11.4 Contact</h3>
            <p>
              General enquiries:{" "}
              <a href="mailto:hello@tubevault.io" className="text-primary hover:text-primary-hover">hello@tubevault.io</a>
              <br />
              Legal matters:{" "}
              <a href="mailto:legal@ikigai-dynamics.com" className="text-primary hover:text-primary-hover">legal@ikigai-dynamics.com</a>
              <br />
              Privacy matters:{" "}
              <a href="mailto:privacy@ikigai-dynamics.com" className="text-primary hover:text-primary-hover">privacy@ikigai-dynamics.com</a>
            </p>
          </section>

          {/* Annex */}
          <section className="border-t border-white/[0.06] pt-8">
            <h2 className="mb-3 text-lg font-semibold text-cream">Annex: Legal Notice (Impressum)</h2>
            <p>Information pursuant to &sect; 5 TMG:</p>
            <p className="mt-2">
              Robin Jost<br />
              IkigAI Dynamics<br />
              Cottbus, Germany
            </p>
            <p className="mt-2">
              Email:{" "}
              <a href="mailto:legal@ikigai-dynamics.com" className="text-primary hover:text-primary-hover">
                legal@ikigai-dynamics.com
              </a>
            </p>
            <p className="mt-2">
              Note: VAT-exempt pursuant to &sect; 19 UStG (German small business regulation). No VAT is
              charged. A VAT identification number is not required as long as no B2B transactions are
              made to customers in other EU member states.
            </p>
          </section>
        </div>

        <div className="mt-12 border-t border-white/[0.06] pt-6 text-xs text-gray-text/40">
          <p>TubeVault &middot; IkigAI Dynamics &middot; Robin Jost &middot; Cottbus, Germany</p>
        </div>

        <div className="mt-4">
          <Link href="/" className="text-sm text-gray-text transition-colors hover:text-cream">
            &larr; Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
