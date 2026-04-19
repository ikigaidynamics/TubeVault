"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/attribution";

interface Props {
  variantSlug: string;
}

export function AttributionTracker({ variantSlug }: Props) {
  useEffect(() => {
    captureAttribution(variantSlug);
  }, [variantSlug]);

  return null;
}
