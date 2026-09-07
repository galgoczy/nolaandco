'use client';

import { useEffect, useRef, useState } from 'react';

type Status = { total: number; done: number; remaining: number };

/**
 * Képváltozatok utólagos legyártása a már feltöltött képekhez.
 *
 * A szerver hívásonként néhány képet gyárt le, és visszaadja, hol tart
 * (offset); az oldal ezzel lépked végig a katalóguson, amíg a végére nem ér.
 * Megszakadás után a gomb újra nyomható, a kész képeket kihagyja.
 */
export default function VariantBackfill() {
  const [status, setStatus] = useState<Status | null>(null);
  const [running, setRunning] = useState(false);
  const [madeCount, setMadeCount] = useState(0);
  const [position, setPosition] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [error, setError] = useState('');
  const stop = useRef(false);

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
    setMadeCount(0);
    stop.current = false;
    let offset = 0;
    try {
      for (let round = 0; round < 1000; round++) {
        if (stop.current) break;
        const res = await fetch('/api/admin/images/variants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ limit: 3, offset }),
        });
        if (!res.ok) {
          setError(
            `Hiba a gyártás közben (HTTP ${res.status}). Nyomd meg újra — a kész képeket kihagyja, onnan folytatja.`,
          );
          break;
        }
        const data = await res.json();
        offset = data.offset;
        setPosition(offset);
        setMadeCount((n) => n + data.processed.length);
        if (data.processed.length || data.errors.length) {
          setLog((l) =>
            [
              ...data.processed.map((u: string) => `✓ ${u.split('/').pop()}`),
              ...data.errors.map((e: { url: string; error: string }) => `✗ ${e.url.split('/').pop()} — ${e.error}`),
              ...l,
            ].slice(0, 300),
          );
        }
        if (data.quotaFull) {
          setError(
            'Betelt a tárhely. Nyisd meg az Admin → Tárhely oldalt, töröld az árva fájlokat, majd indítsd újra a gyártást.',
          );
          break;
        }
        if (data.finished) break;
      }
    } catch {
      setError('A kapcsolat megszakadt. Nyomd meg újra, onnan folytatja, ahol abbahagyta.');
    } finally {
      setRunning(false);
      refresh();
    }
  }

  const pct = status && status.total > 0 ? Math.round((position / status.total) * 100) : 0;

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-6 max-w-2xl">
      <p className="text-sm text-on-surface/70 mb-4">
        {status
          ? `${status.total} kép · ${status.done} kész · ${status.remaining} hiányzik`
          : 'Állapot betöltése…'}
      </p>

      {running && status && (
        <div className="mb-4">
          <div className="h-2 rounded-full bg-surface-container overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-on-surface/60 mt-2">
            Átnézve: {position} / {status.total} · ebben a körben legyártva: {madeCount}. A gyártás
            képenként pár másodperc, hagyd nyitva ezt a lapot.
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={run}
          disabled={running || !status || status.remaining === 0}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-on-primary hover:opacity-90 disabled:opacity-50"
        >
          {running
            ? 'Gyártás folyamatban…'
            : status?.remaining === 0
              ? 'Minden kép kész'
              : 'Hiányzó változatok legyártása'}
        </button>
        {running && (
          <button
            type="button"
            onClick={() => {
              stop.current = true;
            }}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-surface-container hover:bg-surface-container-high"
          >
            Leállítás
          </button>
        )}
      </div>

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
