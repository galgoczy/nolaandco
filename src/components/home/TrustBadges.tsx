import RevealOnScroll from '@/components/ui/RevealOnScroll';

const iconCls = 'w-10 h-10 md:w-12 md:h-12 text-[#C4A591]';
const iconProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  fill: 'none',
  viewBox: '0 0 24 24',
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const badges = [
  {
    title: 'Kézműves gondoskodás',
    desc: 'Minden darabot egyedileg, szeretettel varrunk budapesti műhelyünkben.',
    // varrótű + cérna
    icon: (
      <svg {...iconProps} className={iconCls}>
        <path d="M19.5 4.5c1 1 1 2.5 0 3.5L8 19.5l-4 .5.5-4L16 4.5c1-1 2.5-1 3.5 0Z" />
        <path d="M17.8 9.2 14.8 6.2" />
        <path d="M4.5 16c2 .5 3.5 2 4 4" strokeDasharray="1.5 2" />
      </svg>
    ),
  },
  {
    title: 'Prémium puhaság',
    desc: 'OEKO-TEX® plüss és 100% pamut duplagéz: a legtisztább érintés a legkisebbeknek.',
    // levél / növény
    icon: (
      <svg {...iconProps} className={iconCls}>
        <path d="M12 20c0-6 2.5-11 8-13 0 7-3 11.5-8 13Z" />
        <path d="M12 20c-.5-4-2.5-7-6.5-8 .5 4.5 3 7.5 6.5 8Z" />
        <path d="M12 20v1.5" />
      </svg>
    ),
  },
  {
    title: 'Személyre szabott csodák',
    desc: 'A baba pontos születési méretétől a nagytesó kezdőbetűjéig mindent nektek készítünk.',
    // csillag / szikra
    icon: (
      <svg {...iconProps} className={iconCls}>
        <path d="M12 3c.6 3.8 2.8 6 6.5 6.5C14.8 10.1 12.6 12.3 12 16c-.6-3.7-2.8-5.9-6.5-6.5C9.2 9 11.4 6.8 12 3Z" />
        <path d="M18.5 15.5c.3 1.6 1.2 2.5 2.5 2.8-1.3.3-2.2 1.2-2.5 2.7-.3-1.5-1.2-2.4-2.5-2.7 1.3-.3 2.2-1.2 2.5-2.8Z" />
      </svg>
    ),
  },
  {
    title: 'Emlékből kaland',
    desc: 'A legelső pillanatoktól a gyermekkori varázslatos játékokig végigkísérjük a családot.',
    // papírrepülő
    icon: (
      <svg {...iconProps} className={iconCls}>
        <path d="M21 4 3.5 11l5.5 2.5L11.5 19 15 14M21 4l-12 9.5M21 4l-6 10" />
        <path d="M4 19.5c2 0 3.5-.8 4.5-2" strokeDasharray="1.5 2" />
      </svg>
    ),
  },
];

/** BLOKK 5: Bizalmi ikon-sáv — teljes szélességű, halvány zsályazöld háttérrel. */
export default function TrustBadges() {
  return (
    <section className="py-14 md:py-20 bg-[#eef1e8]">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <RevealOnScroll>
          <h2
            className="text-2xl md:text-3xl lg:text-4xl text-carbon text-center mb-10 md:mb-14 tracking-[0.04em] leading-snug"
            style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}
          >
            Több, mint egy tárgy.
            <br className="hidden md:block" />{' '}
            Egy darabka a családotok történetéből.
          </h2>
        </RevealOnScroll>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10 md:gap-8">
          {badges.map((b, i) => (
            <RevealOnScroll key={b.title} delay={i * 100}>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4">{b.icon}</div>
                <h3
                  className="text-sm md:text-base text-carbon mb-2 tracking-[0.12em] uppercase"
                  style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 400 }}
                >
                  {b.title}
                </h3>
                <p className="text-xs md:text-sm text-[#4A4A4A] font-body" style={{ lineHeight: 1.7 }}>
                  {b.desc}
                </p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
