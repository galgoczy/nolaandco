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

const foxpostSizes = ['XS', 'S', 'M', 'L', 'XL'] as const;

export default function OrderActions({
  orderId,
  currentStatus,
  currentTracking,
  carrier = 'foxpost',
}: {
  orderId: string;
  currentStatus: string;
  currentTracking: string;
  carrier?: string;
}) {
  const isPacketa = carrier === 'packeta';
  const carrierName = isPacketa ? 'Packeta' : 'Foxpost';
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [tracking, setTracking] = useState(currentTracking);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [foxpostLoading, setFoxpostLoading] = useState(false);
  const [foxpostSize, setFoxpostSize] = useState<string>('M');
  const [reminderLoading, setReminderLoading] = useState(false);
  const [message, setMessage] = useState('');

  const sendPaymentReminder = async () => {
    if (!confirm('Fizetési emlékeztető küldése a vásárlónak?')) return;
    setReminderLoading(true);
    setMessage('');
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/payment-reminder`, { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      setMessage(res.ok ? 'Fizetési emlékeztető elküldve!' : data.error || 'Hiba történt');
    } catch {
      setMessage('Hálózati hiba');
    } finally {
      setReminderLoading(false);
    }
  };

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

  const handleFoxpostShip = async () => {
    if (!confirm(`${carrierName} csomag feladása ezzel a rendeléssel?`)) return;
    setFoxpostLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/foxpost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, size: foxpostSize }),
      });
      const data = await res.json();
      if (res.ok) {
        setTracking(data.trackingNumber || '');
        setStatus('processing');
        setMessage(`${carrierName} csomag létrehozva! Azonosító: ${data.trackingNumber}`);
        router.refresh();
      } else {
        setMessage(data.error || 'Foxpost hiba');
      }
    } catch {
      setMessage('Hálózati hiba');
    } finally {
      setFoxpostLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Status & tracking */}
      <div className="bg-surface-container-lowest rounded-2xl p-6">
        <h2 className="font-headline font-bold text-on-surface mb-4">
          Műveletek
        </h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm text-on-surface/60 mb-1">Státusz</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {statusFlow.map((s) => (
                <option key={s} value={s}>{statusLabels[s]}</option>
              ))}
              <option value="cancelled">{statusLabels.cancelled}</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm text-on-surface/60 mb-1">Nyomkövetési szám</label>
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
        {status === 'pending' && (
          <div className="mt-4 pt-4 border-t border-outline-variant/40">
            <p className="text-sm text-on-surface/60 mb-2">
              Fizetésre váró rendelés — küldhetsz a vásárlónak egy emlékeztetőt egykattintásos
              bankkártyás fizetési linkkel (kártyás és átutalásos pendingnél is).
            </p>
            <button
              onClick={sendPaymentReminder}
              disabled={reminderLoading}
              className="bg-[#D5E8F0] text-[#4A4A4A] px-5 py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {reminderLoading ? 'Küldés...' : 'Fizetési emlékeztető küldése'}
            </button>
          </div>
        )}
        {message && (
          <p className="mt-3 text-sm text-primary font-medium">{message}</p>
        )}
      </div>

      {/* Carrier shipping (Foxpost domestic / Packeta cross-border) */}
      <div className="bg-surface-container-lowest rounded-2xl p-6">
        <h2 className="font-headline font-bold text-on-surface mb-4">
          {carrierName} szállítás
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          {!isPacketa && (
            <div>
              <label className="block text-sm text-on-surface/60 mb-1">Csomagméret</label>
              <select
                value={foxpostSize}
                onChange={(e) => setFoxpostSize(e.target.value)}
                className="rounded-xl border border-outline-variant bg-surface px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {foxpostSizes.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}
          <button
            onClick={handleFoxpostShip}
            disabled={foxpostLoading || !!currentTracking}
            className="bg-[#E8740C] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#d16a0b] transition-colors disabled:opacity-50"
          >
            {foxpostLoading ? 'Feladás...' : `${carrierName} feladás`}
          </button>
          {currentTracking && (
            <a
              href={`/api/admin/foxpost/label?orderId=${orderId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#E8740C]/10 text-[#E8740C] px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[#E8740C]/20 transition-colors"
            >
              Címke letöltése (PDF)
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
