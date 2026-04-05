'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

export default function ProductRowActions({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Biztos törlöd ezt a terméket: "${name}"?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || 'Törlés sikertelen');
        return;
      }
      if (data.softDeleted) {
        alert(data.message || 'Deaktiválva (rendelések miatt nem törölhető).');
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Link
        href={`/admin/termekek/${id}`}
        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-container-low hover:bg-surface-container text-on-surface transition-colors"
      >
        Szerkeszt
      </Link>
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
      >
        {loading ? '...' : 'Törlés'}
      </button>
    </div>
  );
}
