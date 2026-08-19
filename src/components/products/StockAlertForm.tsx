'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';

/**
 * „Szólj, ha újra lesz" — az elfogyott termék tiltott kosárgombja helyett.
 * Egyetlen e-mail mező, megerősítő levél nélkül: ez egy konkrét termékre kért,
 * egyszeri szolgáltatásüzenet, nem hírlevél. A kiküldött levélben egykattintásos
 * törlés van.
 */
export default function StockAlertForm({ productId }: { productId: string }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'instock'>('idle');
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setState('sending');
    try {
      const res = await fetch('/api/stock-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'A feliratkozás nem sikerült.');
        setState('idle');
        return;
      }
      setState(data.alreadyInStock ? 'instock' : 'done');
    } catch {
      setError('A feliratkozás nem sikerült. Próbáld újra.');
      setState('idle');
    }
  }

  if (state === 'done') {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center space-y-2">
        <div className="text-2xl">&#10003;</div>
        <p className="font-medium text-green-800">Szólunk, amint megérkezik</p>
        <p className="text-sm text-carbon-light">
          Egyetlen e-mailt küldünk erről a termékről, mást nem.
        </p>
      </div>
    );
  }

  if (state === 'instock') {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center space-y-2">
        <p className="font-medium text-green-800">Jó hírünk van: időközben újra elérhető!</p>
        <p className="text-sm text-carbon-light">Töltsd újra az oldalt, és a kosárba teheted.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Button
        variant="secondary"
        disabled
        className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Jelenleg nem elérhető
      </Button>

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full text-sm text-[#C4A591] hover:text-[#4A4A4A] underline underline-offset-2 transition-colors cursor-pointer"
        >
          Szólj, ha újra lesz
        </button>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <p className="text-sm text-carbon-light">
            Add meg az e-mail címed, és értesítünk, amint újra elérhető.
          </p>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail cím"
            aria-label="E-mail cím"
            className="w-full rounded-xl border border-[#E0DAD1] px-4 py-3 text-sm focus:outline-none focus:border-[#C4A591]"
          />
          <Button
            variant="secondary"
            type="submit"
            disabled={state === 'sending'}
            className="w-full disabled:opacity-50"
          >
            {state === 'sending' ? 'Küldés…' : 'Kérem az értesítést'}
          </Button>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <p className="text-xs text-carbon-light">
            A címedet kizárólag erre az egy értesítőre használjuk, és nem kerülsz fel a
            hírlevelünkre.
          </p>
        </form>
      )}
    </div>
  );
}
