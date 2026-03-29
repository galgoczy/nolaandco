import RevealOnScroll from '@/components/ui/RevealOnScroll';

function StarIcons() {
  return (
    <div className="star-twinkle flex gap-1 mb-6 text-brand-blue/60">
      <span className="material-symbols-outlined text-xs fill-current">star</span>
      <span className="material-symbols-outlined text-xs fill-current">star</span>
      <span className="material-symbols-outlined text-xs fill-current">star</span>
      <span className="material-symbols-outlined text-xs fill-current">star</span>
      <span className="material-symbols-outlined text-xs fill-current">star</span>
    </div>
  );
}

const faqItems = [
  {
    question: 'MIKOR KAPOM MEG A RENDELÉSEMET?',
    answer:
      'Mivel minden Nola termék egyedileg, az általad megadott születési adatok alapján készül, a gyártási időnk 5-8 munkanap. Amint a termék elkészült, azonnal átadjuk a futárnak, amiről e-mailben értesítünk.',
  },
  {
    question: 'MILYEN ANYAGBÓL KÉSZÜLNEK A PÁRNÁK?',
    answer:
      'Minden Nola párna OEKO-TEX Standard 100 minősítésű, hipoallergén pamut és len keverékéből készül. A töltet antiallergén szilikonizált polyester, amely megtartja formáját és mosógépben mosható.',
  },
  {
    question: 'LEHET-E MOSNI A TERMÉKET?',
    answer:
      'Igen! A Nola párnák huzata levehető és mosógépben mosható 30°C-on, kímélő programon. A töltet külön is mosható. Szárítógépet nem ajánlunk – természetes szárítás a legjobb megoldás.',
  },
];

export default function FaqSection() {
  return (
    <section className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-16">
          <RevealOnScroll>
            <h2 className="text-4xl md:text-5xl montserrat-light-caps text-carbon mb-6 leading-tight">
              GYAKRAN ISMÉTELT KÉRDÉSEK
            </h2>
          </RevealOnScroll>
          <RevealOnScroll>
            <p className="text-carbon-light max-w-2xl mx-auto font-light leading-relaxed">
              Ha felmerül benned bármilyen kérdés, kérlek olvasd át a gyakran ismételt kérdéseket,
              ahol igyekeztünk minél több kérdést megválaszolni. Ha mégsem találtad meg azt, amit
              kerestél, bátran írj nekünk:{' '}
              <a href="mailto:hello@nolaandco.hu" className="underline">
                hello@nolaandco.hu
              </a>
            </p>
          </RevealOnScroll>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger-children">
          {faqItems.map((item, i) => (
            <RevealOnScroll key={i} delay={i * 120}>
              <div className="faq-hover bg-warm-beige/30 p-10 rounded-2xl">
                <h4 className="text-sm font-bold uppercase tracking-widest mb-4 footer-text">
                  {item.question}
                </h4>
                <StarIcons />
                <p className="text-sm text-carbon-light font-light leading-relaxed mb-6">
                  {item.answer}
                </p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
