import Image from 'next/image';
import RevealOnScroll from '@/components/ui/RevealOnScroll';

const highlights = [
  {
    icon: '/images/50.png',
    title: '1:1 MÉRETARÁNY',
    desc: 'Minden párna és poszter pontosan akkora, mint amekkora a babád a karjaidban volt.',
  },
  {
    icon: '/images/49.png',
    title: 'IDŐKAPSZULA',
    desc: 'Egy kézzel fogható, puha és örök emlék a legelső, megismételhetetlen napokról.',
  },
  {
    icon: '/images/51.png',
    title: 'KÉZMŰVES MINŐSÉG',
    desc: 'Budapesti műhelyünkben, OEKO-TEX® minősített anyagból, hipoallergén töltettel, kézzel varrva készül.',
  },
];

export default function FeatureHighlights() {
  return (
    <section className="py-16 md:py-24 bg-surface">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
          {highlights.map((h, i) => (
            <RevealOnScroll key={h.title} delay={i * 120}>
              <div className="flex flex-col items-center text-center">
                <div className="relative w-20 h-20 md:w-24 md:h-24 mb-6">
                  <Image
                    src={h.icon}
                    alt=""
                    fill
                    className="object-contain"
                    sizes="96px"
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
