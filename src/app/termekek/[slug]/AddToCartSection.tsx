'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import BirthDataForm from '@/components/products/BirthDataForm';
import Button from '@/components/ui/Button';
import { useCartStore } from '@/store/cart';
import { useBirthDataStore } from '@/store/birthData';
import { formatPrice } from '@/lib/utils';
import type { BirthData } from '@/lib/validators';

// Fix összegű digitális ajándékkártya címletek.
const giftCardVariants = [
  { label: '10.000 Ft', price: 10000 },
  { label: '15.000 Ft', price: 15000 },
  { label: '20.000 Ft', price: 20000 },
  { label: '25.000 Ft', price: 25000 },
  { label: '35.000 Ft', price: 35000 },
];

const posterVariants = [
  { label: 'Digitális', price: 5900, description: 'Digitális fájl (PDF), amit otthon nyomtathatsz ki' },
  { label: 'Nyomtatott', price: 12900, description: 'Prémium papírra nyomtatva' },
];

export const POSTER_VARIANTS = posterVariants;

interface Props {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    imageUrl: string;
    category?: string | null;
  };
  onBirthDataChange?: (data: BirthData | null) => void;
  onVariantChange?: (variantIdx: number) => void;
  onAdded?: () => void;
  extraNote?: string;
  disableAutoScroll?: boolean;
  /** When this number changes, trigger the add-to-cart action externally. */
  addToCartSignal?: number;
  /** Structured poster layout id (e.g. "origin-1"). Persisted on order item. */
  posterLayout?: string;
  /** Human-readable label for the poster layout, e.g. "Origin 1". */
  posterLayoutLabel?: string;
}

