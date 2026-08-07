/**
 * Kompakt bizalom-sáv a termékoldali vásárlási gomb közelébe.
 * A prémium ár indoklását hozza a döntés helyére, terméktípus szerint.
 */
const HANDMADE = [
  'OEKO-TEX alapanyagok',
  'Kézzel készült magyar termék',
  'Gyártási idő: kb. 2 hét',
  'Biztonságos kártyás fizetés',
];

const BY_CATEGORY: Record<string, string[]> = {
  pillow: HANDMADE,
  cape: HANDMADE,
  crown: HANDMADE,
  bundle: HANDMADE,
  babytextile: HANDMADE,
  poster: [
    '200 g-os silk felületű művészi papír',
    '50×70 cm-es méret',
    'Gyártási idő: kb. 2 hét',
    'Biztonságos kártyás fizetés',
  ],
};

export default function TrustBar({
  category,
  items: custom,
  className = '',
}: {
  category?: string | null;
  /** Termékenként adminból szerkesztett sorok; üres tömb = kategória-alapértelmezés. */
  items?: string[] | null;
  className?: string;
}) {
  const items =
    custom && custom.length > 0 ? custom : (category && BY_CATEGORY[category]) || HANDMADE;
  return (
    <ul
      className={`flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-carbon-light/80 font-body ${className}`}
    >
      {items.map((item, i) => (
        <li key={item} className="flex items-center gap-3">
          {i > 0 && <span aria-hidden className="text-carbon-light/30">•</span>}
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="text-cta">✓</span>
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}
