'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatGrams, type WeightedConfig, type WeightedStatus } from '@/lib/weightedPillow';

const STATUS_LABELS: Record<WeightedStatus, string> = {
  preorder: 'Előrendelhető',
  available: 'Rendelhető',
  unavailable: 'Nem rendelhető',
};

/** Méret- és súlyarányos párna: központi beállítások. */
export default function WeightedSettings({
  initial,
  pillows,
  problems,
}: {
  initial: WeightedConfig;
  /** Párnánkénti állapot: engedélyezve-e, és milyen maximummal. */
  pillows: { name: string; enabled: boolean; maxOverride: number | null; slug: string; id: string; series: string }[];
  /** Miért nem rendelhető most (üres = rendben). */
  problems: string[];
}) {
  const router = useRouter();
  const [maxGrams, setMaxGrams] = useState(initial.maxGrams?.toString() ?? '');
  const [price, setPrice] = useState(initial.price?.toString() ?? '');
  const [status, setStatus] = useState<WeightedStatus>(initial.status);
  const [info, setInfo] = useState(initial.info);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Párnafajták (sorozatok) — egy kattintással az összes párnájukon.
  const seriesList = Array.from(new Set(pillows.map((p) => p.series))).sort();
  const [seriesSaving, setSeriesSaving] = useState<string | null>(null);
  async function toggleSeries(series: string, enabled: boolean) {
    setSeriesSaving(series);
    setMessage('');
    try {
      const res = await fetch('/api/admin/settings/weighted/series', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ series, enabled }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setMessage('A fajta mentése nem sikerült, próbáld újra.');
    } finally {
      setSeriesSaving(null);
    }
  }

  async function save() {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/settings/weighted', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxGrams: maxGrams.trim(), price: price.trim(), status, info }),
      });
      if (!res.ok) throw new Error();
      setMessage('Mentve.');
      router.refresh();
    } catch {
      setMessage('A mentés nem sikerült, próbáld újra.');
    } finally {
      setSaving(false);
    }
  }

  const input = 'w-full bg-surface-container rounded-lg px-3 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30';

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-6 max-w-2xl mt-6">
      <h2 className="font-headline font-bold text-on-surface mb-1">Méret- és súlyarányos párna</h2>
      <p className="text-sm text-on-surface/60 font-body leading-relaxed mb-4">
        Ezek az értékek érvényesek a termékoldalon, a kosárban, a pénztárban és a szerveroldali
        ellenőrzésben. A párnánkénti engedélyezés és súlymaximum-felülírás a termék szerkesztőoldalán
        állítható. A már leadott rendeléseket a módosítás nem írja át.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="text-sm text-on-surface">
          Maximális vállalt súly (g)
          <input className={input} inputMode="numeric" value={maxGrams} onChange={(e) => setMaxGrams(e.target.value.replace(/\D/g, ''))} />
        </label>
        <label className="text-sm text-on-surface">
          Ár (teljes ár, Ft)
          <input className={input} inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ''))} />
        </label>
        <label className="text-sm text-on-surface sm:col-span-2">
          Rendelhetőség
          <select className={input} value={status} onChange={(e) => setStatus(e.target.value as WeightedStatus)}>
            {(Object.keys(STATUS_LABELS) as WeightedStatus[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-on-surface sm:col-span-2">
          Várható elkészítési és feladási tájékoztató (a vásárló ezt látja és ezt kapja meg a visszaigazolásban)
          <textarea className={`${input} min-h-[90px]`} value={info} onChange={(e) => setInfo(e.target.value)} />
        </label>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="px-5 py-2 rounded-full bg-primary text-white text-sm font-medium disabled:opacity-50"
        >
          Mentés
        </button>
        {message && <span className="text-sm text-on-surface/70">{message}</span>}
      </div>

      {problems.length > 0 ? (
        <ul className="mt-4 text-sm text-amber-800 bg-amber-50 rounded-xl p-3 space-y-1">
          {problems.map((p) => (
            <li key={p}>⚠ {p}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-green-700">A vásárlók rendelhetik az engedélyezett párnáknál.</p>
      )}

      <h3 className="mt-6 text-sm font-bold text-on-surface">Fajtánként</h3>
      <p className="text-xs text-on-surface/60 mt-1">
        A kapcsoló a fajta összes párnáján be- vagy kikapcsolja a súlyarányos változatot. Egyenként a
        termék szerkesztőoldalán módosítható.
      </p>
      <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
        {seriesList.map((series) => {
          const group = pillows.filter((p) => p.series === series);
          const on = group.filter((p) => p.enabled).length;
          const all = on === group.length;
          return (
            <label
              key={series}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm cursor-pointer ${
                on > 0 ? 'bg-green-50 text-green-800' : 'bg-surface-container text-on-surface/70'
              }`}
            >
              <input
                type="checkbox"
                checked={all}
                ref={(el) => {
                  if (el) el.indeterminate = on > 0 && !all;
                }}
                disabled={seriesSaving !== null}
                onChange={() => toggleSeries(series, !all)}
              />
              <span>
                <span className="font-bold uppercase tracking-wide">{series || '—'}</span>
                <span className="block text-xs">
                  {on}/{group.length} párna
                </span>
              </span>
            </label>
          );
        })}
      </div>

      <h3 className="mt-6 text-sm font-bold text-on-surface">Párnák</h3>
      <ul className="mt-2 text-sm text-on-surface/80 space-y-1">
        {pillows.map((p) => (
          <li key={p.id} className="flex justify-between gap-4">
            <a href={`/admin/termekek/${p.id}`} className="hover:underline">
              {p.name}
            </a>
            <span className={p.enabled ? 'text-green-700' : 'text-on-surface/50'}>
              {p.enabled
                ? `engedélyezve${p.maxOverride ? ` · max. ${formatGrams(p.maxOverride)} g (egyedi)` : ''}`
                : 'nincs engedélyezve'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
