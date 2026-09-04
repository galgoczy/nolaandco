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
}: {
  orderId: string;
  value: number;
}) {
  useEffect(() => {
    trackPurchase({ orderId, value });
  }, [orderId, value]);

  return null;
}
