'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { renderRichText } from '@/lib/richText';
import { formatPrice } from '@/lib/utils';
import type { BirthData } from '@/lib/validators';
import AddToCartSection from './AddToCartSection';
import {
  POSTER_LAYOUTS,
  POSTER_COLORS,
  DEFAULT_LAYOUT_ID,
  DEFAULT_COLOR_ID,
  findLayout,
  findColor,
  type PosterLayout,
  type PosterColor,
} from './posterData';

type Props = {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    imageUrl: string;
    category: string | null;
    description: string;
    longDescription: string | null;
    badge: string | null;
    series: string | null;
    onSale: boolean;
    salePrice: number | null;
    images: string[];
  };
  initialLayoutId: string;
};

type ViewMode = 'preview' | 'lifestyle';

function PosterPreview({
  layout,
  color,
  birthData,
}: {
  layout: PosterLayout;
  color: PosterColor;
  birthData: BirthData | null;
}) {
  return (
    <div className="relative w-full aspect-[5/7] bg-white rounded-md shadow-[0_20px_40px_-16px_rgba(74,74,74,0.25)] overflow-hidden">
      {/* Inner colored "window" inside the paszpartu */}
      <div
        className="absolute left-[7%] right-[7%] top-[7%] bottom-[22%] overflow-hidden"
        style={{ backgroundColor: color.hex }}
      >
        <Image
          key={layout.id}
          src={layout.webImage}
          alt={layout.label}
          fill
          className="object-contain transition-opacity duration-300"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
      </div>

      {/* Birth data on the lower paszpartu */}
      <div className="absolute left-0 right-0 bottom-[6%] text-center px-8">
        {birthData ? (
          <>
            <div
              className="text-[#4A4A4A] uppercase tracking-[0.28em]"
              style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: 'clamp(14px, 2.4vw, 22px)' }}
            >
              {birthData.babyName}
            </div>
            <div
              className="text-[#4A4A4A]/70 mt-1 tracking-[0.18em]"
              style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 200, fontSize: 'clamp(9px, 1.4vw, 13px)' }}
            >
              {birthData.birthDate}
              {birthData.birthTime ? ` · ${birthData.birthTime}` : ''}
              {' · '}
              {birthData.birthWeight} / {birthData.birthHeight}
            </div>
          </>
        ) : (
          <div
            className="text-[#4A4A4A]/30 italic tracking-[0.15em]"
            style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 200, fontSize: 'clamp(9px, 1.3vw, 12px)' }}
          >
            a baba adatai itt fognak megjelenni
          </div>
        )}
      </div>
    </div>
  );
}

