'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { renderInline, renderMobileBreaks } from '@/lib/richTextInline';

export type HeroImageSlide = {
  src: string;
  eyebrow: string;
  title: string;
  cta: string;
  ctaHref: string;
};

const ROTATE_MS = 4500;

const textShadow =
  '0 2px 24px rgba(0,0,0,0.35), 0 0 12px rgba(0,0,0,0.25), 0 0 2px rgba(255,255,255,0.15)';
// A felvezető sor világos képrészletre eshet — külön, sötétebb derengést kap.
const eyebrowShadow =
  '0 1px 4px rgba(0,0,0,0.65), 0 0 14px rgba(0,0,0,0.55), 0 0 30px rgba(0,0,0,0.4)';
const heroFont = "'Gilroy', 'Inter', 'Montserrat', sans-serif";

/**
 * Kép-hero lapozó: a diák pár másodpercenként váltakoznak — az érkező kép
 * jobbról, finom átúszással jön be. Egyetlen dia esetén nincs váltás.
 */
export default function HeroImageCarousel({ slides }: { slides: HeroImageSlide[] }) {
  const [active, setActive] = useState(0);

  // Az `active` a függőség: kézi váltás után újraindul a visszaszámlálás,
  // így a pöttyre kattintva nem ugrik azonnal tovább a lapozó.
  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setTimeout(() => setActive((a) => (a + 1) % slides.length), ROTATE_MS);
    return () => clearTimeout(timer);
  }, [slides.length, active]);

  return (
    <div className="relative w-full aspect-[8/9] sm:aspect-[4/3] md:aspect-auto md:h-[calc(100svh-76px-7vh)] overflow-hidden">
      {slides.map((slide, i) => (
        <div
          key={slide.src}
          aria-hidden={active !== i}
          // A rejtett diák nem foghatják el a kattintást az aktív dia gombjától.
          className={`absolute inset-0 transition-all duration-1000 ease-out ${
            active === i
              ? 'opacity-100 translate-x-0 pointer-events-auto'
              : 'opacity-0 translate-x-[4%] pointer-events-none'
          }`}
        >
          <Image
            src={slide.src}
            alt="Nola & Co."
            fill
            priority={i === 0}
            className="object-cover object-[50%_58%] md:object-[50%_60%]"
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
                  textShadow: eyebrowShadow,
                }}
              >
                {slide.eyebrow}
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
                {renderInline(slide.title)}
              </h1>
              <Link
                href={slide.ctaHref}
                tabIndex={active === i ? 0 : -1}
                className="bg-cta hover:bg-cta-hover text-white rounded-2xl px-7 md:px-12 py-3 md:py-4 text-xs md:text-sm btn-anim shadow-xl cursor-pointer hero-cta-pulse"
                style={{
                  fontFamily: heroFont,
                  fontWeight: 600,
                  letterSpacing: '0.128em',
                  textTransform: 'uppercase',
                }}
              >
                {renderMobileBreaks(slide.cta)}
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Lapozó pöttyök: jelzik, hányadik diánál járunk, és kattintással
          ugyanazzal az átúszással váltanak. */}
      {slides.length > 1 && (
        <div className="absolute inset-x-0 bottom-3 md:bottom-6 flex justify-center gap-2.5">
          {slides.map((slide, i) => (
            <button
              key={slide.src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`${i + 1}. dia`}
              aria-current={active === i}
              className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${
                active === i ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
              }`}
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.45)' }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
