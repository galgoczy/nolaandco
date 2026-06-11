'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/store/cart';
import { formatPrice } from '@/lib/utils';
import Button from '@/components/ui/Button';

export default function KosarPage() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const total = useCartStore((s) => s.total);

  // Hydration guard for persisted zustand store
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <section className="py-24 bg-surface min-h-screen">
        <div className="max-w-4xl mx-auto px-8">
          <h1 className="text-4xl md:text-6xl montserrat-light-caps text-carbon mb-12 text-center">
            KOSÁR
          </h1>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="py-24 bg-surface min-h-screen">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h1 className="text-4xl md:text-6xl montserrat-light-caps text-carbon mb-12">
            KOSÁR
          </h1>
          <p className="text-carbon-light text-lg mb-8">A kosarad üres.</p>
          <Button variant="secondary" href="/termekek">Termékek böngészése</Button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-surface min-h-screen">
      <div className="max-w-4xl mx-auto px-8">
        <h1 className="text-4xl md:text-6xl montserrat-light-caps text-carbon mb-12 text-center">
          KOSÁR
        </h1>

        <div className="space-y-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-4 md:p-6 shadow-sm ghost-border flex flex-col sm:flex-row gap-4 items-start sm:items-center"
            >
              {/* Image */}
              <Link
                href={`/termekek/${item.slug}`}
                className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-surface-container-low"
              >
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </Link>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link
                  href={`/termekek/${item.slug}`}
                  className="text-base font-medium text-carbon hover:text-primary transition-colors"
                >
                  {item.name}
                </Link>
                <p className="text-sm text-carbon-light mt-0.5">
                  {item.babyName} &middot; {item.birthDate}
                </p>
                {item.posterLayoutLabel && (
                  <p className="text-xs text-carbon-light/80 mt-0.5">
                    Dizájn: {item.posterLayoutLabel}
                  </p>
                )}
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center text-carbon-light hover:bg-surface-container transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Mennyiség csökkentése"
                >
                  &minus;
                </button>
                <span className="w-8 text-center text-sm font-medium text-carbon">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center text-carbon-light hover:bg-surface-container transition-colors"
                  aria-label="Mennyiség növelése"
                >
                  +
                </button>
              </div>

              {/* Price */}
              <div className="text-right min-w-[90px]">
                <p className="font-medium text-carbon">
                  {formatPrice(item.price * item.quantity)}
                </p>
                {item.quantity > 1 && (
                  <p className="text-xs text-carbon-light">
                    {formatPrice(item.price)} / db
                  </p>
                )}
              </div>

              {/* Remove */}
              <button
                onClick={() => removeItem(item.id)}
                className="p-2 text-carbon-light hover:text-red-500 transition-colors"
                aria-label="Termék eltávolítása"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-10 bg-white rounded-2xl p-6 md:p-8 shadow-sm ghost-border">
          <div className="space-y-3">
            <div className="flex justify-between text-carbon">
              <span>Részösszeg</span>
              <span className="font-medium">{formatPrice(total())}</span>
            </div>
            <div className="flex justify-between text-carbon-light text-sm">
              <span>Szállítási költség</span>
              <span>számítás a pénztárban</span>
            </div>
            <div className="border-t border-outline-variant pt-3 flex justify-between text-lg font-bold text-carbon">
              <span>Összesen</span>
              <span>{formatPrice(total())}</span>
            </div>
          </div>

          <div className="mt-6">
            <Button variant="secondary" href="/penztar" className="w-full">
              Tovább a pénztárhoz
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
