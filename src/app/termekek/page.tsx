export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import ProductCard from '@/components/home/ProductCard';
import CategoryFilters from '@/components/products/CategoryFilters';
import { getListingItems } from '@/lib/productListing';

interface Props {
  searchParams: Promise<{ category?: string }>;
}

function CategoryHeader({ en, hu }: { en: string; hu: string }) {
  return (
    <RevealOnScroll>
      <div className="text-center mb-10 mt-2">
        <h3 className="text-sm md:text-base tracking-[0.3em] uppercase text-secondary mb-1" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}>
          {en}
        </h3>
        <h4 className="text-lg md:text-xl tracking-[0.15em] uppercase text-carbon-light" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 200 }}>
          {hu}
        </h4>
      </div>
    </RevealOnScroll>
  );
}

export default async function TermekekPage({ searchParams }: Props) {
  const { category } = await searchParams;

  // Read categories from DB (sorted by admin-defined order)
  const allCategories = await prisma.category.findMany({ orderBy: { sortOrder: 'asc' } });

  const products = await getListingItems(category ? { category } : undefined);

  const showAll = !category;
  const selectedCat = category
    ? allCategories.find((c) => c.slug === category)
    : null;

  return (
    <section className="pt-6 md:pt-8 pb-20 bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-8">
        <div className="mb-10">
          <RevealOnScroll>
            <CategoryFilters categories={allCategories} active={category ?? null} />
          </RevealOnScroll>
        </div>

        {products.length === 0 ? (
          <RevealOnScroll>
            <p className="text-center text-carbon-light text-lg">
              Ebben a kategóriában még nincsenek termékek.
            </p>
          </RevealOnScroll>
        ) : showAll ? (
          <>
            {allCategories.map((cat) => {
              const catProducts = products.filter((p) => p.category === cat.slug);
              if (catProducts.length === 0) return null;
              return (
                <div key={cat.slug} className="mb-20 last:mb-0">
                  <CategoryHeader
                    en={cat.nameEn ?? cat.slug.toUpperCase()}
                    hu={cat.name}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto stagger-children">
                    {catProducts.map((product, i) => (
                      <RevealOnScroll key={product.id} delay={i * 120}>
                        <ProductCard product={product} />
                      </RevealOnScroll>
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          <>
            {selectedCat && (
              <CategoryHeader
                en={selectedCat.nameEn ?? selectedCat.slug.toUpperCase()}
                hu={selectedCat.name}
              />
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto stagger-children">
              {products.map((product, i) => (
                <RevealOnScroll key={product.id} delay={i * 120}>
                  <ProductCard product={product} />
                </RevealOnScroll>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
