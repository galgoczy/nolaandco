'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';

// Sequential hero playlist: the videos play one after another (cross-fading),
// then start over. The original hero runs first.
const VIDEOS = {
  desktop: ['/scrollytelling/hero6-desktop.mp4', '/scrollytelling/nola_koppeny-desktop.mp4'],
  mobile: ['/scrollytelling/hero6-mobile.mp4', '/scrollytelling/nola_koppeny-mobile.mp4'],
};

/**
 * BLOKK 1: Hero — 16:9 background videos (autoplay, muted) with a
 * left-aligned text box + CTA pointing at the "Nagyoknak" collection.
 */
export default function HomeHero() {
  const videoRef0 = useRef<HTMLVideoElement>(null);
  const videoRef1 = useRef<HTMLVideoElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [active, setActive] = useState(0);

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
    const refs = [videoRef0, videoRef1];
    const v = refs[active].current;
    if (v) {
      v.currentTime = 0;
      v.play().catch(() => {});
    }
  }, [active]);

  const sources = isMobile ? VIDEOS.mobile : VIDEOS.desktop;
  const refs = [videoRef0, videoRef1];

  return (
    <section className="relative w-full overflow-hidden leading-[0]">
      <div className={`w-full relative ${isMobile ? 'h-[68vh]' : 'aspect-video'}`}>
        {sources.map((src, i) => (
          <video
            key={src}
            ref={refs[i]}
            src={src}
            muted
            playsInline
            preload="auto"
            autoPlay={i === 0}
            onEnded={() => {
              if (i === active) setActive((a) => (a + 1) % sources.length);
            }}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              active === i ? 'opacity-100' : 'opacity-0'
            }`}
            // Mobilon az új (köpenyes) videó kivágása 20%-kal balra tolva.
            style={{ objectPosition: isMobile && i === 1 ? '30% 50%' : '50% 50%' }}
          />
        ))}
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
