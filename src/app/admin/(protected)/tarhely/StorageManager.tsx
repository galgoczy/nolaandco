'use client';

import { useEffect, useState } from 'react';

type OrphanGroup = 'regi-valtozat' | 'duplikatum' | 'egyeb';
type ClassifiedFile = {
  url: string;
  pathname: string;
  size: number;
  uploadedAt: string;
  status: 'hivatkozott' | 'valtozat' | 'arva';
  group?: OrphanGroup;
};
type Report = {
  totalBytes: number;
  fileCount: number;
  referenced: { bytes: number; count: number };
  variants: { bytes: number; count: number };
  orphans: { bytes: number; count: number };
  groups: { key: OrphanGroup; label: string; note: string; count: number; bytes: number }[];
  files: ClassifiedFile[];
};

const LIMIT = 1024 * 1024 * 1024; // Hobby: 1 GB

function mb(bytes: number): string {
  return `${(bytes / 1048576).toFixed(1)} MB`;
}
function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat('hu-HU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Europe/Budapest',
  }).format(new Date(iso));
}
function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/**
 * Blob-tárhely áttekintés: hivatkozott tartalom, képváltozatok, árva fájlok.
 * Az árvák csoportonként (a legkevésbé kockázatostól haladva) törölhetők, és
 * előtte letölthető a mentési lista, amivel minden fájl lementhető a gépre.
 */
