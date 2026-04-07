'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type BannerRow = {
  id: string;
  text: string;
  textColor: string;
  bgColor: string;
  href: string;
  active: boolean;
  endsAt: string;
  bold: boolean;
};

const PRESET_COLORS = [
  { bg: '#C4C4C4', text: '#FFFFFF', label: 'Szürke' },
  { bg: '#C4A591', text: '#FFFFFF', label: 'Bézs' },
];

const emptyForm = {
  text: '',
  textColor: '#FFFFFF',
  bgColor: '#4A4A4A',
  href: '',
  active: true,
  endsAt: '',
  bold: false,
};

export default function BannerEditor({ initial }: { initial: BannerRow[] }) {
  const router = useRouter();
  const [banners, setBanners] = useState(initial);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function toggleActive(banner: BannerRow) {
    const newVal = !banner.active;
    setBanners((prev) =>
      prev.map((b) => (b.id === banner.id ? { ...b, active: newVal } : b)),
    );
    await fetch('/api/admin/banner', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: banner.id, active: newVal }),
    });
    router.refresh();
  }

  async function saveField(id: string, field: string, value: string) {
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [field]: value } : b)),
    );
    await fetch('/api/admin/banner', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        [field]: field === 'endsAt' && !value ? null : value,
      }),
    });
  }

  async function saveNew() {
    if (!form.text.trim()) {
      setError('Szöveg kötelező');
      return;
    }
    setSaving(true);
    setError('');
    const res = await fetch('/api/admin/banner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        endsAt: form.endsAt || null,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(data.error || 'Mentés sikertelen');
      return;
    }
    setBanners((prev) => [
      {
        id: data.banner.id,
        text: data.banner.text,
        textColor: data.banner.textColor,
        bgColor: data.banner.bgColor,
        href: data.banner.href ?? '',
        bold: data.banner.bold ?? false,
        active: data.banner.active,
        endsAt: data.banner.endsAt
          ? new Date(data.banner.endsAt).toISOString().slice(0, 16)
          : '',
      },
      ...prev,
    ]);
    setAdding(false);
    setForm(emptyForm);
    router.refresh();
  }

  const inputCls =
    'w-full px-3 py-2 rounded-lg border border-outline-variant bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30';
  const labelCls = 'block text-xs text-on-surface/60 mb-1';

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {banners.map((b) => (
        <div
          key={b.id}
          className="bg-surface-container-lowest rounded-2xl p-6 flex flex-col gap-4"
        >
          {/* Preview */}
          <div
            className="rounded-lg py-2 px-4 text-center text-sm"
            style={{
              backgroundColor: b.bgColor,
              color: b.textColor,
              fontWeight: b.bold ? 700 : 500,
            }}
          >
            {b.text || 'Szalagcím szövege...'}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Szöveg</label>
              <input
                className={inputCls}
                value={b.text}
                onChange={(e) =>
                  setBanners((prev) =>
                    prev.map((x) => (x.id === b.id ? { ...x, text: e.target.value } : x)),
                  )
                }
                onBlur={() => saveField(b.id, 'text', b.text)}
              />
            </div>
            <div>
              <label className={labelCls}>Link (opcionális)</label>
              <input
                className={inputCls}
                value={b.href}
                onChange={(e) =>
                  setBanners((prev) =>
                    prev.map((x) => (x.id === b.id ? { ...x, href: e.target.value } : x)),
                  )
                }
                onBlur={() => saveField(b.id, 'href', b.href)}
                placeholder="/termekek vagy https://..."
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className={labelCls}>Háttérszín</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={b.bgColor}
                    onChange={(e) => {
                      setBanners((prev) =>
                        prev.map((x) => (x.id === b.id ? { ...x, bgColor: e.target.value } : x)),
                      );
                    }}
                    onBlur={() => saveField(b.id, 'bgColor', b.bgColor)}
                    className="w-8 h-8 rounded cursor-pointer"
                  />
                  <input
                    className={`${inputCls} flex-1`}
                    value={b.bgColor}
                    onChange={(e) =>
                      setBanners((prev) =>
                        prev.map((x) => (x.id === b.id ? { ...x, bgColor: e.target.value } : x)),
                      )
                    }
                    onBlur={() => saveField(b.id, 'bgColor', b.bgColor)}
                  />
                </div>
              </div>
              <div className="flex-1">
                <label className={labelCls}>Szövegszín</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={b.textColor}
                    onChange={(e) => {
                      setBanners((prev) =>
                        prev.map((x) => (x.id === b.id ? { ...x, textColor: e.target.value } : x)),
                      );
                    }}
                    onBlur={() => saveField(b.id, 'textColor', b.textColor)}
                    className="w-8 h-8 rounded cursor-pointer"
                  />
                  <input
                    className={`${inputCls} flex-1`}
                    value={b.textColor}
                    onChange={(e) =>
                      setBanners((prev) =>
                        prev.map((x) => (x.id === b.id ? { ...x, textColor: e.target.value } : x)),
                      )
                    }
                    onBlur={() => saveField(b.id, 'textColor', b.textColor)}
                  />
                </div>
              </div>
            </div>
            <div>
              <label className={labelCls}>Gyorsszín</label>
              <div className="flex gap-2">
                {PRESET_COLORS.map((preset) => (
                  <button
                    key={preset.bg}
                    type="button"
                    onClick={() => {
                      setBanners((prev) =>
                        prev.map((x) =>
                          x.id === b.id ? { ...x, bgColor: preset.bg, textColor: preset.text } : x,
                        ),
                      );
                      saveField(b.id, 'bgColor', preset.bg);
                      saveField(b.id, 'textColor', preset.text);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border border-outline-variant hover:opacity-80"
                    style={{ backgroundColor: preset.bg, color: preset.text }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label className={labelCls}>Automatikus kikapcsolás (üresen = manuális)</label>
                <input
                  type="datetime-local"
                  className={inputCls}
                  value={b.endsAt}
                  onChange={(e) =>
                    setBanners((prev) =>
                      prev.map((x) => (x.id === b.id ? { ...x, endsAt: e.target.value } : x)),
                    )
                  }
                  onBlur={() => saveField(b.id, 'endsAt', b.endsAt)}
                />
              </div>
              <label className="flex items-center gap-2 text-sm font-body cursor-pointer pb-2">
                <input
                  type="checkbox"
                  checked={b.bold}
                  onChange={(e) => {
                    const bold = e.target.checked;
                    setBanners((prev) =>
                      prev.map((x) => (x.id === b.id ? { ...x, bold } : x)),
                    );
                    saveField(b.id, 'bold', String(bold));
                  }}
                />
                <span className="font-bold">B</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-body cursor-pointer">
              <button
                type="button"
                onClick={() => toggleActive(b)}
                className={`w-9 h-5 rounded-full relative transition-colors ${
                  b.active ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    b.active ? 'left-[18px]' : 'left-0.5'
                  }`}
                />
              </button>
              {b.active ? 'Aktív' : 'Inaktív'}
            </label>
          </div>
        </div>
      ))}

      {adding ? (
        <div className="bg-surface-container-lowest rounded-2xl p-6">
          <h3 className="text-sm font-bold font-headline mb-4">Új szalagcím</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className={labelCls}>Szöveg *</label>
              <input
                className={inputCls}
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
                placeholder="🎉 -15% kedvezmény! Kód: NOLA15"
              />
            </div>
            <div>
              <label className={labelCls}>Link (opcionális)</label>
              <input
                className={inputCls}
                value={form.href}
                onChange={(e) => setForm({ ...form, href: e.target.value })}
                placeholder="/termekek"
              />
            </div>
            <div>
              <label className={labelCls}>Automatikus kikapcsolás</label>
              <input
                type="datetime-local"
                className={inputCls}
                value={form.endsAt}
                onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
              />
            </div>
            <div className="flex gap-4">
              <div>
                <label className={labelCls}>Háttér</label>
                <input
                  type="color"
                  value={form.bgColor}
                  onChange={(e) => setForm({ ...form, bgColor: e.target.value })}
                  className="w-10 h-10 rounded cursor-pointer"
                />
              </div>
              <div>
                <label className={labelCls}>Szöveg</label>
                <input
                  type="color"
                  value={form.textColor}
                  onChange={(e) => setForm({ ...form, textColor: e.target.value })}
                  className="w-10 h-10 rounded cursor-pointer"
                />
              </div>
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
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="self-start bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          + Új szalagcím
        </button>
      )}
    </div>
  );
}
