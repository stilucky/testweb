import HeroSection from "@/components/home/HeroSection";
import SplitFeatureSection from "@/components/home/SplitFeatureSection";
import dynamic from "next/dynamic";

const TestimonialsSection = dynamic(() => import("@/components/home/TestimonialsSection"), {
  loading: () => <div className="h-64" />,
});

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <SplitFeatureSection />
      <TestimonialsSection />
    </>
  );
}
