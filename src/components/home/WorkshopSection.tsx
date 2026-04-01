import RevealOnScroll from '@/components/ui/RevealOnScroll';

const features = [
  {
    title: 'Prémium alapanyagok',
    desc: 'Kizárólag OEKO-TEX® minősítésű, bababarát, extra puha plüss textíliával dolgozunk, amely a legérzékenyebb bababőrnek is biztonságos.',
  },
  {
    title: 'Tartós kidolgozás',
    desc: 'Párnáinkat speciális, hipoallergén, mosógépben mosható és formatartó töltettel látjuk el, így évek múltán is ugyanolyan ölelni valók maradnak, mint a vásárlás napján.',
  },
  {
    title: 'Egyedi részletek',
    desc: 'A sziluettet és a születési adatokat modern, kopásálló technológiával visszük fel az anyagra, amely a plüss szerkezetével együtt alkot harmonikus egységet.',
  },
  {
    title: 'Kézműves gondoskodás',
    desc: 'Minden párnát gondos, kézi záróvarrással fejezünk be, ügyelve arra, hogy a végeredmény kívül-belül tökéletes legyen.',
  },
];

const steps = [
  { num: '01', title: 'Válaszd ki a formát', desc: 'ORIGIN vagy NOVA – melyik sziluett áll közelebb a szívedhez?' },
  { num: '02', title: 'Válaszd ki a stílust', desc: 'Core, Linea vagy Atelier – a színek és anyagok világa.' },
  { num: '03', title: 'Add meg a születési adatokat', desc: 'Név, dátum, súly, hossz – és elkészítjük az egyedi párnádat.' },
];

export default function WorkshopSection() {
  return (
    <section className="py-24 md:py-32 bg-[#C4A591] overflow-hidden">
      <div className="max-w-7xl mx-auto px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <RevealOnScroll>
            <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl text-[#FDFBF7] mb-4 leading-tight tracking-[0.2em] uppercase" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 100 }}>
              THE ART OF CRAFTING
            </h2>
          </RevealOnScroll>
          <RevealOnScroll>
            <h3 className="text-base md:text-lg text-[#FDFBF7]/90 mb-8" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, letterSpacing: '0.08em' }}>
              A műhely titkai
            </h3>
          </RevealOnScroll>
          <RevealOnScroll>
            <p className="text-[#FDFBF7]/85 leading-loose max-w-3xl mx-auto" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 200, letterSpacing: '0.02em' }}>
              Minden öltés mögött történetek állnak. A Nola &amp; Co. párnákat nemcsak varrjuk, hanem alkotjuk:
              a legpuhább anyagokat választjuk és minden részletet kézzel finomítunk, hogy az emlék örök maradhasson.
            </p>
          </RevealOnScroll>
        </div>

        {/* 4 Feature bullets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20 stagger-children">
          {features.map((f, i) => (
            <RevealOnScroll key={i} delay={i * 120}>
              <div className="flex gap-4 items-start">
                <span className="text-[#FDFBF7] text-2xl mt-1">·</span>
                <div>
                  <h4 className="text-sm uppercase tracking-wider mb-2 text-[#FDFBF7]" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 600 }}>
                    {f.title}
                  </h4>
                  <p className="text-sm text-[#FDFBF7]/80 leading-relaxed" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 200 }}>
                    {f.desc}
                  </p>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>

        {/* 3 Placeholder photos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {['Szabás', 'Hőpréselés', 'Címke & varrás'].map((label, i) => (
            <RevealOnScroll key={i} delay={i * 120}>
              <div className="aspect-[4/3] rounded-2xl bg-[#FDFBF7]/10 flex items-center justify-center">
                <span className="text-[#FDFBF7]/40 text-sm font-body">{label}</span>
              </div>
            </RevealOnScroll>
          ))}
        </div>

        {/* Rendelés menete */}
        <div className="text-center mb-12">
          <RevealOnScroll>
            <h3 className="text-2xl md:text-3xl text-[#FDFBF7] mb-4 tracking-[0.15em] uppercase" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 100 }}>
              RENDELÉS MENETE
            </h3>
          </RevealOnScroll>
          <RevealOnScroll>
            <p className="text-[#FDFBF7]/80 max-w-xl mx-auto" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 200, letterSpacing: '0.02em' }}>
              Három egyszerű lépésben elkészítjük a tökéletes emlékőrzőt.
            </p>
          </RevealOnScroll>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16 stagger-children">
          {steps.map((s, i) => (
            <RevealOnScroll key={i} delay={i * 150}>
              <div className="text-center">
                <span className="text-5xl text-[#FDFBF7]/30 block mb-4" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 100 }}>{s.num}</span>
                <h4 className="text-lg text-[#FDFBF7] mb-2" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 500 }}>{s.title}</h4>
                <p className="text-sm text-[#FDFBF7]/80 leading-relaxed" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 200 }}>{s.desc}</p>
              </div>
            </RevealOnScroll>
          ))}
        </div>

        <RevealOnScroll>
          <div className="text-center">
            <a
              href="/termekek"
              className="inline-block bg-[#FDFBF7] text-[#C4A591] px-10 py-4 rounded-full text-sm tracking-wide btn-anim shadow-xl" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 500 }}
            >
              Kezdd el a tervezést!
            </a>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
