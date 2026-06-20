import HeroSection from "@/components/home/HeroSection";
import CategorySection from "@/components/home/CategorySection";
import FeaturedSection from "@/components/home/FeaturedSection";
import EditorialBanner from "@/components/home/EditorialBanner";
import BestSellersSection from "@/components/home/BestSellersSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategorySection />
      <FeaturedSection />
      <EditorialBanner />
      <BestSellersSection />
      <TestimonialsSection />
    </>
  );
}
