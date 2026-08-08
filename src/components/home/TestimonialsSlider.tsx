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
  {
    quote:
      'Az első hetek hamar elrepülnek, egy szempillantás és már az újszülöttkor elillan. Életének első napjai jutnak eszembe mindig, mikor a párnára nézek és látom mellette a kislányom a jelenben, mennyi minden történt velünk és mennyi minden fog még. A párna ott lesz velünk mindig, akárcsak az emlékeink az első időszakról. Ő a világ számunkra!',
    name: 'Adri',
  },
  {
    quote:
      '„Tényleg ekkora volt?” – szerintem ezt fogjuk kérdezni minden alkalommal, amikor ránézünk. 51 cm tiszta boldogság. 🩷 Ez a párna emlékeztet minket arra, milyen pici volt a kislányunk, amikor megszületett. Egy olyan emlék, amit jó lesz évekkel később is újra átölelni.',
    name: 'Barbi',
  },
  {
    quote:
      'Gyönyörű emlék egy életre! A baba emlékpárna nagyon puha, igényesen elkészített, és minden apró részlete szeretettel készült. Különleges dísze lett a babaszobának, miközben egy igazán megható emléket őriz. A minősége kifogástalan, a kivitelezés pedig pontosan olyan, mint amire számítottam. Szívből ajánlom mindenkinek, aki egy egyedi és maradandó emléket szeretne megőrizni a kisbabájáról!',
    name: 'Kata',
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
    <section className="py-10 md:py-16 bg-[#eef1e8]">
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
