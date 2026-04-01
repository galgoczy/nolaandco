export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import ProductCard from '@/components/home/ProductCard';

interface Props {
  searchParams: Promise<{ category?: string }>;
}

const tabs = [
  { label: 'Összes', href: '/termekek', value: undefined },
  { label: 'Párnák', href: '/termekek?category=pillow', value: 'pillow' },
  { label: 'Poszterek', href: '/termekek?category=poster', value: 'poster' },
  { label: 'Ajándékkártya', href: '/termekek?category=giftcard', value: 'giftcard' },
] as const;

const categoryHeaders: Record<string, { en: string; hu: string }> = {
  pillow: { en: 'KEEPSAKES', hu: 'Párnák' },
  poster: { en: 'ART PRINTS', hu: 'Poszterek' },
  giftcard: { en: 'GIFT CARDS', hu: 'Ajándékkártya' },
};

function CategoryHeader({ en, hu }: { en: string; hu: string }) {
  return (
    <RevealOnScroll>
      <div className="text-center mb-10">
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

  const products = await prisma.product.findMany({
    where: {
      active: true,
      ...(category ? { category } : {}),
    },
    orderBy: { createdAt: 'asc' },
  });

  const showAll = !category;
  const pillows = showAll ? products.filter(p => p.category === 'pillow') : [];
  const posters = showAll ? products.filter(p => p.category === 'poster') : [];
  const giftcards = showAll ? products.filter(p => p.category === 'giftcard') : [];

  return (
    <section className="py-24 bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-16">
          <RevealOnScroll>
            <h1 className="text-4xl md:text-6xl montserrat-light-caps text-carbon mb-6 leading-tight">
              TERMÉKEINK
            </h1>
          </RevealOnScroll>
          <RevealOnScroll>
            <div className="w-12 h-0.5 bg-primary mx-auto mb-10" />
          </RevealOnScroll>

          <RevealOnScroll>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              {tabs.map((tab) => {
                const isActive = category === tab.value;
                return (
                  <Link
                    key={tab.label}
                    href={tab.href}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'bg-surface-container text-carbon-light hover:bg-surface-container-low'
                    }`}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </div>
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
            {/* Párnák */}
            {pillows.length > 0 && (
              <div className="mb-20">
                <CategoryHeader en="KEEPSAKES" hu="Párnák" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 stagger-children">
                  {pillows.map((product, i) => (
                    <RevealOnScroll key={product.id} delay={i * 120}>
                      <ProductCard product={product} />
                    </RevealOnScroll>
                  ))}
                </div>
              </div>
            )}

            {/* Poszterek */}
            {posters.length > 0 && (
              <div className="mb-20">
                <CategoryHeader en="ART PRINTS" hu="Poszterek" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 stagger-children">
                  {posters.map((product, i) => (
                    <RevealOnScroll key={product.id} delay={i * 120}>
                      <ProductCard product={product} />
                    </RevealOnScroll>
                  ))}
                </div>
              </div>
            )}

            {/* Ajándékkártya */}
            {giftcards.length > 0 && (
              <div>
                <CategoryHeader en="GIFT CARDS" hu="Ajándékkártya" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 stagger-children">
                  {giftcards.map((product, i) => (
                    <RevealOnScroll key={product.id} delay={i * 120}>
                      <ProductCard product={product} />
                    </RevealOnScroll>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {category && categoryHeaders[category] && (
              <CategoryHeader en={categoryHeaders[category].en} hu={categoryHeaders[category].hu} />
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 stagger-children">
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
