'use client';

import { useState } from 'react';
import {
  URGENT_DURATION,
  URGENT_EXTRA_FEE,
  URGENT_FIRST_FEE,
} from '@/lib/urgentProduction';
import { formatPrice } from '@/lib/utils';

/** Sürgősségi elkészítés ki-be kapcsolója — a műhely szabad kapacitása szerint. */
export default function UrgentToggle({ initial }: { initial: boolean }) {
  const [enabled, setEnabled] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function toggle() {
    const next = !enabled;
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/settings/urgent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: next }),
      });
      if (!res.ok) throw new Error();
      setEnabled(next);
    } catch {
      setError('A mentés nem sikerült, próbáld újra.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-6 max-w-2xl">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h2 className="font-headline font-bold text-on-surface mb-1">Sürgősségi elkészítés (emlékpárnák)</h2>
          <p className="text-sm text-on-surface/60 font-body leading-relaxed">
            Bekapcsolva a vásárlók {URGENT_DURATION} alatti elkészítést kérhetnek a párnákra:{' '}
            {formatPrice(URGENT_FIRST_FEE)} az első, {formatPrice(URGENT_EXTRA_FEE)} minden további
            párnára. Kikapcsolva a termékoldalon „Jelenleg nem választható” jelenik meg, és a pénztár
            sürgős tételt nem fogad el.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={toggle}
          disabled={saving}
          className={`relative inline-flex h-7 w-12 flex-shrink-0 rounded-full transition-colors disabled:opacity-50 ${
            enabled ? 'bg-green-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-6 w-6 mt-0.5 rounded-full bg-white shadow transition-transform ${
              enabled ? 'translate-x-[1.35rem]' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>
      <p className={`mt-4 text-sm font-medium ${enabled ? 'text-green-700' : 'text-on-surface/60'}`}>
        {enabled ? 'Bekapcsolva — rendelhető' : 'Kikapcsolva — nem rendelhető'}
      </p>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
