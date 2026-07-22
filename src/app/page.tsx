import HeroSection from "@/components/home/HeroSection";
import SplitFeatureSection from "@/components/home/SplitFeatureSection";
import { readHeroSettings } from "@/lib/server-hero";
import { readHomeFeatureSettings } from "@/lib/server-home-features";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [heroSettings, homeFeatureSettings] = await Promise.all([
    readHeroSettings(),
    readHomeFeatureSettings(),
  ]);

  return (
    <>
      <HeroSection initialSettings={heroSettings} />
      <SplitFeatureSection initialFeatures={homeFeatureSettings?.features ?? null} />
    </>
  );
}
