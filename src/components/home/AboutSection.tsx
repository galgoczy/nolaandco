import Image from 'next/image';
import Link from 'next/link';
import RevealOnScroll from '@/components/ui/RevealOnScroll';

const thinText = { fontFamily: "'Montserrat', sans-serif", fontWeight: 200 } as const;

export default function AboutSection() {
  return (
    <section className="pt-12 pb-24 md:pt-16 md:pb-32 bg-surface">
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
              <p className="text-carbon-light leading-relaxed mb-4 text-[15px]" style={thinText}>
                A <strong className="font-medium">Nola &amp; Co.</strong> születését nem egyetlen pillanat, hanem a vágy inspirálta: alkotni
                valamit, amely a leginkább képes megőrizni és visszaadni azt az érzést, amit egy
                újszülött kisbaba karunkban tartása jelent.
              </p>
            </RevealOnScroll>
            <RevealOnScroll>
              <p className="text-carbon-light leading-relaxed mb-8 text-[15px]" style={thinText}>
                Termékeinkben számomra a <strong className="font-medium">szülői gondoskodás</strong> és a <strong className="font-medium">design</strong> találkozik: minden párnát és
                posztert egyedi jellemzők alapján, gondos tervezéssel készítünk el, hogy a
                végeredmény ne csak egy tárgy legyen, hanem egy darabka a családotok történetéből.
              </p>
            </RevealOnScroll>
            <RevealOnScroll>
              <Link
                href="/rolunk"
                className="inline-block bg-[#D5E8F0] text-carbon px-8 py-3 rounded-full text-sm font-medium btn-anim uppercase tracking-[0.1em]"
              >
                Ismerj meg minket
              </Link>
            </RevealOnScroll>
            <RevealOnScroll>
              <div className="relative mt-10 aspect-[3/4] max-w-sm mx-auto rounded-2xl overflow-hidden bg-surface-container">
                <Image
                  src="/images/Tőlünk.jpg"
                  alt="Tőlünk - Nola & Co."
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 384px"
                />
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
              <p className="text-carbon-light leading-relaxed mb-6 text-[15px]" style={thinText}>
                A Nola párnákat azoknak a családoknak álmodtuk meg, akik szeretnék megőrizni a
                legelső napok csodáját.
              </p>
            </RevealOnScroll>
            <RevealOnScroll>
              <ul className="space-y-2 mb-6 text-[15px]">
                <li className="text-carbon-light leading-relaxed" style={thinText}>
                  <span className="text-[#C4A591] mr-2">·</span>
                  A <strong className="font-medium">várandósoknak</strong> és <strong className="font-medium">szülőknek</strong>, hogy az első ölelés emléke ne halványuljon.
                </li>
                <li className="text-carbon-light leading-relaxed" style={thinText}>
                  <span className="text-[#C4A591] mr-2">·</span>
                  Az <strong className="font-medium">örökbefogadóknak</strong>, akik számára az első találkozás váratott magára.
                </li>
                <li className="text-carbon-light leading-relaxed" style={thinText}>
                  <span className="text-[#C4A591] mr-2">·</span>
                  A <strong className="font-medium">korababák szüleinek</strong>, hogy büszkén emlékezzenek vissza az útra, amit bejártak.
                </li>
              </ul>
            </RevealOnScroll>
            <RevealOnScroll>
              <p className="text-carbon-light leading-relaxed mb-8 italic text-[15px]" style={thinText}>
                Ezen kívül szeretnénk segíteni az <strong className="font-bold italic">angyalbaba-szülőknek</strong>, hogy szeretetben őrizhessék
                meg azt az emléket, ami örökre a szívükbe égett.
              </p>
            </RevealOnScroll>
            <RevealOnScroll>
              <Link
                href="/termekek"
                className="inline-block bg-[#D5E8F0] text-carbon px-8 py-3 rounded-full text-sm font-medium btn-anim uppercase tracking-[0.1em]"
              >
                Megnézem a párnákat
              </Link>
            </RevealOnScroll>
            <RevealOnScroll>
              <div className="relative mt-10 aspect-[4/3] rounded-2xl overflow-hidden bg-surface-container">
                <Image
                  src="/images/Nektek_1.jpg"
                  alt="Nektek - Nola & Co."
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </div>
    </section>
  );
}
