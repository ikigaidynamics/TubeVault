import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";
import { VARIANTS, RESERVED_SLUGS } from "@/lib/landing-variants";

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return Object.keys(VARIANTS)
    .filter((slug) => slug !== "default")
    .map((slug) => ({ slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const variant = VARIANTS[params.slug];
  if (!variant || RESERVED_SLUGS.has(params.slug)) {
    return { title: "Not Found" };
  }
  return {
    title: variant.metaTitle,
    description: variant.metaDescription,
  };
}

export default function VariantPage({ params }: Props) {
  if (RESERVED_SLUGS.has(params.slug)) {
    notFound();
  }

  const variant = VARIANTS[params.slug];
  if (!variant) {
    notFound();
  }

  return <LandingPage variant={variant} />;
}
