import { LandingPage } from "@/components/landing/landing-page";
import { VARIANTS } from "@/lib/landing-variants";

export default function Home() {
  return <LandingPage variant={VARIANTS.default} />;
}
