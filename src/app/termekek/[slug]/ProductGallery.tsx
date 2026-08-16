'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { parseMediaEntry, type MediaEntry } from '@/lib/productMedia';

type Props = {
  mainImage: string;
  images: string[];
  alt: string;
  badge?: string | null;
};

/** Lejátszás-ikon a videó-diákhoz és bélyegképekhez. */
function PlayIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M8 5.14v13.72c0 .8.87 1.3 1.56.88l10.5-6.86a1.03 1.03 0 0 0 0-1.76L9.56 4.26A1.03 1.03 0 0 0 8 5.14z" />
    </svg>
  );
}

export default function ProductGallery({ mainImage, images, alt, badge }: Props) {
  // A galéria bejegyzései: a fő kép + a (képeket és videókat közösen
  // sorrendező) galérialista, duplikátumok nélkül.
  const seen: string[] = [];
  const allMedia: MediaEntry[] = [];
  const push = (entry: string) => {
    if (!entry || seen.indexOf(entry) !== -1) return;
    seen.push(entry);
    allMedia.push(parseMediaEntry(entry));
  };
  push(mainImage);
  images.forEach(push);

  const [activeIdx, setActiveIdx] = useState(0);
  // A videó elem csak a lejátszás gombra kattintva mountolódik — addig csak a
  // borítókép töltődik, így a videó nem lassítja az oldal betöltését.
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  const hasMultiple = allMedia.length > 1;

  // Csak az aktív és a szomszédos diák médiáját kérjük le. Korábban a sáv
  // minden képe egyszerre indult, így egy 5 fotós termékoldal 5 párhuzamos
  // képtranszformációt indított hideg cache-en — ez volt a 2-3 másodperces
  // első betöltés fő oka. A már betöltött indexeket megjegyezzük, hogy
  // visszalapozásnál ne kelljen újra.
  const [loadedIdx, setLoadedIdx] = useState<number[]>([0]);
  useEffect(() => {
    const n = allMedia.length;
    if (n === 0) return;
    setLoadedIdx((prev) => {
      const want = [activeIdx, (activeIdx + 1) % n, (activeIdx - 1 + n) % n];
      const missing = want.filter((i) => prev.indexOf(i) === -1);
      return missing.length > 0 ? prev.concat(missing) : prev;
    });
  }, [activeIdx, allMedia.length]);

  // Diaváltáskor a futó videó leáll (az elem lekerül a DOM-ról).
  useEffect(() => {
    setPlayingIdx((playing) => (playing !== null && playing !== activeIdx ? null : playing));
  }, [activeIdx]);

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
      if (dx < 0) setActiveIdx((i) => (i + 1) % allMedia.length);
      else setActiveIdx((i) => (i - 1 + allMedia.length) % allMedia.length);
    }
  };

  // Fotó nélküli termék (a képeket az admin tölti fel) — semleges felület,
  // hogy a termékoldal addig is teljes értékűen működjön.
  if (allMedia.length === 0) {
    return (
      <div className="flex flex-col gap-3 w-full max-w-[470px] mx-auto lg:ml-auto lg:mr-0">
        <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-[#EFEAE2] ghost-border flex items-center justify-center">
          <span className="text-carbon-light/50 text-xs tracking-[0.2em] uppercase">
            Fotó hamarosan
          </span>
          {badge && (
            <div className="absolute top-4 right-4">
              <span
                className="badge-shimmer px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest text-white shadow-sm"
                style={{ backgroundColor: '#7A4A5A' }}
              >
                {badge}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

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
            {allMedia.map((media, idx) => (
              <div key={media.src} className="relative w-full h-full flex-shrink-0">
                {loadedIdx.indexOf(idx) !== -1 &&
                  (media.type === 'video' ? (
                    playingIdx === idx ? (
                      // Álló és fekvő videó is torzítás nélkül fér el
                      // (object-contain), sötét háttér előtt.
                      <video
                        src={media.src}
                        poster={media.poster || undefined}
                        controls
                        autoPlay
                        playsInline
                        preload="none"
                        className="absolute inset-0 w-full h-full object-contain bg-black"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPlayingIdx(idx)}
                        className="absolute inset-0 w-full h-full group/video"
                        aria-label="Videó lejátszása"
                      >
                        {media.poster ? (
                          <Image
                            src={media.poster}
                            alt={`${alt} — videó`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 520px) 100vw, 470px"
                          />
                        ) : (
                          <span className="absolute inset-0 bg-[#2C2C2C]" />
                        )}
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="w-16 h-16 rounded-full bg-white/85 backdrop-blur-sm shadow-lg flex items-center justify-center text-[#4A4A4A] transition-transform duration-300 group-hover/video:scale-110">
                            <PlayIcon className="w-7 h-7 ml-1" />
                          </span>
                        </span>
                      </button>
                    )
                  ) : (
                    <Image
                      src={media.src}
                      alt={`${alt} — ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 520px) 100vw, 470px"
                      priority={idx === 0}
                    />
                  ))}
              </div>
            ))}
          </div>

          {badge && (
            <div className="absolute top-4 right-4 z-10">
              <span
                className="badge-shimmer px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest text-white shadow-sm"
                style={{ backgroundColor: '#7A4A5A' }}
              >
                {badge}
              </span>
            </div>
          )}

          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={() =>
                  setActiveIdx((i) => (i - 1 + allMedia.length) % allMedia.length)
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
                onClick={() => setActiveIdx((i) => (i + 1) % allMedia.length)}
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
                {allMedia.map((_, idx) => (
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
          {allMedia.map((media, idx) => (
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
              {media.type === 'video' ? (
                <>
                  {media.poster ? (
                    <Image
                      src={media.poster}
                      alt={`${alt} — videó`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : (
                    <span className="absolute inset-0 bg-[#2C2C2C]" />
                  )}
                  <span className="absolute inset-0 flex items-center justify-center text-white">
                    <span className="w-6 h-6 rounded-full bg-black/45 flex items-center justify-center">
                      <PlayIcon className="w-3 h-3 ml-0.5" />
                    </span>
                  </span>
                </>
              ) : (
                <Image
                  src={media.src}
                  alt={`${alt} — ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
