'use client';

import { useEffect, useState } from 'react';

type BlobFile = { url: string; pathname: string; size: number; uploadedAt: string };
type Report = {
  totalBytes: number;
  files: number;
  referenced: { bytes: number; count: number };
  variants: { bytes: number; count: number };
  orphans: BlobFile[];
  orphanBytes: number;
  largest: (BlobFile & { status: string })[];
};

const LIMIT = 1024 * 1024 * 1024; // Hobby: 1 GB

function mb(bytes: number): string {
  return `${(bytes / 1048576).toFixed(1)} MB`;
}
function fmt(iso: string): string {
  return new Intl.DateTimeFormat('hu-HU', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Europe/Budapest' }).format(new Date(iso));
}

/**
 * Blob-tárhely áttekintés: mennyi a hivatkozott tartalom, a képváltozat, és
 * mennyi az árva fájl (régi, lecserélt feltöltés). Az árvák egy gombbal
 * törölhetők — a szerver törlés előtt újra ellenőrzi, hogy tényleg árvák.
 */
export default function StorageManager() {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    const res = await fetch('/api/admin/storage');
    const data = await res.json().catch(() => ({}));
    if (!res.ok) setError(data.error || `Nem sikerült beolvasni a tárhelyet (HTTP ${res.status}).`);
    else setReport(data);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function deleteOrphans() {
    if (!report || report.orphans.length === 0) return;
    if (
      !confirm(
        `Törlöd mind a(z) ${report.orphans.length} árva fájlt (${mb(report.orphanBytes)})? Ezekre az oldal sehol nem hivatkozik. A törlés végleges.`,
      )
    )
      return;
    setBusy(true);
    setError('');
    setMessage('');
    const res = await fetch('/api/admin/storage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls: report.orphans.map((o) => o.url) }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error || `A törlés nem sikerült (HTTP ${res.status}).`);
      return;
    }
    setMessage(`${data.deleted} fájl törölve, ${mb(data.bytes)} felszabadult.`);
    load();
  }

  if (loading) return <p className="text-sm text-on-surface/60">Tárhely beolvasása…</p>;
  if (error && !report) return <p className="text-sm text-red-600">{error}</p>;
  if (!report) return null;

  const pct = Math.min(100, Math.round((report.totalBytes / LIMIT) * 100));

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-surface-container-lowest rounded-2xl p-6">
        <div className="flex items-baseline justify-between mb-2">
          <p className="font-headline font-semibold">
            {mb(report.totalBytes)} / 1024 MB <span className="text-on-surface/50 font-normal">({report.files} fájl)</span>
          </p>
          <p className={`text-sm ${pct >= 90 ? 'text-red-600 font-medium' : 'text-on-surface/60'}`}>{pct}%</p>
        </div>
        <div className="h-2 rounded-full bg-surface-container overflow-hidden">
          <div className={`h-full ${pct >= 90 ? 'bg-red-500' : 'bg-primary'}`} style={{ width: `${pct}%` }} />
        </div>
        <ul className="mt-4 text-sm text-on-surface/70 space-y-1">
          <li>Hivatkozott eredetik (kép, videó, borító): {mb(report.referenced.bytes)} · {report.referenced.count} fájl</li>
          <li>Képváltozatok (AVIF/WebP): {mb(report.variants.bytes)} · {report.variants.count} fájl</li>
          <li className={report.orphanBytes > 0 ? 'text-[#B48D76] font-medium' : ''}>
            Árva fájlok: {mb(report.orphanBytes)} · {report.orphans.length} fájl
          </li>
        </ul>
        {report.orphans.length > 0 && (
          <button
            type="button"
            onClick={deleteOrphans}
            disabled={busy}
            className="mt-4 px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:opacity-90 disabled:opacity-50"
          >
            {busy ? 'Törlés…' : `Árva fájlok törlése (${mb(report.orphanBytes)})`}
          </button>
        )}
        {message && <p className="text-sm text-green-700 mt-3">{message}</p>}
        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
      </div>

      {report.orphans.length > 0 && (
        <div className="bg-surface-container-lowest rounded-2xl overflow-hidden">
          <h2 className="text-sm font-bold font-headline px-4 pt-4 pb-2">Árva fájlok (méret szerint)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="border-b border-outline-variant text-left bg-surface-container-low">
                  <th className="p-3 text-on-surface/60 font-medium">Fájl</th>
                  <th className="p-3 text-on-surface/60 font-medium text-right">Méret</th>
                  <th className="p-3 text-on-surface/60 font-medium text-right">Feltöltve</th>
                </tr>
              </thead>
              <tbody>
                {report.orphans.slice(0, 200).map((o) => (
                  <tr key={o.url} className="border-b border-outline-variant/40 last:border-none">
                    <td className="p-3 font-mono text-xs break-all">
                      <a href={o.url} target="_blank" rel="noreferrer" className="hover:underline">
                        {o.pathname}
                      </a>
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">{mb(o.size)}</td>
                    <td className="p-3 text-right whitespace-nowrap text-on-surface/60">{fmt(o.uploadedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="bg-surface-container-lowest rounded-2xl overflow-hidden">
        <h2 className="text-sm font-bold font-headline px-4 pt-4 pb-2">Legnagyobb fájlok</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="border-b border-outline-variant text-left bg-surface-container-low">
                <th className="p-3 text-on-surface/60 font-medium">Fájl</th>
                <th className="p-3 text-on-surface/60 font-medium">Állapot</th>
                <th className="p-3 text-on-surface/60 font-medium text-right">Méret</th>
              </tr>
            </thead>
            <tbody>
              {report.largest.map((f) => (
                <tr key={f.url} className="border-b border-outline-variant/40 last:border-none">
                  <td className="p-3 font-mono text-xs break-all">{f.pathname}</td>
                  <td className="p-3 text-xs">{f.status}</td>
                  <td className="p-3 text-right whitespace-nowrap">{mb(f.size)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
