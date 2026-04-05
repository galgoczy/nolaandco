'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Cat = {
  id: string;
  slug: string;
  name: string;
  nameEn: string;
  sortOrder: number;
  visibleOnHome: boolean;
  productCount: number;
};

export default function CategoryManager({ initial }: { initial: Cat[] }) {
  const router = useRouter();
  const [cats, setCats] = useState<Cat[]>(initial);
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ slug: '', name: '', nameEn: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // --- Reorder ---
  async function move(idx: number, dir: -1 | 1) {
    const target = idx + dir;
    if (target < 0 || target >= cats.length) return;
    const next = [...cats];
    [next[idx], next[target]] = [next[target], next[idx]];
    const order = next.map((c, i) => ({ id: c.id, sortOrder: i }));
    setCats(next.map((c, i) => ({ ...c, sortOrder: i })));

    await fetch('/api/admin/categories', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order }),
    });
    router.refresh();
  }

  // --- Toggle visibility ---
  async function toggleVisible(cat: Cat) {
    const newVal = !cat.visibleOnHome;
    setCats((prev) =>
      prev.map((c) => (c.id === cat.id ? { ...c, visibleOnHome: newVal } : c)),
    );
    await fetch(`/api/admin/categories/${cat.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visibleOnHome: newVal }),
    });
    router.refresh();
  }

  // --- Inline edit ---
  function startEdit(cat: Cat) {
    setEditing(cat.id);
    setForm({ slug: cat.slug, name: cat.name, nameEn: cat.nameEn });
    setAdding(false);
    setError('');
  }

  async function saveEdit(id: string) {
    if (!form.name.trim()) {
      setError('Név kötelező');
      return;
    }
    setSaving(true);
    setError('');
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: form.slug, name: form.name, nameEn: form.nameEn }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(data.error || 'Mentés sikertelen');
      return;
    }
    setCats((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, slug: form.slug, name: form.name, nameEn: form.nameEn } : c,
      ),
    );
    setEditing(null);
    router.refresh();
  }

  // --- Add new ---
  function startAdd() {
    setAdding(true);
    setEditing(null);
    setForm({ slug: '', name: '', nameEn: '' });
    setError('');
  }

  async function saveNew() {
    if (!form.slug.trim() || !form.name.trim()) {
      setError('Slug és név kötelező');
      return;
    }
    setSaving(true);
    setError('');
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(data.error || 'Mentés sikertelen');
      return;
    }
    setCats((prev) => [...prev, { ...data.category, nameEn: data.category.nameEn ?? '', productCount: 0 }]);
    setAdding(false);
    router.refresh();
  }

  // --- Delete ---
  async function handleDelete(cat: Cat) {
    if (!confirm(`Biztos törlöd: "${cat.name}"?`)) return;
    const res = await fetch(`/api/admin/categories/${cat.id}`, { method: 'DELETE' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(data.error || 'Törlés sikertelen');
      return;
    }
    setCats((prev) => prev.filter((c) => c.id !== cat.id));
    router.refresh();
  }

  const inputCls =
    'px-2 py-1 rounded border border-outline-variant bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30';

  return (
    <div className="flex flex-col gap-4 max-w-3xl">
      <div className="bg-surface-container-lowest rounded-2xl overflow-hidden">
        <table className="w-full text-sm font-body">
          <thead>
            <tr className="border-b border-outline-variant text-left bg-surface-container-low">
              <th className="p-4 text-on-surface/60 font-medium w-10">Sorrend</th>
              <th className="p-4 text-on-surface/60 font-medium">Slug</th>
              <th className="p-4 text-on-surface/60 font-medium">Magyar név</th>
              <th className="p-4 text-on-surface/60 font-medium">Angol név</th>
              <th className="p-4 text-on-surface/60 font-medium text-center">Termékek</th>
              <th className="p-4 text-on-surface/60 font-medium text-center">Főoldalon</th>
              <th className="p-4 text-on-surface/60 font-medium text-right">Műveletek</th>
            </tr>
          </thead>
          <tbody>
            {cats.map((cat, idx) => (
              <tr key={cat.id} className="border-b border-outline-variant/40 last:border-none">
                <td className="p-4">
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => move(idx, -1)}
                      disabled={idx === 0}
                      className="text-on-surface/60 hover:text-on-surface disabled:opacity-20 text-xs"
                      aria-label="Fel"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => move(idx, 1)}
                      disabled={idx === cats.length - 1}
                      className="text-on-surface/60 hover:text-on-surface disabled:opacity-20 text-xs"
                      aria-label="Le"
                    >
                      ▼
                    </button>
                  </div>
                </td>

                {editing === cat.id ? (
                  <>
                    <td className="p-4">
                      <input
                        className={inputCls}
                        value={form.slug}
                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
                      />
                    </td>
                    <td className="p-4">
                      <input
                        className={inputCls}
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                      />
                    </td>
                    <td className="p-4">
                      <input
                        className={inputCls}
                        value={form.nameEn}
                        onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                      />
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-4 font-mono text-xs text-on-surface/60">{cat.slug}</td>
                    <td className="p-4">{cat.name}</td>
                    <td className="p-4 text-on-surface/70">{cat.nameEn || '—'}</td>
                  </>
                )}

                <td className="p-4 text-center text-on-surface/60">{cat.productCount}</td>

                <td className="p-4 text-center">
                  <button
                    type="button"
                    onClick={() => toggleVisible(cat)}
                    className={`w-9 h-5 rounded-full relative transition-colors ${
                      cat.visibleOnHome ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                    aria-label={cat.visibleOnHome ? 'Elrejtés' : 'Megjelenítés'}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                        cat.visibleOnHome ? 'left-[18px]' : 'left-0.5'
                      }`}
                    />
                  </button>
                </td>

                <td className="p-4 text-right">
                  {editing === cat.id ? (
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => saveEdit(cat.id)}
                        disabled={saving}
                        className="px-3 py-1 rounded-lg text-xs font-medium bg-primary text-on-primary hover:opacity-90 disabled:opacity-50"
                      >
                        Mentés
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(null)}
                        className="px-3 py-1 rounded-lg text-xs font-medium bg-surface-container hover:bg-surface-container-high"
                      >
                        Mégse
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(cat)}
                        className="px-3 py-1 rounded-lg text-xs font-medium bg-surface-container-low hover:bg-surface-container"
                      >
                        Szerkeszt
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cat)}
                        className="px-3 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100"
                      >
                        Törlés
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add new */}
      {adding ? (
        <div className="bg-surface-container-lowest rounded-2xl p-6">
          <h3 className="text-sm font-bold font-headline mb-3">Új kategória</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-xs text-on-surface/60 mb-1">Slug *</label>
              <input
                className={`${inputCls} w-full`}
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="pl. pillow"
              />
            </div>
            <div>
              <label className="block text-xs text-on-surface/60 mb-1">Magyar név *</label>
              <input
                className={`${inputCls} w-full`}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="pl. Párnák"
              />
            </div>
            <div>
              <label className="block text-xs text-on-surface/60 mb-1">Angol név</label>
              <input
                className={`${inputCls} w-full`}
                value={form.nameEn}
                onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                placeholder="pl. KEEPSAKES"
              />
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
              onClick={() => setAdding(false)}
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
            onClick={startAdd}
            className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            + Új kategória
          </button>
        </div>
      )}

      {error && !adding && !editing && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
