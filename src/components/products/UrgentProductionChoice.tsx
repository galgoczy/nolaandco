'use client';

import { formatPrice } from '@/lib/utils';
import {
  NORMAL_DURATION,
  NORMAL_LABEL,
  URGENT_DURATION,
  URGENT_EXTRA_FEE,
  URGENT_FIRST_FEE,
  URGENT_LABEL,
} from '@/lib/urgentProduction';

/**
 * Elkészítési mód választása az emlékpárna termékoldalán: normál (kb. 1 hét)
 * vagy sürgős (2–3 munkanap, felárral). A felár a kosár tartalmától függ —
 * ha már van sürgős párna a kosárban, a következő csak +2 000 Ft.
 */
export default function UrgentProductionChoice({
  value,
  onChange,
  enabled,
  nextFee,
  basePrice,
}: {
  value: boolean;
  onChange: (urgent: boolean) => void;
  /** null: még tölt; false: az admin kikapcsolta (nincs szabad kapacitás). */
  enabled: boolean | null;
  /** Ennyivel nő a rendelés, ha ez a párna sürgős (4 000 vagy 2 000 Ft). */
  nextFee: number;
  basePrice: number;
}) {
  const urgentDisabled = enabled !== true;
  const option = (active: boolean) =>
    `w-full text-left rounded-2xl p-4 border-2 transition-all ${
      active ? 'border-[#C4A591] bg-[#faf6f1]' : 'border-transparent bg-surface-container hover:bg-surface-container-low'
    }`;

  return (
    <fieldset className="space-y-3">
      <legend className="text-lg font-bold text-carbon mb-3">Elkészítési idő</legend>

      <button type="button" role="radio" aria-checked={!value} onClick={() => onChange(false)} className={option(!value)}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="font-medium text-carbon">{NORMAL_LABEL}</span>
            <p className="text-sm text-carbon-light mt-0.5">{NORMAL_DURATION}</p>
          </div>
          <span className="text-sm text-carbon-light whitespace-nowrap">az árban</span>
        </div>
      </button>

      <button
        type="button"
        role="radio"
        aria-checked={value}
        aria-disabled={urgentDisabled}
        disabled={urgentDisabled}
        onClick={() => onChange(true)}
        className={`${option(value)} disabled:opacity-60 disabled:cursor-not-allowed`}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="font-medium text-carbon">{URGENT_LABEL}</span>
            <p className="text-sm text-carbon-light mt-0.5">{URGENT_DURATION}</p>
          </div>
          <span className="font-bold text-carbon whitespace-nowrap">+{formatPrice(nextFee)}</span>
        </div>
        {enabled === false && (
          <p className="text-xs text-carbon-light mt-2">
            Jelenleg nem választható — a műhely szabad kapacitása most betelt.
          </p>
        )}
      </button>

      {value && enabled === true && (
        <div className="text-sm text-carbon-light bg-surface-container-low rounded-xl p-4 space-y-1.5">
          <p>
            A párnád {URGENT_DURATION} alatt elkészül. A szállítás ideje ezen felül értendő. Szabad
            kapacitás függvényében választható.
          </p>
          <p className="text-xs">
            +{formatPrice(URGENT_FIRST_FEE)} az első párnára, +{formatPrice(URGENT_EXTRA_FEE)} minden további
            sürgős párnára egy rendelésen belül.
          </p>
        </div>
      )}

      <p className="text-sm text-carbon">
        Ár ezzel a választással:{' '}
        <span className="font-bold">{formatPrice(basePrice + (value ? nextFee : 0))}</span>
      </p>
    </fieldset>
  );
}
