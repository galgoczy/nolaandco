import RevealOnScroll from '@/components/ui/RevealOnScroll';

export const metadata = {
  title: 'Kapcsolat – Nola & Co.',
  description: 'Lépj velünk kapcsolatba! Kérdésed van? Írj nekünk bátran.',
};

export default function KapcsolatPage() {
  return (
    <section className="min-h-[80vh] bg-warm-beige flex items-center justify-center py-24 px-4">
      <div className="max-w-xl w-full text-center">
        <RevealOnScroll>
          <h1 className="montserrat-light-caps text-4xl md:text-5xl text-carbon mb-4">
            Lépj velünk kapcsolatba!
          </h1>
          <div className="w-12 h-[2px] bg-primary mx-auto mb-8" />
        </RevealOnScroll>

        <RevealOnScroll delay={100}>
          <p className="text-carbon-light font-body text-lg leading-relaxed mb-10">
            Ha kérdésed van a rendeléseddel kapcsolatban, vagy csak tanácsot kérnél,
            írj nekünk bátran!
          </p>
        </RevealOnScroll>

        <RevealOnScroll delay={200}>
          <div className="bg-surface-container-lowest rounded-xl p-8 ghost-border space-y-4">
            <div>
              <p className="text-sm text-carbon-light uppercase tracking-wider mb-1">Email</p>
              <a href="mailto:rendeles@nolaandco.hu" className="text-[#C4A591] hover:text-[#4A4A4A] transition-colors underline underline-offset-2 font-medium">
                rendeles@nolaandco.hu
              </a>
            </div>
            <div>
              <p className="text-sm text-carbon-light uppercase tracking-wider mb-1">Facebook</p>
              <a
                href="https://facebook.com/nolaandco"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#C4A591] hover:text-[#4A4A4A] transition-colors underline underline-offset-2 font-medium"
              >
                facebook.com/nolaandco
              </a>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
