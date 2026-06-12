import Image from 'next/image';
import Link from 'next/link';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import Button from '@/components/ui/Button';

/** BLOKK 3: Kiemelt újdonság sáv — a Kalandköpeny kollekció bemutatása. */
export default function FeaturedCapes() {
  return (
    <section className="py-12 md:py-20 bg-[#f5f0e8]">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <RevealOnScroll>
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* Left: product photo (2/3 width) */}
            <div className="w-full md:w-2/3">
              <div className="relative aspect-square rounded-sm overflow-hidden bg-surface-container-low ghost-border">
                <Image
                  src="/images/home/kalandkopeny-kiemelt.jpg"
                  alt="NOLA Kalandköpenyek"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 90vw, 60vw"
                />
              </div>
            </div>

            {/* Right: title, description, CTA (1/3 width) */}
            <div className="w-full md:w-1/3 flex flex-col items-start gap-5 md:gap-6">
              <h2
                className="text-3xl md:text-4xl text-carbon tracking-[0.04em] leading-tight"
                style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}
              >
                ÚJDONSÁG: NOLA Kalandköpenyek
              </h2>
              <p className="text-[#4A4A4A] text-base md:text-lg leading-relaxed font-body">
                Egy köpeny, két stílus. Pihe-puha, kétoldalas duplagéz köpenyeink
                elhozzák a varázslatot a mindennapokba. Add meg a lehetőséget,
                hogy a Te gyermeked legyen a történet hőse! Fedezd fel az új
                kollekciót exkluzív bevezető áron.
              </p>
              <Button variant="secondary" href="/termekek?category=cape">
                Irány az Előrendelés
              </Button>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