function PosterPickers({
  layoutId,
  colorId,
  onLayoutChange,
  onColorChange,
}: {
  layoutId: string;
  colorId: string;
  onLayoutChange: (id: string) => void;
  onColorChange: (id: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <div
          className="text-[11px] uppercase tracking-[0.2em] text-carbon-light mb-3"
          style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 400 }}
        >
          Elrendezés
        </div>
        <div className="flex gap-2.5 flex-wrap">
          {POSTER_LAYOUTS.map((l) => {
            const active = l.id === layoutId;
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => onLayoutChange(l.id)}
                aria-label={l.label}
                className={`relative w-12 h-12 rounded-full overflow-hidden border-2 transition-all ${
                  active
                    ? 'border-[#C4A591] shadow-sm scale-105'
                    : 'border-[#4A4A4A]/15 opacity-70 hover:opacity-100'
                }`}
              >
                <span
                  className="absolute inset-0"
                  style={{ backgroundColor: active ? '#faf6f1' : '#f5f0e8' }}
                />
                <Image
                  src={l.webImage}
                  alt={l.label}
                  fill
                  className="object-contain p-1"
                  sizes="48px"
                />
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div
          className="text-[11px] uppercase tracking-[0.2em] text-carbon-light mb-3"
          style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 400 }}
        >
          Háttérszín
        </div>
        <div className="flex gap-2.5 flex-wrap">
          {POSTER_COLORS.map((c) => {
            const active = c.id === colorId;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onColorChange(c.id)}
                aria-label={c.label}
                title={c.label}
                className={`w-12 h-12 rounded-full border-2 transition-all ${
                  active
                    ? 'border-[#C4A591] shadow-sm scale-105 ring-2 ring-[#C4A591]/20 ring-offset-2 ring-offset-surface'
                    : 'border-[#4A4A4A]/15 hover:scale-105'
                }`}
                style={{ backgroundColor: c.hex }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function PosterClient({ product, initialLayoutId }: Props) {
  const [layoutId, setLayoutId] = useState(initialLayoutId || DEFAULT_LAYOUT_ID);
  const [colorId, setColorId] = useState(DEFAULT_COLOR_ID);
  const [birthData, setBirthData] = useState<BirthData | null>(null);
  const [view, setView] = useState<ViewMode>('preview');
  const [activeLifestyleIdx, setActiveLifestyleIdx] = useState(0);

  const layout = useMemo(() => findLayout(layoutId), [layoutId]);
  const color = useMemo(() => findColor(colorId), [colorId]);

  const lifestyleImages = useMemo(
    () => (product.images ?? []).filter((img) => img && img !== product.imageUrl),
    [product.images, product.imageUrl]
  );

  const effectivePrice = product.onSale && product.salePrice ? product.salePrice : product.price;
  const extraNote = `Elrendezés: ${layout.label} | Háttérszín: ${color.label} (${color.hex})`;

  return (
    <div className="flex flex-col lg:flex-row lg:items-start lg:gap-x-16">
      {/* Left column: preview (or lifestyle) + pickers */}
      <div className="w-full lg:w-1/2 flex flex-col gap-6">
        <div className="w-full max-w-[470px] mx-auto lg:ml-auto lg:mr-0">
          {view === 'preview' ? (
            <PosterPreview layout={layout} color={color} birthData={birthData} />
          ) : (
            <div className="relative w-full aspect-[5/7] bg-surface-container-low rounded-md overflow-hidden ghost-border">
              <Image
                src={lifestyleImages[activeLifestyleIdx]}
                alt={`${product.name} — lifestyle ${activeLifestyleIdx + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          )}

          {/* Thumbnails row: preview tile + lifestyle tiles */}
          {lifestyleImages.length > 0 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setView('preview')}
                aria-label="Saját tervezett poszter"
                className={`relative w-16 h-[89px] rounded flex-shrink-0 border-2 bg-white transition-all overflow-hidden ${
                  view === 'preview'
                    ? 'border-[#C4A591] shadow-sm'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <div
                  className="absolute left-[10%] right-[10%] top-[10%] bottom-[28%]"
                  style={{ backgroundColor: color.hex }}
                >
                  <Image src={layout.webImage} alt="" fill className="object-contain" sizes="64px" />
                </div>
              </button>
              {lifestyleImages.map((img, idx) => {
                const active = view === 'lifestyle' && idx === activeLifestyleIdx;
                return (
                  <button
                    key={`${img}-${idx}`}
                    type="button"
                    onClick={() => {
                      setView('lifestyle');
                      setActiveLifestyleIdx(idx);
                    }}
                    className={`relative w-16 h-[89px] rounded flex-shrink-0 border-2 overflow-hidden transition-all ${
                      active
                        ? 'border-[#C4A591] shadow-sm'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" sizes="64px" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Pickers — always visible, even while viewing a lifestyle thumbnail */}
          <div className="mt-6">
            <PosterPickers
              layoutId={layoutId}
              colorId={colorId}
              onLayoutChange={(id) => {
                setLayoutId(id);
                setView('preview');
              }}
              onColorChange={(id) => {
                setColorId(id);
                setView('preview');
              }}
            />
          </div>
        </div>

        {/* Long description — desktop, under the designer */}
        {product.longDescription && (
          <div
            id="bovebb-leiras-desktop"
            className="hidden lg:block w-full max-w-[470px] mx-auto lg:ml-auto lg:mr-0 mt-8 scroll-mt-24"
          >
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
          </div>
        )}
      </div>

      {/* Right column: details + add to cart */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center space-y-6 mt-12 lg:mt-0">
        {product.series && (
          <span className="inline-block self-start px-3 py-1 rounded-full bg-surface-container text-xs font-medium uppercase tracking-wider text-carbon-light">
            {product.series} series
          </span>
        )}

        <h1
          className="text-3xl md:text-4xl text-[#4A4A4A] leading-tight tracking-[0.1em]"
          style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}
        >
          {product.name}
        </h1>

        <div className="flex items-center gap-3">
          {product.onSale && product.salePrice ? (
            <>
              <span className="text-2xl font-bold text-primary">{formatPrice(product.salePrice)}</span>
              <span className="text-lg text-carbon-light line-through">{formatPrice(product.price)}</span>
            </>
          ) : (
            <span className="text-2xl font-bold text-carbon">{formatPrice(product.price)}</span>
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
            onBirthDataChange={setBirthData}
            extraNote={extraNote}
          />
        </div>
      </div>

      {/* Long description — mobile, at the very bottom */}
      {product.longDescription && (
        <div
          id="bovebb-leiras-mobile"
          className="lg:hidden w-full max-w-[470px] mx-auto mt-12 scroll-mt-24"
        >
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
        </div>
      )}
    </div>
  );
}
