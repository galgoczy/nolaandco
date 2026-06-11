import HomeHero from '@/components/home/HomeHero';
import CategoryGrid from '@/components/home/CategoryGrid';
import FeaturedCapes from '@/components/home/FeaturedCapes';
import TrustBadges from '@/components/home/TrustBadges';

// Evergreen home structure:
//   1. Hero (video) → Nagyoknak kollekció
//   2. Vásárolj kategória szerint (3 oszlopos rács)
//   3. Kiemelt újdonság sáv (Kalandköpenyek)
//   4. Bizalmi ikonok
export default function HomePage() {
  return (
    <main>
      <HomeHero />
      <CategoryGrid />
      <FeaturedCapes />
      <TrustBadges />
    </main>
  );
}
