export const dynamic = 'force-dynamic';

import RevealOnScroll from '@/components/ui/RevealOnScroll';
import ProductCard from '@/components/home/ProductCard';
import { getListingItems } from '@/lib/productListing';

interface Props {
  searchParams: Promise<{ category?: string }>;
}

export default async function TermekekPage({ searchParams }: Props) {
  const { category } = await searchParams;

  const products = await getListingItems(category ? { category } : undefined);

  return (
    <section className="pt-6 md:pt-10 pb-20 bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        {category === 'cape' && (
          <RevealOnScroll>
            <header className="mb-8 md:mb-12">
              <h1
                className="text-3xl md:text-5xl text-carbon text-center tracking-[0.08em] mb-8 md:mb-10"
                style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}
              >
                Kétoldalas Duplagéz Kalandköpenyek
              </h1>
              <div className="bg-[#f5f0e8] rounded-2xl px-6 py-8 md:px-12 md:py-10 text-center">
                <h2
                  className="text-2xl md:text-3xl text-carbon tracking-[0.04em] mb-3"
                  style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}
                >
                  Megérkeztek a Kalandköpenyek!
                </h2>
                <p className="text-[#4A4A4A] text-base md:text-lg leading-relaxed font-body max-w-2xl mx-auto">
                  Kifordítható, prémium duplagéz köpenyek, hogy a nagyok is
                  hősnek érezhessék magukat. Most bevezető áron!
                </p>
              </div>
            </header>
          </RevealOnScroll>
        )}
        {products.length === 0 ? (
          <RevealOnScroll>
            <p className="text-center text-carbon-light text-lg">
              Ebben a kategóriában még nincsenek termékek.
            </p>
          </RevealOnScroll>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-1 md:gap-2">
            {products.map((product, i) => (
              <RevealOnScroll key={product.id} delay={i * 80}>
                <ProductCard product={product} />
              </RevealOnScroll>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
