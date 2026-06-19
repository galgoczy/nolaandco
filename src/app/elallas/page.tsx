import RevealOnScroll from '@/components/ui/RevealOnScroll';
import ElallasClient from './ElallasClient';

export const metadata = {
  title: 'Elállás a szerződéstől – Nola & Co.',
  description: 'Indítsd el online a 14 napos elállási jogod gyakorlását a nem személyre szabott termékekre.',
};

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{ rendeles?: string }>;
}

export default async function ElallasPage({ searchParams }: Props) {
  const { rendeles } = await searchParams;

  return (
    <section className="min-h-[80vh] bg-warm-beige py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <RevealOnScroll>
          <h1 className="montserrat-light-caps text-3xl md:text-4xl text-carbon mb-4 text-center">
            Elállás a szerződéstől
          </h1>
          <div className="w-12 h-[2px] bg-primary mx-auto mb-6" />
          <p className="text-center text-carbon-light font-body mb-10 leading-relaxed">
            A nem személyre szabott termékek (jelenleg a NOLA Crew Kalandköpeny és a koronák)
            esetében a kézhezvételtől számított 14 napon belül, indokolás nélkül elállhatsz a
            szerződéstől. Bejelentkezett vásárlóként a folyamatot a{' '}
            <a href="/fiok#rendelesek" className="text-[#C4A591] underline underline-offset-2 hover:text-[#4A4A4A] transition-colors">
              Fiókom
            </a>{' '}
            oldalon, a rendelésnél is elindíthatod.
          </p>
        </RevealOnScroll>
        <RevealOnScroll>
          <ElallasClient initialOrderNumber={rendeles} />
        </RevealOnScroll>
      </div>
    </section>
  );
}
