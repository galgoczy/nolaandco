import RevealOnScroll from '@/components/ui/RevealOnScroll';

export const metadata = {
  title: 'Szállítás és fizetés – Nola & Co.',
  description: 'Szállítási módok, díjak és fizetési lehetőségek a Nola & Co. webshopban.',
};

export default function SzallitasPage() {
  return (
    <section className="min-h-screen bg-warm-beige py-24 px-4">
      <div className="max-w-2xl mx-auto">
        <RevealOnScroll>
          <h1 className="montserrat-light-caps text-4xl md:text-5xl text-carbon mb-4 text-center">
            Szállítás & Fizetés
          </h1>
          <div className="w-12 h-[2px] bg-primary mx-auto mb-6" />
          <p className="text-center text-lg text-carbon-light font-body leading-relaxed mb-12">
            Biztonságos vásárlás & gyors szállítás
          </p>
        </RevealOnScroll>

        <div className="space-y-8 text-carbon-light font-body text-base leading-relaxed">
          <RevealOnScroll>
            <p>
              Termékeinket a legnagyobb odafigyeléssel, környezetbarát csomagolásba csomagoljuk,
              hogy sérülésmentesen érkezzenek meg hozzád.
            </p>
          </RevealOnScroll>

          <RevealOnScroll>
            <div className="bg-surface-container-lowest rounded-xl p-6 ghost-border space-y-4">
              <div>
                <h3 className="text-carbon font-medium mb-1">Szállítási módok</h3>
                <p>Foxpost, Packeta – válaszd a számodra legkényelmesebbet!</p>
              </div>

              <div>
                <h3 className="text-carbon font-medium mb-1">Szállítási díj <span className="text-sm font-normal">(Magyarország területén)</span></h3>
                <ul className="list-disc list-inside space-y-1 ml-1">
                  <li>Csomagautomatába: <strong className="text-carbon">1 190 Ft</strong></li>
                  <li>Házhozszállítás: <strong className="text-carbon">2 490 Ft</strong></li>
                </ul>
              </div>

              <div>
                <h3 className="text-carbon font-medium mb-1">Fizetés</h3>
                <p>Biztonságos kártyás fizetés (Stripe), banki utalás.</p>
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll>
            <p className="text-sm italic">
              Utánvétes fizetésre egyedi, névre szóló termékeink miatt nincs lehetőség.
            </p>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
