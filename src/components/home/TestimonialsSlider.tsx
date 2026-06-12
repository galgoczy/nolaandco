'use client';

import { useEffect, useState } from 'react';
import RevealOnScroll from '@/components/ui/RevealOnScroll';

const testimonials = [
  {
    quote:
      'Elsírtam magam, amikor kibontottam a csomagolást. Hajszálpontosan akkora, mint a kislányom volt...',
    name: 'Zsófi',
  },
  {
    quote:
      'Csodálatos minőség, a – nem is olyan kicsi – fiam azóta a babakori méretű párnájával alszik.',
    name: 'Anna',
  },
  {
    quote:
      'A legkülönlegesebb babaszoba kiegészítő, amit valaha láttam. Tökéletes ajándék volt a barátnőmnek.',
    name: 'Laura',
  },
];

const ROTATE_MS = 6000;

/** BLOKK 7: Vásárlói vélemények — automatikusan lapozó, letisztult slider. */
export default function TestimonialsSlider() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(
      () => setActive((a) => (a + 1) % testimonials.length),
      ROTATE_MS
    );
    return () => clearInterval(timer);
  }, [paused]);

  return (
    <section className="py-16 md:py-24 bg-surface-container-low">
      <div className="max-w-3xl mx-auto px-6 md:px-8 text-center">
        <RevealOnScroll>
          <h2
            className="text-2xl md:text-3xl lg:text-4xl text-carbon mb-10 md:mb-14 tracking-[0.04em]"
            style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}
          >
            Amit a Nola anyukák mondanak
          </h2>
        </RevealOnScroll>

        <RevealOnScroll>
          <div
            className="relative"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <span
              aria-hidden
              className="block text-7xl md:text-8xl leading-none text-[#C4A591]/40 select-none"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              &ldquo;
            </span>

            {/* Stacked slides cross-fade; height follows the tallest quote. */}
            <div className="relative grid">
              {testimonials.map((t, i) => (
                <figure
                  key={t.name}
                  className={`col-start-1 row-start-1 transition-opacity duration-700 ${
                    active === i ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <blockquote
                    className="text-lg md:text-2xl text-[#4A4A4A] leading-relaxed italic"
                    style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}
                  >
                    {t.quote}
                  </blockquote>
                  <figcaption className="mt-6 text-sm md:text-base tracking-[0.2em] uppercase text-[#C4A591] font-medium">
                    &ndash; {t.name}
                  </figcaption>
                </figure>
              ))}
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2.5 mt-8">
              {testimonials.map((t, i) => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`${i + 1}. vélemény`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    active === i ? 'w-6 bg-[#C4A591]' : 'w-2 bg-[#C4A591]/35 hover:bg-[#C4A591]/60'
                  }`}
                />
              ))}
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
