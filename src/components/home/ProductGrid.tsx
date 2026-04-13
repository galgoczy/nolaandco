import { prisma } from '@/lib/prisma';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import ProductCard from './ProductCard';

export default async function ProductGrid() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  });

  return (
    <section className="pt-12 pb-24 md:py-24 bg-surface" id="collection">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-20">
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
        <div id="products-start" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto stagger-children">
          {products.map((product, i) => (
            <RevealOnScroll key={product.id} delay={i * 80}>
              <ProductCard product={product} />
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
