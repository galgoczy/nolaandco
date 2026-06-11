import RevealOnScroll from '@/components/ui/RevealOnScroll';

export const metadata = {
  title: 'Elállás és visszaküldés – Nola & Co.',
  description: 'Tudnivalók az egyedi rendelésekről és az elállási jogról.',
};

export default function VisszakuldesPage() {
  return (
    <section className="min-h-[80vh] bg-warm-beige flex items-center justify-center py-24 px-4">
      <div className="max-w-2xl w-full">
        <RevealOnScroll>
          <h1 className="montserrat-light-caps text-4xl md:text-5xl text-carbon mb-4 text-center">
            Elállás és visszaküldés
          </h1>
          <div className="w-12 h-[2px] bg-primary mx-auto mb-6" />
          <p className="text-center text-lg text-carbon font-body font-medium mb-12">
            Tudnivalók az egyedi rendelésekről
          </p>
        </RevealOnScroll>

        <div className="space-y-6 text-carbon-light font-body text-base leading-relaxed">
          <RevealOnScroll>
            <p>
              Mivel a Nola & Co termékek 1:1 méretarányban, a vásárló által megadott születési
              adatok alapján, névre szólóan készülnek, ezek egyedi gyártású termékek. A törvényi
              előírások alapján az egyértelműen a fogyasztó személyére szabott termékekre az
              elállási jog nem vonatkozik.
            </p>
          </RevealOnScroll>

          <RevealOnScroll>
            <div className="bg-surface-container-lowest rounded-xl p-6 ghost-border">
              <p>
                Természetesen, ha a gyártás során hiba történt, keress minket azonnal a{' '}
                <a href="mailto:rendeles@nolaandco.hu" className="text-[#C4A591] underline underline-offset-2 hover:text-[#4A4A4A] transition-colors font-medium">
                  rendeles@nolaandco.hu
                </a>{' '}
                email címen, és mindent megteszünk, hogy minél hamarabb megoldást találjunk!
              </p>
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
