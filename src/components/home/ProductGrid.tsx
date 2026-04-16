import { prisma } from '@/lib/prisma';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import ProductCard from './ProductCard';

type SimpleProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string;
  badge: string | null;
  category: string | null;
  series: string | null;
};

export default async function ProductGrid() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  });

  const simple: SimpleProduct[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    imageUrl: p.imageUrl,
    badge: p.badge,
    category: p.category ?? null,
    series: (p as unknown as { series?: string | null }).series ?? null,
  }));

  const pillows = simple.filter((p) => p.category === 'pillow');
  const others = simple.filter((p) => p.category === 'poster' || p.category === 'giftcard');

  const groups: { key: string; label: string; showLabel: boolean; items: SimpleProduct[] }[] = [
    { key: 'pillows', label: 'PÁRNÁK', showLabel: true, items: pillows },
    { key: 'others', label: '', showLabel: false, items: others },
  ].filter((g) => g.items.length > 0);

  return (
    <section className="pt-12 pb-4 md:pt-24 md:pb-8 bg-surface" id="collection">
      <div className="max-w-7xl mx-auto px-8">
        <div id="products-start" className="text-center mb-16 md:mb-20 scroll-mt-4">
          <RevealOnScroll>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-carbon mb-4 leading-tight tracking-[0.18em] uppercase sm:whitespace-nowrap" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 100 }}>
              THE SHAPE OF<br className="sm:hidden" /> <span className="sm:inline">YOUR MEMORIES</span>
            </h2>
          </RevealOnScroll>
          <RevealOnScroll>
            <h3 className="text-lg md:text-2xl text-carbon-light" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, letterSpacing: '0.08em' }}>
              Emlékeid formába öntve
            </h3>
          </RevealOnScroll>
        </div>

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
                      className="snap-start flex-shrink-0 w-[85%] md:w-[calc((100%-16px)/3)]"
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
