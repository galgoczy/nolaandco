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
          src={isMobile ? '/scrollytelling/hero5-mobile.mp4' : '/scrollytelling/hero5-desktop.mp4'}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className={`w-full object-cover ${isMobile ? 'h-[85vh]' : 'h-auto'}`}
        />
        <div className="absolute inset-0 flex pointer-events-none items-center justify-start px-8 md:px-32">
          <div className="flex flex-col items-start gap-4">
            <button
              onClick={scrollToProducts}
              className="pointer-events-auto bg-brand-blue text-carbon rounded-full px-14 py-5 text-sm tracking-[0.25em] uppercase btn-anim shadow-xl cursor-pointer hero-cta-pulse"
              style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 500 }}
            >
              Görgess és fedezd fel!
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
