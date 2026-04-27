"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/shared/navbar";

const REQUEST_TYPES = [
  "Auskunft (Art. 15 DSGVO) / Right of Access",
  "Löschung (Art. 17 DSGVO) / Right to Erasure",
  "Berichtigung (Art. 16 DSGVO) / Right to Rectification",
  "Datenübertragbarkeit (Art. 20 DSGVO) / Right to Data Portability",
  "Widerspruch (Art. 21 DSGVO) / Right to Object",
] as const;

export default function DataRequestPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [requestType, setRequestType] = useState("");
  const [requestText, setRequestText] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email || !requestType || !requestText || !confirmed) {
      setError("Please fill in all required fields and confirm the checkbox. / Bitte füllen Sie alle Pflichtfelder aus und bestätigen Sie die Checkbox.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address. / Bitte geben Sie eine gültige E-Mail-Adresse ein.");
      return;
    }

    if (requestText.length < 20) {
      setError("Please describe your request in at least 20 characters. / Bitte beschreiben Sie Ihre Anfrage in mindestens 20 Zeichen.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/privacy/data-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || null,
          email,
          request_type: requestType,
          request_text: requestText,
          confirmation: true,
          website, // honeypot
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "An error occurred. Please try again. / Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("An error occurred. Please try again. / Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar />
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold text-cream">
          DSGVO-Anfrage / GDPR Data Request
        </h1>
        <p className="mt-2 text-sm text-gray-text">
          TubeVault &middot; tubevault.io
        </p>

        {submitted ? (
          <div className="mt-10 rounded-xl border border-primary/20 bg-primary/[0.05] p-6">
            <p className="text-sm leading-relaxed text-cream/80">
              Ihre Anfrage wurde &uuml;bermittelt. Wir antworten innerhalb von 30 Tagen
              gem&auml;&szlig; Art. 12 Abs. 3 DSGVO.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-cream/80">
              Your request has been submitted. We will respond within 30 days as required
              by Art. 12(3) GDPR.
            </p>
            <div className="mt-6">
              <Link href="/privacy" className="text-sm text-primary hover:text-primary-hover">
                &larr; Back to Privacy Policy
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-cream">
                Name <span className="text-gray-text">(optional)</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-700 bg-white/5 px-4 py-2.5 text-sm text-cream placeholder:text-gray-text/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Ihr Name / Your name"
              />
            </div>

            {/* Honeypot — hidden from real users, bots fill it */}
            <div className="absolute left-[-9999px]" aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input
                id="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-cream">
                E-Mail-Adresse / Email address <span className="text-red-400">*</span>
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-700 bg-white/5 px-4 py-2.5 text-sm text-cream placeholder:text-gray-text/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="name@example.com"
              />
            </div>

            {/* Request type */}
            <div>
              <label htmlFor="request-type" className="block text-sm font-medium text-cream">
                Anfrage-Typ / Request type <span className="text-red-400">*</span>
              </label>
              <select
                id="request-type"
                required
                value={requestType}
                onChange={(e) => setRequestType(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-700 bg-white/5 px-4 py-2.5 text-sm text-cream focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="" className="bg-[#2a2a2a]">
                  Bitte w&auml;hlen / Please select
                </option>
                {REQUEST_TYPES.map((t) => (
                  <option key={t} value={t} className="bg-[#2a2a2a]">
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Request text */}
            <div>
              <label htmlFor="request-text" className="block text-sm font-medium text-cream">
                Ihre Anfrage / Your request <span className="text-red-400">*</span>
              </label>
              <textarea
                id="request-text"
                required
                minLength={20}
                maxLength={2000}
                rows={5}
                value={requestText}
                onChange={(e) => setRequestText(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-700 bg-white/5 px-4 py-2.5 text-sm text-cream placeholder:text-gray-text/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Beschreiben Sie Ihre Anfrage... / Describe your request..."
              />
              <p className="mt-1 text-xs text-gray-text/40">
                {requestText.length}/2000
              </p>
            </div>

            {/* Confirmation checkbox */}
            <div className="flex items-start gap-3">
              <input
                id="confirmation"
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 rounded border-gray-700 bg-white/5 text-primary accent-primary focus:ring-primary"
              />
              <label htmlFor="confirmation" className="text-xs leading-relaxed text-cream/70">
                Ich best&auml;tige, dass die angegebene E-Mail-Adresse mir geh&ouml;rt oder
                ich berechtigt bin, die Anfrage in deren Namen zu stellen. / I confirm that
                the email address provided is mine or I am authorized to submit this request
                on its behalf. <span className="text-red-400">*</span>
              </label>
            </div>

            {/* Error */}
            {error && (
              <p className="rounded-lg border border-red-500/20 bg-red-500/[0.05] px-4 py-3 text-sm text-red-400">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-[#1d1d1d] disabled:opacity-50"
            >
              {submitting
                ? "Wird gesendet... / Submitting..."
                : "Anfrage senden / Submit request"}
            </button>

            <p className="text-xs text-gray-text/40">
              Wir antworten innerhalb von 30 Tagen (Art. 12 Abs. 3 DSGVO). /
              We respond within 30 days (Art. 12(3) GDPR).
            </p>
          </form>
        )}

        <div className="mt-8">
          <Link href="/privacy" className="text-sm text-gray-text transition-colors hover:text-cream">
            &larr; Back to Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
