'use client';

import { useEffect, useState } from 'react';
import RevealOnScroll from '@/components/ui/RevealOnScroll';

/** A vélemények adminból szerkeszthetők (Megjelenés → Szövegek); az üresre
 * állított vélemény kimarad a lapozóból. */
function buildTestimonials(t: Record<string, string>) {
  const items: { quote: string; name: string }[] = [];
  for (let i = 1; i <= 6; i++) {
    const quote = (t[`velemeny-${i}-szoveg`] ?? '').trim();
    const name = (t[`velemeny-${i}-nev`] ?? '').trim();
    if (quote) items.push({ quote, name });
  }
  return items;
}

const ROTATE_MS = 6000;

/** BLOKK 7: Vásárlói vélemények — automatikusan lapozó, letisztult slider. */
export default function TestimonialsSlider({ t }: { t: Record<string, string> }) {
  const testimonials = buildTestimonials(t);
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
    <section className="py-10 md:py-16 bg-[#eef1e8]">
      <div className="max-w-3xl mx-auto px-6 md:px-8 text-center">
        <RevealOnScroll>
          <h2
            className="text-2xl md:text-3xl lg:text-4xl text-carbon mb-10 md:mb-14 tracking-[0.04em]"
            style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}
          >
            {t['velemeny-cim']}
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
                    // A hosszabb véleményeknél kisebb betűméret, hogy ne
                    // nőjön aránytalanul magasra a blokk.
                    className={`${
                      t.quote.length > 200 ? 'text-base md:text-xl' : 'text-lg md:text-2xl'
                    } text-[#4A4A4A] leading-relaxed italic`}
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
