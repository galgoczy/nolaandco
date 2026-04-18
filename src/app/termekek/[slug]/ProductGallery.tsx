'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

type Props = {
  mainImage: string;
  images: string[];
  alt: string;
  badge?: string | null;
};

export default function ProductGallery({ mainImage, images, alt, badge }: Props) {
  const allImages = [mainImage, ...images.filter((img) => img !== mainImage)];
  const [activeIdx, setActiveIdx] = useState(0);
  const hasMultiple = allImages.length > 1;

  // Brief hint-bump on mount (mobile only) — shifts the track slightly left
  // and back so the user sees that the gallery is swipeable.
  const [hintShift, setHintShift] = useState(0);
  useEffect(() => {
    if (!hasMultiple) return;
    if (typeof window === 'undefined' || window.innerWidth >= 1024) return;
    const t1 = setTimeout(() => setHintShift(-7), 450);
    const t2 = setTimeout(() => setHintShift(0), 900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [hasMultiple]);

  // Swipe navigation for mobile — 50px horizontal threshold, must dominate
  // over vertical so we don't hijack page scroll.
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current || !hasMultiple) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) setActiveIdx((i) => (i + 1) % allImages.length);
      else setActiveIdx((i) => (i - 1 + allImages.length) % allImages.length);
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full max-w-[470px] mx-auto lg:ml-auto lg:mr-0">
      {/* Main slider */}
      <div
        className="relative"
        style={{ touchAction: 'pan-y' }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-surface-container-low ghost-border">
          <div
            className="absolute inset-0 flex transition-transform duration-[350ms] ease-[cubic-bezier(0.22,0.61,0.36,1)]"
            style={{
              transform: `translateX(calc(-${activeIdx * 100}% + ${hintShift}%))`,
            }}
          >
            {allImages.map((img, idx) => (
              <div key={img} className="relative w-full h-full flex-shrink-0">
                <Image
                  src={img}
                  alt={`${alt} — ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority={idx === 0}
                />
              </div>
            ))}
          </div>

          {badge && (
            <div className="absolute top-4 right-4 z-10">
              <span className="badge-shimmer px-3 py-1 rounded-lg glass-nav text-[10px] font-bold uppercase tracking-widest text-primary shadow-sm">
                {badge}
              </span>
            </div>
          )}

          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={() =>
                  setActiveIdx((i) => (i - 1 + allImages.length) % allImages.length)
                }
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow flex items-center justify-center text-[#4A4A4A] hover:bg-white transition-colors z-10"
                aria-label="Előző kép"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setActiveIdx((i) => (i + 1) % allImages.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow flex items-center justify-center text-[#4A4A4A] hover:bg-white transition-colors z-10"
                aria-label="Következő kép"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 md:hidden z-10">
                {allImages.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveIdx(idx)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      idx === activeIdx ? 'bg-white' : 'bg-white/40'
                    }`}
                    aria-label={`${idx + 1}. kép`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Thumbnails — desktop only */}
      {hasMultiple && (
        <div className="hidden md:flex gap-2 overflow-x-auto pb-1">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIdx(idx)}
              className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                idx === activeIdx
                  ? 'border-[#C4A591] shadow-sm'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <Image
                src={img}
                alt={`${alt} — ${idx + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
