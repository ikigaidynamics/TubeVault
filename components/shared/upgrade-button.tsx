"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Zap } from "lucide-react";
import { track } from "@/lib/analytics/tracker";

interface UpgradeButtonProps {
  priceKey: string;
  label?: string;
  className?: string;
  variant?: "primary" | "outline";
  size?: "sm" | "md" | "lg";
}

export function UpgradeButton({
  priceKey,
  label = "Upgrade",
  className = "",
  variant = "primary",
  size = "md",
}: UpgradeButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (loading) return;
    setLoading(true);

    track("upgrade_click", { metadata: { trigger: "direct", priceKey } });

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceKey }),
      });

      if (res.status === 401) {
        router.push(`/signup?redirect=/dashboard&plan=${priceKey}`);
        return;
      }

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        router.push("/pricing");
      }
    } catch {
      router.push("/pricing");
    } finally {
      setLoading(false);
    }
  }

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-8 py-4 text-base",
  }[size];

  const variantClasses = variant === "primary"
    ? "bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20"
    : "border border-primary/30 text-primary hover:bg-primary/10";

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 disabled:opacity-70 ${sizeClasses} ${variantClasses} ${className}`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Zap className="h-4 w-4" />
      )}
      {loading ? "Redirecting..." : label}
    </button>
  );
}
