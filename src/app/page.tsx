export const dynamic = 'force-dynamic';

import HeroSection from '@/components/home/HeroSection';
import ProductGrid from '@/components/home/ProductGrid';
import AboutSection from '@/components/home/AboutSection';
import WorkshopSection from '@/components/home/WorkshopSection';
import PostersSection from '@/components/home/PostersSection';
import FaqSection from '@/components/home/FaqSection';
import ConversionSection from '@/components/home/ConversionSection';

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <ProductGrid />
      <AboutSection />
      <WorkshopSection />
      <PostersSection />
      <FaqSection />
      <ConversionSection />
    </main>
  );
}
