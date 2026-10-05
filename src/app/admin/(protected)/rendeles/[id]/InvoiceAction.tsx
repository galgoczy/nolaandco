'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

/** Számla utólagos kiállítása (ha az automatikus nem készült el). */
export default function InvoiceAction({ orderId, email }: { orderId: string; email: string }) {
  const router = useRouter();
  const [sendEmail, setSendEmail] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function issue() {
    if (!confirm(`Számla kiállítása${sendEmail ? ` és elküldése (${email})` : ''}?`)) return;
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sendEmail }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data.error || 'Hiba történt');
        return;
      }
      setMessage(
        data.warning ??
          `Számla kiállítva (${data.invoiceNumber})${data.emailed ? ', e-mailben elküldve.' : '.'}`,
      );
      router.refresh();
    } catch {
      setMessage('Hálózati hiba');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-6 mb-8">
      <h2 className="font-headline font-bold text-on-surface mb-2">Számla</h2>
      <p className="text-sm text-on-surface/60 mb-3">
        Ehhez a rendeléshez még nincs számla. A rendeléskori eladó Számlázz.hu fiókjából állítjuk ki;
        a PDF-et a saját levelünkben küldjük el a vásárlónak.
      </p>
      <label className="flex items-center gap-2 text-sm text-on-surface mb-3 cursor-pointer">
        <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} />
        Elküldés a vásárlónak e-mailben ({email})
      </label>
      <button
        onClick={issue}
        disabled={loading}
        className="bg-primary text-white px-5 py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {loading ? 'Kiállítás…' : 'Számla kiállítása'}
      </button>
      {message && <p className="mt-3 text-sm text-primary font-medium">{message}</p>}
    </div>
  );
}
