export const dynamic = 'force-dynamic';

import RevealOnScroll from '@/components/ui/RevealOnScroll';
import ProductCard from '@/components/home/ProductCard';
import PillowSteps from '@/components/home/PillowSteps';
import SubcategoryTiles from '@/components/products/SubcategoryTiles';
import { getListingItems } from '@/lib/productListing';

/** Gyűjtő kategóriák: itt az alkategória-kártyák is megjelennek a rács fölött. */
const UMBRELLA_CATEGORIES = new Set(['kicsiknek', 'nagyoknak']);

interface Props {
  searchParams: Promise<{ category?: string }>;
}

export default async function TermekekPage({ searchParams }: Props) {
  const { category } = await searchParams;

  const products = await getListingItems(category ? { category } : undefined);

  return (
    <section className="pt-6 md:pt-10 pb-20 bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        {category && UMBRELLA_CATEGORIES.has(category) && (
          <SubcategoryTiles parent={category} />
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

      {/* Emlékpárnák kategóriaoldal: a rács után a "Így készül el..." blokk. */}
      {category === 'pillow' && <PillowSteps />}
    </section>
  );
}
