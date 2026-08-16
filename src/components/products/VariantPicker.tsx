'use client';

export type PickerVariant = {
  id: string;
  name: string;
  colorHex: string | null;
  colorHex2: string | null;
  stock: number | null;
};

/**
 * Feliratozott szín-swatch választó — szándékosan nem legördülő lista, hogy az
 * összes elérhető változat egy pillantással látható legyen. Két színkód esetén
 * a swatch átlósan kettéosztott (kétoldalas színpárosítás).
 */
export default function VariantPicker({
  label,
  variants,
  selectedId,
  onSelect,
}: {
  label: string;
  variants: PickerVariant[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (variants.length === 0) return null;

  return (
    <div className="space-y-3">
      <p className="text-xs uppercase tracking-[0.14em] text-carbon-light/70">{label}</p>
      <div className="flex flex-wrap gap-2.5">
        {variants.map((v) => {
          const soldOut = v.stock !== null && v.stock <= 0;
          const selected = v.id === selectedId;
          const background =
            v.colorHex && v.colorHex2
              ? `linear-gradient(135deg, ${v.colorHex} 0 50%, ${v.colorHex2} 50% 100%)`
              : (v.colorHex ?? '#E5D9C7');
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => onSelect(v.id)}
              disabled={soldOut}
              aria-pressed={selected}
              className={`group flex items-center gap-2.5 pl-1.5 pr-3.5 py-1.5 rounded-full border text-sm transition-all ${
                selected
                  ? 'border-cta bg-cta/5 text-carbon shadow-sm'
                  : 'border-outline-variant text-carbon-light hover:border-carbon-light'
              } ${soldOut ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <span
                aria-hidden
                className={`w-6 h-6 rounded-full flex-shrink-0 ring-1 ring-inset ring-black/10 ${
                  selected ? 'outline outline-2 outline-offset-2 outline-cta' : ''
                }`}
                style={{ background }}
              />
              <span className="font-body whitespace-nowrap">
                {v.name}
                {soldOut && <span className="text-xs"> — elfogyott</span>}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
