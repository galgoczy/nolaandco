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
              A Nola &amp; Co. termékeit azért hívtuk életre, hogy visszahozzuk azt a semmihez sem
              fogható, törékeny érzést, amit egy újszülött érkezése, karunkban tartása ad.
            </p>
          </RevealOnScroll>

          <RevealOnScroll>
            <p className="font-medium">Szeretnénk ezt a pillanatot:</p>
            <ul className="space-y-3 mt-3">
              <li className="flex gap-3">
                <span className="text-[#C4A591] mt-1">•</span>
                <span>
                  <strong className="font-semibold">Megőrizni</strong> azoknak a szülőknek, akiknek
                  a kisbabái egy pillanat alatt megnőttek
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#C4A591] mt-1">•</span>
                <span>
                  <strong className="font-semibold">Odaadni</strong> azoknak az örökbefogadó
                  szülőknek, akik számára az első ölelés váratott magára
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#C4A591] mt-1">•</span>
                <span>
                  <strong className="font-semibold">Megmutatni</strong> a korababák szüleinek, hogy
                  büszkén tekinthessenek vissza, mekkora utat jártak be
                </span>
              </li>
            </ul>
          </RevealOnScroll>

          <RevealOnScroll>
            <p className="italic">
              Továbbá szívből szeretnénk segíteni a feldolgozásban azoknak a szülőknek, akiknek egy
              angyalbaba emléke örökre a szívükbe égett – hogy a párna által egy kézzelfogható
              emlékkel tarthassák őket közel magukhoz.
            </p>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
