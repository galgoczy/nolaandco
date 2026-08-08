'use client';

import { useEffect, useMemo, useState } from 'react';
import Button from '@/components/ui/Button';
import TrustBar from '@/components/products/TrustBar';
import ProductSpecs from '@/components/products/ProductSpecs';
import VariantPicker, { type PickerVariant } from '@/components/products/VariantPicker';
import ProductGallery from './ProductGallery';
import { renderRichText } from '@/lib/richText';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cart';

export type TextileVariant = PickerVariant & {
  images: string[];
  priceDiff: number;
};

type Props = {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    originalPrice: number | null;
    imageUrl: string;
    images: string[];
    category: string | null;
    description: string;
    longDescription: string | null;
    badge: string | null;
    stock: number | null;
    features: string[];
    material: string | null;
    size: string | null;
    productionTime: string | null;
    careInfo: string | null;
    noShipping: boolean;
  };
  variants: TextileVariant[];
  /** A választó felirata, pl. "Válassz színt" vagy "Válassz színpárosítást". */
  variantLabel: string;
};

/**
 * Termékoldal a textil- és dekortermékekhez (szundikendő, takaró, pillangó): galéria + feliratozott
 * szín-swatch választó + kosárba helyezés. A választott variáns saját
 * képgalériát, felárat és készletet hozhat; a választás a kosártételre kerül,
 * így a rendelésben, a visszaigazoló e-mailben és az adminban is látszik.
 */
export default function TextileClient({ product, variants, variantLabel }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const selectable = useMemo(
    () => variants.filter((v) => v.stock === null || v.stock > 0),
    [variants],
  );
  const [selectedId, setSelectedId] = useState<string | null>(selectable[0]?.id ?? null);
  const [error, setError] = useState('');
  const [added, setAdded] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!added) return;
    setFading(false);
    const timer = setTimeout(() => setFading(true), 500);
    return () => clearTimeout(timer);
  }, [added]);

  const selected = variants.find((v) => v.id === selectedId) ?? null;

  // A variáns saját galériája felülírja a termékét, ha van feltöltött képe.
  const galleryImages = selected && selected.images.length > 0 ? selected.images : null;
  const mainImage = galleryImages ? galleryImages[0] : product.imageUrl;
  const restImages = galleryImages ? galleryImages.slice(1) : product.images;

  const price = product.price + (selected?.priceDiff ?? 0);
  const originalPrice =
    product.originalPrice !== null ? product.originalPrice + (selected?.priceDiff ?? 0) : null;

  // Készlet: variánsnál a variáns készlete dönt, egyébként a terméké.
  const stock = variants.length > 0 ? (selected?.stock ?? null) : product.stock;
  const soldOut = variants.length > 0 ? selectable.length === 0 : stock !== null && stock <= 0;

  const handleAddToCart = () => {
    if (variants.length > 0 && !selected) {
      setError('Kérlek válassz egy változatot!');
      return;
    }
    setError('');
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price,
      imageUrl: mainImage,
      quantity: 1,
      babyName: '',
      birthDate: '',
      birthWeight: '',
      birthHeight: '',
      customNote: selected ? `${variantLabel}: ${selected.name}` : undefined,
      variant: selected?.name,
      variantId: selected?.id,
      category: product.category,
      noShipping: product.noShipping,
    });
    setAdded(true);
  };

  const longDescriptionBlock = product.longDescription ? (
    <>
      <h2
        className="text-2xl md:text-3xl text-[#4A4A4A] mb-6 tracking-[0.1em]"
        style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}
      >
        Bővebb leírás
      </h2>
      <div
        className="prose prose-neutral max-w-none text-[#4A4A4A] leading-relaxed"
        dangerouslySetInnerHTML={{ __html: renderRichText(product.longDescription) }}
      />
    </>
  ) : null;

  return (
    <div className="flex flex-col lg:flex-row lg:items-start lg:gap-x-16">
      {/* Bal oszlop: galéria + (desktopon) bővebb leírás */}
      <div className="w-full lg:w-1/2 flex flex-col gap-12">
        <ProductGallery
          key={selected?.id ?? 'base'}
          mainImage={mainImage}
          images={restImages}
          alt={selected ? `${product.name} – ${selected.name}` : product.name}
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

      {/* Jobb oszlop: termékadatok */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center space-y-6 mt-12 lg:mt-0">
        <h1
          className="text-3xl md:text-4xl text-[#4A4A4A] leading-tight tracking-[0.1em]"
          style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}
        >
          {product.name}
        </h1>

        <div className="flex items-center gap-3">
          {originalPrice ? (
            <>
              <span className="text-2xl font-bold text-primary">{formatPrice(price)}</span>
              <span className="text-lg text-carbon-light line-through">
                {formatPrice(originalPrice)}
              </span>
            </>
          ) : (
            <span className="text-2xl font-bold text-carbon">{formatPrice(price)}</span>
          )}
        </div>

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

        {variants.length > 0 && (
          <VariantPicker
            label={variantLabel}
            variants={variants}
            selectedId={selectedId}
            onSelect={(id) => {
              setSelectedId(id);
              setError('');
              setAdded(false);
            }}
          />
        )}

        {stock !== null && stock > 0 && stock <= 3 && (
          <p className="text-sm text-[#D55850]">
            Már csak {stock} db elérhető ebből a változatból.
          </p>
        )}

        <div className="pt-2 space-y-6">
          {added ? (
            <div
              className="rounded-2xl p-6 text-center space-y-3 transition-all duration-[2500ms] ease-in-out border"
              style={{
                backgroundColor: fading ? '#faf6f1' : '#f0fdf4',
                borderColor: fading ? 'transparent' : '#bbf7d0',
              }}
            >
              <div className="text-2xl">&#10003;</div>
              <p
                className={`font-medium text-lg transition-colors duration-[2500ms] ${
                  fading ? 'text-carbon' : 'text-green-800'
                }`}
              >
                Hozzáadva a kosárhoz!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Button variant="outline" onClick={() => setAdded(false)}>
                  További vásárlás
                </Button>
                <Button variant="secondary" href="/kosar">
                  Kosár megtekintése
                </Button>
              </div>
            </div>
          ) : (
            <>
              <Button
                variant="secondary"
                onClick={handleAddToCart}
                disabled={soldOut}
                className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {soldOut ? 'Jelenleg nem elérhető' : `Kosárba teszem – ${formatPrice(price)}`}
              </Button>
              {error && <p className="text-sm text-red-500 -mt-3">{error}</p>}
            </>
          )}

          <TrustBar
            category={product.category}
            items={product.features}
            className="justify-center"
          />

          <ProductSpecs
            specs={{
              material: product.material,
              size: product.size,
              productionTime: product.productionTime,
              careInfo: product.careInfo,
            }}
          />
        </div>
      </div>

      {/* Mobil: bővebb leírás legalul */}
      {product.longDescription && (
        <div
          id="bovebb-leiras-mobile"
          className="lg:hidden w-full max-w-[470px] mx-auto mt-12 scroll-mt-24"
        >
          {longDescriptionBlock}
        </div>
      )}
    </div>
  );
}
