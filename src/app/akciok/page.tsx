import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import Button from '@/components/ui/Button';
import RevealOnScroll from '@/components/ui/RevealOnScroll';

export const dynamic = 'force-dynamic';

export default async function AkciokPage() {
  const now = new Date();

  const [promotions, saleProducts] = await Promise.all([
    prisma.promotion.findMany({
      where: {
        active: true,
        startsAt: { lte: now },
        endsAt: { gte: now },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.findMany({
      where: {
        active: true,
        onSale: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const hasContent = promotions.length > 0 || saleProducts.length > 0;

  return (
    <section className="min-h-[80vh] bg-surface px-4 py-24">
      <div className="max-w-6xl mx-auto">
        <RevealOnScroll>
          <div className="text-center mb-16">
            <h1 className="montserrat-light-caps text-4xl md:text-5xl text-carbon mb-6">
              Akciók
            </h1>
            <div className="w-12 h-[2px] bg-primary mx-auto" />
          </div>
        </RevealOnScroll>

        {!hasContent ? (
          <RevealOnScroll delay={200}>
            <div className="text-center max-w-md mx-auto py-16">
              <p className="text-carbon-light font-body text-lg mb-8">
                Jelenleg nincs aktív akció. Iratkozz fel hírlevelünkre, hogy
                elsőként értesülj a következő akciókról!
              </p>
              <Button href="/hirlevel">Feliratkozás a hírlevélre</Button>
            </div>
          </RevealOnScroll>
        ) : (
          <>
            {/* Promotions */}
            {promotions.length > 0 && (
              <div className="mb-20">
                <RevealOnScroll>
                  <h2 className="montserrat-light-caps text-2xl text-carbon mb-8 text-center">
                    Aktív promóciók
                  </h2>
                </RevealOnScroll>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {promotions.map((promo, i) => (
                    <RevealOnScroll key={promo.id} delay={i * 120}>
                      <div className="bg-warm-beige rounded-lg p-8 ghost-border card-hover">
                        <h3 className="font-headline font-semibold text-xl text-carbon mb-3">
                          {promo.title}
                        </h3>
                        <p className="text-carbon-light font-body mb-4">
                          {promo.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-4">
                          {promo.discountPct && (
                            <span className="bg-brand-red text-on-primary px-4 py-1.5 rounded-full text-sm font-bold">
                              -{promo.discountPct}%
                            </span>
                          )}
                          {promo.discountAmt && (
                            <span className="bg-brand-red text-on-primary px-4 py-1.5 rounded-full text-sm font-bold">
                              -{formatPrice(promo.discountAmt)}
                            </span>
                          )}
                          {promo.code && (
                            <span className="bg-surface-container px-4 py-1.5 rounded-full text-sm font-body text-carbon">
                              Kód:{' '}
                              <strong className="font-bold tracking-wider">
                                {promo.code}
                              </strong>
                            </span>
                          )}
                        </div>
                      </div>
                    </RevealOnScroll>
                  ))}
                </div>
              </div>
            )}

            {/* Sale Products */}
            {saleProducts.length > 0 && (
              <div>
                <RevealOnScroll>
                  <h2 className="montserrat-light-caps text-2xl text-carbon mb-8 text-center">
                    Akciós termékek
                  </h2>
                </RevealOnScroll>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {saleProducts.map((product, i) => (
                    <RevealOnScroll key={product.id} delay={i * 120}>
                      <Link
                        href={`/termekek/${product.slug}`}
                        className="group block bg-surface-container-lowest rounded-lg overflow-hidden ghost-border card-hover"
                      >
                        <div className="relative aspect-square overflow-hidden">
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute top-3 right-3 bg-brand-red text-on-primary px-3 py-1 rounded-full text-xs font-bold">
                            Akció
                          </div>
                        </div>

                        <div className="p-5">
                          <h3 className="font-headline font-medium text-carbon mb-2">
                            {product.name}
                          </h3>
                          <div className="flex items-center gap-3">
                            <span className="text-carbon-light line-through text-sm">
                              {formatPrice(product.price)}
                            </span>
                            <span className="text-brand-red font-bold text-lg">
                              {formatPrice(product.salePrice ?? product.price)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </RevealOnScroll>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
