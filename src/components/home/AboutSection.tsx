import Link from 'next/link';
import RevealOnScroll from '@/components/ui/RevealOnScroll';

export default function AboutSection() {
  return (
    <section className="py-24 md:py-32 bg-surface">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Left: TŐLÜNK */}
          <div className="pr-0 md:pr-16 md:border-r border-[#4A4A4A]/20 pb-16 md:pb-0">
            <RevealOnScroll>
              <h2 className="text-3xl md:text-4xl text-carbon mb-8 tracking-[0.15em] uppercase" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 100 }}>
                TŐLÜNK
              </h2>
            </RevealOnScroll>
            <RevealOnScroll>
              <p className="text-carbon-light leading-loose mb-4" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 200, letterSpacing: '0.02em' }}>
                A <strong className="font-semibold">Nola &amp; Co.</strong> születését nem egyetlen pillanat, hanem a vágy inspirálta: alkotni
                valamit, amely a leginkább képes megőrizni és visszaadni azt az érzést, amit egy
                újszülött kisbaba karunkban tartása jelent.
              </p>
            </RevealOnScroll>
            <RevealOnScroll>
              <p className="text-carbon-light leading-loose mb-8" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 200, letterSpacing: '0.02em' }}>
                Termékeinkben számomra a <strong className="font-semibold">szülői gondoskodás</strong> és a <strong className="font-semibold">design</strong> találkozik: minden párnát és
                posztert egyedi jellemzők alapján, gondos tervezéssel készítünk el, hogy a
                végeredmény ne csak egy tárgy legyen, hanem egy darabka a családotok történetéből.
              </p>
            </RevealOnScroll>
            <RevealOnScroll>
              <Link
                href="/rolunk"
                className="inline-block bg-[#D5E8F0] text-carbon px-8 py-3 rounded-full text-sm font-medium btn-anim"
              >
                Ismerj meg minket
              </Link>
            </RevealOnScroll>
            {/* Placeholder image */}
            <RevealOnScroll>
              <div className="mt-10 aspect-[4/3] rounded-2xl bg-surface-container flex items-center justify-center">
                <span className="text-carbon-light/40 text-sm font-body">Kép helye (varrógép, varrás)</span>
              </div>
            </RevealOnScroll>
          </div>

          {/* Right: NEKTEK */}
          <div className="pl-0 md:pl-16 pt-16 md:pt-0">
            <RevealOnScroll>
              <h2 className="text-3xl md:text-4xl text-carbon mb-8 tracking-[0.15em] uppercase" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 100 }}>
                NEKTEK
              </h2>
            </RevealOnScroll>
            <RevealOnScroll>
              <p className="text-carbon-light leading-loose mb-6" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 200, letterSpacing: '0.02em' }}>
                A Nola párnákat azoknak a családoknak álmodtuk meg, akik szeretnék megőrizni a
                legelső napok csodáját.
              </p>
            </RevealOnScroll>
            <RevealOnScroll>
              <ul className="space-y-3 mb-6">
                <li className="text-carbon-light leading-loose flex items-start gap-2" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 200, letterSpacing: '0.02em' }}>
                  <span className="text-[#C4A591] mt-1">•</span>
                  A <strong className="font-semibold">várandósoknak</strong> és <strong className="font-semibold">szülőknek</strong>, hogy az első ölelés emléke ne halványuljon.
                </li>
                <li className="text-carbon-light leading-loose flex items-start gap-2" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 200, letterSpacing: '0.02em' }}>
                  <span className="text-[#C4A591] mt-1">•</span>
                  Az <strong className="font-semibold">örökbefogadóknak</strong>, akik számára az első találkozás váratott magára.
                </li>
                <li className="text-carbon-light leading-loose flex items-start gap-2" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 200, letterSpacing: '0.02em' }}>
                  <span className="text-[#C4A591] mt-1">•</span>
                  A <strong className="font-semibold">korababák szüleinek</strong>, hogy büszkén emlékezzenek vissza az útra, amit bejártak.
                </li>
              </ul>
            </RevealOnScroll>
            <RevealOnScroll>
              <p className="text-carbon-light leading-loose mb-8 italic" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 200, letterSpacing: '0.02em' }}>
                Ezen kívül szeretnénk segíteni az angyalbaba-szülőknek, hogy szeretetben őrizhessék
                meg azt az emléket, ami örökre a szívükbe égett.
              </p>
            </RevealOnScroll>
            <RevealOnScroll>
              <Link
                href="/termekek"
                className="inline-block bg-[#D5E8F0] text-carbon px-8 py-3 rounded-full text-sm font-medium btn-anim"
              >
                Megnézem a párnákat
              </Link>
            </RevealOnScroll>
            {/* Placeholder image */}
            <RevealOnScroll>
              <div className="mt-10 aspect-[4/3] rounded-2xl bg-surface-container flex items-center justify-center">
                <span className="text-carbon-light/40 text-sm font-body">Kép helye (szülők a párnával)</span>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </div>
    </section>
  );
}
