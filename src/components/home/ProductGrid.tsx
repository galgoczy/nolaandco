import { prisma } from '@/lib/prisma';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import ProductCard from './ProductCard';

export default async function ProductGrid() {
  const products = await prisma.product.findMany({ where: { active: true } });

  return (
    <section className="py-24 bg-surface" id="collection">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-20">
          <RevealOnScroll>
            <h2 className="text-5xl md:text-7xl montserrat-light-caps text-carbon mb-4 leading-tight tracking-[0.15em]">
              THE SHAPE OF YOUR MEMORIES
            </h2>
          </RevealOnScroll>
          <RevealOnScroll>
            <h3 className="text-lg md:text-xl font-headline italic text-carbon-light mb-6">
              Emlékeid formába öntve
            </h3>
          </RevealOnScroll>
          <RevealOnScroll>
            <div className="w-12 h-0.5 bg-primary mx-auto" />
          </RevealOnScroll>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 stagger-children">
          {products.map((product, i) => (
            <RevealOnScroll key={product.id} delay={i * 120}>
              <ProductCard product={product} />
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
