import Link from "next/link";

export default function ChannelsPage() {
  return (
    <div className="min-h-screen bg-dark-bg">
      <nav className="border-b border-white/10 px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="text-xl font-bold text-cream">
            TubeVault
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/pricing"
              className="text-sm text-gray-text hover:text-cream transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/login"
              className="text-sm text-gray-text hover:text-cream transition-colors"
            >
              Log in
            </Link>
          </div>
        </div>
      </nav>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-4xl font-bold text-cream">Browse Channels</h1>
          <p className="mt-4 text-gray-text">
            Explore all indexed YouTube channels available for AI-powered search.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Channel cards will be fetched from /api/collections */}
            <div className="rounded-xl border border-white/10 bg-dark-surface p-6">
              <p className="text-sm text-gray-text">
                Loading channels...
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
