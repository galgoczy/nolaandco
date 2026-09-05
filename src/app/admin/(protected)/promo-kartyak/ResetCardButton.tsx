'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Kártya visszaállítása érintetlenre. A link/QR nem változik.
 * Tesztkártyánál egy megerősítés elég; éles kártyánál a kódot be kell gépelni,
 * hogy egy félrekattintás ne törölhesse egy vendég nyereményét.
 */
export default function ResetCardButton({ token, live }: { token: string; live: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function reset() {
    let confirmToken: string | null = null;
    if (live) {
      confirmToken = prompt(
        `ÉLES kártya! A(z) ${token} nyereménye törlődik, a kártya újra kaparható lesz.\n` +
          'A QR-kód és a link változatlan marad.\n\nMegerősítésként gépeld be a kártya kódját:',
      );
      if (confirmToken === null) return;
      if (confirmToken.trim().toUpperCase() !== token) {
        alert('A begépelt kód nem egyezik, nem történt változás.');
        return;
      }
    } else if (!confirm(`Visszaállítod a(z) ${token} kártyát érintetlenre? A nyeremény és az e-mail törlődik.`)) {
      return;
    }

    setBusy(true);
    const res = await fetch(`/api/admin/promo-cards/${token}/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(live ? { confirm: confirmToken } : {}),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      alert(data.error || 'A visszaállítás nem sikerült.');
      return;
    }
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={reset}
      disabled={busy}
      className="text-xs text-on-surface/60 hover:text-red-600 underline underline-offset-2 transition-colors cursor-pointer disabled:opacity-50"
    >
      {busy ? 'Visszaállítás…' : 'Visszaállítás'}
    </button>
  );
}
