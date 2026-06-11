'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';

/**
 * BLOKK 1: Hero — 16:9 background video (autoplay, muted, loop) with a
 * left-aligned text box + CTA pointing at the "Nagyoknak" collection.
 */
export default function HomeHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    setIsMobile(mq.matches);

    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (v) {
      v.load();
      v.play().catch(() => {});
    }
  }, [isMobile]);

  return (
    <section className="relative w-full overflow-hidden leading-[0]">
      <div className={`w-full relative ${isMobile ? 'h-[68vh]' : 'aspect-video'}`}>
        <video
          ref={videoRef}
          key={isMobile ? 'mobile' : 'desktop'}
          src={isMobile ? '/scrollytelling/hero6-mobile.mp4' : '/scrollytelling/hero6-desktop.mp4'}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex pointer-events-none items-end justify-start px-8 md:px-20 lg:px-32 pb-[8vh] md:pb-[14vh] lg:pb-[16vh]">
          <div className="flex flex-col items-start gap-3 md:gap-6 max-w-[90%] md:max-w-[60%]">
            <p
              className="text-white text-[0.9rem] sm:text-[1.05rem] md:text-[1.05rem] lg:text-[1.2rem] uppercase"
              style={{
                fontFamily: "'Gilroy', 'Inter', 'Montserrat', sans-serif",
                fontWeight: 300,
                letterSpacing: '0.18em',
                lineHeight: 1.4,
                textShadow:
                  '0 2px 24px rgba(0,0,0,0.35), 0 0 12px rgba(0,0,0,0.25), 0 0 2px rgba(255,255,255,0.15)',
              }}
            >
              EMLÉKEK A KICSIKNEK, KALANDOK A NAGYOKNAK
            </p>
            <h1
              className="text-white text-[1.6875rem] sm:text-[2.025rem] md:text-[2.025rem] lg:text-[2.7rem]"
              style={{
                fontFamily: "'Gilroy', 'Inter', 'Montserrat', sans-serif",
                fontWeight: 600,
                letterSpacing: '-0.024em',
                lineHeight: 1.2,
                textShadow:
                  '0 2px 24px rgba(0,0,0,0.35), 0 0 12px rgba(0,0,0,0.25), 0 0 2px rgba(255,255,255,0.15)',
              }}
            >
              Megérkezett<br />a Nagytesó kollekció
            </h1>
            <Link
              href="/termekek?category=nagyoknak"
              className="pointer-events-auto bg-[#C4A591] text-white rounded-2xl px-8 md:px-12 py-3.5 md:py-4 text-xs md:text-sm btn-anim shadow-xl cursor-pointer hero-cta-pulse"
              style={{
                fontFamily: "'Gilroy', 'Inter', 'Montserrat', sans-serif",
                fontWeight: 600,
                letterSpacing: '0.128em',
                textTransform: 'uppercase',
              }}
            >
              Megnézem az újdonságokat
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
