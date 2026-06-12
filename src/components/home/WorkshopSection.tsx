import Image from 'next/image';
import RevealOnScroll from '@/components/ui/RevealOnScroll';

const features = [
  {
    title: 'Prémium alapanyagok',
    icon: '/images/31.png',
    desc: 'Legyen szó a párnáink pihe-puha plüsséről, vagy az új termékeink pillekönnyű pamut duplagéz (muszlin) anyagáról, textíliáink és cérnáink kivétel nélkül OEKO-TEX® Standard 100 minősítésűek. Ez garantálja, hogy minden felhasznált anyagot káros anyagokra bevizsgáltak, így az újszülöttek és a nagyobb gyerekek érzékeny bőrével érintkezve is 100%-ig biztonságos választást jelentenek.',
  },
  {
    title: 'Tartós kidolgozás',
    icon: '/images/5.png',
    desc: 'Termékeinket évekre tervezzük. A párnák töltete hipoallergén, mosható és formatartó (nem csomósodik), míg a kalandköpenyek és kiegészítők dupla rétegű anyagból, strapabíró varrással készülnek. Bármelyiket is választod, hosszú távon megőrzik puhaságukat és gyönyörű esésüket az emlékőrzés vagy a mindennapi játék során is.',
  },
  {
    title: 'Egyedi részletek',
    icon: '/images/9.png',
    desc: 'Minden darab a tiétek. A párnákon lévő sziluetteket és születési adatokat modern, bőrbarát és mosásálló technológiával visszük fel az anyagra. A köpenyeken lévő kezdőbetűket és motívumokat pedig kézműves filcből, gondos kézi rátét-varrással (applikálással) rögzítjük, hogy tökéletes, térbeli harmóniát alkossanak.',
  },
  {
    title: 'Kézműves gondoskodás',
    icon: '/images/19.png',
    desc: 'Minden termékünk gondosan, egyedileg készül, hogy a legkisebb babák és a legnagyobb „csapatjátékosok" számára is megbízható, biztonságos és szerethető kiegészítő legyen.',
  },
];

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
    desc: 'Ezt követően mi 5-8 nap alatt elkészítjük a párnát és postázzuk neked.',
  },
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
              A Nola &amp; Co. darabjai nem sorozatgyártásban készülnek. Minden emlékőrző és
              kiegészítő a te megrendelésedre, a ti egyedi történetetek alapján születik meg
              budapesti műhelyünkben.
            </p>
          </RevealOnScroll>
        </div>

        {/* 4 Feature bullets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20 stagger-children">
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
                    {f.title}
                  </h4>
                  <p className="text-sm text-[#FDFBF7]/90 leading-relaxed" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 400 }}>
                    {f.desc}
                  </p>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>

        {/* 3 Workshop photos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {[
            { src: '/images/home/artofcrafting-1.jpg', alt: 'Szabás' },
            { src: '/images/home/artofcrafting-2.jpg', alt: 'Kézi applikálás' },
            { src: '/images/home/artofcrafting-3.jpg', alt: 'Varrás' },
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

        {/* Rendelés menete */}
        <div className="text-center mb-12">
          <RevealOnScroll>
            <h3 className="text-2xl md:text-3xl text-[#FDFBF7] mb-4 tracking-[0.15em] uppercase" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 100 }}>
              RENDELÉS MENETE
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
