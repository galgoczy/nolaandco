'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from './ImageUpload';

export type ProductFormValues = {
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  price: number;
  category: string;
  series: string;
  variant: string;
  imageUrl: string;
  images: string[];
  badge: string;
  active: boolean;
  onSale: boolean;
  salePrice: number | '';
};

export const emptyProduct: ProductFormValues = {
  name: '',
  slug: '',
  description: '',
  longDescription: '',
  price: 0,
  category: 'pillow',
  series: '',
  variant: '',
  imageUrl: '',
  images: [],
  badge: '',
  active: true,
  onSale: false,
  salePrice: '',
};

export default function ProductForm({
  initial,
  productId,
  categories,
}: {
  initial: ProductFormValues;
  productId?: string;
  categories: { value: string; label: string }[];
}) {
  const router = useRouter();
  const [values, setValues] = useState<ProductFormValues>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [newImage, setNewImage] = useState('');

  const isEdit = !!productId;

  function update<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function slugify(s: string) {
    return s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      ...values,
      price: Number(values.price) || 0,
      salePrice: values.salePrice === '' ? null : Number(values.salePrice),
    };

    try {
      const res = await fetch(
        isEdit ? `/api/admin/products/${productId}` : '/api/admin/products',
        {
          method: isEdit ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Mentés sikertelen');
        return;
      }
      router.push('/admin/termekek');
      router.refresh();
    } catch {
      setError('Hálózati hiba');
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    'w-full px-3 py-2 rounded-lg border border-outline-variant bg-white text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30';
  const labelCls = 'block text-xs font-body text-on-surface/70 mb-1';

  function addImage() {
    const url = newImage.trim();
    if (!url) return;
    update('images', [...values.images, url]);
    setNewImage('');
  }

  function removeImage(idx: number) {
    update(
      'images',
      values.images.filter((_, i) => i !== idx),
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-3xl">
      {/* Basics */}
      <section className="bg-surface-container-lowest rounded-2xl p-6">
        <h2 className="text-lg font-headline font-bold mb-4">Alapadatok</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Név *</label>
            <input
              type="text"
              className={inputCls}
              value={values.name}
              onChange={(e) => {
                const name = e.target.value;
                update('name', name);
                if (!isEdit && !values.slug) update('slug', slugify(name));
              }}
              required
            />
          </div>
          <div>
            <label className={labelCls}>Slug (URL) *</label>
            <input
              type="text"
              className={inputCls}
              value={values.slug}
              onChange={(e) => update('slug', e.target.value)}
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>Összefoglaló (rövid leírás) *</label>
            <textarea
              className={`${inputCls} min-h-[120px]`}
              value={values.description}
              onChange={(e) => update('description', e.target.value)}
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>Bővebb leírás (a termék képek alatt jelenik meg)</label>
            <textarea
              className={`${inputCls} min-h-[200px]`}
              value={values.longDescription}
              onChange={(e) => update('longDescription', e.target.value)}
              placeholder="Hosszabb, részletes termékleírás. Új sorok megőrződnek."
            />
          </div>
          <div>
            <label className={labelCls}>Kategória *</label>
            <select
              className={inputCls}
              value={values.category}
              onChange={(e) => update('category', e.target.value)}
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Badge (pl. &ldquo;Új&rdquo;, &ldquo;Limited&rdquo;)</label>
            <input
              type="text"
              className={inputCls}
              value={values.badge}
              onChange={(e) => update('badge', e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>Széria (opcionális)</label>
            <input
              type="text"
              className={inputCls}
              value={values.series}
              onChange={(e) => update('series', e.target.value)}
              placeholder="origin / nova / ..."
            />
          </div>
          <div>
            <label className={labelCls}>Variáns (opcionális)</label>
            <input
              type="text"
              className={inputCls}
              value={values.variant}
              onChange={(e) => update('variant', e.target.value)}
              placeholder="core / linea / atelier / ..."
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-surface-container-lowest rounded-2xl p-6">
        <h2 className="text-lg font-headline font-bold mb-4">Árazás</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Ár (Ft) *</label>
            <input
              type="number"
              className={inputCls}
              value={values.price}
              onChange={(e) => update('price', Number(e.target.value))}
              min={0}
              required
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm font-body cursor-pointer">
              <input
                type="checkbox"
                checked={values.onSale}
                onChange={(e) => update('onSale', e.target.checked)}
              />
              Akciós
            </label>
          </div>
          <div>
            <label className={labelCls}>Akciós ár (Ft)</label>
            <input
              type="number"
              className={inputCls}
              value={values.salePrice}
              onChange={(e) =>
                update('salePrice', e.target.value === '' ? '' : Number(e.target.value))
              }
              min={0}
              disabled={!values.onSale}
            />
          </div>
        </div>
      </section>

      {/* Images */}
      <section className="bg-surface-container-lowest rounded-2xl p-6">
        <h2 className="text-lg font-headline font-bold mb-4">Képek</h2>
        <div className="flex flex-col gap-6">
          <div>
            <label className={labelCls}>Fő kép *</label>
            <div className="flex items-start gap-4">
              {values.imageUrl ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={values.imageUrl}
                    alt=""
                    className="w-32 h-32 rounded-lg object-cover bg-gray-100 border border-outline-variant"
                  />
                  <button
                    type="button"
                    onClick={() => update('imageUrl', '')}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600"
                    aria-label="Eltávolítás"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="w-32 h-32 rounded-lg bg-surface-container border border-dashed border-outline-variant flex items-center justify-center text-xs text-on-surface/40 text-center px-2">
                  Nincs fő kép
                </div>
              )}
              <div className="flex-1 flex flex-col gap-2">
                <ImageUpload
                  label="Fő kép feltöltése"
                  onUploaded={(url) => update('imageUrl', url)}
                />
                <details className="text-xs">
                  <summary className="cursor-pointer text-on-surface/60 hover:text-on-surface">
                    ...vagy URL megadása
                  </summary>
                  <input
                    type="text"
                    className={`${inputCls} mt-2`}
                    value={values.imageUrl}
                    onChange={(e) => update('imageUrl', e.target.value)}
                    placeholder="https://... vagy /images/products/..."
                  />
                </details>
              </div>
            </div>
          </div>

          <div>
            <label className={labelCls}>További képek</label>
            {values.images.length > 0 && (
              <ul className="flex flex-wrap gap-3 mb-3">
                {values.images.map((img, idx) => (
                  <li key={idx} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt=""
                      className="w-24 h-24 rounded-lg object-cover bg-gray-100 border border-outline-variant"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600"
                      aria-label="Törlés"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-col gap-2">
              <ImageUpload
                label="További kép feltöltése"
                onUploaded={(url) => update('images', [...values.images, url])}
              />
              <details className="text-xs">
                <summary className="cursor-pointer text-on-surface/60 hover:text-on-surface">
                  ...vagy URL hozzáadása
                </summary>
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    className={inputCls}
                    value={newImage}
                    onChange={(e) => setNewImage(e.target.value)}
                    placeholder="https://... vagy /images/products/..."
                  />
                  <button
                    type="button"
                    onClick={addImage}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-surface-container hover:bg-surface-container-high whitespace-nowrap"
                  >
                    Hozzáad
                  </button>
                </div>
              </details>
            </div>
          </div>
        </div>
      </section>

      {/* Visibility */}
      <section className="bg-surface-container-lowest rounded-2xl p-6">
        <label className="flex items-center gap-2 text-sm font-body cursor-pointer">
          <input
            type="checkbox"
            checked={values.active}
            onChange={(e) => update('active', e.target.checked)}
          />
          Aktív (látható a boltban)
        </label>
      </section>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-primary text-on-primary px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? 'Mentés...' : isEdit ? 'Mentés' : 'Termék létrehozása'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/termekek')}
          className="px-6 py-2.5 rounded-lg text-sm font-medium bg-surface-container hover:bg-surface-container-high"
        >
          Mégse
        </button>
      </div>
    </form>
  );
}
