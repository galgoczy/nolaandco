import Image from 'next/image';
import RevealOnScroll from '@/components/ui/RevealOnScroll';

const highlights = [
  {
    icon: '/images/50.png',
    title: '1:1 MÉRETARÁNY',
    desc: 'Pontosan akkora, mint amekkora a kisbabád volt, amikor megszületett.',
  },
  {
    icon: '/images/49.png',
    title: 'IDŐKAPSZULA',
    desc: 'Életre kelti és megőrzi az emlékeket az első, megismételhetetlen napokról.',
  },
  {
    icon: '/images/51.png',
    title: 'KÉZMŰVES MINŐSÉG',
    desc: 'Bababarát – OEKO-TEX® és hipoallergén – anyagokból, kézzel készül budapesti műhelyünkben.',
  },
];

export default function FeatureHighlights() {
  return (
    <section className="py-8 md:py-12 bg-surface">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
          {highlights.map((h, i) => (
            <RevealOnScroll key={h.title} delay={i * 120}>
              <div className="flex flex-col items-center text-center">
                <div className="relative w-[50px] h-[50px] md:w-[61px] md:h-[61px] mb-6">
                  <Image
                    src={h.icon}
                    alt=""
                    fill
                    className="object-contain"
                    sizes="61px"
                  />
                </div>
                <h3
                  className="text-sm md:text-base text-carbon mb-3 tracking-[0.2em]"
                  style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 500 }}
                >
                  {h.title}
                </h3>
                <p className="text-sm text-carbon-light font-body leading-relaxed max-w-xs">
                  {h.desc}
                </p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
