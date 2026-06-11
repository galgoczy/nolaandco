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
    title: 'Egyedi tervezés',
    desc: 'A baba pontos születési méretétől a nagytesó kezdőbetűjéig mindent egyedileg, nektek készítünk',
    // vonalzó
    icon: (
      <svg {...iconProps} className={iconCls}>
        <path d="M3.5 16.5 16.5 3.5l4 4L7.5 20.5l-4-4Z" />
        <path d="m7 13 1.5 1.5M10 10l1.5 1.5M13 7l1.5 1.5" />
      </svg>
    ),
  },
  {
    title: 'Prémium puhaság',
    desc: 'OEKO-TEX® plüss és duplagéz: a legtisztább, bőrbarát érintések a legkisebbeknek',
    // levél a tenyérben
    icon: (
      <svg {...iconProps} className={iconCls}>
        <path d="M12 13c0-3.5 2.5-6 6.5-6 0 4-2.5 6.5-6.5 6Z" />
        <path d="M12 13v3" />
        <path d="M4 17.5c1.5-1.5 3.5-1.5 5 0l1.5 1c1 .7 2.5.7 3.5 0l4-2.5" />
      </svg>
    ),
  },
  {
    title: 'Emléktől a kalandig',
    desc: 'A legelső pillanatok megőrzésétől a varázslatos gyermekkori játékokig végig kísérjük a családot',
    // csillag-ösvény
    icon: (
      <svg {...iconProps} className={iconCls}>
        <path d="M12 3.5l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4L6.2 7.7l4-.6L12 3.5Z" />
        <path d="M5 20.5c4.5 0 9.5 0 14 0" strokeDasharray="2 3" />
      </svg>
    ),
  },
  {
    title: 'Itthon készült, szeretettel',
    desc: 'Minden Nola & Co darabot gondos odafigyeléssel, kézzel varrunk budapesti manufaktúránkban',
    // ház szívvel
    icon: (
      <svg {...iconProps} className={iconCls}>
        <path d="M4 10.5 12 4l8 6.5V20H4v-9.5Z" />
        <path d="M12 16.5s-2.6-1.7-2.6-3.4c0-1 .8-1.7 1.6-1.7.5 0 .8.2 1 .5.2-.3.5-.5 1-.5.8 0 1.6.7 1.6 1.7 0 1.7-2.6 3.4-2.6 3.4Z" />
      </svg>
    ),
  },
];

/** BLOKK 4: Bizalmi ikonok — 4 badge, mobilon 2x2 rácsban. */
export default function TrustBadges() {
  return (
    <section className="py-12 md:py-16 bg-surface">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
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
