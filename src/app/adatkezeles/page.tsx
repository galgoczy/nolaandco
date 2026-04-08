import RevealOnScroll from '@/components/ui/RevealOnScroll';

export const metadata = {
  title: 'Adatkezelési tájékoztató – Nola & Co.',
  description: 'A Nola & Co. adatkezelési tájékoztatója (GDPR).',
};

export default function AdatkezelesPage() {
  return (
    <section className="min-h-screen bg-warm-beige py-24 px-4">
      <div className="max-w-2xl mx-auto">
        <RevealOnScroll>
          <h1 className="montserrat-light-caps text-4xl md:text-5xl text-carbon mb-4 text-center">
            Adatkezelési Tájékoztató
          </h1>
          <div className="w-12 h-[2px] bg-primary mx-auto mb-12" />
        </RevealOnScroll>

        <div className="space-y-10 text-carbon-light font-body text-base leading-relaxed">
          {/* I. */}
          <RevealOnScroll>
            <h2 className="text-lg text-carbon font-medium mb-3">I. Az Adatkezelő adatai</h2>
            <ul className="space-y-1">
              <li><strong className="text-carbon">Név:</strong> Galgóczy Krisztina E.V.</li>
              <li><strong className="text-carbon">Elérhetőség:</strong>{' '}
                <a href="mailto:hello@nolaandco.hu" className="text-[#C4A591] underline underline-offset-2 hover:text-[#4A4A4A] transition-colors">
                  hello@nolaandco.hu
                </a>
              </li>
            </ul>
          </RevealOnScroll>

          {/* II. */}
          <RevealOnScroll>
            <h2 className="text-lg text-carbon font-medium mb-3">II. Milyen adatokat kezelünk és miért?</h2>

            <div className="space-y-6">
              <div className="bg-surface-container-lowest rounded-xl p-5 ghost-border">
                <h3 className="text-carbon font-medium mb-2">1. Rendelés teljesítése</h3>
                <ul className="space-y-1 text-sm">
                  <li><strong className="text-carbon">Adatok:</strong> Név, szállítási cím, email, telefonszám.</li>
                  <li><strong className="text-carbon">Cél:</strong> A termék eljuttatása, kapcsolattartás.</li>
                  <li><strong className="text-carbon">Jogalap:</strong> Szerződés teljesítése.</li>
                  <li><strong className="text-carbon">Időtartam:</strong> A Számviteli törvény szerinti 8 év (számla megőrzése).</li>
                </ul>
              </div>

              <div className="bg-surface-container-lowest rounded-xl p-5 ghost-border">
                <h3 className="text-carbon font-medium mb-2">2. A termékre kerülő adatok (Baba adatai)</h3>
                <ul className="space-y-1 text-sm">
                  <li><strong className="text-carbon">Adatok:</strong> Baba neve, születési adatai (születési dátum, időpont, súly, hossz).</li>
                  <li><strong className="text-carbon">Cél:</strong> A termék elkészítése (nyomat).</li>
                  <li><strong className="text-carbon">Kezelés:</strong> Ezeket az adatokat bizalmasan kezeljük, harmadik félnek nem adjuk át, és a gyártás után, a jótállási idő végével töröljük a gyártási nyilvántartásból (kivéve a számlán szereplő adatokat).</li>
                </ul>
              </div>
            </div>
          </RevealOnScroll>

          {/* III. */}
          <RevealOnScroll>
            <h2 className="text-lg text-carbon font-medium mb-3">III. Kik ismerhetik meg az adatokat? (Adatfeldolgozók)</h2>
            <p className="mb-4">Az adatok továbbításra kerülnek az alábbi partnerek felé a szolgáltatás teljesítése érdekében:</p>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li><strong className="text-carbon">Tárhelyszolgáltató:</strong> Vercel (A webshop üzemeltetése).</li>
              <li><strong className="text-carbon">Számlázás:</strong> Számlázz.hu (A számla kiállítása).</li>
              <li><strong className="text-carbon">Szállítás:</strong> Foxpost Zrt. / Packeta Hungary Kft. (A csomag kézbesítése – név, cím, telefonszám, email cím).</li>
              <li><strong className="text-carbon">Fizetés:</strong> Stripe, Inc. (Bankkártyás fizetés lebonyolítása).</li>
              <li><strong className="text-carbon">Könyvelés:</strong> Andreotti Bt.</li>
            </ol>
          </RevealOnScroll>

          {/* IV. */}
          <RevealOnScroll>
            <h2 className="text-lg text-carbon font-medium mb-3">IV. Az Ön jogai</h2>
            <p>
              Ön kérelmezheti az adatkezelőtől a személyes adataihoz való hozzáférést, azok helyesbítését,
              törlését vagy kezelésének korlátozását. Panasszal a NAIH-hoz fordulhat (www.naih.hu).
            </p>
          </RevealOnScroll>

          {/* V. */}
          <RevealOnScroll>
            <h2 className="text-lg text-carbon font-medium mb-3">V. Sütik (Cookies)</h2>
            <p>
              A weboldal a működéshez szükséges sütiket használ. Marketing célú sütiket
              (Facebook Pixel, Google Analytics) csak az Ön kifejezett hozzájárulásával használunk.
            </p>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
