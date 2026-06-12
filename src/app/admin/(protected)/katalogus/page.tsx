'use client';

import { useState } from 'react';

export default function KatalogusPage() {
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState<string[] | null>(null);
  const [error, setError] = useState('');

  async function runSync() {
    setRunning(true);
    setError('');
    setLog(null);
    try {
      const res = await fetch('/api/admin/catalog-sync', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Ismeretlen hiba történt.');
        return;
      }
      setLog(data.log as string[]);
    } catch {
      setError('Hálózati hiba történt, próbáld újra.');
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-headline font-bold text-carbon mb-2">
        Katalógus frissítés
      </h1>
      <p className="text-sm text-carbon-light mb-6 leading-relaxed">
        Ez a gomb létrehozza a webshop által várt kategóriákat és termékeket
        (pl. az új Nagytesó kollekciót és a digitális ajándékkártyát), és
        elvégzi az egyszeri rendrakásokat (régi ajándékkártya archiválása,
        badge-átnevezés). <strong>Biztonságos:</strong> többször is futtatható,
        a meglévő termékek admin-szerkesztéseit (kép, szöveg, ár) nem írja
        felül, és nem töröl semmit.
      </p>

      <button
        onClick={runSync}
        disabled={running}
        className="bg-carbon text-white px-6 py-3 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {running ? 'Futtatás folyamatban…' : 'Katalógus frissítése'}
      </button>

      {error && (
        <p className="mt-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-4">
          {error}
        </p>
      )}

      {log && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-black/5 p-5">
          <h2 className="text-sm font-bold text-carbon mb-3">Eredmény</h2>
          <ul className="space-y-1">
            {log.map((line, i) => (
              <li key={i} className="text-sm text-carbon-light font-mono">
                ✓ {line}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
