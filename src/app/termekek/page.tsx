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
        {products.length === 0 ? (
          <RevealOnScroll>
            <p className="text-center text-carbon-light text-lg">
              Ebben a kategóriában még nincsenek termékek.
            </p>
          </RevealOnScroll>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
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
