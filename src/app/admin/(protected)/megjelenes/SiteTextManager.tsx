'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { SiteTextSlot } from '@/lib/siteTexts';

type Props = {
  slots: SiteTextSlot[];
  /** key → admin által mentett érték (csak a felülírt slotok). */
  overrides: Record<string, string>;
};

/**
 * A főoldali blokkok szövegeinek szerkesztése, blokkonkénti mentéssel. Az
 * üresen hagyott mező az alapértelmezett (kódbeli) szöveget jelenti — az a
 * mező alatt mindig látható.
 */
export default function SiteTextManager({ slots, overrides }: Props) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(overrides);
  const [savingGroup, setSavingGroup] = useState<string | null>(null);
  const [savedGroup, setSavedGroup] = useState<string | null>(null);
  const [error, setError] = useState('');

  const groups = Array.from(new Set(slots.map((s) => s.group)));

  async function saveGroup(group: string) {
    setSavingGroup(group);
    setSavedGroup(null);
    setError('');
    const entries = slots
      .filter((s) => s.group === group)
      .map((s) => ({ key: s.key, value: values[s.key] ?? '' }));
    const res = await fetch('/api/admin/site-texts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries }),
    });
    setSavingGroup(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Mentés sikertelen');
      return;
    }
    setSavedGroup(group);
    setTimeout(() => setSavedGroup((g) => (g === group ? null : g)), 2500);
    router.refresh();
  }

  const inputCls =
    'w-full px-3 py-2 rounded-lg border border-outline-variant bg-white text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30';

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}
      {groups.map((group) => (
        <section key={group} className="bg-surface-container-lowest rounded-2xl p-6">
          <h2 className="text-lg font-headline font-bold mb-4">{group}</h2>
          <div className="flex flex-col gap-4">
            {slots
              .filter((s) => s.group === group)
              .map((slot) => (
                <div key={slot.key}>
                  <label className="block text-xs font-body text-on-surface/70 mb-1">
                    {slot.label}
                  </label>
                  {slot.multiline ? (
                    <textarea
                      className={inputCls}
                      rows={Math.min(6, Math.max(2, Math.ceil(slot.defaultValue.length / 90)))}
                      value={values[slot.key] ?? ''}
                      placeholder={slot.defaultValue}
                      onChange={(e) =>
                        setValues((prev) => ({ ...prev, [slot.key]: e.target.value }))
                      }
                    />
                  ) : (
                    <input
                      type="text"
                      className={inputCls}
                      value={values[slot.key] ?? ''}
                      placeholder={slot.defaultValue}
                      onChange={(e) =>
                        setValues((prev) => ({ ...prev, [slot.key]: e.target.value }))
                      }
                    />
                  )}
                </div>
              ))}
          </div>
          <div className="flex items-center gap-3 mt-4">
            <button
              type="button"
              onClick={() => saveGroup(group)}
              disabled={savingGroup === group}
              className="bg-primary text-on-primary px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              {savingGroup === group ? 'Mentés...' : 'Blokk mentése'}
            </button>
            {savedGroup === group && <span className="text-sm text-green-700">Mentve ✓</span>}
          </div>
        </section>
      ))}
      <p className="text-xs text-on-surface/50">
        Az üresen hagyott mező az eredeti (beépített) szöveget jelenti — ez a mezőben halványan
        látható. Többsoros mezőknél az új sor sortörésként jelenik meg, a **szöveg** pedig
        félkövérként.
      </p>
    </div>
  );
}
