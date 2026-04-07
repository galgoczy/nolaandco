'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const statusFlow = ['pending', 'paid', 'processing', 'shipped', 'delivered'];
const statusLabels: Record<string, string> = {
  pending: 'Függőben',
  paid: 'Fizetett',
  processing: 'Feldolgozás alatt',
  shipped: 'Kiszállítva',
  delivered: 'Kézbesítve',
  cancelled: 'Törölve',
};

export default function OrderActions({
  orderId,
  currentStatus,
  currentTracking,
}: {
  orderId: string;
  currentStatus: string;
  currentTracking: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [tracking, setTracking] = useState(currentTracking);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpdate = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, trackingNumber: tracking || undefined }),
      });
      if (res.ok) {
        setMessage('Mentve!');
        router.refresh();
      } else {
        const data = await res.json();
        setMessage(data.error || 'Hiba történt');
      }
    } catch {
      setMessage('Hálózati hiba');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Biztosan törölni szeretnéd ezt a rendelést? Ez a művelet nem visszavonható.')) {
      return;
    }
    setDeleting(true);
    setMessage('');
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        router.push('/admin/rendelesek');
      } else {
        const data = await res.json();
        setMessage(data.error || 'Hiba történt a törlés során');
      }
    } catch {
      setMessage('Hálózati hiba');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-6">
      <h2 className="font-headline font-bold text-on-surface mb-4">
        Műveletek
      </h2>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm text-on-surface/60 mb-1">
            Státusz
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {statusFlow.map((s) => (
              <option key={s} value={s}>
                {statusLabels[s]}
              </option>
            ))}
            <option value="cancelled">{statusLabels.cancelled}</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm text-on-surface/60 mb-1">
            Nyomkövetési szám
          </label>
          <input
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            placeholder="pl. GLS123456789"
            className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex items-end gap-2">
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="bg-primary text-on-primary px-6 py-2.5 rounded-full text-sm font-medium btn-anim disabled:opacity-50"
          >
            {loading ? 'Mentés...' : 'Mentés'}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="bg-red-50 text-red-600 px-4 py-2.5 rounded-full text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            {deleting ? 'Törlés...' : 'Törlés'}
          </button>
        </div>
      </div>
      {message && (
        <p className="mt-3 text-sm text-primary font-medium">{message}</p>
      )}
    </div>
  );
}
