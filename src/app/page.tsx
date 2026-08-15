// A főoldal szekció-képei adatbázisból jönnek (adminból cserélhetők) —
// percenként újraépül, hogy a csere gyorsan megjelenjen, de a látogatók
// többsége cache-ből kapja az oldalt.
export const revalidate = 60;

// A videós hero (HomeHero) félretéve — visszaváltáshoz importáld és cseréld
// vissza a HomeHeroImage helyére: <HomeHero t={t} />.
import HomeHeroImage from '@/components/home/HomeHeroImage';
import CategoryGrid from '@/components/home/CategoryGrid';
import FeaturedCapes from '@/components/home/FeaturedCapes';
import TrustBadges from '@/components/home/TrustBadges';
import AboutIntro from '@/components/home/AboutIntro';
import WorkshopSection from '@/components/home/WorkshopSection';
import TestimonialsSlider from '@/components/home/TestimonialsSlider';
import InstagramGrid from '@/components/home/InstagramGrid';
import NewsletterBand from '@/components/home/NewsletterBand';
import { getAllSiteTexts } from '@/lib/siteTexts';

// Evergreen home structure:
//   1. Hero (video) → kollekció-CTA-k
//   2. Vásárolj kategória szerint (3 oszlopos rács)
//   3. Kiemelt újdonság sáv (Kalandköpenyek)
//   5. Bizalmi ikon-sáv
//   6. Rólunk bevezető (Tőlünk, Nektek.) + THE ART OF CRAFTING
//   7. Vásárlói vélemények (slider)
//   8. Instagram-rács
//   9. Hírlevél-sáv (a lábléc fölött)
export default async function HomePage() {
  // A blokkok szövegei adminból szerkeszthetők (Megjelenés → Szövegek).
  const t = await getAllSiteTexts();
  return (
    <main>
      <HomeHeroImage t={t} />
      <CategoryGrid t={t} />
      <FeaturedCapes t={t} />
      <TrustBadges t={t} />
      <AboutIntro t={t} />
      <WorkshopSection t={t} />
      <TestimonialsSlider t={t} />
      <InstagramGrid t={t} />
      <NewsletterBand t={t} />
    </main>
  );
}
