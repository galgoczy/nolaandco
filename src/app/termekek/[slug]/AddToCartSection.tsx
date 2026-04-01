'use client';

import { useState } from 'react';
import Link from 'next/link';
import BirthDataForm from '@/components/products/BirthDataForm';
import Button from '@/components/ui/Button';
import { useCartStore } from '@/store/cart';
import { formatPrice } from '@/lib/utils';
import type { BirthData } from '@/lib/validators';

const giftCardVariants = [
  { label: 'Poszter', price: 8900, description: 'Egy darab születési poszter' },
  { label: 'Párna', price: 22900, description: 'Egy darab születési párna' },
  { label: 'Párna + Poszter', price: 29900, description: 'Párna és poszter csomag' },
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
  const [selectedVariant, setSelectedVariant] = useState(0);

  const isGiftCard = product.category === 'giftcard';

  const handleBirthDataSubmit = (data: BirthData) => {
    setBirthData(data);
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

    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity: 1,
      babyName: birthData.babyName,
      birthDate: birthData.birthDate,
      birthWeight: birthData.birthWeight,
      birthHeight: birthData.birthHeight,
      birthTime: birthData.birthTime,
      customNote: birthData.customNote,
    });

    setAdded(true);
  };

  // Gift card flow
  if (isGiftCard) {
    if (added) {
      return (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center space-y-3">
          <div className="text-2xl">&#10003;</div>
          <p className="text-green-800 font-medium text-lg">
            Hozzáadva a kosárhoz!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button
              variant="outline"
              onClick={() => setAdded(false)}
            >
              További vásárlás
            </Button>
            <Button href="/kosar">Kosár megtekintése</Button>
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
        <Button onClick={handleAddToCart} className="w-full">
          Kosárba – {formatPrice(giftCardVariants[selectedVariant].price)}
        </Button>
      </div>
    );
  }

  // Standard product flow (pillow/poster)
  return (
    <div className="space-y-6">
      {!birthData ? (
        <BirthDataForm onSubmit={handleBirthDataSubmit} />
      ) : !added ? (
        <div className="space-y-4">
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

          <Button onClick={handleAddToCart} className="w-full">
            Kosárba
          </Button>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center space-y-3">
          <div className="text-2xl">&#10003;</div>
          <p className="text-green-800 font-medium text-lg">
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
            <Button href="/kosar">Kosár megtekintése</Button>
          </div>
        </div>
      )}
    </div>
  );
}
