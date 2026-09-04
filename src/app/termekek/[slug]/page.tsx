export const dynamic = 'force-dynamic';

import { cache } from 'react';
import type { Metadata } from 'next';
import ProductViewTracker from '@/components/products/ProductViewTracker';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import { renderRichText } from '@/lib/richText';
import AddToCartSection from './AddToCartSection';
import CapeAddToCart from './CapeAddToCart';
import ProductGallery from './ProductGallery';
import PillowVariants from './PillowVariants';
import PosterClient from './PosterClient';
import TextileClient from './TextileClient';
import ProductSpecs from '@/components/products/ProductSpecs';
import BundleCompositeImage from '@/components/products/BundleCompositeImage';
import { DEFAULT_LAYOUT_ID, POSTER_LAYOUTS } from './posterData';
import { resolveCapeConfig } from '@/lib/capeOptions';

const POSTER_DESIGNER_SLUG = 'poszter';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Alias- és termékfeloldás egy helyen. A React `cache` a kérésen belül
 * megjegyzi az eredményt, így a generateMetadata és az oldal együtt is csak
 * egyszer kérdezi le az adatbázist.
 */
const resolveProduct = cache(async (slug: string) => {
  // Alias lookup first — if this URL is a "landing card" for a canonical product,
  // resolve to the canonical product and use the alias's default layout.
  const alias = await prisma.productAlias.findUnique({ where: { slug } });
  const canonicalSlug = alias?.targetProductSlug ?? slug;
  const product = await prisma.product.findUnique({ where: { slug: canonicalSlug } });
  return { alias, product };
});

