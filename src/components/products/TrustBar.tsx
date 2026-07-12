/**
 * Kompakt bizalom-sáv a termékoldali vásárlási gomb közelébe.
 * A prémium ár indoklását hozza a döntés helyére.
 */
const ITEMS = [
  'OEKO-TEX®',
  'Kézzel varrjuk Budapesten',
  'Gyártási idő kb. 2 hét',
  'Biztonságos kártyás fizetés',
];

export default function TrustBar({ className = '' }: { className?: string }) {
  return (
    <ul
      className={`flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-carbon-light/80 font-body ${className}`}
    >
      {ITEMS.map((item, i) => (
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
