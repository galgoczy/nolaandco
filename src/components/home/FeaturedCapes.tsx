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
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
            {/* Left: product photo */}
            <div className="w-full md:w-1/2">
              <div className="relative aspect-[4/5] rounded-sm overflow-hidden bg-surface-container-low ghost-border">
                <Image
                  src="/images/home/kalandkopeny-kiemelt.png"
                  alt="NOLA Kalandköpeny"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 90vw, 45vw"
                />
              </div>
            </div>

            {/* Right: title, description, CTA */}
            <div className="w-full md:w-1/2 flex flex-col items-start gap-5 md:gap-6">
              <h2
                className="text-3xl md:text-4xl lg:text-5xl text-carbon tracking-[0.04em] leading-tight"
                style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}
              >
                Megérkeztek a Kalandköpenyek!
              </h2>
              <p className="text-[#4A4A4A] text-base md:text-lg leading-relaxed font-body">
                Kétoldalas, prémium duplagéz köpenyek, hogy a nagyok is hősnek
                érezhessék magukat. Most bevezető áron!
              </p>
              <Button variant="secondary" href="/termekek?category=cape">
                Megnézem a köpenyeket
              </Button>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
