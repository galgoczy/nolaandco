'use client';

import { useRef, useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';

type HeroSlide = {
  desktopSrc: string;
  mobileSrc: string;
  /** object-position a mobil kivágáshoz (alapértelmezés: középre). */
  mobileObjectPosition?: string;
  eyebrow: string;
  title: ReactNode;
  ctaLabel: string;
  ctaHref: string;
};

// Sequential hero playlist: the videos play one after another (cross-fading),
// then start over. Each slide carries its own overlay copy + CTA.
const SLIDES: HeroSlide[] = [
  {
    desktopSrc: '/scrollytelling/nola_koppeny-desktop.mp4',
    mobileSrc: '/scrollytelling/nola_koppeny-mobile.mp4',
    mobileObjectPosition: '70% 50%',
    eyebrow: 'EMLÉKEK A KICSIKNEK, KALANDOK A NAGYOKNAK',
    title: (
      <>
        Megérkezett
        <br />a Nagytesó kollekció
      </>
    ),
    ctaLabel: 'Megnézem az újdonságokat',
    ctaHref: '/termekek?category=nagyoknak',
  },
  {
    desktopSrc: '/scrollytelling/hero6-desktop.mp4',
    mobileSrc: '/scrollytelling/hero6-mobile.mp4',
    eyebrow: 'EMLÉKEK, AMIK PONTOSAN AKKORÁK, MINT Ő VOLT',
    title: (
      <>
        1:1 méretarányú
        <br />
        születési emlékpárnák
        <br />
        &amp; poszterek
      </>
    ),
    ctaLabel: 'Megnézem a kollekciót',
    ctaHref: '/termekek?category=kicsiknek',
  },
];

const textShadow =
  '0 2px 24px rgba(0,0,0,0.35), 0 0 12px rgba(0,0,0,0.25), 0 0 2px rgba(255,255,255,0.15)';
const heroFont = "'Gilroy', 'Inter', 'Montserrat', sans-serif";

/**
 * BLOKK 1: Hero — 16:9 background videos (autoplay, muted) with a
 * left-aligned text box + CTA per slide.
 */
export default function HomeHero() {
  const videoRef0 = useRef<HTMLVideoElement>(null);
  const videoRef1 = useRef<HTMLVideoElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [active, setActive] = useState(0);
  const refs = [videoRef0, videoRef1];

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    setIsMobile(mq.matches);

    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // On viewport switch, reload both sources and restart from the first video.
  useEffect(() => {
    setActive(0);
    [videoRef0, videoRef1].forEach((r) => r.current?.load());
    const v = videoRef0.current;
    if (v) {
      v.currentTime = 0;
      v.play().catch(() => {});
    }
  }, [isMobile]);

  // When the active video changes, start it from the beginning.
  useEffect(() => {
    const allRefs = [videoRef0, videoRef1];
    const v = allRefs[active].current;
    if (v) {
      v.currentTime = 0;
      v.play().catch(() => {});
    }
  }, [active]);

  return (
    <section className="relative w-full overflow-hidden leading-[0]">
      <div className={`w-full relative ${isMobile ? 'h-[68vh]' : 'aspect-video'}`}>
        {SLIDES.map((slide, i) => (
          <video
            key={isMobile ? slide.mobileSrc : slide.desktopSrc}
            ref={refs[i]}
            src={isMobile ? slide.mobileSrc : slide.desktopSrc}
            muted
            playsInline
            preload="auto"
            autoPlay={i === 0}
            onEnded={() => {
              if (i === active) setActive((a) => (a + 1) % SLIDES.length);
            }}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              active === i ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              objectPosition: isMobile
                ? slide.mobileObjectPosition ?? '50% 50%'
                : '50% 50%',
            }}
          />
        ))}

        {/* Per-slide overlay copy, cross-fading in sync with the videos. */}
        {SLIDES.map((slide, i) => (
          <div
            key={slide.ctaHref}
            className={`absolute inset-0 flex items-end justify-start px-8 md:px-20 lg:px-32 pb-[8vh] md:pb-[14vh] lg:pb-[16vh] transition-opacity duration-700 ${
              active === i ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            style={{ pointerEvents: active === i ? undefined : 'none' }}
          >
            <div className="flex flex-col items-start gap-3 md:gap-6 max-w-[90%] md:max-w-[60%] pointer-events-none">
              <p
                className="text-white text-[0.9rem] sm:text-[1.05rem] md:text-[1.05rem] lg:text-[1.2rem] uppercase"
                style={{
                  fontFamily: heroFont,
                  fontWeight: 300,
                  letterSpacing: '0.18em',
                  lineHeight: 1.4,
                  textShadow,
                }}
              >
                {slide.eyebrow}
              </p>
              <h1
                className="text-white text-[1.6875rem] sm:text-[2.025rem] md:text-[2.025rem] lg:text-[2.7rem]"
                style={{
                  fontFamily: heroFont,
                  fontWeight: 600,
                  letterSpacing: '-0.024em',
                  lineHeight: 1.2,
                  textShadow,
                }}
              >
                {slide.title}
              </h1>
              <Link
                href={slide.ctaHref}
                tabIndex={active === i ? 0 : -1}
                className="pointer-events-auto bg-[#C4A591] text-white rounded-2xl px-8 md:px-12 py-3.5 md:py-4 text-xs md:text-sm btn-anim shadow-xl cursor-pointer hero-cta-pulse"
                style={{
                  fontFamily: heroFont,
                  fontWeight: 600,
                  letterSpacing: '0.128em',
                  textTransform: 'uppercase',
                }}
              >
                {slide.ctaLabel}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
