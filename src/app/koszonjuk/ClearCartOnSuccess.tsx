'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/store/cart';

/**
 * Clears the local cart once the /koszonjuk page confirms an order exists.
 * Rendered only inside the "order found" branch so that users who bounce
 * back from Stripe without completing payment keep their cart intact.
 */
export default function ClearCartOnSuccess() {
  useEffect(() => {
    useCartStore.getState().clearCart();
  }, []);

  return null;
}
