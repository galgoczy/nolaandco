import Image from 'next/image';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import { getSiteImages } from '@/lib/siteImages';
import { renderInline } from '@/lib/richTextInline';
import { getAllSiteTexts } from '@/lib/siteTexts';

const features = [
  { key: 'crafting-1', icon: '/images/31.png' },
  { key: 'crafting-2', icon: '/images/5.png' },
  { key: 'crafting-3', icon: '/images/9.png' },
  { key: 'crafting-4', icon: '/images/19.png' },
];

export default async function WorkshopSection({ t: tProp }: { t?: Record<string, string> }) {
  // A műhelyfotók és szövegek adminból cserélhetők (Megjelenés). A t propot a
  // főoldal adja át (egy lekérdezés az összes blokknak); prop nélkül — pl. a
  // kísérleti fooldal-v* oldalakon — a komponens maga tölti be.
  const t = tProp ?? (await getAllSiteTexts());
  const imgs = await getSiteImages(['artofcrafting-1', 'artofcrafting-2', 'artofcrafting-3']);
  return (
    <section className="py-16 md:py-24 bg-[#C4A591] overflow-hidden">
      <div className="max-w-7xl mx-auto px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <RevealOnScroll>
            <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl text-[#FDFBF7] mb-4 leading-tight tracking-[0.2em] uppercase" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 100 }}>
              {t['crafting-cim']}
            </h2>
          </RevealOnScroll>
          <RevealOnScroll>
            <h3 className="text-base md:text-lg text-[#FDFBF7]/90 mb-6" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, letterSpacing: '0.08em' }}>
              {t['crafting-alcim']}
            </h3>
          </RevealOnScroll>
          <RevealOnScroll>
            <p className="text-[#FDFBF7]/85 leading-loose max-w-3xl mx-auto" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 200, letterSpacing: '0.02em' }}>
              {renderInline(t['crafting-bevezeto'])}
            </p>
          </RevealOnScroll>
        </div>

        {/* 4 Feature bullets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 stagger-children">
          {features.map((f, i) => (
            <RevealOnScroll key={i} delay={i * 120}>
              <div className="flex gap-4 items-start">
                <div className="relative w-10 h-10 flex-shrink-0 mt-1">
                  <Image
                    src={f.icon}
                    alt=""
                    fill
                    className="object-contain"
                    style={{ filter: 'brightness(0) invert(1)' }}
                    sizes="40px"
                  />
                </div>
                <div>
                  <h4 className="text-sm uppercase tracking-wider mb-2 text-[#FDFBF7]" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700 }}>
                    {t[`${f.key}-cim`]}
                  </h4>
                  <p className="text-sm text-[#FDFBF7]/90 leading-relaxed" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 400 }}>
                    {renderInline(t[`${f.key}-szoveg`])}
                  </p>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>

        {/* 3 Workshop photos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { src: imgs['artofcrafting-1'], alt: 'Szabás' },
            { src: imgs['artofcrafting-2'], alt: 'Kézi applikálás' },
            { src: imgs['artofcrafting-3'], alt: 'Varrás' },
          ].map((img, i) => (
            <RevealOnScroll key={i} delay={i * 120}>
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#FDFBF7]/10">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
            </RevealOnScroll>
          ))}
        </div>

      </div>
    </section>
  );
}
