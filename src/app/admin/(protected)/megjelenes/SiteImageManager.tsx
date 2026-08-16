'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from '../termekek/ImageUpload';
import type { SiteImageSlot } from '@/lib/siteImages';

type Props = {
  slots: SiteImageSlot[];
  /** key → admin által feltöltött URL (csak a felülírt slotok). */
  overrides: Record<string, string>;
};

/**
 * A statikus szekciók képeinek cseréje. Minden slotnál látszik az aktuális
 * kép; feltöltéskor azonnal mentünk, a "Vissza az eredetire" törli a
 * felülírást és a repóbeli alapértelmezés érvényesül újra.
 */
export default function SiteImageManager({ slots, overrides }: Props) {
  const router = useRouter();
  const [current, setCurrent] = useState<Record<string, string>>(overrides);
  const [error, setError] = useState('');

  async function save(key: string, url: string) {
    setError('');
    const res = await fetch('/api/admin/site-images', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, url }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Mentés sikertelen');
      return;
    }
    setCurrent((prev) => {
      const next = { ...prev };
      if (url) next[key] = url;
      else delete next[key];
      return next;
    });
    router.refresh();
  }

  const groups = Array.from(new Set(slots.map((s) => s.group)));

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}
      {groups.map((group) => (
        <section key={group} className="bg-surface-container-lowest rounded-2xl p-6">
          <h2 className="text-lg font-headline font-bold mb-4">{group}</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {slots
              .filter((s) => s.group === group)
              .map((slot) => {
                const overridden = Boolean(current[slot.key]);
                const shownUrl = current[slot.key] || slot.defaultUrl;
                return (
                  <li key={slot.key} className="flex gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={shownUrl}
                      alt=""
                      className="w-28 h-28 rounded-lg object-cover bg-gray-100 border border-outline-variant flex-shrink-0"
                    />
                    <div className="min-w-0 flex flex-col gap-2">
                      <div>
                        <p className="text-sm font-medium text-on-surface">{slot.label}</p>
                        <p className="text-xs text-on-surface/60">{slot.hint}</p>
                        {overridden && (
                          <p className="text-xs text-green-700 mt-0.5">Egyedi kép beállítva</p>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <ImageUpload
                          label="Kép cseréje"
                          onUploaded={(url) => save(slot.key, url)}
                        />
                        {overridden && (
                          <button
                            type="button"
                            onClick={() => save(slot.key, '')}
                            className="px-3 py-2 rounded-lg text-xs font-medium bg-surface-container hover:bg-surface-container-high"
                          >
                            Vissza az eredetire
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
          </ul>
        </section>
      ))}
    </div>
  );
}
