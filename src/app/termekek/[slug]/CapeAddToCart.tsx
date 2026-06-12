'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useCartStore } from '@/store/cart';
import {
  DESIGNER_FIELDS,
  BUNDLE_FIELDS,
  BUNDLE_CAPE_FIELD_KEY,
  BUNDLE_INITIAL_CHOICES,
  type CapeConfig,
} from './capeData';

interface Props {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    imageUrl: string;
  };
  config: CapeConfig;
}

/**
 * Add-to-cart flow for the Nagytesó kollekció (capes + crowns).
 * Personalization (initial letter, designer choices) is stored on the cart
 * item's customNote so it flows through checkout onto the OrderItem.
 */
export default function CapeAddToCart({ product, config }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const [initial, setInitial] = useState('');
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [added, setAdded] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (added) {
      setFading(false);
      const timer = setTimeout(() => setFading(true), 500);
      return () => clearTimeout(timer);
    }
  }, [added]);

  // Dropdown fields of the product (designer cape: 7, bundle: 2, otherwise none).
  const fields = config.designer ? DESIGNER_FIELDS : config.bundle ? BUNDLE_FIELDS : [];

  // The bundle only takes an initial letter when the chosen cape has one
  // (Crew comes with the TESÓ shield instead).
  const showInitial = Boolean(
    config.initialLabel &&
      (!config.bundle || BUNDLE_INITIAL_CHOICES.includes(selections[BUNDLE_CAPE_FIELD_KEY] ?? ''))
  );

  const handleAddToCart = () => {
    const newErrors: Record<string, string> = {};

    if (showInitial && !initial.trim()) {
      newErrors.initial = 'Kötelező mező';
    }
    for (const field of fields) {
      if (!selections[field.key]) newErrors[field.key] = 'Kérlek válassz!';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    const noteParts: string[] = [];
    for (const field of fields) {
      noteParts.push(`${field.label}: ${selections[field.key]}`);
    }
    if (showInitial && config.initialLabel) {
      noteParts.push(`${config.initialLabel}: ${initial.trim().toUpperCase()}`);
    }

    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity: 1,
      babyName: '',
      birthDate: '',
      birthWeight: '',
      birthHeight: '',
      customNote: noteParts.join('\n'),
    });
    setAdded(true);
  };

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
          <Button variant="outline" onClick={() => setAdded(false)}>
            További vásárlás
          </Button>
          <Button variant="secondary" href="/kosar">Kosár megtekintése</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {fields.length > 0 && (
        <div className="bg-[#faf6f1] rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-carbon">
            {config.bundle ? 'Állítsd össze a szetted' : 'Tervezd meg a köpenyed'}
          </h3>
          {fields.map((field) => (
            <div key={field.key} className="flex flex-col gap-1">
              <label htmlFor={`cape-${field.key}`} className="text-carbon-light text-sm font-body">
                {field.label} *
              </label>
              <select
                id={`cape-${field.key}`}
                value={selections[field.key] ?? ''}
                onChange={(e) => {
                  setSelections((prev) => ({ ...prev, [field.key]: e.target.value }));
                  setErrors((prev) => ({ ...prev, [field.key]: '' }));
                }}
                className={`bg-surface-container rounded-[0.75rem] px-4 py-3 text-carbon font-body outline-none transition-colors focus:ring-2 focus:ring-primary/30 ${
                  errors[field.key] ? 'ring-2 ring-red-400' : ''
                }`}
              >
                <option value="" disabled>
                  Válassz...
                </option>
                {field.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {errors[field.key] && (
                <span className="text-red-500 text-xs mt-0.5">{errors[field.key]}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {showInitial && (
        <div className={fields.length > 0 ? '' : 'bg-[#faf6f1] rounded-2xl p-6 shadow-sm'}>
          {fields.length === 0 && (
            <h3 className="text-lg font-bold text-carbon mb-3">Személyre szabás</h3>
          )}
          <Input
            label={`${config.initialLabel} *`}
            name="capeInitial"
            value={initial}
            maxLength={3}
            placeholder="pl. A"
            error={errors.initial || undefined}
            onChange={(e) => {
              setInitial(e.target.value);
              setErrors((prev) => ({ ...prev, initial: '' }));
            }}
          />
        </div>
      )}

      <Button variant="secondary" onClick={handleAddToCart} className="w-full">
        Kosárba
      </Button>
    </div>
  );
}
