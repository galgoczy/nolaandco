export const dynamic = 'force-dynamic';

import HeroSection from '@/components/home/HeroSection';
import FeatureHighlights from '@/components/home/FeatureHighlights';
import ProductGrid from '@/components/home/ProductGrid';
import AboutSection from '@/components/home/AboutSection';
import WorkshopSection from '@/components/home/WorkshopSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import ConversionSection from '@/components/home/ConversionSection';

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <FeatureHighlights />
      <ProductGrid />
      <AboutSection />
      <WorkshopSection />
      <TestimonialsSection />
      <ConversionSection />
    </main>
  );
}
