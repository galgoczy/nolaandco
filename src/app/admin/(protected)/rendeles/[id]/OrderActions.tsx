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
  paymentMethod,
  shippingCost,
  shippingAddress,
}: {
  orderId: string;
  currentStatus: string;
  currentTracking: string;
  paymentMethod: string;
  shippingCost: number;
  shippingAddress: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [tracking, setTracking] = useState(currentTracking);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [foxpostLoading, setFoxpostLoading] = useState(false);
  const [foxpostSize, setFoxpostSize] = useState<string>('M');
  const [message, setMessage] = useState('');
  const [reminderLoading, setReminderLoading] = useState(false);
  const [reminderIncludeCard, setReminderIncludeCard] = useState(true);
  const [reminderMessage, setReminderMessage] = useState('');

  const showReminder = paymentMethod === 'transfer' && currentStatus === 'pending';

  // Foxpost block visibility: hide on digital-only orders (no shipping
  // booked / placeholder address), already-delivered, or cancelled.
  const isDigitalOnly =
    shippingCost === 0 &&
    /^csomagautomata\s*\(/i.test(shippingAddress.trim());
  const showFoxpost =
    !isDigitalOnly && currentStatus !== 'delivered' && currentStatus !== 'cancelled';
  const foxpostBlocked = currentStatus === 'pending';

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

  const handleSendReminder = async () => {
    if (
      !confirm(
        reminderIncludeCard
          ? 'Elküldjük a fizetési emlékeztetőt? A levél tartalmaz egy "Fizetés bankkártyával" gombot is, amit a vásárló használhat helyette.'
          : 'Elküldjük a fizetési emlékeztetőt (csak utalási adatok, kártyás fizetési lehetőség nélkül)?',
      )
    ) {
      return;
    }
    setReminderLoading(true);
    setReminderMessage('');
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/payment-reminder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ includeCardLink: reminderIncludeCard }),
      });
      const data = await res.json();
      if (res.ok) {
        setReminderMessage(
          data.payByCardLink
            ? 'Emlékeztető elküldve (kártyás fizetési lehetőséggel).'
            : 'Emlékeztető elküldve.',
        );
      } else {
        setReminderMessage(data.error || 'Hiba történt az emlékeztető küldésekor.');
      }
    } catch {
      setReminderMessage('Hálózati hiba');
    } finally {
      setReminderLoading(false);
    }
  };

  const handleFoxpostCancel = async () => {
    if (
      !confirm(
        'Visszavonjuk a Foxpost csomagot? Ez csak akkor sikerül, ha a Foxpost ' +
          'még nem vette át fizikailag (CREATE státusz). FIGYELEM: a vásárló már ' +
          'kapott egy email-t a feladásról; ha most törlöd, érdemes neki külön ' +
          'is jelezni. A státusz visszaáll "Fizetett"-re.',
      )
    ) {
      return;
    }
    setFoxpostLoading(true);
    setMessage('');
    try {
      const res = await fetch(`/api/admin/foxpost?orderId=${encodeURIComponent(orderId)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        setTracking('');
        setStatus('paid');
        setMessage('Foxpost csomag visszavonva. Státusz visszaáll: Fizetett.');
        router.refresh();
      } else {
        setMessage(data.error || 'Foxpost visszavonási hiba');
      }
    } catch {
      setMessage('Hálózati hiba');
    } finally {
      setFoxpostLoading(false);
    }
  };

  const handleFoxpostShip = async () => {
    if (!confirm('Foxpost csomag feladása ezzel a rendeléssel?')) return;
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
        setStatus('shipped');
        const notif = data.notifications ?? {};
        const allOk = notif.customerEmail && notif.adminEmail && notif.telegram;
        setMessage(
          `Foxpost csomag létrehozva! Azonosító: ${data.trackingNumber}` +
            (allOk
              ? ' — vásárlói + admin email + Telegram értesítés kiküldve.'
              : ' — figyelem, néhány értesítés nem ment ki, nézd a Vercel logokat.'),
        );
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
        {message && (
          <p className="mt-3 text-sm text-primary font-medium">{message}</p>
        )}
      </div>

      {/* Bank-transfer payment reminder (only for pending transfer orders) */}
      {showReminder && (
        <div className="bg-surface-container-lowest rounded-2xl p-6">
          <h2 className="font-headline font-bold text-on-surface mb-2">
            Fizetési emlékeztető
          </h2>
          <p className="text-sm text-on-surface/70 mb-4">
            Kedves emlékeztető a vevőnek a banki utalásról. Tartalmazza a
            rendelés részleteit és az utalási adatokat.
          </p>
          <label className="flex items-start gap-2 text-sm text-on-surface/80 mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={reminderIncludeCard}
              onChange={(e) => setReminderIncludeCard(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-gray-300"
            />
            <span>
              <strong>Bankkártyás fizetési lehetőség</strong> hozzáadása az emailhez
              <span className="block text-xs text-on-surface/60">
                Egy egykattintásos Stripe linkkel váltogathatja a fizetési módot.
              </span>
            </span>
          </label>
          <button
            onClick={handleSendReminder}
            disabled={reminderLoading}
            className="bg-[#C4A591] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {reminderLoading ? 'Küldés...' : 'Emlékeztető küldése'}
          </button>
          {reminderMessage && (
            <p className="mt-3 text-sm text-primary font-medium">{reminderMessage}</p>
          )}
        </div>
      )}

      {/* Foxpost shipping — hidden for digital-only / cancelled / delivered orders */}
      {showFoxpost && (
        <div className="bg-surface-container-lowest rounded-2xl p-6">
          <h2 className="font-headline font-bold text-on-surface mb-4">
            Foxpost szállítás
          </h2>
          {foxpostBlocked && (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
              A rendelés még függő státuszban van. Foxpost feladás csak kifizetett
              rendelésekhez engedélyezett — előbb állítsd "Fizetett"-re.
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-4 items-end">
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
            <button
              onClick={handleFoxpostShip}
              disabled={foxpostLoading || !!currentTracking || foxpostBlocked}
              className="bg-[#E8740C] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#d16a0b] transition-colors disabled:opacity-50"
            >
              {foxpostLoading ? 'Feladás...' : 'Foxpost feladás'}
            </button>
            {currentTracking && (
              <a
                href={`/api/admin/foxpost/label?trackingId=${currentTracking}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#E8740C]/10 text-[#E8740C] px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[#E8740C]/20 transition-colors"
              >
                Címke letöltése (PDF)
              </a>
            )}
            {currentTracking && (
              <button
                onClick={handleFoxpostCancel}
                disabled={foxpostLoading}
                className="bg-red-50 text-red-600 px-5 py-2.5 rounded-full text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                {foxpostLoading ? 'Visszavonás...' : 'Foxpost visszavonása'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
