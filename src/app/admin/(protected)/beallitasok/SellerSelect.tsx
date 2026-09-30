'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Option = { value: 'auto' | 'gergely' | 'kriszti'; label: string; hint: string };

/** Aktív eladó: ő szerződik, ő számláz és ő az adatkezelő az új rendeléseknél. */
export default function SellerSelect({
  initial,
  activeName,
  options,
  keyStatus,
}: {
  initial: Option['value'];
  activeName: string;
  options: Option[];
  /** Be van-e állítva a Számla Agent kulcs az adott eladónak (csak igen/nem). */
  keyStatus: { name: string; ok: boolean }[];
}) {
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function save(next: Option['value']) {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/settings/seller', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setting: next }),
      });
      if (!res.ok) throw new Error();
      setValue(next);
      router.refresh();
    } catch {
      setError('A mentés nem sikerült, próbáld újra.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-6 max-w-2xl mt-6">
      <h2 className="font-headline font-bold text-on-surface mb-1">Eladó (szerződő és számlázó)</h2>
      <p className="text-sm text-on-surface/60 font-body leading-relaxed mb-4">
        Az új rendelések ennek a vállalkozásnak a nevében jönnek létre, a számlát az ő Számlázz.hu
        fiókja állítja ki, és az ÁSZF impresszuma, illetve az adatkezelési tájékoztató is őt mutatja. A
        már leadott rendelések eladója nem változik.
      </p>
      <div className="space-y-2">
        {options.map((o) => (
          <label key={o.value} className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="seller"
              checked={value === o.value}
              disabled={saving}
              onChange={() => save(o.value)}
              className="mt-1"
            />
            <span>
              <span className="text-sm font-medium text-on-surface">{o.label}</span>
              <span className="block text-xs text-on-surface/60">{o.hint}</span>
            </span>
          </label>
        ))}
      </div>
      <p className="mt-4 text-sm font-medium text-green-700">Most aktív: {activeName}</p>
      <ul className="mt-3 text-xs text-on-surface/60 space-y-0.5">
        {keyStatus.map((k) => (
          <li key={k.name}>
            {k.ok ? '✓' : '✗'} {k.name} Számla Agent kulcsa {k.ok ? 'beállítva' : 'HIÁNYZIK a Vercelben'}
          </li>
        ))}
      </ul>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
