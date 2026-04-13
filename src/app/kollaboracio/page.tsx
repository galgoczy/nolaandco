import RevealOnScroll from '@/components/ui/RevealOnScroll';

export const metadata = {
  title: 'Kollaboráció – Nola & Co.',
  description: 'Közös történetek – együttműködési lehetőségek a Nola & Co.-val.',
};

export default function KollaboracioPage() {
  return (
    <section className="min-h-[80vh] bg-warm-beige flex items-center justify-center py-24 px-4">
      <div className="max-w-xl w-full text-center">
        <RevealOnScroll>
          <h1 className="montserrat-light-caps text-4xl md:text-5xl text-carbon mb-4">
            Kollaboráció
          </h1>
        </RevealOnScroll>

        <RevealOnScroll delay={50}>
          <h2 className="text-2xl text-carbon font-light mb-8 tracking-wide">
            Közös történetek
          </h2>
        </RevealOnScroll>

        <RevealOnScroll delay={100}>
          <p className="text-carbon-light font-body text-base leading-relaxed mb-6">
            A Nola &amp; Co. világát a ti történeteitek építik. Hiszünk abban, hogy a legszebb
            emlékeket közösen érdemes továbbadni.
          </p>
        </RevealOnScroll>

        <RevealOnScroll delay={150}>
          <p className="text-carbon-light font-body text-base leading-relaxed mb-8">
            Ha szereted a minimalista designt, otthonodban fontos a természetes összhang, és
            szívesen osztanád meg a közösségeddel, hogyan válik egy Nola párna vagy poszter az
            otthonotok részévé, örömmel várjuk jelentkezésedet.
          </p>
        </RevealOnScroll>

        <RevealOnScroll delay={200}>
          <p className="text-carbon font-medium mb-8">
            <a href="mailto:kriszti@nolaandco.hu" className="text-[#C4A591] hover:text-[#4A4A4A] transition-colors underline underline-offset-2">
              kriszti@nolaandco.hu
            </a>
          </p>
        </RevealOnScroll>

        <RevealOnScroll delay={300}>
          <p className="text-carbon-light font-body italic">
            Írjuk együtt a történeteket!
          </p>
        </RevealOnScroll>
      </div>
    </section>
  );
}
