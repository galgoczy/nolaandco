'use client';

import { useRef, useEffect, useState } from 'react';

export default function HeroSection() {
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

  const scrollToProducts = () => {
    document.getElementById('products-start')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative w-full overflow-hidden leading-[0]">
      <div className="w-full relative">
        <video
          ref={videoRef}
          key={isMobile ? 'mobile' : 'desktop'}
          src={isMobile ? '/scrollytelling/hero6-mobile.mp4' : '/scrollytelling/hero6-desktop.mp4'}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className={`w-full object-cover ${isMobile ? 'h-[68vh]' : 'h-auto'}`}
        />
        <div className="absolute inset-0 flex pointer-events-none items-start md:items-end justify-start px-8 md:px-20 lg:px-32 pt-[10vh] md:pt-0 pb-0 md:pb-[22vh] lg:pb-[24vh]">
          <div className="flex flex-col items-start gap-6 md:gap-8 max-w-[90%] md:max-w-[60%]">
            <p
              className="text-white text-xl sm:text-2xl md:text-2xl lg:text-[2.1rem] uppercase"
              style={{
                fontFamily: "'Gilroy', 'Inter', 'Montserrat', sans-serif",
                fontWeight: 600,
                letterSpacing: '-0.024em',
                lineHeight: 1.2,
                textShadow:
                  '0 2px 24px rgba(0,0,0,0.35), 0 0 12px rgba(0,0,0,0.25), 0 0 2px rgba(255,255,255,0.15)',
              }}
            >
              EMLÉKEK, AMIK PONTOSAN AKKORÁK, MINT Ő VOLT
            </p>
            <h1
              className="text-white text-3xl sm:text-4xl md:text-4xl lg:text-5xl"
              style={{
                fontFamily: "'Gilroy', 'Inter', 'Montserrat', sans-serif",
                fontWeight: 600,
                letterSpacing: '-0.024em',
                lineHeight: 1.2,
                textShadow:
                  '0 2px 24px rgba(0,0,0,0.35), 0 0 12px rgba(0,0,0,0.25), 0 0 2px rgba(255,255,255,0.15)',
              }}
            >
              1:1 méretarányú<br />születési emlékpárnák<br />&amp; poszterek
            </h1>
            <button
              onClick={scrollToProducts}
              className="pointer-events-auto bg-[#C4A591] text-white rounded-2xl px-8 md:px-12 py-3.5 md:py-4 text-xs md:text-sm btn-anim shadow-xl cursor-pointer hero-cta-pulse"
              style={{
                fontFamily: "'Gilroy', 'Inter', 'Montserrat', sans-serif",
                fontWeight: 400,
                letterSpacing: '0.128em',
                textTransform: 'uppercase',
              }}
            >
              Megnézem a kollekciót
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
