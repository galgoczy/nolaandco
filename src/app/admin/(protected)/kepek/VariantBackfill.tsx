'use client';

import { useEffect, useState } from 'react';

type Status = { total: number; done: number; remaining: number };

/**
 * Képváltozatok utólagos legyártása a már feltöltött képekhez. Kötegenként
 * hívja az API-t, amíg minden kép kész nincs; a gomb újra nyomható, ha
 * félbeszakadt.
 */
export default function VariantBackfill() {
  const [status, setStatus] = useState<Status | null>(null);
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [error, setError] = useState('');

  async function refresh() {
    const res = await fetch('/api/admin/images/variants');
    if (res.ok) setStatus(await res.json());
  }
  useEffect(() => {
    refresh();
  }, []);

  async function run() {
    setRunning(true);
    setError('');
    try {
      for (let round = 0; round < 60; round++) {
        const res = await fetch('/api/admin/images/variants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ limit: 4 }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error || 'Hiba a gyártás közben.');
          break;
        }
        setStatus({ total: data.total, done: data.done, remaining: data.remaining });
        setLog((l) => [
          ...data.processed.map((u: string) => `✓ ${u.split('/').pop()}`),
          ...data.errors.map((e: { url: string; error: string }) => `✗ ${e.url.split('/').pop()} — ${e.error}`),
          ...l,
        ].slice(0, 200));
        if (data.remaining === 0 || (data.processed.length === 0 && data.errors.length > 0)) break;
      }
    } catch {
      setError('A kapcsolat megszakadt. Nyomd meg újra, onnan folytatja, ahol abbahagyta.');
    } finally {
      setRunning(false);
      refresh();
    }
  }

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-6 max-w-2xl">
      <p className="text-sm text-on-surface/70 mb-4">
        {status
          ? `${status.total} Blob-kép · ${status.done} kész · ${status.remaining} hiányzik`
          : 'Állapot betöltése…'}
      </p>
      <button
        type="button"
        onClick={run}
        disabled={running || !status || status.remaining === 0}
        className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-on-primary hover:opacity-90 disabled:opacity-50"
      >
        {running ? 'Gyártás folyamatban…' : status?.remaining === 0 ? 'Minden kép kész' : 'Hiányzó változatok legyártása'}
      </button>
      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
      {log.length > 0 && (
        <ul className="mt-4 text-xs font-mono text-on-surface/70 space-y-0.5 max-h-72 overflow-y-auto">
          {log.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
