import Image from 'next/image';
import Link from 'next/link';
import { getSiteImages } from '@/lib/siteImages';
import { renderInline, renderMobileBreaks } from '@/lib/richTextInline';

const textShadow =
  '0 2px 24px rgba(0,0,0,0.35), 0 0 12px rgba(0,0,0,0.25), 0 0 2px rgba(255,255,255,0.15)';
const heroFont = "'Gilroy', 'Inter', 'Montserrat', sans-serif";

/**
 * BLOKK 1 (kép-variáns): teljes szélességű álló hero fotó, rajta a megszokott
 * felvezető + cím + CTA (a szövegek adminból szerkeszthetők, Megjelenés →
 * Szövegek → Hero, a fotó a Megjelenés → Képek alatt cserélhető).
 *
 * Desktopon a kép majdnem a nyitóképernyő aljáig ér (a fejléccel együtt a
 * magasság ~92%-áig), mobilon 4:5-re vágva, hogy alatta már látsszon a
 * kategória-választó. A videós hero (HomeHero.tsx) félretéve — visszaváltás:
 * a főoldalon <HomeHero t={t} /> erre a komponensre cserélve.
 */
export default async function HomeHeroImage({ t }: { t: Record<string, string> }) {
  const imgs = await getSiteImages(['home-hero-kep']);

  return (
    <section className="relative w-full overflow-hidden bg-[#C4A591]">
      <div className="relative w-full aspect-[4/5] sm:aspect-[4/3] md:aspect-auto md:h-[calc(100svh-76px-7vh)]">
        <Image
          src={imgs['home-hero-kep']}
          alt="Nola & Co."
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        {/* Finom sötétítés alul, hogy a szöveg világos képen is olvasható maradjon. */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/30 to-transparent"
        />

        <div className="absolute inset-0 flex items-end justify-start px-6 md:px-20 lg:px-32 pb-8 md:pb-[9vh]">
          <div className="flex flex-col items-start gap-3 md:gap-6 max-w-[90%] md:max-w-[60%]">
            <p
              className="text-white text-[0.8rem] sm:text-[1rem] lg:text-[1.2rem] uppercase"
              style={{
                fontFamily: heroFont,
                fontWeight: 300,
                letterSpacing: '0.18em',
                lineHeight: 1.4,
                textShadow,
              }}
            >
              {t['hero-1-eyebrow']}
            </p>
            <h1
              className="text-white text-[1.5rem] sm:text-[2rem] lg:text-[2.7rem]"
              style={{
                fontFamily: heroFont,
                fontWeight: 600,
                letterSpacing: '-0.024em',
                lineHeight: 1.2,
                textShadow,
              }}
            >
              {renderInline(t['hero-1-title'])}
            </h1>
            <Link
              href="/termekek?category=emlekorzok"
              className="bg-cta hover:bg-cta-hover text-white rounded-2xl px-7 md:px-12 py-3 md:py-4 text-xs md:text-sm btn-anim shadow-xl cursor-pointer hero-cta-pulse"
              style={{
                fontFamily: heroFont,
                fontWeight: 600,
                letterSpacing: '0.128em',
                textTransform: 'uppercase',
              }}
            >
              {renderMobileBreaks(t['hero-1-cta'])}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
