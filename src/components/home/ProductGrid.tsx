import ProductCard from './ProductCard';
import { getListingItems, type ListingItem } from '@/lib/productListing';

export default async function ProductGrid() {
  const items = await getListingItems();

  const pillows = items.filter((p) => p.category === 'pillow');
  const others = items.filter((p) => p.category === 'poster' || p.category === 'giftcard');

  const groups: { key: string; items: ListingItem[] }[] = [
    { key: 'pillows', items: pillows },
    { key: 'others', items: others },
  ].filter((g) => g.items.length > 0);

  return (
    <section className="pt-0 pb-4 md:pb-8 bg-surface" id="collection">
      <div className="max-w-7xl mx-auto px-8">
        <div id="products-start" className="scroll-mt-4" />

        {/* Horizontal scrollable rows — mobile: 1 card (85%), desktop: 3 cards. */}
        <div className="space-y-8 md:space-y-12">
          {groups.map((group) => (
            <div key={group.key} className="relative">
              <div className="-mx-8 md:mx-0">
                <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-3 px-8 md:px-0 scroll-smooth hide-scrollbar">
                  {group.items.map((product) => (
                    <div
                      key={product.id}
                      className="snap-start flex-shrink-0 w-[85%] md:w-[30%]"
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </div>
              {/* Small arrow hint: indicates the row is horizontally scrollable */}
              <div className="pointer-events-none absolute top-1/2 -translate-y-1/2 right-1 md:-right-2 text-carbon-light/40">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
