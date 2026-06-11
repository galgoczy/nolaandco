import HomeHero from '@/components/home/HomeHero';
import CategoryGrid from '@/components/home/CategoryGrid';
import FeaturedCapes from '@/components/home/FeaturedCapes';
import TrustBadges from '@/components/home/TrustBadges';
import AboutSection from '@/components/home/AboutSection';
import WorkshopSection from '@/components/home/WorkshopSection';

// Evergreen home structure:
//   1. Hero (video) → Nagyoknak kollekció
//   2. Vásárolj kategória szerint (3 oszlopos rács)
//   3. Kiemelt újdonság sáv (Kalandköpenyek)
//   4. Bizalmi ikonok
//   majd: NEKTEK / TŐLÜNK és THE ART OF CRAFTING
export default function HomePage() {
  return (
    <main>
      <HomeHero />
      <CategoryGrid />
      <FeaturedCapes />
      <TrustBadges />
      <AboutSection />
      <WorkshopSection />
    </main>
  );
}
