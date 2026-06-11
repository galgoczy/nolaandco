import RevealOnScroll from '@/components/ui/RevealOnScroll';

export const metadata = {
  title: 'Nektek – Nola & Co.',
  description: 'A küldetésünk – a Nola & Co. termékei a legszebb pillanatok megőrzéséért.',
};

export default function NektekPage() {
  return (
    <section className="min-h-screen bg-warm-beige py-24 px-4">
      <div className="max-w-2xl mx-auto">
        <RevealOnScroll>
          <h1 className="montserrat-light-caps text-4xl md:text-5xl text-[#4A4A4A] mb-4 text-center">
            A küldetésünk
          </h1>
        </RevealOnScroll>

        <div className="space-y-8 text-[#4A4A4A] font-body text-base leading-relaxed mt-12">
          <RevealOnScroll>
            <p>
              A Nola &amp; Co darabjait azoknak a családoknak álmodtuk meg, akik szeretnék
              kézzelfoghatóvá tenni a gyermekkor legfontosabb pillanatait &ndash; a legelső napok
              csodájától egészen a varázslatos, közös kalandokig.
            </p>
          </RevealOnScroll>

          <RevealOnScroll>
            <ul className="space-y-3 mt-3">
              <li className="flex gap-3">
                <span className="text-[#C4A591] mt-1">•</span>
                <span>
                  A <strong className="font-semibold">várandósoknak és szülőknek</strong>, hogy az
                  első ölelés emléke ne halványuljon.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#C4A591] mt-1">•</span>
                <span>
                  A <strong className="font-semibold">nagytesóknak és a bővülő családoknak</strong>,
                  hogy a kistestvér érkezésekor az ő új, fontos szerepük is méltó, kiemelt
                  figyelmet kapjon.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#C4A591] mt-1">•</span>
                <span>
                  Az <strong className="font-semibold">örökbefogadóknak</strong>, akik számára az
                  első találkozás váratott magára.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#C4A591] mt-1">•</span>
                <span>
                  A <strong className="font-semibold">korababák szüleinek</strong>, hogy büszkén
                  emlékezzenek vissza az útra, amit bejártak.
                </span>
              </li>
            </ul>
          </RevealOnScroll>

          <RevealOnScroll>
            <p className="italic">
              Ezen kívül szeretnénk segíteni az{' '}
              <strong className="font-bold italic">angyalbaba-szülőknek</strong>, hogy szeretetben
              őrizhessék meg azt az emléket, ami örökre a szívükbe égett.
            </p>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
