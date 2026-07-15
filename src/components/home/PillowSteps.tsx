import RevealOnScroll from '@/components/ui/RevealOnScroll';

const steps = [
  {
    num: '01',
    title: 'Válaszd ki a formát',
    subtitle: 'ORIGIN vagy NOVA',
    desc: 'ORIGIN: a magzati állapotot idéző, oldalt fekvő pozíció\nNOVA: lendületes, dinamikus, hason fekvő pozíció',
  },
  {
    num: '02',
    title: 'Dönts a stílusról',
    subtitle: 'CORE, LINEA vagy ATELIER',
    desc: 'CORE: skandináv minimalizmus\nLINEA: megszakítás nélküli vonalvezetés\nATELIER: kézműves részletgazdagság',
  },
  {
    num: '03',
    title: 'Add meg a születési adatokat és rendelj',
    subtitle: 'NÉV, SZÜLETÉSI DÁTUM ÉS IDŐ, SÚLY, HOSSZ',
    desc: 'Ezt követően mi kb. 2 hét alatt elkészítjük a párnát és postázzuk neked.',
  },
];

/**
 * "Így készül el a saját emlékpárnád" — az Emlékpárnák kategóriaoldal alján,
 * a termékrács után jelenik meg (a főoldali THE ART OF CRAFTING blokktól külön).
 */
export default function PillowSteps() {
  return (
    <section className="py-20 md:py-28 bg-[#C4A591] overflow-hidden">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-12">
          <RevealOnScroll>
            <h3 className="text-2xl md:text-3xl text-[#FDFBF7] mb-4 tracking-[0.15em] uppercase" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 100 }}>
              Így készül el a saját emlékpárnád
            </h3>
          </RevealOnScroll>
          <RevealOnScroll>
            <p className="text-[#FDFBF7]/80 max-w-xl mx-auto" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 200, letterSpacing: '0.02em' }}>
              Három egyszerű lépés a NOLA-párnáig
            </p>
          </RevealOnScroll>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16 stagger-children">
          {steps.map((s, i) => (
            <RevealOnScroll key={i} delay={i * 150}>
              <div className="text-center">
                <span className="text-5xl text-[#FDFBF7]/30 block mb-4" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 100 }}>{s.num}</span>
                <h4 className="text-lg text-[#FDFBF7] mb-1" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 600 }}>{s.title}</h4>
                <p className="text-xs uppercase tracking-wider text-[#FDFBF7]/80 mb-3" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 500 }}>{s.subtitle}</p>
                <p className="text-sm text-[#FDFBF7]/90 leading-relaxed whitespace-pre-line" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 400 }}>{s.desc}</p>
              </div>
            </RevealOnScroll>
          ))}
        </div>

        <RevealOnScroll>
          <div className="text-center">
            <a
              href="/termekek?category=pillow"
              className="inline-block bg-cta text-white hover:bg-cta-hover px-10 py-4 rounded-full text-sm tracking-wide btn-anim shadow-xl" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 500 }}
            >
              Megtervezem a saját emlékpárnámat
            </a>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
