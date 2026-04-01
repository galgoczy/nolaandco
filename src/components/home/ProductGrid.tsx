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
            <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl text-carbon mb-4 leading-tight tracking-[0.2em] uppercase" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 100 }}>
              THE SHAPE OF YOUR MEMORIES
            </h2>
          </RevealOnScroll>
          <RevealOnScroll>
            <h3 className="text-base md:text-lg text-carbon-light mb-6" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, letterSpacing: '0.08em' }}>
              Emlékeid formába öntve
            </h3>
          </RevealOnScroll>
          <RevealOnScroll>
            <div className="w-12 h-0.5 bg-primary mx-auto" />
          </RevealOnScroll>
        </div>
        {/* Párnák */}
        <RevealOnScroll>
          <h3 className="text-xs tracking-[0.3em] uppercase text-secondary mb-2 text-center" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}>
            KEEPSAKES
          </h3>
          <h4 className="text-sm tracking-[0.15em] uppercase text-carbon-light mb-10 text-center" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 200 }}>
            Párnák
          </h4>
        </RevealOnScroll>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 stagger-children mb-20">
          {products.filter(p => p.category === 'pillow').map((product, i) => (
            <RevealOnScroll key={product.id} delay={i * 120}>
              <ProductCard product={product} />
            </RevealOnScroll>
          ))}
        </div>

        {/* Poszterek */}
        <RevealOnScroll>
          <h3 className="text-xs tracking-[0.3em] uppercase text-secondary mb-2 text-center" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}>
            ART PRINTS
          </h3>
          <h4 className="text-sm tracking-[0.15em] uppercase text-carbon-light mb-10 text-center" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 200 }}>
            Poszterek
          </h4>
        </RevealOnScroll>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 stagger-children mb-20">
          {products.filter(p => p.category === 'poster').map((product, i) => (
            <RevealOnScroll key={product.id} delay={i * 120}>
              <ProductCard product={product} />
            </RevealOnScroll>
          ))}
        </div>

        {/* Ajándékkártya */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 stagger-children">
          {products.filter(p => p.category === 'giftcard').map((product, i) => (
            <RevealOnScroll key={product.id} delay={i * 120}>
              <ProductCard product={product} />
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
