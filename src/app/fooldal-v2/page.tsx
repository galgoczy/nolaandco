export const dynamic = 'force-dynamic';

import ScrollVideoHero from '@/components/home/ScrollVideoHero';
import ProductGrid from '@/components/home/ProductGrid';
import AboutSection from '@/components/home/AboutSection';
import WorkshopSection from '@/components/home/WorkshopSection';
import PostersSection from '@/components/home/PostersSection';
import FaqSection from '@/components/home/FaqSection';
import ConversionSection from '@/components/home/ConversionSection';

export default function HomePageV2() {
  return (
    <main>
      <ScrollVideoHero />
      <ProductGrid />
      <AboutSection />
      <WorkshopSection />
      <PostersSection />
      <FaqSection />
      <ConversionSection />
    </main>
  );
}
