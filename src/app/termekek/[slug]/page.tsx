export const dynamic = 'force-dynamic';

import Image from 'next/image';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import { renderRichText } from '@/lib/richText';
import AddToCartSection from './AddToCartSection';
import ProductGallery from './ProductGallery';

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
          {/* Left: Product Images */}
          <ProductGallery
            mainImage={product.imageUrl}
            images={product.images ?? []}
            alt={product.name}
            badge={product.badge}
          />

          {/* Right: Product Details */}
          <div className="flex flex-col justify-center space-y-6">
            {!isGiftCard && product.series && (
              <span className="inline-block self-start px-3 py-1 rounded-full bg-surface-container text-xs font-medium uppercase tracking-wider text-carbon-light">
                {product.series} series
              </span>
            )}

            <h1 className="text-3xl md:text-4xl text-[#4A4A4A] leading-tight tracking-[0.1em]" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}>
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

            <div className="space-y-2">
              <div
                className="text-[#4A4A4A] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: renderRichText(product.description) }}
              />
              {product.longDescription && (
                <a
                  href="#bovebb-leiras"
                  className="inline-block text-sm text-[#C4A591] hover:text-[#4A4A4A] underline underline-offset-2 transition-colors mt-1"
                >
                  további információk...
                </a>
              )}
            </div>

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

        {/* Bővebb leírás (long description) below images */}
        {product.longDescription && (
          <div id="bovebb-leiras" className="mt-16 max-w-4xl mx-auto scroll-mt-24">
            <h2 className="text-2xl md:text-3xl text-[#4A4A4A] mb-6 tracking-[0.1em]" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}>
              Bővebb leírás
            </h2>
            <div
              className="prose prose-neutral max-w-none text-[#4A4A4A] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderRichText(product.longDescription) }}
            />
          </div>
        )}
      </div>
    </section>
  );
}
