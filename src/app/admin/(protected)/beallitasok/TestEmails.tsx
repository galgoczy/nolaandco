'use client';

import { useState } from 'react';

/** A rendelés-visszaigazoló e-mailek mintáinak kiküldése ellenőrzéshez. */
export default function TestEmails() {
  const [to, setTo] = useState('');
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState<{ label: string; ok: boolean }[]>([]);
  const [error, setError] = useState('');

  async function send() {
    setSending(true);
    setError('');
    setResults([]);
    try {
      const res = await fetch('/api/admin/test-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.results) setResults(data.results);
      if (!res.ok) setError(data.error || 'Nem minden levél ment ki.');
    } catch {
      setError('A küldés nem sikerült, próbáld újra.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-6 max-w-2xl mt-6">
      <h2 className="font-headline font-bold text-on-surface mb-1">Teszt e-mailek</h2>
      <p className="text-sm text-on-surface/70 mb-4">
        A rendelés-visszaigazoló levél minden változatát (párna, sürgős, súlyarányos előrendelés, poszter, névre szóló
        variáns, átutalás, ajándékkártya, vegyes kosár) mintaadatokkal elküldi a megadott címre. Rendelés nem jön létre.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="E-mail cím"
          className="flex-1 px-3 py-2 rounded-xl border border-outline-variant bg-white text-sm"
        />
        <button
          type="button"
          onClick={send}
          disabled={sending || !to.includes('@')}
          className="px-5 py-2 rounded-full bg-primary text-white text-sm font-medium disabled:opacity-50"
        >
          {sending ? 'Küldés…' : 'Teszt levelek küldése'}
        </button>
      </div>
      {results.length > 0 && (
        <ul className="mt-4 text-sm space-y-1">
          {results.map((r) => (
            <li key={r.label} className={r.ok ? 'text-green-700' : 'text-red-600'}>
              {r.ok ? '✓' : '✗'} {r.label}
            </li>
          ))}
        </ul>
      )}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
