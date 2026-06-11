import Image from 'next/image';
import Link from 'next/link';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import { formatPrice } from '@/lib/utils';
import { getListingItems } from '@/lib/productListing';

export default async function PostersSection() {
  const posters = await getListingItems({ category: 'poster' });

  if (posters.length === 0) return null;

  return (
    <section className="py-24 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-8 text-center">
        <RevealOnScroll>
          <h3 className="text-xs tracking-[0.3em] uppercase text-secondary mb-2" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}>
            ART PRINTS
          </h3>
        </RevealOnScroll>
        <RevealOnScroll>
          <h2 className="text-3xl md:text-4xl text-carbon mb-12 tracking-[0.15em] uppercase" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 100 }}>
            POSZTEREK
          </h2>
        </RevealOnScroll>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {posters.map((poster, i) => (
            <RevealOnScroll key={poster.id} delay={i * 120}>
              <Link href={`/termekek/${poster.slug}`} className="group block space-y-6">
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-surface-container-low shadow-lg poster-tilt">
                  <Image
                    src={poster.imageUrl}
                    alt={poster.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <div>
                  <p className="ethereal-title text-sm font-bold tracking-[0.2em] group-hover:text-[#4A4A4A] transition-colors">
                    {poster.name.toUpperCase()}
                  </p>
                  <p className="text-sm text-carbon-light mt-1">{formatPrice(poster.price)}-tól</p>
                </div>
              </Link>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
