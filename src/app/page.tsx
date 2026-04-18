export const dynamic = 'force-dynamic';

import HeroSection from '@/components/home/HeroSection';
import FeatureHighlights from '@/components/home/FeatureHighlights';
import ProductGrid from '@/components/home/ProductGrid';
import AboutSection from '@/components/home/AboutSection';
import WorkshopSection from '@/components/home/WorkshopSection';
import PostersSection from '@/components/home/PostersSection';
import ConversionSection from '@/components/home/ConversionSection';

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <FeatureHighlights />
      <ProductGrid />
      <AboutSection />
      <WorkshopSection />
      <PostersSection />
      <ConversionSection />
    </main>
  );
}