/**
 * A nem létező termék ellenőrzése ide kerül, mert a metaadat még a válasz
 * streamelése előtt áll össze — csak innen hívva ad a notFound() valódi 404-et.
 * Magában az oldalban hívva a `loading.tsx` Suspense-határa miatt a státusz
 * már 200-ként elment. Lásd vercel/next.js#76474.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { product } = await resolveProduct(slug);
  if (!product || !product.active) {
    notFound();
  }

  // Saját megosztási adatok termékenként. Enélkül minden terméklink a főoldal
  // címét és képét vitte a Facebookon és a Google-találatokban, az og:url pedig
  // a főoldalra mutatott — így a megosztások nem a termékhez gyűltek.
  const url = `/termekek/${slug}`;
  const description = product.description.replace(/\s+/g, ' ').trim().slice(0, 200);
  // A galéria videóbejegyzéseket is tartalmazhat ("videó|poszter"), azokat kihagyjuk.
  const image = product.imageUrl || product.images.find((i) => !i.includes('|')) || null;

  return {
    title: product.name,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      title: product.name,
      description,
      url,
      images: image ? [{ url: image, alt: product.name }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const search = await searchParams;

  const { alias, product } = await resolveProduct(slug);

  if (!product || !product.active) {
    notFound();
  }

  // Alias's preset takes precedence unless the URL param explicitly overrides.
  const aliasDefaultLayoutId = alias?.defaultLayoutId;

  const isGiftCard = product.category === 'giftcard';
  const isPosterDesigner = product.slug === POSTER_DESIGNER_SLUG;
  const isPillow = product.category === 'pillow';
  const isBigKidProduct =
    product.category === 'cape' || product.category === 'crown' || product.category === 'bundle';
  // DB-variánsos, nem személyre szabott termékek (swatch-választós oldal).
  const isTextile = ['szundikendo', 'takaro', 'decor'].includes(product.category);
  const effectivePrice = product.onSale && product.salePrice ? product.salePrice : product.price;

  // A csomagok választható színei/modelljei a katalógusból jönnek, hogy az
  // adminban átnevezett vagy elfogyott darabok ne maradjanak a listában.
  const capeConfig = isBigKidProduct
    ? await resolveCapeConfig(product.slug)
    : { designer: false };

  const pillowVariants = isPillow
    ? await (async () => {
        const all = await prisma.product.findMany({
          where: { category: 'pillow', active: true },
          select: { id: true, slug: true, name: true, imageUrl: true },
        });
        const order = [
          'origin-core',
          'origin-linea',
          'origin-atelier',
          'nova-core',
          'nova-linea',
          'nova-atelier',
        ];
        const rank = (slug: string) => {
          const i = order.indexOf(slug);
          return i === -1 ? order.length : i;
        };
        return [...all].sort((a, b) => rank(a.slug) - rank(b.slug));
      })()
    : [];

  if (isPosterDesigner) {
    const requested = typeof search.elrendezes === 'string' ? search.elrendezes : undefined;
    const initialLayoutId =
      requested && POSTER_LAYOUTS.some((l) => l.id === requested)
        ? requested
        : aliasDefaultLayoutId && POSTER_LAYOUTS.some((l) => l.id === aliasDefaultLayoutId)
          ? aliasDefaultLayoutId
          : DEFAULT_LAYOUT_ID;

    return (
      <section className="pt-4 pb-16 md:pt-8 md:pb-24 bg-surface min-h-screen">
        <ProductViewTracker id={product.id} name={product.name} price={effectivePrice} category={product.category} />
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

  if (isTextile) {
    const variants = await prisma.productVariant.findMany({
      where: { productId: product.id, active: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    // A NOLA Cloud kétoldalas párosításokkal érkezik — ott "színpárosítás" a felirat.
    const variantLabel = variants.some((v) => v.colorHex2)
      ? 'Válassz színpárosítást'
      : 'Válassz színt';

    return (
      <section className="pt-4 pb-16 md:pt-8 md:pb-24 bg-surface min-h-screen">
        <ProductViewTracker id={product.id} name={product.name} price={effectivePrice} category={product.category} />
        <div className="max-w-7xl mx-auto px-8">
          <TextileClient
            product={{
              id: product.id,
              name: product.name,
              slug: product.slug,
              price: effectivePrice,
              originalPrice: product.onSale && product.salePrice ? product.price : null,
              imageUrl: product.imageUrl,
              images: product.images ?? [],
              category: product.category,
              description: product.description,
              longDescription: product.longDescription,
              badge: product.badge,
              stock: product.stock,
              features: product.features ?? [],
              material: product.material,
              size: product.size,
              productionTime: product.productionTime,
              careInfo: product.careInfo,
              noShipping: product.noShipping,
            }}
            variants={variants.map((v) => ({
              id: v.id,
              name: v.name,
              colorHex: v.colorHex,
              colorHex2: v.colorHex2,
              stock: v.stock,
              images: v.images ?? [],
              priceDiff: v.priceDiff,
            }))}
            variantLabel={variantLabel}
          />
        </div>
      </section>
    );
  }

  // Csomag saját fotó nélkül: a tagtermékek képeiből álló mozaik.
  const bundleComposite =
    product.category === 'bundle' && !product.imageUrl && product.bundleItems.length > 0
      ? (
          await prisma.product.findMany({
            where: { slug: { in: product.bundleItems } },
            select: { slug: true, imageUrl: true },
          })
        )
          .sort(
            (a, b) => product.bundleItems.indexOf(a.slug) - product.bundleItems.indexOf(b.slug),
          )
          .map((m) => m.imageUrl)
          .filter((u) => u !== '')
          .slice(0, 3)
      : [];

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
      <ProductViewTracker id={product.id} name={product.name} price={effectivePrice} category={product.category} />
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:gap-x-16">
          {/* Left column: gallery + (desktop) long description */}
          <div className="w-full lg:w-1/2 flex flex-col gap-12">
            {bundleComposite.length > 0 ? (
              <div className="w-full max-w-[470px] mx-auto lg:ml-auto lg:mr-0">
                <div className="relative aspect-[2/3] rounded-2xl overflow-hidden ghost-border">
                  <BundleCompositeImage
                    images={bundleComposite}
                    alt={product.name}
                    sizes="(max-width: 520px) 50vw, 235px"
                  />
                  {product.badge && (
                    <div className="absolute top-4 right-4 z-10">
                      <span
                        className="badge-shimmer px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest text-white shadow-sm"
                        style={{ backgroundColor: '#7A4A5A' }}
                      >
                        {product.badge}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <ProductGallery
                mainImage={product.imageUrl}
                images={product.images ?? []}
                alt={product.name}
                badge={product.badge}
              />
            )}

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
            {!isGiftCard && !isBigKidProduct && product.series && (
              <span className="inline-block self-start px-3 py-1 rounded-full bg-surface-container text-xs font-medium uppercase tracking-wider text-carbon-light">
                {product.series} series
              </span>
            )}

            <h1 className="text-3xl md:text-4xl text-[#4A4A4A] leading-tight tracking-[0.1em]" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}>
              {product.name}
            </h1>

            {!isGiftCard && (
              <div className="flex flex-col gap-1">
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
                {/* Csomagoknál a megtakarítás kiírva: "X helyett Y — Z megtakarítás". */}
                {product.category === 'bundle' && product.onSale && product.salePrice && (
                  <p className="text-sm text-carbon-light">
                    {formatPrice(product.price)} helyett{' '}
                    <strong className="text-carbon">{formatPrice(product.salePrice)}</strong> —{' '}
                    {formatPrice(product.price - product.salePrice)} megtakarítás
                  </p>
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

            {isPillow && pillowVariants.length > 0 && (
              <PillowVariants variants={pillowVariants} currentSlug={product.slug} />
            )}

            <div className="pt-4">
              {isBigKidProduct ? (
                <CapeAddToCart
                  product={{
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    price: effectivePrice,
                    imageUrl: product.imageUrl,
                    category: product.category,
                    noShipping: product.noShipping,
                    features: product.features ?? [],
                  }}
                  config={capeConfig}
                />
              ) : (
                <AddToCartSection
                  product={{
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    price: effectivePrice,
                    imageUrl: product.imageUrl,
                    category: product.category,
                    noShipping: product.noShipping,
                    features: product.features ?? [],
                  }}
                  oneClickAdd
                />
              )}
            </div>

            {/* Adminból szerkeszthető termékadat-lap (üres mezők kimaradnak). */}
            <ProductSpecs
              specs={{
                material: product.material,
                size: product.size,
                productionTime: product.productionTime,
                careInfo: product.careInfo,
              }}
            />
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
