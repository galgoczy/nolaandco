export const dynamic = 'force-dynamic';

import Image from 'next/image';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import AddToCartSection from './AddToCartSection';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
  });

  if (!product || !product.active) {
    notFound();
  }

  const isGiftCard = product.category === 'giftcard';
  const effectivePrice = product.onSale && product.salePrice ? product.salePrice : product.price;

  return (
    <section className="py-24 bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left: Product Image */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-surface-container-low ghost-border">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            {product.badge && (
              <div className="absolute top-4 right-4">
                <span className="badge-shimmer px-3 py-1 rounded-lg glass-nav text-[10px] font-bold uppercase tracking-widest text-primary shadow-sm">
                  {product.badge}
                </span>
              </div>
            )}
          </div>

          {/* Right: Product Details */}
          <div className="flex flex-col justify-center space-y-6">
            {!isGiftCard && product.series && (
              <span className="inline-block self-start px-3 py-1 rounded-full bg-surface-container text-xs font-medium uppercase tracking-wider text-carbon-light">
                {product.series} series
              </span>
            )}

            <h1 className="text-3xl md:text-4xl montserrat-light-caps text-carbon leading-tight">
              {product.name}
            </h1>

            {!isGiftCard && (
              <div className="flex items-center gap-3">
                {product.onSale && product.salePrice ? (
                  <>
                    <span className="text-2xl font-bold text-primary">
                      {formatPrice(product.salePrice)}
                    </span>
                    <span className="text-lg text-carbon-light line-through">
                      {formatPrice(product.price)}
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-bold text-carbon">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>
            )}

            <p className="text-carbon-light leading-relaxed">
              {product.description}
            </p>

            <div className="pt-4">
              <AddToCartSection
                product={{
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  price: effectivePrice,
                  imageUrl: product.imageUrl,
                  category: product.category,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
