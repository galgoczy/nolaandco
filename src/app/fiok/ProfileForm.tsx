'use client';

import { useState, FormEvent } from 'react';

type Profile = {
  name: string;
  phone: string;
  shippingName: string;
  shippingZip: string;
  shippingCity: string;
  shippingAddress: string;
  shippingNote: string;
  billingZip: string;
  billingCity: string;
  billingAddress: string;
  newsletter: boolean;
};

export default function ProfileForm({ initial }: { initial: Profile }) {
  const [profile, setProfile] = useState<Profile>(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMessage({ type: 'err', text: data.error || 'Mentés sikertelen' });
      } else {
        setMessage({ type: 'ok', text: 'Mentve' });
      }
    } catch {
      setMessage({ type: 'err', text: 'Hálózati hiba' });
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    'w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-[#4A4A4A] focus:outline-none focus:ring-2 focus:ring-[#D5E8F0]';
  const labelCls = 'block text-xs font-body text-[#4A4A4A]/70 mb-1';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Név</label>
          <input
            type="text"
            className={inputCls}
            value={profile.name}
            onChange={(e) => {
              const name = e.target.value;
              setProfile((prev) => ({
                ...prev,
                name,
                shippingName: !prev.shippingName || prev.shippingName === prev.name
                  ? name
                  : prev.shippingName,
              }));
            }}
          />
        </div>
        <div>
          <label className={labelCls}>Telefonszám</label>
          <input
            type="tel"
            className={inputCls}
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
          />
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-body text-[#4A4A4A] mb-3">Alapértelmezett szállítási cím</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={labelCls}>Címzett neve</label>
            <input
              type="text"
              className={inputCls}
              value={profile.shippingName}
              onChange={(e) => setProfile({ ...profile, shippingName: e.target.value })}
            />
          </div>
          <div>
            <label className={labelCls}>Irányítószám</label>
            <input
              type="text"
              className={inputCls}
              value={profile.shippingZip}
              onChange={(e) => setProfile({ ...profile, shippingZip: e.target.value })}
            />
          </div>
          <div>
            <label className={labelCls}>Város</label>
            <input
              type="text"
              className={inputCls}
              value={profile.shippingCity}
              onChange={(e) => setProfile({ ...profile, shippingCity: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>Utca, házszám</label>
            <input
              type="text"
              className={inputCls}
              value={profile.shippingAddress}
              onChange={(e) => setProfile({ ...profile, shippingAddress: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>Megjegyzés (opcionális)</label>
            <input
              type="text"
              className={inputCls}
              value={profile.shippingNote}
              onChange={(e) => setProfile({ ...profile, shippingNote: e.target.value })}
              placeholder="Pl. kapucsengő, emelet, ajtó..."
            />
          </div>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-body text-[#4A4A4A] mb-3">Számlázási cím</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Irányítószám</label>
            <input
              type="text"
              className={inputCls}
              value={profile.billingZip}
              maxLength={4}
              inputMode="numeric"
              onChange={async (e) => {
                const zip = e.target.value;
                setProfile((prev) => ({ ...prev, billingZip: zip }));
                if (zip.length === 4) {
                  try {
                    const res = await fetch(`/api/zip-to-city?zip=${zip}`);
                    const data = await res.json();
                    if (data.city) {
                      setProfile((prev) => ({ ...prev, billingCity: data.city }));
                    }
                  } catch { /* ignore */ }
                }
              }}
            />
          </div>
          <div>
            <label className={labelCls}>Város</label>
            <input
              type="text"
              className={inputCls}
              value={profile.billingCity}
              onChange={(e) => setProfile({ ...profile, billingCity: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>Utca, házszám</label>
            <input
              type="text"
              className={inputCls}
              value={profile.billingAddress}
              onChange={(e) => setProfile({ ...profile, billingAddress: e.target.value })}
            />
          </div>
        </div>
      </div>

      <label className="flex items-center gap-2 mt-2 text-sm text-[#4A4A4A] font-body cursor-pointer">
        <input
          type="checkbox"
          checked={profile.newsletter}
          onChange={(e) => setProfile({ ...profile, newsletter: e.target.checked })}
        />
        Feliratkozás a hírlevélre
      </label>

      <div className="flex items-center gap-4 mt-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-[#D5E8F0] text-[#4A4A4A] px-5 py-2 rounded-full text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? 'Mentés...' : 'Mentés'}
        </button>
        {message && (
          <span
            className={`text-sm font-body ${
              message.type === 'ok' ? 'text-green-600' : 'text-red-500'
            }`}
          >
            {message.text}
          </span>
        )}
      </div>
    </form>
  );
}