export default function StorageManager() {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [listGroup, setListGroup] = useState<OrphanGroup | null>(null);

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

  async function deleteGroup(group: OrphanGroup, label: string) {
    if (!report) return;
    const urls = report.files.filter((f) => f.status === 'arva' && f.group === group).map((f) => f.url);
    if (urls.length === 0) return;
    const bytes = report.files
      .filter((f) => f.status === 'arva' && f.group === group)
      .reduce((s, f) => s + f.size, 0);
    if (!confirm(`Törlöd ezt a csoportot: „${label}”?\n\n${urls.length} fájl, ${mb(bytes)}. A törlés végleges.`)) return;

    setBusy(group);
    setError('');
    setMessage('');
    const res = await fetch('/api/admin/storage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy('');
    if (!res.ok) {
      setError(data.error || `A törlés nem sikerült (HTTP ${res.status}).`);
      return;
    }
    setMessage(
      `${label}: ${data.deleted} fájl törölve, ${mb(data.bytes)} felszabadult.` +
        (data.skipped ? ` (${data.skipped} fájl kimaradt, mert időközben hivatkozottá vált.)` : ''),
    );
    load();
  }

  function downloadList(scope: 'mind' | 'arva') {
    if (!report) return;
    const files = scope === 'mind' ? report.files : report.files.filter((f) => f.status === 'arva');
    download(`nola-mentes-${scope}.txt`, files.map((f) => f.url).join('\n') + '\n');
  }

  if (loading) return <p className="text-sm text-on-surface/60">Tárhely beolvasása…</p>;
  if (error && !report) return <p className="text-sm text-red-600">{error}</p>;
  if (!report) return null;

  const pct = Math.min(100, Math.round((report.totalBytes / LIMIT) * 100));
  const listed = listGroup ? report.files.filter((f) => f.status === 'arva' && f.group === listGroup) : [];

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-surface-container-lowest rounded-2xl p-6">
        <div className="flex items-baseline justify-between mb-2">
          <p className="font-headline font-semibold">
            {mb(report.totalBytes)} / 1024 MB{' '}
            <span className="text-on-surface/50 font-normal">({report.fileCount} fájl)</span>
          </p>
          <p className={`text-sm ${pct >= 90 ? 'text-red-600 font-medium' : 'text-on-surface/60'}`}>{pct}%</p>
        </div>
        <div className="h-2 rounded-full bg-surface-container overflow-hidden">
          <div className={`h-full ${pct >= 90 ? 'bg-red-500' : 'bg-primary'}`} style={{ width: `${pct}%` }} />
        </div>
        <ul className="mt-4 text-sm text-on-surface/70 space-y-1">
          <li>
            Hivatkozott eredetik: {mb(report.referenced.bytes)} · {report.referenced.count} fájl
          </li>
          <li>
            Képváltozatok (AVIF/WebP): {mb(report.variants.bytes)} · {report.variants.count} fájl
          </li>
          <li className={report.orphans.bytes > 0 ? 'text-[#B48D76] font-medium' : ''}>
            Árva fájlok: {mb(report.orphans.bytes)} · {report.orphans.count} fájl
          </li>
        </ul>
        {message && <p className="text-sm text-green-700 mt-3">{message}</p>}
        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
      </div>

      {/* Mentés */}
      <div className="bg-surface-container-lowest rounded-2xl p-6">
        <h2 className="text-sm font-bold font-headline mb-1">Mentés a gépre</h2>
        <p className="text-xs text-on-surface/60 mb-4">
          A gomb egy szövegfájlt tölt le a fájlok címeivel. Az alatta lévő paranccsal az összes fájl
          letölthető egy mappába — érdemes a törlés előtt megtenni.
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            type="button"
            onClick={() => downloadList('mind')}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-on-primary hover:opacity-90"
          >
            Teljes lista ({report.fileCount} fájl, {mb(report.totalBytes)})
          </button>
          <button
            type="button"
            onClick={() => downloadList('arva')}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-surface-container hover:bg-surface-container-high"
          >
            Csak az árvák ({report.orphans.count} fájl, {mb(report.orphans.bytes)})
          </button>
        </div>
        <p className="text-xs font-medium text-on-surface/70 mb-1">Mac vagy Linux — Terminál:</p>
        <pre className="text-xs bg-surface-container rounded-lg p-3 mb-3 overflow-x-auto">
{`cd ~/Downloads && mkdir -p nola-mentes && cd nola-mentes
xargs -n 1 curl -O < ../nola-mentes-mind.txt`}
        </pre>
        <p className="text-xs font-medium text-on-surface/70 mb-1">Windows — PowerShell:</p>
        <pre className="text-xs bg-surface-container rounded-lg p-3 overflow-x-auto">
{`cd ~\\Downloads; mkdir nola-mentes -Force; cd nola-mentes
Get-Content ..\\nola-mentes-mind.txt | ForEach-Object {
  Invoke-WebRequest $_ -OutFile ($_ -split '/')[-1]
}`}
        </pre>
      </div>

      {/* Csoportos törlés */}
      <div className="bg-surface-container-lowest rounded-2xl p-6">
        <h2 className="text-sm font-bold font-headline mb-1">Árva fájlok törlése csoportonként</h2>
        <p className="text-xs text-on-surface/60 mb-4">
          A csoportok a legkevésbé kockázatostól haladnak. A szerver törlés előtt újra ellenőrzi, hogy
          a fájlok tényleg árvák, így használatban lévő kép nem törlődhet.
        </p>
        <div className="space-y-4">
          {report.groups.map((g) => (
            <div key={g.key} className="border border-outline-variant/60 rounded-xl p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-medium text-sm">{g.label}</p>
                <p className="text-xs text-on-surface/60">
                  {g.count} fájl · {mb(g.bytes)}
                </p>
              </div>
              <p className="text-xs text-on-surface/60 mt-1">{g.note}</p>
              {g.count > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => deleteGroup(g.key, g.label)}
                    disabled={busy !== ''}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600 text-white hover:opacity-90 disabled:opacity-50"
                  >
                    {busy === g.key ? 'Törlés…' : `Törlés (${mb(g.bytes)})`}
                  </button>
                  <button
                    type="button"
                    onClick={() => setListGroup(listGroup === g.key ? null : g.key)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-container hover:bg-surface-container-high"
                  >
                    {listGroup === g.key ? 'Lista elrejtése' : 'Fájlok megnézése'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {listed.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="border-b border-outline-variant text-left bg-surface-container-low">
                  <th className="p-3 text-on-surface/60 font-medium">Fájl</th>
                  <th className="p-3 text-on-surface/60 font-medium text-right">Méret</th>
                  <th className="p-3 text-on-surface/60 font-medium text-right">Feltöltve</th>
                </tr>
              </thead>
              <tbody>
                {listed.slice(0, 300).map((f) => (
                  <tr key={f.url} className="border-b border-outline-variant/40 last:border-none">
                    <td className="p-3 font-mono text-xs break-all">
                      <a href={f.url} target="_blank" rel="noreferrer" className="hover:underline">
                        {f.pathname}
                      </a>
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">{mb(f.size)}</td>
                    <td className="p-3 text-right whitespace-nowrap text-on-surface/60">{fmtDate(f.uploadedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Legnagyobb fájlok */}
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
              {report.files.slice(0, 20).map((f) => (
                <tr key={f.url} className="border-b border-outline-variant/40 last:border-none">
                  <td className="p-3 font-mono text-xs break-all">{f.pathname}</td>
                  <td className="p-3 text-xs">
                    {f.status === 'hivatkozott' ? 'hivatkozott' : f.status === 'valtozat' ? 'változat' : 'árva'}
                  </td>
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
