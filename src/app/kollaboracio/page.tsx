import RevealOnScroll from '@/components/ui/RevealOnScroll';

export const metadata = {
  title: 'Kollaboráció – Nola & Co.',
  description: 'Dolgozzunk együtt! Együttműködési lehetőségek a Nola & Co.-val.',
};

export default function KollaboracioPage() {
  return (
    <section className="min-h-[80vh] bg-warm-beige flex items-center justify-center py-24 px-4">
      <div className="max-w-xl w-full text-center">
        <RevealOnScroll>
          <h1 className="montserrat-light-caps text-4xl md:text-5xl text-carbon mb-4">
            Dolgozzunk együtt!
          </h1>
          <div className="w-12 h-[2px] bg-primary mx-auto mb-8" />
        </RevealOnScroll>

        <RevealOnScroll delay={100}>
          <p className="text-carbon-light font-body text-lg leading-relaxed mb-8">
            Hiszünk abban, hogy a történetek akkor a legszebbek, ha megosztjuk őket.
            Ha te is édesanya vagy, gyerekszoba-dekorációval foglalkozol, esetleg csak
            egyszerűen beleszerettél a párnáinkba és szeretnél együttműködni velünk,
            keress minket bátran!
          </p>
        </RevealOnScroll>

        <RevealOnScroll delay={200}>
          <div className="bg-surface-container-lowest rounded-xl p-6 ghost-border inline-block">
            <p className="text-carbon font-medium">
              <a href="mailto:kriszti@nolaandco.hu" className="text-[#C4A591] hover:text-[#4A4A4A] transition-colors underline underline-offset-2">
                kriszti@nolaandco.hu
              </a>
            </p>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={300}>
          <p className="text-carbon-light font-body italic mt-8">
            Várjuk a közös történeteket!
          </p>
        </RevealOnScroll>
      </div>
    </section>
  );
}
