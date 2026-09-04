'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

/** Tesztkártya visszaállítása érintetlenre — csak tesztkötegeknél jelenik meg. */
export default function ResetCardButton({ token }: { token: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function reset() {
    if (!confirm(`Visszaállítod a(z) ${token} kártyát érintetlenre? A nyeremény és az e-mail törlődik.`)) return;
    setBusy(true);
    const res = await fetch(`/api/admin/promo-cards/${token}/reset`, { method: 'POST' });
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
