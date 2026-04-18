import Image from 'next/image';
import RevealOnScroll from '@/components/ui/RevealOnScroll';

const testimonials = [
  {
    image: '/testimonials/testimonial-1.jpg',
    quote:
      '„Gyönyörű lett a párna, pont olyan, mint a kislányunk a karjainkban. Minden ismerősünk azt kérdezi, honnan van."',
    author: 'Eszter és Márk',
  },
  {
    image: '/testimonials/testimonial-2.jpg',
    quote:
      '„A poszter a hálószobánk ékköve lett. Olyan emlék, ami minden reggel eszünkbe juttatja az első napokat."',
    author: 'Kata és Dávid',
  },
  {
    image: '/testimonials/testimonial-3.jpg',
    quote:
      '„Hihetetlenül puha, gyerekbarát anyag, a minta precíz. A csomagolás is annyira igényes, hogy szinte kár kibontani."',
    author: 'Nóra és Bálint',
  },
  {
    image: '/testimonials/testimonial-4.jpg',
    quote:
      '„Ajándékba vittük egy babalátogatóra — a szülők szeme könnybe lábadt. Tényleg egyedi, megismételhetetlen emlék."',
    author: 'Zsófi',
  },
  {
    image: '/testimonials/testimonial-5.jpg',
    quote:
      '„A gyártás gyors volt, a kommunikáció kedves és figyelmes. Bátran ajánlom minden kismamának."',
    author: 'Anna és Péter',
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-16 md:py-24 bg-surface-container-low">
      <div className="max-w-7xl mx-auto">
        <RevealOnScroll>
          <div className="overflow-x-auto snap-x snap-mandatory scroll-smooth hide-scrollbar">
            <div className="flex gap-4 md:gap-6 px-8 pb-4">
              {testimonials.map((t, i) => (
                <figure
                  key={i}
                  className="snap-start flex-shrink-0 w-[78%] md:w-[30%] flex flex-col"
                >
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-surface-container mb-4 shadow-sm">
                    <Image
                      src={t.image}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 78vw, 30vw"
                    />
                  </div>
                  <blockquote className="text-sm text-carbon-light leading-relaxed font-body italic">
                    {t.quote}
                  </blockquote>
                  <figcaption className="text-xs text-carbon-light/70 mt-2 tracking-wide">
                    — {t.author}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
