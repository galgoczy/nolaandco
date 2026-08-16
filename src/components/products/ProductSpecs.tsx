/**
 * Termékadat-lap: anyagösszetétel, méret, gyártási idő és ápolási információk.
 * Minden mező adminból szerkeszthető és opcionális — üres mező nem jelenik meg,
 * és ha egyik sincs kitöltve, a blokk sem renderelődik.
 */
export type ProductSpecData = {
  material?: string | null;
  size?: string | null;
  productionTime?: string | null;
  careInfo?: string | null;
};

export default function ProductSpecs({
  specs,
  className = '',
}: {
  specs: ProductSpecData;
  className?: string;
}) {
  const rows: { label: string; value: string }[] = [];
  if (specs.material?.trim()) rows.push({ label: 'Anyagösszetétel', value: specs.material.trim() });
  if (specs.size?.trim()) rows.push({ label: 'Méret', value: specs.size.trim() });
  if (specs.productionTime?.trim())
    rows.push({ label: 'Gyártási idő', value: specs.productionTime.trim() });
  if (specs.careInfo?.trim())
    rows.push({ label: 'Ápolás és kezelés', value: specs.careInfo.trim() });

  if (rows.length === 0) return null;

  return (
    <dl
      className={`divide-y divide-outline-variant/40 border-y border-outline-variant/40 ${className}`}
    >
      {rows.map((row) => (
        <div key={row.label} className="py-3 sm:flex sm:gap-6">
          <dt className="text-xs uppercase tracking-[0.14em] text-carbon-light/70 sm:w-44 sm:flex-shrink-0 sm:pt-0.5">
            {row.label}
          </dt>
          <dd className="text-sm text-[#4A4A4A] leading-relaxed mt-1 sm:mt-0">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
