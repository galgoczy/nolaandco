'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

export interface WithdrawalFormItem {
  orderItemId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

interface Props {
  orderId: string;
  orderNumber: string;
  defaultName: string;
  defaultEmail: string;
  /** Logged-in owners don't re-enter their email (still editable as contact). */
  emailEditable?: boolean;
  items: WithdrawalFormItem[];
}

/**
 * The online withdrawal declaration ("elállás a szerződéstől"). The consumer
 * picks the affected items (partial withdrawal supported), provides their name
 * and the contact e-mail for the acknowledgment, then submits with the
 * mandated "Elállás megerősítése" button.
 */
export default function WithdrawalForm({
  orderId,
  orderNumber,
  defaultName,
  defaultEmail,
  emailEditable = true,
  items,
}: Props) {
  // Default: every eligible item selected at full quantity.
  const [selected, setSelected] = useState<Record<string, number>>(
    Object.fromEntries(items.map((it) => [it.orderItemId, it.quantity]))
  );
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const toggle = (id: string, qty: number) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = qty;
      return next;
    });
  };

  const chosen = items.filter((it) => selected[it.orderItemId]);
  const refundAmount = chosen.reduce((sum, it) => sum + it.unitPrice * selected[it.orderItemId], 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (chosen.length === 0) {
      setError('Válassz legalább egy terméket, amelyre az elállás vonatkozik.');
      return;
    }
    if (name.trim().length < 2) {
      setError('Kérjük, add meg a neved.');
      return;
    }
    setStatus('loading');
    try {
      const res = await fetch('/api/withdrawal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          declaredName: name.trim(),
          contactEmail: email.trim(),
          items: chosen.map((it) => ({
            orderItemId: it.orderItemId,
            quantity: selected[it.orderItemId],
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Hiba történt, kérjük próbáld újra.');
        setStatus('error');
        return;
      }
      setStatus('success');
    } catch {
      setError('Hálózati hiba történt, kérjük próbáld újra.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm ghost-border text-center space-y-3">
        <div className="text-3xl">&#10003;</div>
        <h3 className="text-lg font-medium text-carbon">Elállási nyilatkozatodat megkaptuk</h3>
        <p className="text-sm text-carbon-light leading-relaxed">
          A megadott <strong>{email.trim()}</strong> címre elküldtük az átvételi elismervényt, amely
          tartalmazza a nyilatkozat tartalmát és a beérkezés időpontját. Kollégánk hamarosan
          felveszi veled a kapcsolatot a visszatérítés részleteiről.
        </p>
        <Link
          href="/"
          className="inline-block mt-2 bg-[#D5E8F0] text-carbon px-6 py-2.5 rounded-full text-sm hover:opacity-90 transition-opacity"
        >
          Vissza a főoldalra
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm ghost-border space-y-6">
      <div>
        <h3 className="text-lg font-medium text-carbon mb-1">Elállás a szerződéstől</h3>
        <p className="text-sm text-carbon-light leading-relaxed">
          A(z) <strong>#{orderNumber}</strong> rendelésen belül az alábbi, elállásra jogosult
          termékek érhetők el. Jelöld be, mely termék(ek) tekintetében kívánsz elállni a
          szerződéstől.
        </p>
      </div>

      <div className="space-y-2">
        {items.map((it) => {
          const checked = !!selected[it.orderItemId];
          return (
            <label
              key={it.orderItemId}
              className={`flex items-center justify-between gap-3 rounded-xl border-2 p-4 cursor-pointer transition-colors ${
                checked ? 'border-[#C4A591] bg-[#faf6f1]' : 'border-transparent bg-surface-container'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(it.orderItemId, it.quantity)}
                  className="h-4 w-4 accent-[#C4A591]"
                />
                <span className="text-sm text-carbon">
                  {it.productName}
                  {it.quantity > 1 && <span className="text-carbon-light"> × {it.quantity}</span>}
                </span>
              </div>
              <span className="text-sm text-carbon whitespace-nowrap">
                {formatPrice(it.unitPrice * it.quantity)}
              </span>
            </label>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="wd-name" className="text-carbon-light text-sm">Név *</label>
          <input
            id="wd-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="bg-surface-container rounded-[0.75rem] px-4 py-3 text-carbon outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="wd-email" className="text-carbon-light text-sm">
            Visszaigazoló e-mail cím *
          </label>
          <input
            id="wd-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            readOnly={!emailEditable}
            className={`rounded-[0.75rem] px-4 py-3 text-carbon outline-none focus:ring-2 focus:ring-primary/30 ${
              emailEditable ? 'bg-surface-container' : 'bg-surface-container-low text-carbon-light'
            }`}
          />
        </div>
      </div>

      <div className="rounded-xl bg-surface-container-low p-4 text-sm text-carbon-light leading-relaxed">
        Nyilatkozat: a fent megjelölt termék(ek) tekintetében elállok a szerződéstől. Az érintett
        összeg: <strong className="text-carbon">{formatPrice(refundAmount)}</strong>.
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full bg-carbon text-white px-6 py-3.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'loading' ? 'Küldés…' : 'Elállás megerősítése'}
      </button>
    </form>
  );
}
