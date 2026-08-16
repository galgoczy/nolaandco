import Image from 'next/image';
import { getSiteImages } from '@/lib/siteImages';
import { renderInline } from '@/lib/richTextInline';
import Link from 'next/link';
import RevealOnScroll from '@/components/ui/RevealOnScroll';

/** BLOKK 6: Rólunk szekció bevezetője — 50-50% kép + szöveg. */
export default async function AboutIntro({ t }: { t: Record<string, string> }) {
  const imgs = await getSiteImages(['home-rolunk-intro']);
  return (
    <section className="py-12 md:py-[72px] bg-surface">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
          {/* Left: portrait photo */}
          <RevealOnScroll className="w-full md:w-1/2">
            <div className="relative aspect-[3/4] max-w-md mx-auto rounded-2xl overflow-hidden bg-surface-container">
              <Image
                src={imgs['home-rolunk-intro']}
                alt="Tőlünk, Nektek – Nola & Co."
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 45vw"
              />
            </div>
          </RevealOnScroll>

          {/* Right: title, text, CTA */}
          <div className="w-full md:w-1/2 flex flex-col items-start gap-5 md:gap-6">
            <RevealOnScroll>
              <h2
                className="text-3xl md:text-4xl lg:text-5xl text-carbon tracking-[0.04em] leading-tight"
                style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}
              >
                {t['rolunk-cim']}
              </h2>
            </RevealOnScroll>
            <RevealOnScroll>
              <p className="text-[#4A4A4A] text-base md:text-lg leading-relaxed font-body">
                {renderInline(t['rolunk-szoveg'])}
              </p>
            </RevealOnScroll>
            <RevealOnScroll>
              <Link
                href="/rolunk"
                className="inline-block bg-cta hover:bg-cta-hover text-white px-8 py-3.5 rounded-full text-sm font-medium btn-anim uppercase tracking-[0.1em] shadow-md"
              >
                {t['rolunk-gomb']}
              </Link>
            </RevealOnScroll>
          </div>
        </div>
      </div>
    </section>
  );
}
