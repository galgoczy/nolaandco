'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type CouponRow = {
  id: string;
  code: string;
  description: string;
  discountType: string;
  discountValue: number;
  minOrderAmount: number | null;
  usageLimit: number | null;
  usageCount: number;
  productIds: string[];
  categorySlugs: string[];
  freeShippingOnParcel: boolean;
  active: boolean;
  startsAt: string;
  endsAt: string;
};

type CatOption = { slug: string; name: string };

const emptyForm = {
  code: '',
  description: '',
  discountType: 'percent' as 'percent' | 'fixed',
  discountValue: '',
  minOrderAmount: '',
  usageLimit: '',
  categorySlugs: [] as string[],
  freeShippingOnParcel: false,
  active: true,
  startsAt: new Date().toISOString().slice(0, 16),
  endsAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 16),
};

export default function CouponManager({
  initial,
  categories,
}: {
  initial: CouponRow[];
  categories: CatOption[];
}) {
  const router = useRouter();
  const [coupons, setCoupons] = useState(initial);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function toggleActive(coupon: CouponRow) {
    const newVal = !coupon.active;
    setCoupons((prev) =>
      prev.map((c) => (c.id === coupon.id ? { ...c, active: newVal } : c)),
    );
    await fetch(`/api/admin/coupons/${coupon.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: newVal }),
    });
    router.refresh();
  }

  async function handleDelete(coupon: CouponRow) {
    if (!confirm(`Biztos törlöd: "${coupon.code}"?`)) return;
    const res = await fetch(`/api/admin/coupons/${coupon.id}`, { method: 'DELETE' });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error || 'Törlés sikertelen');
      return;
    }
    setCoupons((prev) => prev.filter((c) => c.id !== coupon.id));
    router.refresh();
  }

  async function saveNew() {
    if (!form.code.trim()) {
      setError('Kód kötelező');
      return;
    }
    setSaving(true);
    setError('');
    const res = await fetch('/api/admin/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        discountValue: Number(form.discountValue) || 0,
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : null,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(data.error || 'Mentés sikertelen');
      return;
    }
    setCoupons((prev) => [
      {
        ...data.coupon,
        startsAt: data.coupon.startsAt,
        endsAt: data.coupon.endsAt,
        createdAt: data.coupon.createdAt,
        updatedAt: data.coupon.updatedAt,
      },
      ...prev,
    ]);
    setAdding(false);
    setForm(emptyForm);
    router.refresh();
  }

  function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  function isExpired(c: CouponRow) {
    return new Date(c.endsAt) < new Date();
  }

  const inputCls =
    'w-full px-3 py-2 rounded-lg border border-outline-variant bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30';
  const labelCls = 'block text-xs text-on-surface/60 mb-1';

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      {/* List */}
      <div className="bg-surface-container-lowest rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="border-b border-outline-variant text-left bg-surface-container-low">
                <th className="p-4 text-on-surface/60 font-medium">Kód</th>
                <th className="p-4 text-on-surface/60 font-medium">Kedvezmény</th>
                <th className="p-4 text-on-surface/60 font-medium">Hatálya</th>
                <th className="p-4 text-on-surface/60 font-medium">Érvényesség</th>
                <th className="p-4 text-on-surface/60 font-medium text-center">Használat</th>
                <th className="p-4 text-on-surface/60 font-medium text-center">Aktív</th>
                <th className="p-4 text-on-surface/60 font-medium text-right">Műveletek</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr
                  key={c.id}
                  className={`border-b border-outline-variant/40 last:border-none ${isExpired(c) ? 'opacity-50' : ''}`}
                >
                  <td className="p-4 font-mono font-semibold tracking-wider">{c.code}</td>
                  <td className="p-4">
                    {c.discountType === 'percent'
                      ? `${c.discountValue}%`
                      : `${c.discountValue.toLocaleString('hu-HU')} Ft`}
                    {c.minOrderAmount ? (
                      <span className="block text-xs text-on-surface/50">
                        min. {c.minOrderAmount.toLocaleString('hu-HU')} Ft
                      </span>
                    ) : null}
                    {c.freeShippingOnParcel ? (
                      <span className="block text-xs text-green-600">+ ingyen csomagautomata</span>
                    ) : null}
                  </td>
                  <td className="p-4 text-xs text-on-surface/70">
                    {c.categorySlugs.length > 0 ? (
                      <span>
                        {c.categorySlugs.map((s) => categories.find((cat) => cat.slug === s)?.name ?? s).join(', ')}
                      </span>
                    ) : (
                      <span className="text-on-surface/50">Minden termékre</span>
                    )}
                  </td>
                  <td className="p-4 text-xs text-on-surface/70">
                    {fmtDate(c.startsAt)} – {fmtDate(c.endsAt)}
                  </td>
                  <td className="p-4 text-center text-on-surface/70">
                    {c.usageCount}
                    {c.usageLimit ? ` / ${c.usageLimit}` : ''}
                  </td>
                  <td className="p-4 text-center">
                    <button
                      type="button"
                      onClick={() => toggleActive(c)}
                      className={`w-9 h-5 rounded-full relative transition-colors ${
                        c.active ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                          c.active ? 'left-[18px]' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(c)}
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100"
                    >
                      Törlés
                    </button>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-on-surface/60">
                    Még nincs kupon. Kattints az &ldquo;Új kupon&rdquo; gombra.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New coupon form */}
      {adding ? (
        <div className="bg-surface-container-lowest rounded-2xl p-6">
          <h3 className="text-sm font-bold font-headline mb-4">Új kupon</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className={labelCls}>Kód *</label>
              <input
                className={inputCls}
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="NOLA15"
              />
            </div>
            <div>
              <label className={labelCls}>Leírás</label>
              <input
                className={inputCls}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="15% kedvezmény első rendelésre"
              />
            </div>
            <div>
              <label className={labelCls}>Típus</label>
              <select
                className={inputCls}
                value={form.discountType}
                onChange={(e) =>
                  setForm({ ...form, discountType: e.target.value as 'percent' | 'fixed' })
                }
              >
                <option value="percent">Százalékos (%)</option>
                <option value="fixed">Fix összeg (Ft)</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>
                Érték ({form.discountType === 'percent' ? '%' : 'Ft'}) *
              </label>
              <input
                type="number"
                className={inputCls}
                value={form.discountValue}
                onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                min={0}
              />
            </div>
            <div>
              <label className={labelCls}>Min. rendelési összeg (Ft)</label>
              <input
                type="number"
                className={inputCls}
                value={form.minOrderAmount}
                onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                min={0}
                placeholder="Opcionális"
              />
            </div>
            <div>
              <label className={labelCls}>Max felhasználás</label>
              <input
                type="number"
                className={inputCls}
                value={form.usageLimit}
                onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                min={0}
                placeholder="Korlátlan"
              />
            </div>
            <div>
              <label className={labelCls}>Érvényes: tól</label>
              <input
                type="datetime-local"
                className={inputCls}
                value={form.startsAt}
                onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>Érvényes: ig</label>
              <input
                type="datetime-local"
                className={inputCls}
                value={form.endsAt}
                onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>Kategóriák (üresen = mind)</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const selected = form.categorySlugs.includes(cat.slug);
                  return (
                    <button
                      key={cat.slug}
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          categorySlugs: selected
                            ? form.categorySlugs.filter((s) => s !== cat.slug)
                            : [...form.categorySlugs, cat.slug],
                        })
                      }
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        selected
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-container text-on-surface/60 hover:bg-surface-container-high'
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.freeShippingOnParcel}
                  onChange={(e) => setForm({ ...form, freeShippingOnParcel: e.target.checked })}
                  className="mt-0.5 w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/30"
                />
                <span className="text-sm">
                  Csomagautomatás szállítás ingyenes
                  <span className="block text-xs text-on-surface/60">
                    Házhozszállításra nem vonatkozik, és csak akkor érvényesül, ha a rendelés fizikai terméket tartalmaz.
                  </span>
                </span>
              </label>
            </div>
          </div>
          {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={saveNew}
              disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-on-primary hover:opacity-90 disabled:opacity-50"
            >
              {saving ? 'Mentés...' : 'Létrehozás'}
            </button>
            <button
              type="button"
              onClick={() => {
                setAdding(false);
                setError('');
              }}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-surface-container hover:bg-surface-container-high"
            >
              Mégse
            </button>
          </div>
        </div>
      ) : (
        <div>
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            + Új kupon
          </button>
        </div>
      )}
    </div>
  );
}
