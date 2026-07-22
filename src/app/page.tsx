import HeroSection from "@/components/home/HeroSection";
import SplitFeatureSection from "@/components/home/SplitFeatureSection";
import { readHeroSettings } from "@/lib/server-hero";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const heroSettings = await readHeroSettings();

  return (
    <>
      <HeroSection initialSettings={heroSettings} />
      <SplitFeatureSection />
    </>
  );
}
