'use client';

import { useEffect } from 'react';
import { trackMetaEvent } from '@/lib/metaPixel';

interface Props {
  productId: string;
  productName: string;
  price: number;
  category?: string | null;
}

export default function ViewContentTracker({ productId, productName, price, category }: Props) {
  useEffect(() => {
    trackMetaEvent('ViewContent', {
      content_ids: [productId],
      content_name: productName,
      content_type: category || 'product',
      value: price,
      currency: 'HUF',
    });
  }, [productId, productName, price, category]);

  return null;
}
