'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

/** Tárgynyeremény átvételének jelölése / visszavonása. */
export default function RedeemCardButton({ token, redeemed }: { token: string; redeemed: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (redeemed && !confirm(`Visszavonod a(z) ${token} kártya átvételét?`)) return;
    setBusy(true);
    const res = await fetch(`/api/admin/promo-cards/${token}/redeem`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ redeemed: !redeemed }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      alert(data.error || 'Nem sikerült menteni.');
      return;
    }
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      className={`text-xs underline underline-offset-2 transition-colors cursor-pointer disabled:opacity-50 ${
        redeemed ? 'text-on-surface/50 hover:text-red-600' : 'text-primary hover:text-on-surface'
      }`}
    >
      {busy ? '…' : redeemed ? 'Átvétel visszavonása' : 'Átvéve ✓'}
    </button>
  );
}
