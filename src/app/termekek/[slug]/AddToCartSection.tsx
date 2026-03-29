'use client';

import { useState } from 'react';
import Link from 'next/link';
import BirthDataForm from '@/components/products/BirthDataForm';
import Button from '@/components/ui/Button';
import { useCartStore } from '@/store/cart';
import type { BirthData } from '@/lib/validators';

interface Props {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    imageUrl: string;
  };
}

export default function AddToCartSection({ product }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const [birthData, setBirthData] = useState<BirthData | null>(null);
  const [added, setAdded] = useState(false);

  const handleBirthDataSubmit = (data: BirthData) => {
    setBirthData(data);
  };

  const handleAddToCart = () => {
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

  return (
    <div className="space-y-6">
      {!birthData ? (
        <BirthDataForm onSubmit={handleBirthDataSubmit} />
      ) : !added ? (
        <div className="space-y-4">
          <div className="bg-[#faf6f1] rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-carbon mb-3">Szemelyre szabas</h3>
            <div className="text-sm text-carbon-light space-y-1">
              <p>
                <span className="font-medium text-carbon">Baba neve:</span>{' '}
                {birthData.babyName}
              </p>
              <p>
                <span className="font-medium text-carbon">Szuletesi datum:</span>{' '}
                {birthData.birthDate}
              </p>
              <p>
                <span className="font-medium text-carbon">Suly:</span>{' '}
                {birthData.birthWeight}
              </p>
              <p>
                <span className="font-medium text-carbon">Hossz:</span>{' '}
                {birthData.birthHeight}
              </p>
              {birthData.birthTime && (
                <p>
                  <span className="font-medium text-carbon">Idopont:</span>{' '}
                  {birthData.birthTime}
                </p>
              )}
            </div>
            <button
              onClick={() => setBirthData(null)}
              className="text-sm text-primary underline mt-3"
            >
              Modositas
            </button>
          </div>

          <Button onClick={handleAddToCart} className="w-full">
            Kosarba
          </Button>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center space-y-3">
          <div className="text-2xl">&#10003;</div>
          <p className="text-green-800 font-medium text-lg">
            Hozzaadva a kosarhoz!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setBirthData(null);
                setAdded(false);
              }}
            >
              Tovabbi vasarlas
            </Button>
            <Button href="/kosar">Kosar megtekintese</Button>
          </div>
        </div>
      )}
    </div>
  );
}
