'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import BirthDataForm from '@/components/products/BirthDataForm';
import Button from '@/components/ui/Button';
import { useCartStore } from '@/store/cart';
import { formatPrice } from '@/lib/utils';
import type { BirthData } from '@/lib/validators';

const giftCardVariants = [
  { label: 'Digitális poszter', price: 6000, description: 'emailben kiküldve, tetszőleges méretben nyomtatható' },
  { label: 'Print poszter + szállítás', price: 14000, description: 'nyomtatott poszter 50 x 70 cm + csomagautomatás szállítás' },
  { label: 'Párna + szállítás', price: 24000, description: 'választott párna + csomagautomatás szállítás' },
  { label: 'Nola Duet – digital', price: 27000, description: 'digitális poszter + párna + csomagautomatás szállítás' },
  { label: 'Nola Duet – print', price: 33000, description: 'nyomtatott poszter 50 x 70 cm + párna + csomagautomatás szállítás' },
];

const posterVariants = [
  { label: 'Digitális', price: 5900, description: 'Digitális fájl (PDF), amit otthon nyomtathatsz ki' },
  { label: 'Nyomtatott', price: 12900, description: 'Prémium papírra nyomtatva' },
];

interface Props {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    imageUrl: string;
    category?: string | null;
  };
}

export default function AddToCartSection({ product }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const [birthData, setBirthData] = useState<BirthData | null>(null);
  const [added, setAdded] = useState(false);
  const [fading, setFading] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const addToCartRef = useRef<HTMLDivElement>(null);

  const isGiftCard = product.category === 'giftcard';
  const isPoster = product.category === 'poster';

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
        customNote: `Ajándékkártya verzió: ${variant.label}`,
      });
      setAdded(true);
      return;
    }

    if (!birthData) return;

    const finalPrice = isPoster ? posterVariants[selectedVariant].price : product.price;
    const variantLabel = isPoster ? posterVariants[selectedVariant].label : undefined;

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
      customNote: isPoster ? `Poszter verzió: ${variantLabel}` : birthData.customNote,
    });

    setAdded(true);
  };

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
        <h3 className="text-lg font-bold text-carbon">Válassz verziót</h3>
        <div className="space-y-3">
          {giftCardVariants.map((variant, i) => (
            <button
              key={i}
              onClick={() => setSelectedVariant(i)}
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
              onClick={() => setSelectedVariant(i)}
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
      {!birthData ? (
        <BirthDataForm onSubmit={handleBirthDataSubmit} />
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
              onClick={() => setBirthData(null)}
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
