import RevealOnScroll from '@/components/ui/RevealOnScroll';

export const metadata = {
  title: 'Általános Szerződési Feltételek – Nola & Co.',
  description: 'A Nola & Co. webshop Általános Szerződési Feltételei (ÁSZF).',
};

export default function AszfPage() {
  return (
    <section className="min-h-screen bg-warm-beige py-24 px-4">
      <div className="max-w-2xl mx-auto">
        <RevealOnScroll>
          <h1 className="montserrat-light-caps text-4xl md:text-5xl text-carbon mb-4 text-center">
            Általános Szerződési Feltételek
          </h1>
          <div className="w-12 h-[2px] bg-primary mx-auto mb-4" />
          <p className="text-center text-sm text-carbon-light mb-12">
            Hatályos: 2026. április 6-tól visszavonásig
          </p>
        </RevealOnScroll>

        <div className="space-y-10 text-carbon-light font-body text-base leading-relaxed">
          {/* I. */}
          <RevealOnScroll>
            <h2 className="text-lg text-carbon font-medium mb-3">I. A Szolgáltató adatai</h2>
            <ul className="space-y-1 text-sm">
              <li><strong className="text-carbon">Név:</strong> Galgóczy Krisztina E.V.</li>
              <li><strong className="text-carbon">Székhely:</strong> 1135 Budapest, Reitter Ferenc utca 35-37. 5/1.</li>
              <li><strong className="text-carbon">Adószám:</strong> 91306353-1-41</li>
              <li><strong className="text-carbon">Nyilvántartási szám:</strong> 60843867</li>
              <li><strong className="text-carbon">Email:</strong>{' '}
                <a href="mailto:hello@nolaandco.hu" className="text-[#C4A591] underline underline-offset-2 hover:text-[#4A4A4A] transition-colors">
                  hello@nolaandco.hu
                </a>
              </li>
              <li><strong className="text-carbon">Telefon:</strong> +36 30 868 5348</li>
              <li><strong className="text-carbon">Tárhelyszolgáltató:</strong> Hostinger</li>
            </ul>
          </RevealOnScroll>

          {/* II. */}
          <RevealOnScroll>
            <h2 className="text-lg text-carbon font-medium mb-3">II. A megrendelhető termékek és árak</h2>
            <p>
              A Webáruházban a Nola & Co. márkanév alatt futó, egyedi kézműves textiltermékek
              (születési emlékpárnák) és egyedi papírposzterek, illetve digitális poszterek és
              ajándékkártya vásárolhatók meg.
            </p>
            <p className="mt-3">
              A termékek egyedi gyártásúak, a Vásárló által megadott paraméterek (név, születési
              hossz és súly, dátum) alapján készülnek.
            </p>
            <p className="mt-3">
              Webáruházunk alanyi adómentes, így áraink az ÁFÁ-t nem tartalmazzák, és külön ÁFA
              nem kerül felszámításra. A szállítási költség külön tételként jelenik meg.
            </p>
          </RevealOnScroll>

          {/* III. */}
          <RevealOnScroll>
            <h2 className="text-lg text-carbon font-medium mb-3">III. A rendelés menete</h2>
            <p>
              A Vásárló kiválasztja a terméket (párna vagy poszter), majd a pozíciót (Origin és Nova)
              és stílust (Core, Linea, Atelier), a poszter esetében a háttér színét is, illetve azt,
              hogy papír alapon vagy digitális formában szeretné-e, ezt követően pedig megadja a kért
              adatokat és kosárba helyezi a termék(ek)et.
            </p>
            <div className="bg-surface-container-lowest rounded-xl p-5 ghost-border mt-4">
              <p className="text-sm">
                <strong className="text-carbon">KÖTELEZŐ:</strong> A Vásárló köteles a megjegyzésben
                vagy a megfelelő mezőkben pontosan megadni a baba születési adatait. A hibásan megadott
                adatokból eredő károkért (pl. rossz név a párnán, poszteren) a Szolgáltató nem vállal
                felelősséget.
              </p>
            </div>
            <p className="mt-4">
              A rendelés elküldése fizetési kötelezettséggel járó megrendelésnek minősül.
            </p>
          </RevealOnScroll>

          {/* IV. */}
          <RevealOnScroll>
            <h2 className="text-lg text-carbon font-medium mb-3">IV. Fizetés és Szállítás</h2>
            <p>
              <strong className="text-carbon">Fizetési módok:</strong> Bankkártyás fizetés (Stripe), banki átutalás.
            </p>
            <p className="mt-3">
              <strong className="text-carbon">Egyedi gyártás szabálya:</strong> Mivel a termék egyedi igények
              alapján készül, a gyártást a Szolgáltató csak a vételár beérkezése után kezdi meg.
              Utánvétes fizetésre nincs lehetőség.
            </p>
            <p className="mt-3">
              <strong className="text-carbon">Szállítás:</strong> Foxpost, Packeta. A szállítási határidő a
              gyártási időtől függ (általában 5-8 munkanap + szállítás). A digitális termékeket elektronikus
              formában kézbesítjük, szállítási díj nélkül.
            </p>
          </RevealOnScroll>

          {/* V. */}
          <RevealOnScroll>
            <h2 className="text-lg text-carbon font-medium mb-3">V. Elállási jog</h2>
            <p>
              A fogyasztót a 45/2014. (II. 26.) Korm. rendelet alapján főszabály szerint 14 napos
              elállási jog illetné meg.
            </p>
            <div className="bg-surface-container-lowest rounded-xl p-5 ghost-border mt-4">
              <p className="text-sm">
                <strong className="text-carbon">KIVÉTEL:</strong> A rendelet 29. § (1) bekezdés c) pontja
                alapján a fogyasztó NEM gyakorolhatja elállási jogát olyan nem előre gyártott termék esetében,
                amelyet a fogyasztó utasítása alapján vagy kifejezett kérésére állítottak elő, vagy amelyet
                egyértelműen a fogyasztó személyére szabtak (pl. a baba nevével, méretével ellátott párna, poszter).
              </p>
            </div>
            <p className="mt-4">
              Amennyiben a gyártás még nem kezdődött meg, a Szolgáltató méltányosságból elfogadhatja a
              lemondást, de erre nem köteles.
            </p>
          </RevealOnScroll>

          {/* VI. */}
          <RevealOnScroll>
            <h2 className="text-lg text-carbon font-medium mb-3">VI. Szavatosság (Garancia)</h2>
            <p>
              A Szolgáltatót hibás teljesítés esetén kellékszavatosság terheli (pl. ha a párna varrása
              vagy a poszter szakadt, minőségileg nem tartja a vállaltakat, vagy nem a vásárló által kért
              grafikával, az általa megadott adatokkal érkezett).
            </p>
            <p className="mt-3">
              Nem minősül hibának a kézi készítésből eredő apró eltérés, vagy a monitoron látott színek
              árnyalatnyi különbsége a valósághoz képest.
            </p>
          </RevealOnScroll>

          {/* VII. */}
          <RevealOnScroll>
            <h2 className="text-lg text-carbon font-medium mb-3">VII. Panaszkezelés</h2>
            <p>
              Panaszával a Vásárló a{' '}
              <a href="mailto:rendeles@nolaandco.hu" className="text-[#C4A591] underline underline-offset-2 hover:text-[#4A4A4A] transition-colors">
                rendeles@nolaandco.hu
              </a>{' '}
              címen fordulhat a Szolgáltatóhoz.
            </p>
            <p className="mt-3 text-sm">
              Online vitarendezési platform:{' '}
              <span className="text-[#C4A591]">https://ec.europa.eu/consumers/odr/</span>
            </p>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
