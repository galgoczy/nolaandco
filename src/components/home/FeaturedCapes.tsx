import Image from 'next/image';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import Button from '@/components/ui/Button';
import { getSiteImages } from '@/lib/siteImages';

/** BLOKK 3: Kiemelt újdonság sáv — a Pixie pillangó függők bemutatása.
 * A fotó adminból cserélhető (Megjelenés). */
export default async function FeaturedCapes() {
  const imgs = await getSiteImages(['home-kiemelt-kalandkopeny']);
  return (
    <section className="py-10 md:py-16 bg-[#f5f0e8]">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <RevealOnScroll>
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* Left: product photo (2/3 width) */}
            <div className="w-full md:w-2/3">
              <div className="relative aspect-square rounded-sm overflow-hidden bg-surface-container-low ghost-border">
                <Image
                  src={imgs['home-kiemelt-kalandkopeny']}
                  alt="Nola Pixie pillangó függők"
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
                Újdonság: Nola Pixie pillangó függők
              </h2>
              <p className="text-[#4A4A4A] text-base md:text-lg leading-relaxed font-body">
                Megérkeztek a Pixie pillangó függők a webshopba. Ezek a könnyed,
                kézzel készült textildíszek finoman mozognak a gyerekszobában, és
                kedves részletei lehetnek az olvasósaroknak, kiságynak vagy
                baldachinnak. Minden darab kis szériában készül, ezért a mintákból
                egyszerre csak néhány elérhető. Reméljük, találsz köztük olyat,
                amelyik igazán illik hozzátok.
              </p>
              <Button variant="secondary" href="/termekek?category=decor">
                Megnézem a kollekciót
              </Button>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
