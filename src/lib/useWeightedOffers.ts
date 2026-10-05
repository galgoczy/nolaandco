'use client';

import { useEffect, useState } from 'react';
import type { WeightedOffer } from './weightedPillow';

/**
 * A súlyarányos párna aktuális ajánlata a megadott termékekre. null, amíg
 * tölt (vagy ha nincs párna). A kosár és a pénztár ezzel ellenőrzi újra a
 * tételeket és frissíti az árat, ha az admin közben módosította.
 */
export function useWeightedOffers(productIds: string[]): Record<string, WeightedOffer | null> | null {
  const key = Array.from(new Set(productIds)).sort().join(',');
  const [offers, setOffers] = useState<Record<string, WeightedOffer | null> | null>(null);

  useEffect(() => {
    if (!key) {
      setOffers(null);
      return;
    }
    let cancelled = false;
    fetch(`/api/weighted-pillow?ids=${encodeURIComponent(key)}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data?.offers) setOffers(data.offers);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [key]);

  return offers;
}
