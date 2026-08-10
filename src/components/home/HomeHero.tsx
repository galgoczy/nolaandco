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
  ctaLabel: ReactNode;
  ctaHref: string;
};

// Sequential hero playlist: the videos play one after another (cross-fading),
// then start over. Each slide carries its own overlay copy + CTA.
const SLIDES: HeroSlide[] = [
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
    // Desktopon egy sor, mobilon szépen két sorba tör ("Megtervezem a saját" /
    // "emlékpárnámat"), így nem lesz túl széles vagy háromsoros.
    ctaLabel: (
      <>
        Megtervezem a saját<br className="md:hidden" /> emlékpárnámat
      </>
    ),
    ctaHref: '/termekek?category=emlekorzok',
  },
  {
    desktopSrc: '/scrollytelling/nola_koppeny-desktop.mp4',
    mobileSrc: '/scrollytelling/nola_koppeny-mobile.mp4',
    mobileObjectPosition: '70% 50%',
    eyebrow: 'PUHA TEXTILEK A GYEREKKOR APRÓ PILLANATAIHOZ',
    title: (
      <>
        Megérkezett
        <br />a Nagytesó kollekció
      </>
    ),
    ctaLabel: 'Megnézem az újdonságokat',
    ctaHref: '/termekek?category=textilek',
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
  // null = még nem tudjuk a viewportot. Amíg null, egyik videónak sincs src-je,
  // így a telefon nem kezdi el letölteni a (jóval nagyobb) desktop változatot,
  // hogy aztán eldobja.
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  // A második videó csak akkor kezd töltődni, amikor az első már játszik —
  // így nem versenyez az első képkockáért a CSS-sel, a JS-sel és a képekkel.
  const [loadSecond, setLoadSecond] = useState(false);
  const [active, setActive] = useState(0);
  const refs = [videoRef0, videoRef1];

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    setIsMobile(mq.matches);

    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // On viewport switch, restart from the first video. (A <video> elemek
  // kulcsa is a viewporttól függ, tehát új forrással mountolódnak újra.)
  useEffect(() => {
    if (isMobile === null) return;
    setActive(0);
    const v = videoRef0.current;
    if (v) {
      v.currentTime = 0;
      v.play().catch(() => {});
    }
  }, [isMobile]);

  // A második videó forrása csak most kerül fel — indítsuk el a pufferelést,
  // hogy készen álljon, mire az első véget ér.
  useEffect(() => {
    if (!loadSecond) return;
    videoRef1.current?.load();
  }, [loadSecond]);

  // When the active video changes, start it from the beginning.
  useEffect(() => {
    if (isMobile === null) return;
    const allRefs = [videoRef0, videoRef1];
    const v = allRefs[active].current;
    if (v) {
      v.currentTime = 0;
      v.play().catch(() => {});
    }
  }, [active, isMobile]);

  return (
    <section className="relative w-full overflow-hidden leading-[0] bg-[#C4A591]">
      <div className={`w-full relative ${isMobile ? 'h-[68vh]' : 'aspect-video'}`}>
        {SLIDES.map((slide, i) => (
          <video
            // A kulcs csak akkor változik, ha tényleg más forrásra váltunk
            // (desktop → mobil). Így a desktop videó letöltése nem indul újra
            // a hidratálás után.
            key={`${i}-${isMobile === true ? 'm' : 'd'}`}
            ref={refs[i]}
            // Az első videó forrása a szerver által küldött HTML-ben is benne
            // van, hogy a böngésző már a HTML olvasása közben tölteni kezdje.
            // A második csak akkor kap forrást, amikor az első már játszik.
            src={
              i > 0 && !loadSecond
                ? undefined
                : isMobile === true
                  ? slide.mobileSrc
                  : slide.desktopSrc
            }
            muted
            playsInline
            preload={i === 0 || loadSecond ? 'auto' : 'none'}
            autoPlay={i === 0}
            onPlaying={() => {
              // Az első videó elindult — innentől van ~10 másodperc a
              // másodikat betölteni, mielőtt szükség lenne rá.
              if (i === 0) setLoadSecond(true);
            }}
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
                aria-hidden={active !== i}
                className="bg-cta hover:bg-cta-hover text-white rounded-2xl px-8 md:px-12 py-3.5 md:py-4 text-xs md:text-sm btn-anim shadow-xl cursor-pointer hero-cta-pulse"
                style={{
                  fontFamily: heroFont,
                  fontWeight: 600,
                  letterSpacing: '0.128em',
                  textTransform: 'uppercase',
                  // Csak az aktív dia gombja kattintható — az inaktív, átlátszó
                  // gomb különben elfogná a kattintást a látható gomb elől.
                  pointerEvents: active === i ? 'auto' : 'none',
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
