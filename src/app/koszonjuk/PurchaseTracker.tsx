'use client';

import { useEffect } from 'react';
import { trackPurchase } from '@/lib/metaPixel';

/**
 * Sikeres rendelés jelzése a Meta Pixelnek. Ugyanabban az ágban jelenik meg,
 * mint a kosárürítés — tehát csak akkor, ha a rendelés tényleg létrejött.
 * A rendelésenkénti egyszeri küldésről a trackPurchase gondoskodik.
 */
export default function PurchaseTracker({
  orderId,
  value,
  items,
}: {
  orderId: string;
  value: number;
  items: { productId: string; quantity: number }[];
}) {
  useEffect(() => {
    trackPurchase({ orderId, value, items });
    // Az items tömb minden rendereléskor új — a rendelés azonosítója elég kulcsnak.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, value]);

  return null;
}
