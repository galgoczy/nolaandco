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
              style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}
            >
              Görgess és fedezd fel!
            </button>
            {/* Fading arrows */}
            <button
              onClick={scrollToProducts}
              className="pointer-events-auto flex gap-1 items-center pl-6 cursor-pointer"
            >
              <svg
                className="w-5 h-5 text-carbon/60 animate-fade-bounce"
                style={{ animationDelay: '0s' }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              <svg
                className="w-5 h-5 text-carbon/40 animate-fade-bounce"
                style={{ animationDelay: '0.3s' }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              <svg
                className="w-5 h-5 text-carbon/20 animate-fade-bounce"
                style={{ animationDelay: '0.6s' }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
