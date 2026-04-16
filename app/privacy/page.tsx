import Link from "next/link";
import { Navbar } from "@/components/shared/navbar";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar />
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold text-cream">Privacy Policy</h1>
        <p className="mt-2 text-sm text-gray-text">
          TubeVault &middot; tubevault.io
          <br />
          Effective date: June 2025 &middot; Operator: Robin Jost, Cottbus, Germany
        </p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-cream/80">
          {/* 1 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">1. Data Controller</h2>
            <p>
              Data Controller within the meaning of Art. 4 No. 7 GDPR:
            </p>
            <p className="mt-2">
              Robin Jost<br />
              Cottbus, Germany<br />
              Email:{" "}
              <a href="mailto:jost@ikigai-dynamics.com" className="text-primary hover:text-primary-hover">
                jost@ikigai-dynamics.com
              </a><br />
              Website:{" "}
              <a href="https://tubevault.io" className="text-primary hover:text-primary-hover">
                https://tubevault.io
              </a>
            </p>
            <p className="mt-2">
              Note: Robin Jost operates as a sole trader (Einzelunternehmer). The appointment of a
              Data Protection Officer is not required under Art. 37 GDPR given the nature and scale
              of processing activities.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">2. Overview of Data Processed</h2>
            <p>When you use TubeVault, we process the following categories of personal data:</p>
            <ul className="ml-4 mt-2 list-disc space-y-1.5">
              <li><strong className="text-cream">Contact data:</strong> Email address (upon registration)</li>
              <li><strong className="text-cream">Profile data:</strong> Name and profile picture (when signing in with Google OAuth)</li>
              <li><strong className="text-cream">Usage data:</strong> Search queries, channel interactions, feature usage, conversion events</li>
              <li><strong className="text-cream">Technical data:</strong> IP address (in server logs), browser information</li>
              <li><strong className="text-cream">Payment data:</strong> Processed exclusively by Stripe &mdash; we do not receive or store payment card details</li>
              <li><strong className="text-cream">Technical identifiers:</strong> Hashed device characteristics for anonymous users (no persistent tracking)</li>
            </ul>
          </section>

          {/* 3 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">3. Legal Bases for Processing</h2>
            <p>We process personal data on the following legal bases:</p>
            <ul className="ml-4 mt-2 list-disc space-y-1.5">
              <li><strong className="text-cream">Art. 6(1)(b) GDPR</strong> &mdash; Processing necessary for the performance of a contract (providing the platform, managing subscriptions)</li>
              <li><strong className="text-cream">Art. 6(1)(c) GDPR</strong> &mdash; Processing necessary for compliance with a legal obligation (retention obligations under German commercial and tax law)</li>
              <li><strong className="text-cream">Art. 6(1)(f) GDPR</strong> &mdash; Processing based on legitimate interests (IT security, abuse prevention, product analytics, server logs)</li>
              <li><strong className="text-cream">Art. 6(1)(a) GDPR</strong> &mdash; Consent (where explicitly obtained, e.g. marketing emails)</li>
            </ul>
          </section>

          {/* 4 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">4. Registration and User Account</h2>

            <h3 className="mb-2 mt-4 text-base font-medium text-cream">4.1 Email Registration</h3>
            <p>
              To create an account, we collect your email address and a password you choose. This data
              is processed and stored via Supabase Auth (see Section 9).
            </p>
            <p className="mt-1">Legal basis: Art. 6(1)(b) GDPR</p>
            <p>Retention: For the duration of the contractual relationship; deletable at any time upon request (Section 12).</p>

            <h3 className="mb-2 mt-4 text-base font-medium text-cream">4.2 Google OAuth (Single Sign-On)</h3>
            <p>
              Alternatively, you may sign in using your Google account. Google transmits the following
              data to us: email address, display name, profile picture URL, and an anonymised Google
              user ID. We do not receive your Google password or access any Google data beyond what is
              necessary for authentication.
            </p>
            <p className="mt-1">
              Google Privacy Policy:{" "}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-hover">
                https://policies.google.com/privacy
              </a>
            </p>
            <p>Legal basis: Art. 6(1)(b) GDPR</p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">5. Search Queries and AI Answer Generation</h2>
            <p>
              TubeVault enables semantic search across indexed YouTube channel archives. Each search
              query is processed to generate an AI-assisted answer with source references.
            </p>

            <h3 className="mb-2 mt-4 text-base font-medium text-cream">5.1 Processing Steps</h3>
            <ul className="ml-4 list-disc space-y-1.5">
              <li>Your search input is used as a vector query against our local Qdrant database (Hetzner server, Germany)</li>
              <li>The most relevant transcript excerpts are identified</li>
              <li>Your search query and the relevant excerpts are transmitted to the OpenAI API (international transfer &mdash; see Section 9) to generate a summarised answer</li>
              <li>The answer is displayed to you with timestamp links to the source videos on YouTube</li>
            </ul>

            <h3 className="mb-2 mt-4 text-base font-medium text-cream">5.2 Purpose and Legal Basis</h3>
            <p>Purpose: Performance of contract (provision of the platform&apos;s core functionality)</p>
            <p>Legal basis: Art. 6(1)(b) GDPR</p>

            <h3 className="mb-2 mt-4 text-base font-medium text-cream">5.3 Storage of Search Queries</h3>
            <p>
              Search queries may be stored in our server logs for a maximum of 30 days for abuse
              prevention and IT security purposes. No personalised analysis of individual queries is
              carried out.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">6. Usage Analytics</h2>
            <p>
              To improve TubeVault and understand how users interact with the platform, we collect
              pseudonymised product analytics. All analytics data is stored exclusively on our own
              servers (Hetzner, Germany). We do not use any third-party analytics services such as
              Google Analytics or Mixpanel.
            </p>

            <h3 className="mb-2 mt-4 text-base font-medium text-cream">6.1 What We Collect</h3>
            <ul className="ml-4 list-disc space-y-1.5">
              <li><strong className="text-cream">Search queries</strong> &mdash; stored as a cryptographic SHA-256 hash; readable query text is stored for a maximum of 7 days then automatically deleted</li>
              <li><strong className="text-cream">Channel interactions</strong> &mdash; which channels are viewed and searched</li>
              <li><strong className="text-cream">Feature usage</strong> &mdash; which platform features are used (e.g. transcript view, cross-channel search)</li>
              <li><strong className="text-cream">Conversion events</strong> &mdash; upgrade button clicks, subscription starts, new signups</li>
              <li><strong className="text-cream">Answer quality</strong> &mdash; optional thumbs up / thumbs down ratings on AI-generated answers</li>
            </ul>

            <h3 className="mb-2 mt-4 text-base font-medium text-cream">6.2 Privacy Safeguards</h3>
            <ul className="ml-4 list-disc space-y-1.5">
              <li><strong className="text-cream">Unauthenticated users:</strong> only hashed data is stored, never raw query text</li>
              <li><strong className="text-cream">Authenticated users:</strong> raw query text is stored for a maximum of 7 days, then automatically nulled by a scheduled cleanup job</li>
              <li>Session identifiers are generated from a daily-rotated hash of browser characteristics &mdash; they do not persist across days and cannot identify you personally</li>
              <li>Aggregate statistics (without any personal reference) are retained indefinitely for product development purposes</li>
            </ul>

            <p className="mt-3">Legal basis: Art. 6(1)(f) GDPR &mdash; legitimate interest in improving the product and understanding user needs</p>
            <p>Retention: Raw queries: 7 days. Event logs: 30 days. Aggregates: indefinite (no personal data).</p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">7. Technical Identifiers for Anonymous Users</h2>
            <p>
              To limit use of the free tier to 5 queries per day for unauthenticated users, we generate
              a non-persistent hashed fingerprint from the following information:
            </p>
            <ul className="ml-4 mt-2 list-disc space-y-1.5">
              <li>Browser type and version (User-Agent string)</li>
              <li>Screen resolution</li>
              <li>Preferred browser language</li>
            </ul>
            <p className="mt-2">
              This fingerprint is stored as a cryptographic hash value. It does not enable identification
              of your person, is not stored persistently, and is scoped to the current calendar day. No
              cookies are set for this purpose.
            </p>
            <p className="mt-1">Legal basis: Art. 6(1)(f) GDPR (legitimate interest in preventing abuse of the free offering)</p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">8. Payment Processing</h2>
            <p>
              Subscription payments are processed entirely by Stripe, Inc. (USA). We do not store credit
              card numbers or full payment details. Stripe acts as a data processor under Art. 28 GDPR;
              a Data Processing Agreement is in place. Transfers to the USA are safeguarded by the
              EU&ndash;US Data Privacy Framework and Standard Contractual Clauses.
            </p>
            <p className="mt-2">
              Stripe Privacy Policy:{" "}
              <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-hover">
                https://stripe.com/privacy
              </a>
            </p>
            <p>Legal basis: Art. 6(1)(b) GDPR</p>
            <p>
              Retention: Stripe retains payment records in accordance with applicable financial
              record-keeping obligations (Germany: 10 years under HGB). Full deletion of Stripe payment
              data after account closure is therefore not always possible; such data is anonymised where
              deletion is not legally permissible.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">9. Service Providers and International Transfers</h2>
            <p>
              We engage the following service providers, each under a Data Processing Agreement (DPA)
              pursuant to Art. 28 GDPR:
            </p>

            <h3 className="mb-2 mt-4 text-base font-medium text-cream">9.1 Supabase</h3>
            <p>
              Supabase is used as our authentication provider and user data database, configured with
              an EU server location (Frankfurt). A DPA under Art. 28 GDPR is in place.
            </p>
            <p className="mt-1">
              Privacy information:{" "}
              <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-hover">
                https://supabase.com/privacy
              </a>
            </p>

            <h3 className="mb-2 mt-4 text-base font-medium text-cream">9.2 Hetzner Online GmbH</h3>
            <p>
              Our servers (application, vector database, embeddings, analytics) are located exclusively
              at Hetzner data centres in Germany. A DPA is in place with Hetzner.
            </p>
            <p className="mt-1">
              Privacy information:{" "}
              <a href="https://www.hetzner.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-hover">
                https://www.hetzner.com/legal/privacy-policy
              </a>
            </p>

            <h3 className="mb-2 mt-4 text-base font-medium text-cream">9.3 OpenAI (International Transfer to USA)</h3>
            <p>
              Your search queries are transmitted to OpenAI for AI answer generation. OpenAI processes
              this data in the USA. The transfer is based on EU Standard Contractual Clauses
              (Art. 46(2)(c) GDPR) and a Data Processing Agreement. Under OpenAI&apos;s API terms
              (as of 2024), data submitted via the API is not used by default for training AI models;
              we have contractually ensured this.
            </p>
            <p className="mt-1">
              Privacy information:{" "}
              <a href="https://openai.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-hover">
                https://openai.com/policies/privacy-policy
              </a>
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">10. Server Logs and Technical Data</h2>
            <p>When you access our platform, technical information is automatically recorded in server log files:</p>
            <ul className="ml-4 mt-2 list-disc space-y-1.5">
              <li>IP address (truncated after 24 hours)</li>
              <li>Date and time of access</li>
              <li>URL accessed</li>
              <li>HTTP status code</li>
              <li>Data volume transferred</li>
              <li>Browser type and operating system</li>
            </ul>
            <p className="mt-2">
              This data is used solely to ensure technical operation, IT security and abuse prevention.
              It is not combined with other data.
            </p>
            <p>Legal basis: Art. 6(1)(f) GDPR (legitimate interest)</p>
            <p>Retention: Maximum 30 days, then automatically deleted</p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">11. Data Security</h2>
            <p>We implement appropriate technical and organisational security measures, including:</p>
            <ul className="ml-4 mt-2 list-disc space-y-1.5">
              <li>Encrypted transmission via HTTPS/TLS (Let&apos;s Encrypt certificate via Caddy)</li>
              <li>Production database accessible only via secured SSH connections</li>
              <li>Qdrant vector database bound exclusively to localhost (no external access)</li>
              <li>CORS restrictions limited to authorised domains</li>
              <li>API key protection for administrative endpoints</li>
              <li>SSH password authentication disabled (key-based access only)</li>
            </ul>
            <p className="mt-2">Please note that no data transmission over the internet is entirely secure.</p>
          </section>

          {/* 12 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">12. Your Rights as a Data Subject</h2>
            <p>Under the GDPR, you have the following rights regarding your personal data:</p>

            <h3 className="mb-1 mt-3 text-base font-medium text-cream">Right of Access (Art. 15 GDPR)</h3>
            <p>You have the right to obtain confirmation of whether we process personal data about you and, if so, to receive a copy of that data free of charge.</p>

            <h3 className="mb-1 mt-3 text-base font-medium text-cream">Right to Rectification (Art. 16 GDPR)</h3>
            <p>You have the right to request correction of inaccurate or incomplete personal data.</p>

            <h3 className="mb-1 mt-3 text-base font-medium text-cream">Right to Erasure (Art. 17 GDPR)</h3>
            <p>
              You have the right to request deletion of your data, provided no statutory retention
              obligations apply. You can delete your account directly in your account settings under
              &ldquo;Delete Account&rdquo;. Upon deletion we will erase:
            </p>
            <ul className="ml-4 mt-1 list-disc space-y-1">
              <li>Your Supabase user account (including email, password hash, OAuth link)</li>
              <li>All stored search queries and analytics events associated with your account ID</li>
              <li>All preference data</li>
            </ul>
            <p className="mt-1">
              Stripe payment data cannot be fully deleted due to statutory retention obligations
              (German Tax Code / AO: 10 years); such data will be anonymised.
            </p>

            <h3 className="mb-1 mt-3 text-base font-medium text-cream">Right to Restriction of Processing (Art. 18 GDPR)</h3>
            <p>You have the right to request restriction of the processing of your data under the conditions set out in Art. 18 GDPR.</p>

            <h3 className="mb-1 mt-3 text-base font-medium text-cream">Right to Data Portability (Art. 20 GDPR)</h3>
            <p>You have the right to receive your data in a structured, commonly used and machine-readable format.</p>

            <h3 className="mb-1 mt-3 text-base font-medium text-cream">Right to Object (Art. 21 GDPR)</h3>
            <p>You have the right to object at any time to processing of your data based on Art. 6(1)(f) GDPR (legitimate interest), including profiling based on those provisions.</p>

            <h3 className="mb-1 mt-3 text-base font-medium text-cream">Right to Lodge a Complaint</h3>
            <p>You have the right to lodge a complaint with a supervisory authority. The authority competent for us is:</p>
            <p className="mt-1">
              Die Landesbeauftragte f&uuml;r den Datenschutz Brandenburg (LDA Brandenburg)<br />
              Stahnsdorfer Damm 77, 14532 Kleinmachnow, Germany<br />
              <a href="https://www.lda.brandenburg.de" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-hover">
                www.lda.brandenburg.de
              </a>
            </p>
            <p className="mt-1">You may also lodge a complaint with the supervisory authority in your country of residence or place of work within the EU.</p>
          </section>

          {/* 13 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">13. Data Retention Periods</h2>
            <p>
              Personal data is deleted as soon as it is no longer required for the processing purpose
              and no statutory retention obligations apply. See the specific sections above for
              retention periods applicable to each data category.
            </p>
          </section>

          {/* 14 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">14. Minors</h2>
            <p>
              TubeVault is not directed at children under the age of 16. We do not knowingly collect
              personal data from persons under 16. If we become aware that a person under 16 has
              created an account, we will delete the account and all associated data without delay.
            </p>
          </section>

          {/* 15 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">15. Changes to This Privacy Policy</h2>
            <p>
              We reserve the right to update this Privacy Policy as necessary, in particular when the
              platform changes, new service providers are engaged, or the legal framework evolves.
              Registered users will be notified of material changes by email. The date of the most
              recent update is always shown at the top of this document.
            </p>
          </section>

          {/* 16 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">16. Contact</h2>
            <p>
              For questions about data protection or to exercise your rights, please contact:
            </p>
            <p className="mt-2">
              Email:{" "}
              <a href="mailto:jost@ikigai-dynamics.com" className="text-primary hover:text-primary-hover">
                jost@ikigai-dynamics.com
              </a>
            </p>
            <p className="mt-1">We respond to requests within 30 days as required by Art. 12(3) GDPR.</p>
          </section>
        </div>

        <div className="mt-12 border-t border-white/[0.06] pt-6 text-xs text-gray-text/40">
          <p>TubeVault &middot; Robin Jost &middot; Cottbus, Germany</p>
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
