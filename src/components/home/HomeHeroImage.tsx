import { getSiteImages } from '@/lib/siteImages';
import HeroImageCarousel, { type HeroImageSlide } from './HeroImageCarousel';

/**
 * BLOKK 1 (kép-variáns): teljes szélességű hero fotók, rajtuk felvezető +
 * cím + CTA — három dia, 4,5 másodpercenként finom, jobbról érkező átúszással.
 * A szövegek adminból szerkeszthetők (Megjelenés → Szövegek → Hero), a fotók
 * a Megjelenés → Képek alatt cserélhetők. Az üres képhelyű diák kimaradnak a
 * rotációból.
 *
 * Desktopon a kép majdnem a nyitóképernyő aljáig ér, mobilon 4:4,5-re vágva,
 * hogy alatta már látsszon a kategória-választó. A videós hero (HomeHero.tsx)
 * félretéve — visszaváltás: a főoldalon <HomeHero t={t} /> erre a komponensre
 * cserélve.
 */
export default async function HomeHeroImage({ t }: { t: Record<string, string> }) {
  const imgs = await getSiteImages(['home-hero-kep', 'home-hero-kep-2', 'home-hero-kep-3']);

  const slides: HeroImageSlide[] = [
    {
      src: imgs['home-hero-kep'],
      eyebrow: t['hero-1-eyebrow'],
      title: t['hero-1-title'],
      cta: t['hero-1-cta'],
      ctaHref: '/termekek?category=emlekorzok',
    },
    {
      src: imgs['home-hero-kep-2'],
      eyebrow: t['hero-2-eyebrow'],
      title: t['hero-2-title'],
      cta: t['hero-2-cta'],
      ctaHref: '/termekek?category=dekoracio',
    },
    {
      src: imgs['home-hero-kep-3'],
      eyebrow: t['hero-3-eyebrow'],
      title: t['hero-3-title'],
      cta: t['hero-3-cta'],
      ctaHref: '/termekek?category=szundikendo',
    },
  ].filter((s) => s.src !== '');

  return (
    <section className="relative w-full overflow-hidden bg-[#C4A591]">
      <HeroImageCarousel slides={slides} />
    </section>
  );
}
