'use client';

import { formatPrice } from '@/lib/utils';
import {
  LIGHT_DESCRIPTION,
  LIGHT_LABEL,
  PREORDER_LABEL,
  VARIANT_QUESTION,
  WEIGHTED_FREE_PARCEL,
  WEIGHTED_LABEL,
  weightedDescription,
  type WeightedOffer,
} from '@/lib/weightedPillow';

/**
 * Változatválasztó az emlékpárna termékoldalán: méretarányos, könnyű vagy
 * méret- és súlyarányos (előrendelés). A súlyarányos nincs előre kiválasztva.
 */
export default function PillowVariantChoice({
  weighted,
  onChange,
  offer,
  lightPrice,
}: {
  weighted: boolean;
  onChange: (weighted: boolean) => void;
  offer: WeightedOffer;
  lightPrice: number;
}) {
  const option = (active: boolean) =>
    `w-full text-left rounded-2xl p-4 border-2 transition-all ${
      active ? 'border-[#C4A591] bg-[#faf6f1]' : 'border-transparent bg-surface-container hover:bg-surface-container-low'
    }`;
  const preorder = offer.status === 'preorder';

  return (
    <fieldset className="space-y-3">
      <legend className="text-lg font-bold text-carbon mb-3">{VARIANT_QUESTION}</legend>

      <button type="button" role="radio" aria-checked={!weighted} onClick={() => onChange(false)} className={option(!weighted)}>
        <div className="flex items-start justify-between gap-4">
          <span className="font-medium text-carbon">{LIGHT_LABEL}</span>
          <span className="font-bold text-carbon whitespace-nowrap">{formatPrice(lightPrice)}</span>
        </div>
        <p className="text-sm text-carbon-light mt-1">{LIGHT_DESCRIPTION}</p>
      </button>

      <button
        type="button"
        role="radio"
        aria-checked={weighted}
        onClick={() => onChange(true)}
        className={`${option(weighted)} ${weighted ? '' : 'ring-1 ring-[#7A4A5A]/25'}`}
      >
        <span
          className="inline-block mb-2 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-widest text-white shadow-sm"
          style={{ backgroundColor: '#7A4A5A' }}
        >
          Újdonság
        </span>
        <div className="flex items-start justify-between gap-4">
          <span className="font-bold text-carbon">
            {WEIGHTED_LABEL}
            {preorder && (
              <span className="ml-2 inline-block align-middle px-2 py-0.5 rounded-full bg-[#C4A591] text-white text-[11px] font-semibold uppercase tracking-wide">
                {PREORDER_LABEL}
              </span>
            )}
          </span>
          <span className="font-bold text-carbon whitespace-nowrap">{formatPrice(offer.price)}</span>
        </div>
        <p className="text-sm font-medium text-[#7A4A5A] mt-1">{WEIGHTED_FREE_PARCEL}</p>
        <p className="text-sm text-carbon-light mt-1">{weightedDescription(offer.maxGrams)}</p>
      </button>

      {weighted && offer.info && (
        <div className="text-sm text-carbon bg-surface-container-low rounded-xl p-4">
          <p className="font-medium mb-1">{preorder ? 'Előrendelés – várható elkészítés és feladás' : 'Elkészítés és feladás'}</p>
          <p className="text-carbon-light whitespace-pre-line">{offer.info}</p>
        </div>
      )}
    </fieldset>
  );
}
