'use client';

import { useEffect } from 'react';
import { trackMetaEvent } from '@/lib/metaPixel';

interface Props {
  orderId: string;
  total: number;
  items: Array<{ productId: string; quantity: number }>;
}

const STORAGE_PREFIX = 'nola_fb_purchase_';

export default function PurchaseTracker({ orderId, total, items }: Props) {
  useEffect(() => {
    // Avoid re-firing Purchase on a page refresh of the same order.
    const key = `${STORAGE_PREFIX}${orderId}`;
    try {
      if (window.sessionStorage.getItem(key)) return;
      window.sessionStorage.setItem(key, '1');
    } catch {
      // Storage may be unavailable (private mode); fall through and still fire.
    }

    trackMetaEvent('Purchase', {
      value: total,
      currency: 'HUF',
      content_ids: items.map((item) => item.productId),
      content_type: 'product',
      contents: items.map((item) => ({ id: item.productId, quantity: item.quantity })),
      num_items: items.reduce((sum, item) => sum + item.quantity, 0),
    });
  }, [orderId, total, items]);

  return null;
}
