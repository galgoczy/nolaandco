'use client';

import { usePillowVariantStore } from '@/store/pillowVariant';

/**
 * Termékleírás, amely a választott párnaváltozat szerint vált (oldalújratöltés
 * nélkül). Mindkét változat a szerveren renderelt, biztonságos HTML.
 */
export default function VariantText({
  lightHtml,
  weightedHtml,
  initialWeighted,
  className,
}: {
  lightHtml: string;
  weightedHtml: string;
  initialWeighted: boolean;
  className?: string;
}) {
  const selected = usePillowVariantStore((s) => s.weighted);
  const weighted = selected ?? initialWeighted;
  return <div className={className} dangerouslySetInnerHTML={{ __html: weighted ? weightedHtml : lightHtml }} />;
}
