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
              <h2 className="text-3xl md:text-4xl montserrat-light-caps text-carbon mb-8">
                TŐLÜNK
              </h2>
            </RevealOnScroll>
            <RevealOnScroll>
              <p className="text-carbon-light font-light leading-relaxed mb-4">
                A Nola &amp; Co. születését nem egyetlen pillanat, hanem a vágy inspirálta: alkotni
                valamit, amely a leginkább képes megőrizni és visszaadni azt az érzést, amit egy
                újszülött kisbaba karunkban tartása jelent.
              </p>
            </RevealOnScroll>
            <RevealOnScroll>
              <p className="text-carbon-light font-light leading-relaxed mb-8">
                Termékeinkben számomra a szülői gondoskodás és a design találkozik: minden párnát és
                posztert egyedi jellemzők alapján, gondos tervezéssel készítünk el, hogy a
                végeredmény ne csak egy tárgy legyen, hanem egy darabka a családotok történetéből.
              </p>
            </RevealOnScroll>
            <RevealOnScroll>
              <Link
                href="/rolunk"
                className="inline-block bg-primary text-on-primary px-8 py-3 rounded-full text-sm font-medium btn-anim"
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
              <h2 className="text-3xl md:text-4xl montserrat-light-caps text-carbon mb-8">
                NEKTEK
              </h2>
            </RevealOnScroll>
            <RevealOnScroll>
              <p className="text-carbon-light font-light leading-relaxed mb-6">
                A Nola párnákat azoknak a családoknak álmodtuk meg, akik szeretnék megőrizni a
                legelső napok csodáját.
              </p>
            </RevealOnScroll>
            <RevealOnScroll>
              <ul className="space-y-3 mb-6">
                <li className="text-carbon-light font-light leading-relaxed flex items-start gap-2">
                  <span className="text-[#C4A591] mt-1">•</span>
                  A várandósoknak és szülőknek, hogy az első ölelés emléke ne halványuljon.
                </li>
                <li className="text-carbon-light font-light leading-relaxed flex items-start gap-2">
                  <span className="text-[#C4A591] mt-1">•</span>
                  Az örökbefogadóknak, akik számára az első találkozás váratott magára.
                </li>
                <li className="text-carbon-light font-light leading-relaxed flex items-start gap-2">
                  <span className="text-[#C4A591] mt-1">•</span>
                  A korababák szüleinek, hogy büszkén emlékezzenek vissza az útra, amit bejártak.
                </li>
              </ul>
            </RevealOnScroll>
            <RevealOnScroll>
              <p className="text-carbon-light font-light leading-relaxed mb-8">
                Ezen kívül szeretnénk segíteni az angyalbaba-szülőknek, hogy szeretetben őrizhessék
                meg azt az emléket, ami örökre a szívükbe égett.
              </p>
            </RevealOnScroll>
            <RevealOnScroll>
              <Link
                href="/termekek"
                className="inline-block bg-primary text-on-primary px-8 py-3 rounded-full text-sm font-medium btn-anim"
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
