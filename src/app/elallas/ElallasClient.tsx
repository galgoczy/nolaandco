'use client';

import { useState } from 'react';
import WithdrawalForm, { type WithdrawalFormItem } from '@/components/withdrawal/WithdrawalForm';

type LoadedOrder = {
  orderId: string;
  orderNumber: string;
  contactEmail: string;
  declaredName: string;
  items: WithdrawalFormItem[];
};

export default function ElallasClient({ initialOrderNumber }: { initialOrderNumber?: string }) {
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber ?? '');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState('');
  const [order, setOrder] = useState<LoadedOrder | null>(null);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setStatus('loading');
    try {
      const res = await fetch('/api/withdrawal/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber: orderNumber.trim(), email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Nem sikerült betölteni a rendelést.');
        setStatus('error');
        return;
      }
      if (!data.items || data.items.length === 0) {
        setError('Ehhez a rendeléshez nincs elállásra jogosult termék.');
        setStatus('error');
        return;
      }
      setOrder(data as LoadedOrder);
      setStatus('idle');
    } catch {
      setError('Hálózati hiba történt, kérjük próbáld újra.');
      setStatus('error');
    }
  }

  if (order) {
    return (
      <WithdrawalForm
        orderId={order.orderId}
        orderNumber={order.orderNumber}
        defaultName={order.declaredName}
        defaultEmail={order.contactEmail}
        items={order.items}
      />
    );
  }

  return (
    <form onSubmit={handleLookup} className="bg-white rounded-2xl p-6 shadow-sm ghost-border space-y-5">
      <p className="text-sm text-carbon-light leading-relaxed">
        Add meg a rendelésszámodat és azt az e-mail címet, amellyel a rendelést leadtad. Ezután
        kiválaszthatod, mely termék(ek) tekintetében kívánsz elállni a szerződéstől.
      </p>
      <div className="flex flex-col gap-1">
        <label htmlFor="lk-order" className="text-carbon-light text-sm">Rendelésszám *</label>
        <input
          id="lk-order"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          required
          placeholder="pl. A1B2C3D4"
          className="bg-surface-container rounded-[0.75rem] px-4 py-3 text-carbon outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="lk-email" className="text-carbon-light text-sm">E-mail cím *</label>
        <input
          id="lk-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-surface-container rounded-[0.75rem] px-4 py-3 text-carbon outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full bg-cta text-white px-6 py-3.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'loading' ? 'Keresés…' : 'Rendelés betöltése'}
      </button>
    </form>
  );
}
