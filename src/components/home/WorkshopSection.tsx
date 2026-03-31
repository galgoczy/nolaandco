import RevealOnScroll from '@/components/ui/RevealOnScroll';

const features = [
  {
    title: 'Prémium alapanyagok',
    desc: 'OEKO-TEX Standard 100 minősítésű, hipoallergén anyagok, amelyek biztonságosak a legérzékenyebb bőrre is.',
  },
  {
    title: 'Tartós kidolgozás',
    desc: 'Erős varrások és strapabíró anyagok, hogy a párna évtizedeken át megőrizze formáját és szépségét.',
  },
  {
    title: 'Egyedi részletek',
    desc: 'Minden sziluett és születési adat speciális hőpréselési technológiával kerül a párnára.',
  },
  {
    title: 'Kézműves gondoskodás',
    desc: 'Minden egyes darabot kézzel szabunk, varrunk és ellenőrzünk – mert a te babád megérdemli a legjobbat.',
  },
];

const steps = [
  { num: '01', title: 'Válaszd ki a formát', desc: 'Origin vagy Nova – melyik sziluett áll közelebb a szívedhez?' },
  { num: '02', title: 'Válaszd ki a stílust', desc: 'Core, Signature vagy Luxe – a színek és anyagok világa.' },
  { num: '03', title: 'Add meg a születési adatokat', desc: 'Név, dátum, súly, hossz – és elkészítjük az egyedi párnádat.' },
];

export default function WorkshopSection() {
  return (
    <section className="py-24 md:py-32 bg-[#C4A591] overflow-hidden">
      <div className="max-w-7xl mx-auto px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <RevealOnScroll>
            <h2 className="text-xs font-extrabold tracking-[0.3em] uppercase text-[#FDFBF7] mb-4">
              Crafting Excellence
            </h2>
          </RevealOnScroll>
          <RevealOnScroll>
            <h3 className="text-4xl md:text-5xl montserrat-light-caps text-[#FDFBF7] mb-8 leading-tight">
              MŰHELYTITKOK
            </h3>
          </RevealOnScroll>
          <RevealOnScroll>
            <p className="text-xl text-[#FDFBF7]/90 font-light leading-relaxed max-w-3xl mx-auto">
              Minden Nola &amp; Co. termék a gondoskodás és a precizitás találkozásából születik.
              Belelátunk a kulisszák mögé.
            </p>
          </RevealOnScroll>
        </div>

        {/* 4 Feature bullets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20 stagger-children">
          {features.map((f, i) => (
            <RevealOnScroll key={i} delay={i * 120}>
              <div className="flex gap-4 items-start">
                <span className="text-[#FDFBF7] text-2xl mt-1">&#10022;</span>
                <div>
                  <h4 className="font-bold text-sm uppercase tracking-wider mb-2 text-[#FDFBF7]">
                    {f.title}
                  </h4>
                  <p className="text-sm text-[#FDFBF7]/80 leading-relaxed">{f.desc}</p>
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
            <h3 className="text-3xl md:text-4xl montserrat-light-caps text-[#FDFBF7] mb-4">
              RENDELÉS MENETE
            </h3>
          </RevealOnScroll>
          <RevealOnScroll>
            <p className="text-[#FDFBF7]/80 font-light max-w-xl mx-auto">
              Három egyszerű lépésben elkészítjük a tökéletes emlékőrzőt.
            </p>
          </RevealOnScroll>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16 stagger-children">
          {steps.map((s, i) => (
            <RevealOnScroll key={i} delay={i * 150}>
              <div className="text-center">
                <span className="text-5xl font-light text-[#FDFBF7]/30 block mb-4">{s.num}</span>
                <h4 className="text-lg font-bold text-[#FDFBF7] mb-2">{s.title}</h4>
                <p className="text-sm text-[#FDFBF7]/80 font-light leading-relaxed">{s.desc}</p>
              </div>
            </RevealOnScroll>
          ))}
        </div>

        <RevealOnScroll>
          <div className="text-center">
            <a
              href="/termekek"
              className="inline-block bg-[#FDFBF7] text-[#C4A591] px-10 py-4 rounded-full text-sm font-bold tracking-wide btn-anim shadow-xl"
            >
              Kezdd el a tervezést!
            </a>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
