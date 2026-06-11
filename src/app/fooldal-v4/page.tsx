export const dynamic = 'force-dynamic';

import ScrollVideoHeroV4 from '@/components/home/ScrollVideoHeroV4';
import ProductGrid from '@/components/home/ProductGrid';
import AboutSection from '@/components/home/AboutSection';
import WorkshopSection from '@/components/home/WorkshopSection';
import PostersSection from '@/components/home/PostersSection';
import FaqSection from '@/components/home/FaqSection';
import ConversionSection from '@/components/home/ConversionSection';

export default function HomePageV4() {
  return (
    <main>
      <ScrollVideoHeroV4 />
      <ProductGrid />
      <AboutSection />
      <WorkshopSection />
      <PostersSection />
      <FaqSection />
      <ConversionSection />
    </main>
  );
}
