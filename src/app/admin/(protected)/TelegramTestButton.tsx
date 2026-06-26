'use client';

import { useState } from 'react';

export default function TelegramTestButton() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function runTest() {
    setStatus('loading');
    setMessage('');
    try {
      const res = await fetch('/api/admin/telegram-test', { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus('error');
        setMessage(data.error || 'Ismeretlen hiba.');
        return;
      }
      setStatus('success');
      setMessage('Teszt üzenet elküldve — nézd meg a Telegram-csoportot/chatet!');
    } catch {
      setStatus('error');
      setMessage('Hálózati hiba történt.');
    }
  }

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-6 mb-8">
      <h2 className="text-lg font-headline font-bold text-on-surface mb-2">Telegram értesítő</h2>
      <p className="text-sm text-on-surface/60 font-body mb-4">
        Küldj egy teszt üzenetet a beállított Telegram-chatre, hogy ellenőrizd a bot tokent és a
        chat ID-t. (Valódi rendeléskor automatikusan megy az értesítés.)
      </p>
      <button
        onClick={runTest}
        disabled={status === 'loading'}
        className="bg-carbon text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'loading' ? 'Küldés…' : 'Teszt üzenet küldése'}
      </button>
      {message && (
        <p className={`mt-3 text-sm ${status === 'success' ? 'text-green-700' : 'text-red-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
