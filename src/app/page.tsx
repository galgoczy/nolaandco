import HomeHero from '@/components/home/HomeHero';
import CategoryGrid from '@/components/home/CategoryGrid';
import FeaturedCapes from '@/components/home/FeaturedCapes';
import TrustBadges from '@/components/home/TrustBadges';
import AboutIntro from '@/components/home/AboutIntro';
import WorkshopSection from '@/components/home/WorkshopSection';
import TestimonialsSlider from '@/components/home/TestimonialsSlider';
import InstagramGrid from '@/components/home/InstagramGrid';
import NewsletterBand from '@/components/home/NewsletterBand';

// Evergreen home structure:
//   1. Hero (video) → Nagyoknak kollekció
//   2. Vásárolj kategória szerint (3 oszlopos rács)
//   3. Kiemelt újdonság sáv (Kalandköpenyek)
//   5. Bizalmi ikon-sáv
//   6. Rólunk bevezető (Tőlünk, Nektek.) + THE ART OF CRAFTING
//   7. Vásárlói vélemények (slider)
//   8. Instagram-rács
//   9. Hírlevél-sáv (a lábléc fölött)
export default function HomePage() {
  return (
    <main>
      <HomeHero />
      <CategoryGrid />
      <FeaturedCapes />
      <TrustBadges />
      <AboutIntro />
      <WorkshopSection />
      <TestimonialsSlider />
      <InstagramGrid />
      <NewsletterBand />
    </main>
  );
}
