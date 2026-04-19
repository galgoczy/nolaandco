import Image from 'next/image';
import { Fragment } from 'react';
import RevealOnScroll from '@/components/ui/RevealOnScroll';

const highlights = [
  {
    icon: '/images/1.png',
    title: 'PONTOS MÉRETARÁNY',
    desc: 'Születéskori méretek, 1:1 arányban megörökítve',
  },
  {
    icon: '/images/2.png',
    title: 'ÖRÖK EMLÉK',
    desc: 'Az első napok csodája, amely formát ölt és veletek marad',
  },
  {
    icon: '/images/3.png',
    title: 'BABABARÁT MINŐSÉG',
    desc: 'OEKO-TEX® tanúsítvány, hipoallergén töltet, budapesti manufaktúrából',
  },
];

export default function FeatureHighlights() {
  return (
    <section className="py-10 md:py-16 bg-[#f5f0e8]">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-stretch md:justify-center">
          {highlights.map((h, i) => (
            <Fragment key={h.title}>
              {i > 0 && (
                <div
                  aria-hidden
                  className="hidden md:block w-px bg-[#4A4A4A]/15 mx-[30px] lg:mx-[40px] my-4"
                />
              )}
              <RevealOnScroll delay={i * 120}>
                <div className="flex flex-col items-center text-center py-6 md:py-2 md:w-[220px]">
                  <div className="relative w-[50px] h-[50px] md:w-[61px] md:h-[61px] mb-5">
                    <Image
                      src={h.icon}
                      alt=""
                      fill
                      className="object-contain"
                      sizes="61px"
                    />
                  </div>
                  <h3
                    className="text-sm md:text-base text-carbon mb-3 tracking-[0.22em]"
                    style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}
                  >
                    {h.title}
                  </h3>
                  <p
                    className="text-sm text-[#4A4A4A] font-body"
                    style={{ lineHeight: 1.8 }}
                  >
                    {h.desc}
                  </p>
                </div>
              </RevealOnScroll>
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
