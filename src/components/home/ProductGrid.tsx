import ProductCard from './ProductCard';
import { getListingItems, type ListingItem } from '@/lib/productListing';

export default async function ProductGrid() {
  const items = await getListingItems();

  const pillows = items.filter((p) => p.category === 'pillow');
  const others = items.filter((p) => p.category === 'poster' || p.category === 'giftcard');

  const groups: { key: string; label: string; showLabel: boolean; items: ListingItem[] }[] = [
    { key: 'pillows', label: 'PÁRNÁK', showLabel: true, items: pillows },
    { key: 'others', label: '', showLabel: false, items: others },
  ].filter((g) => g.items.length > 0);

  return (
    <section className="pt-4 pb-4 md:pt-8 md:pb-8 bg-surface" id="collection">
      <div className="max-w-7xl mx-auto px-8">
        <div id="products-start" className="scroll-mt-4" />

        {/* Horizontal scrollable rows — mobile: 1 card (85%), desktop: 3 cards.
            The first row (PÁRNÁK) has a label, the second row has no label. */}
        <div className="space-y-10 md:space-y-14">
          {groups.map((group) => (
            <div key={group.key}>
              {group.showLabel && (
                <h4
                  className="text-sm tracking-[0.2em] text-carbon-light mb-4 px-1"
                  style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 400 }}
                >
                  {group.label}
                </h4>
              )}
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
