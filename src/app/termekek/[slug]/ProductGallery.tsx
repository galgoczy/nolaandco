'use client';

import { useState } from 'react';
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

  return (
    <div className="flex flex-col gap-3 w-full max-w-[470px] mx-auto lg:ml-auto lg:mr-0">
      {/* Main image */}
      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-surface-container-low ghost-border">
        <Image
          key={allImages[activeIdx]}
          src={allImages[activeIdx]}
          alt={alt}
          fill
          className="object-cover transition-opacity duration-300"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority={activeIdx === 0}
        />
        {badge && (
          <div className="absolute top-4 right-4">
            <span className="badge-shimmer px-3 py-1 rounded-lg glass-nav text-[10px] font-bold uppercase tracking-widest text-primary shadow-sm">
              {badge}
            </span>
          </div>
        )}

        {/* Arrow navigation */}
        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={() =>
                setActiveIdx((i) => (i - 1 + allImages.length) % allImages.length)
              }
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow flex items-center justify-center text-[#4A4A4A] hover:bg-white transition-colors"
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
              onClick={() =>
                setActiveIdx((i) => (i + 1) % allImages.length)
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow flex items-center justify-center text-[#4A4A4A] hover:bg-white transition-colors"
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

            {/* Dots for mobile */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 md:hidden">
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