export default function AddToCartSection({
  product,
  onBirthDataChange,
  onVariantChange,
  onAdded,
  extraNote,
  disableAutoScroll,
  addToCartSignal,
  posterLayout,
  posterLayoutLabel,
}: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const storedBirthData = useBirthDataStore((s) => s.data);
  const setStoredBirthData = useBirthDataStore((s) => s.setData);
  const [birthData, setBirthData] = useState<BirthData | null>(null);
  const [added, setAdded] = useState(false);
  const [fading, setFading] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const addToCartRef = useRef<HTMLDivElement>(null);

  const isGiftCard = product.category === 'giftcard';
  const isPoster = product.category === 'poster';

  // Hydrate from the persisted birth-data store so the form is pre-filled
  // when the user navigates between products. Fires once after the client
  // mount when the persisted value becomes available.
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (hydratedRef.current) return;
    if (storedBirthData && !birthData) {
      hydratedRef.current = true;
      setBirthData(storedBirthData);
      onBirthDataChange?.(storedBirthData);
    }
  }, [storedBirthData, birthData, onBirthDataChange]);

  // Start fading the success message after it appears
  useEffect(() => {
    if (added) {
      setFading(false);
      const timer = setTimeout(() => setFading(true), 500);
      return () => clearTimeout(timer);
    }
  }, [added]);

  const handleBirthDataSubmit = (data: BirthData) => {
    setBirthData(data);
    setStoredBirthData(data);
    setIsEditing(false);
    onBirthDataChange?.(data);
    if (disableAutoScroll) return;
    // Scroll so the "Kosárba" button is visible with some breathing room below
    setTimeout(() => {
      if (addToCartRef.current) {
        const rect = addToCartRef.current.getBoundingClientRect();
        const scrollTarget = window.scrollY + rect.bottom - window.innerHeight + 60;
        window.scrollTo({ top: scrollTarget, behavior: 'smooth' });
      }
    }, 100);
  };

  const handleAddToCart = () => {
    if (isGiftCard) {
      const variant = giftCardVariants[selectedVariant];
      addItem({
        productId: product.id,
        name: `${product.name} – ${variant.label}`,
        slug: product.slug,
        price: variant.price,
        imageUrl: product.imageUrl,
        quantity: 1,
        babyName: '',
        birthDate: '',
        birthWeight: '',
        birthHeight: '',
        customNote: `Ajándékkártya értéke: ${variant.label}`,
        variant: variant.label,
      });
      setAdded(true);
      return;
    }

    if (!birthData) return;

    const finalPrice = isPoster ? posterVariants[selectedVariant].price : product.price;
    const variantLabel = isPoster ? posterVariants[selectedVariant].label : undefined;

    const noteParts = [
      extraNote,
      isPoster ? `Poszter verzió: ${variantLabel}` : birthData.customNote,
    ].filter(Boolean);

    addItem({
      productId: product.id,
      name: isPoster ? `${product.name} – ${variantLabel}` : product.name,
      slug: product.slug,
      price: finalPrice,
      imageUrl: product.imageUrl,
      quantity: 1,
      babyName: birthData.babyName,
      birthDate: birthData.birthDate,
      birthWeight: birthData.birthWeight,
      birthHeight: birthData.birthHeight,
      birthTime: birthData.birthTime,
      customNote: noteParts.join('\n'),
      ...(variantLabel ? { variant: variantLabel } : {}),
      ...(posterLayout ? { posterLayout, posterLayoutLabel } : {}),
    });

    setAdded(true);
    onAdded?.();
  };

  // External trigger: when addToCartSignal changes, fire add-to-cart.
  const lastSignalRef = useRef<number | undefined>(addToCartSignal);
  useEffect(() => {
    if (addToCartSignal === undefined) return;
    if (lastSignalRef.current === addToCartSignal) return;
    lastSignalRef.current = addToCartSignal;
    handleAddToCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addToCartSignal]);

  // Gift card flow
  if (isGiftCard) {
    if (added) {
      return (
        <div
          className="rounded-2xl p-6 text-center space-y-3 transition-all duration-[2500ms] ease-in-out border"
          style={{
            backgroundColor: fading ? '#faf6f1' : '#f0fdf4',
            borderColor: fading ? 'transparent' : '#bbf7d0',
          }}
        >
          <div className="text-2xl">&#10003;</div>
          <p className={`font-medium text-lg transition-colors duration-[2500ms] ${fading ? 'text-carbon' : 'text-green-800'}`}>
            Hozzáadva a kosárhoz!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button
              variant="outline"
              onClick={() => setAdded(false)}
            >
              További vásárlás
            </Button>
            <Button variant="secondary" href="/kosar">Kosár megtekintése</Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-[#faf6f1] rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col gap-1">
            <label htmlFor="giftcard-amount" className="text-carbon-light text-sm font-body">
              Választható érték *
            </label>
            <select
              id="giftcard-amount"
              value={selectedVariant}
              onChange={(e) => setSelectedVariant(Number(e.target.value))}
              className="bg-surface-container rounded-[0.75rem] px-4 py-3 text-carbon font-body outline-none transition-colors focus:ring-2 focus:ring-primary/30"
            >
              {giftCardVariants.map((variant, i) => (
                <option key={variant.label} value={i}>
                  {variant.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <Button variant="secondary" onClick={handleAddToCart} className="w-full">
          Kosárba – {formatPrice(giftCardVariants[selectedVariant].price)}
        </Button>
      </div>
    );
  }

  // Standard product flow (pillow/poster)
  return (
    <div className="space-y-6">
      {isPoster && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-carbon">Válassz verziót</h3>
          {posterVariants.map((variant, i) => (
            <button
              key={i}
              onClick={() => {
                setSelectedVariant(i);
                onVariantChange?.(i);
              }}
              className={`w-full text-left rounded-2xl p-5 transition-all border-2 ${
                selectedVariant === i
                  ? 'border-[#C4A591] bg-[#faf6f1]'
                  : 'border-transparent bg-surface-container hover:bg-surface-container-low'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-carbon">{variant.label}</span>
                  <p className="text-sm text-carbon-light mt-0.5">{variant.description}</p>
                </div>
                <span className="text-lg font-bold text-carbon whitespace-nowrap ml-4">
                  {formatPrice(variant.price)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
      {!birthData || isEditing ? (
        <BirthDataForm
          initialValue={isEditing ? birthData : null}
          onSubmit={handleBirthDataSubmit}
        />
      ) : !added ? (
        <div ref={addToCartRef} className="space-y-4">
          <div className="bg-[#faf6f1] rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-carbon mb-3">Személyre szabás</h3>
            <div className="text-sm text-carbon-light space-y-1">
              <p>
                <span className="font-medium text-carbon">Baba neve:</span>{' '}
                {birthData.babyName}
              </p>
              <p>
                <span className="font-medium text-carbon">Születési dátum:</span>{' '}
                {birthData.birthDate}
              </p>
              <p>
                <span className="font-medium text-carbon">Súly:</span>{' '}
                {birthData.birthWeight}
              </p>
              <p>
                <span className="font-medium text-carbon">Hossz:</span>{' '}
                {birthData.birthHeight}
              </p>
              {birthData.birthTime && (
                <p>
                  <span className="font-medium text-carbon">Időpont:</span>{' '}
                  {birthData.birthTime}
                </p>
              )}
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm text-primary underline mt-3"
            >
              Módosítás
            </button>
          </div>

          <Button variant="secondary" onClick={handleAddToCart} className="w-full">
            Kosárba{isPoster ? ` – ${formatPrice(posterVariants[selectedVariant].price)}` : ''}
          </Button>
        </div>
      ) : (
        <div
          className="rounded-2xl p-6 text-center space-y-3 transition-all duration-[2500ms] ease-in-out border"
          style={{
            backgroundColor: fading ? '#faf6f1' : '#f0fdf4',
            borderColor: fading ? 'transparent' : '#bbf7d0',
          }}
        >
          <div className="text-2xl">&#10003;</div>
          <p className={`font-medium text-lg transition-colors duration-[2500ms] ${fading ? 'text-carbon' : 'text-green-800'}`}>
            Hozzáadva a kosárhoz!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setBirthData(null);
                setAdded(false);
                onBirthDataChange?.(null);
              }}
            >
              További vásárlás
            </Button>
            <Button variant="secondary" href="/kosar">Kosár megtekintése</Button>
          </div>
        </div>
      )}
    </div>
  );
}
