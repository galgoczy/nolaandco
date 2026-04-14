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

const groupTitle = (group: { key: string; label: string }) => group.label;

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

  const originPillows = simple.filter((p) => p.category === 'pillow' && p.series === 'origin');
  const novaPillows = simple.filter((p) => p.category === 'pillow' && p.series === 'nova');
  const posters = simple.filter((p) => p.category === 'poster');
  const giftCards = simple.filter((p) => p.category === 'giftcard');

  const groups = [
    { key: 'origin', label: 'ORIGIN párnák', items: originPillows },
    { key: 'nova', label: 'NOVA párnák', items: novaPillows },
    { key: 'posters', label: 'Poszterek', items: posters },
    { key: 'giftcards', label: 'Ajándékkártyák', items: giftCards },
  ].filter((g) => g.items.length > 0);

  return (
    <section className="pt-12 pb-24 md:py-24 bg-surface" id="collection">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-16 md:mb-20">
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

        {/* Mobile: horizontal scrollable groups */}
        <div id="products-start" className="md:hidden space-y-12">
          {groups.map((group) => (
            <div key={group.key}>
              <h4 className="text-sm tracking-[0.2em] text-carbon-light mb-4 px-1" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 400 }}>
                {groupTitle(group).toUpperCase()}
              </h4>
              <div className="-mx-8">
                <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-3 px-8 scroll-smooth hide-scrollbar">
                  {group.items.map((product) => (
                    <div
                      key={product.id}
                      className="snap-start flex-shrink-0 w-[85%]"
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: grid (unchanged) */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto stagger-children">
          {simple.map((product, i) => (
            <RevealOnScroll key={product.id} delay={i * 80}>
              <ProductCard product={product} />
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
