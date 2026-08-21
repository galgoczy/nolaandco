'use client';

import { useEffect } from 'react';
import { trackViewContent } from '@/lib/metaPixel';

/**
 * Termékoldal-megtekintés jelzése a Meta Pixelnek. Külön komponens, mert a
 * termékoldal szerveren renderelődik, az esemény viszont a böngészőben kell
 * hogy elinduljon.
 */
export default function ProductViewTracker({
  id,
  name,
  price,
  category,
}: {
  id: string;
  name: string;
  price: number;
  category?: string | null;
}) {
  useEffect(() => {
    trackViewContent({ id, name, price, category });
  }, [id, name, price, category]);

  return null;
}
