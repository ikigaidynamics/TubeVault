import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-dark-bg px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="text-2xl font-bold text-cream">
            TubeVault
          </Link>
          <h2 className="mt-6 text-xl font-semibold text-cream">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-gray-text">
            Sign in to your account to continue
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-dark-surface p-8">
          <form className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-cream"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="mt-1 w-full rounded-lg border border-gray-700 bg-white/5 px-4 py-2.5 text-cream placeholder:text-gray-text/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-cream"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Your password"
                className="mt-1 w-full rounded-lg border border-gray-700 bg-white/5 px-4 py-2.5 text-cream placeholder:text-gray-text/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-primary py-2.5 font-medium text-white hover:bg-primary-hover transition-colors"
            >
              Sign In
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-text">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-primary hover:text-primary-hover">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
