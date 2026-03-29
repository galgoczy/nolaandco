import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import ProductCard from '@/components/home/ProductCard';

interface Props {
  searchParams: Promise<{ category?: string }>;
}

const tabs = [
  { label: 'Osszes', href: '/termekek', value: undefined },
  { label: 'Parnak', href: '/termekek?category=pillow', value: 'pillow' },
  { label: 'Poszterek', href: '/termekek?category=poster', value: 'poster' },
] as const;

export default async function TermekekPage({ searchParams }: Props) {
  const { category } = await searchParams;

  const products = await prisma.product.findMany({
    where: {
      active: true,
      ...(category ? { category } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <section className="py-24 bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-16">
          <RevealOnScroll>
            <h1 className="text-4xl md:text-6xl montserrat-light-caps text-carbon mb-6 leading-tight">
              TERMEKEINK
            </h1>
          </RevealOnScroll>
          <RevealOnScroll>
            <div className="w-12 h-0.5 bg-primary mx-auto mb-10" />
          </RevealOnScroll>

          <RevealOnScroll>
            <div className="flex items-center justify-center gap-4">
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
              Ebben a kategoriaban meg nincsenek termekek.
            </p>
          </RevealOnScroll>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 stagger-children">
            {products.map((product, i) => (
              <RevealOnScroll key={product.id} delay={i * 120}>
                <ProductCard product={product} />
              </RevealOnScroll>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
