export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import { renderRichText } from '@/lib/richText';
import AddToCartSection from './AddToCartSection';
import ProductGallery from './ProductGallery';
import PosterClient from './PosterClient';
import { DEFAULT_LAYOUT_ID, POSTER_LAYOUTS } from './posterData';

const POSTER_DESIGNER_SLUG = 'poszter';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProductDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const search = await searchParams;

  const product = await prisma.product.findUnique({
    where: { slug },
  });

  if (!product || !product.active) {
    notFound();
  }

  const isGiftCard = product.category === 'giftcard';
  const isPosterDesigner = product.slug === POSTER_DESIGNER_SLUG;
  const effectivePrice = product.onSale && product.salePrice ? product.salePrice : product.price;

  if (isPosterDesigner) {
    const requested = typeof search.elrendezes === 'string' ? search.elrendezes : undefined;
    const initialLayoutId =
      requested && POSTER_LAYOUTS.some((l) => l.id === requested) ? requested : DEFAULT_LAYOUT_ID;

    return (
      <section className="pt-4 pb-16 md:pt-8 md:pb-24 bg-surface min-h-screen">
        <div className="max-w-7xl mx-auto px-8">
          <PosterClient
            product={{
              id: product.id,
              name: product.name,
              slug: product.slug,
              price: product.price,
              imageUrl: product.imageUrl,
              category: product.category,
              description: product.description,
              longDescription: product.longDescription,
              badge: product.badge,
              series: product.series,
              onSale: product.onSale,
              salePrice: product.salePrice,
              images: product.images ?? [],
            }}
            initialLayoutId={initialLayoutId}
          />
        </div>
      </section>
    );
  }

  const longDescriptionBlock = product.longDescription ? (
    <>
      <h2 className="text-2xl md:text-3xl text-[#4A4A4A] mb-6 tracking-[0.1em]" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}>
        Bővebb leírás
      </h2>
      <div
        className="prose prose-neutral max-w-none text-[#4A4A4A] leading-relaxed"
        dangerouslySetInnerHTML={{ __html: renderRichText(product.longDescription) }}
      />
    </>
  ) : null;

  return (
    <section className="pt-4 pb-16 md:pt-8 md:pb-24 bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:gap-x-16">
          {/* Left column: gallery + (desktop) long description */}
          <div className="w-full lg:w-1/2 flex flex-col gap-12">
            <ProductGallery
              mainImage={product.imageUrl}
              images={product.images ?? []}
              alt={product.name}
              badge={product.badge}
            />

            {product.longDescription && (
              <div
                id="bovebb-leiras-desktop"
                className="hidden lg:block w-full max-w-[470px] mx-auto lg:ml-auto lg:mr-0 scroll-mt-24"
              >
                {longDescriptionBlock}
              </div>
            )}
          </div>

          {/* Right column: product details */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center space-y-6 mt-12 lg:mt-0">
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
                <>
                  <a
                    href="#bovebb-leiras-desktop"
                    className="hidden lg:inline-block text-sm text-[#C4A591] hover:text-[#4A4A4A] underline underline-offset-2 transition-colors mt-1"
                  >
                    további információk...
                  </a>
                  <a
                    href="#bovebb-leiras-mobile"
                    className="inline-block lg:hidden text-sm text-[#C4A591] hover:text-[#4A4A4A] underline underline-offset-2 transition-colors mt-1"
                  >
                    további információk...
                  </a>
                </>
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

          {/* Mobile-only long description, at the very bottom */}
          {product.longDescription && (
            <div
              id="bovebb-leiras-mobile"
              className="lg:hidden w-full max-w-[470px] mx-auto mt-12 scroll-mt-24"
            >
              {longDescriptionBlock}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
