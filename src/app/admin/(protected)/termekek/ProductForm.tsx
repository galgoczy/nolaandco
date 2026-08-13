'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from './ImageUpload';
import VideoUpload from './VideoUpload';
import VariantEditor, { type VariantFormValue } from './VariantEditor';
import { makeVideoEntry, parseMediaEntry } from '@/lib/productMedia';
import RichTextarea from '@/components/admin/RichTextarea';

export type { VariantFormValue };

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
  hiddenFromListing: boolean;
  withdrawalEligible: boolean;
  noShipping: boolean;
  onSale: boolean;
  salePrice: number | '';
  stock: number | '';
  productionTime: string;
  material: string;
  size: string;
  careInfo: string;
  features: string[];
  variants: VariantFormValue[];
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
  hiddenFromListing: false,
  withdrawalEligible: false,
  noShipping: false,
  onSale: false,
  salePrice: '',
  stock: '',
  productionTime: '',
  material: '',
  size: '',
  careInfo: '',
  features: [],
  variants: [],
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
      stock: values.stock === '' ? null : Number(values.stock),
      features: values.features.map((f) => f.trim()).filter(Boolean),
      variants: values.variants
        .filter((v) => v.name.trim() !== '')
        .map((v, i) => ({
          id: v.id,
          name: v.name.trim(),
          colorHex: v.colorHex.trim() || null,
          colorHex2: v.colorHex2.trim() || null,
          images: v.images,
          priceDiff: v.priceDiff === '' ? 0 : Number(v.priceDiff),
          stock: v.stock === '' ? null : Number(v.stock),
          sortOrder: i,
          active: v.active,
        })),
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

  function moveImage(idx: number, dir: -1 | 1) {
    const target = idx + dir;
    if (target < 0 || target >= values.images.length) return;
    const next = [...values.images];
    [next[idx], next[target]] = [next[target], next[idx]];
    update('images', next);
  }

  function updateFeature(idx: number, value: string) {
    update(
      'features',
      values.features.map((f, i) => (i === idx ? value : f)),
    );
  }

  function moveFeature(idx: number, dir: -1 | 1) {
    const target = idx + dir;
    if (target < 0 || target >= values.features.length) return;
    const next = [...values.features];
    [next[idx], next[target]] = [next[target], next[idx]];
    update('features', next);
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
            <RichTextarea
              className={inputCls}
              minHeight="120px"
              value={values.description}
              onChange={(v) => update('description', v)}
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>Bővebb leírás (a termék képek alatt jelenik meg)</label>
            <RichTextarea
              className={inputCls}
              minHeight="200px"
              value={values.longDescription}
              onChange={(v) => update('longDescription', v)}
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
          <div>
            <label className={labelCls}>Készlet (üres = nincs készletkövetés)</label>
            <input
              type="number"
              className={inputCls}
              value={values.stock}
              min={0}
              onChange={(e) =>
                update('stock', e.target.value === '' ? '' : Number(e.target.value))
              }
              placeholder="pl. 12"
            />
            <p className="text-xs text-on-surface/50 mt-1">
              0 esetén a termék &bdquo;Jelenleg nem elérhető&rdquo;. Ha vannak variánsok, a
              variáns saját készlete dönt.
            </p>
          </div>
        </div>
      </section>

      {/* Product sheet */}
      <section className="bg-surface-container-lowest rounded-2xl p-6">
        <h2 className="text-lg font-headline font-bold mb-1">Termékadatok</h2>
        <p className="text-xs text-on-surface/60 mb-4">
          A termékoldalon adatlapként jelennek meg. Az üresen hagyott mezők nem látszanak.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Gyártási idő</label>
            <input
              type="text"
              className={inputCls}
              value={values.productionTime}
              onChange={(e) => update('productionTime', e.target.value)}
              placeholder="pl. kb. 2 hét"
            />
          </div>
          <div>
            <label className={labelCls}>Méret</label>
            <input
              type="text"
              className={inputCls}
              value={values.size}
              onChange={(e) => update('size', e.target.value)}
              placeholder="pl. 30 × 30 cm"
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>Anyagösszetétel</label>
            <input
              type="text"
              className={inputCls}
              value={values.material}
              onChange={(e) => update('material', e.target.value)}
              placeholder="pl. 100% OEKO-TEX® minősítésű pamut duplagéz"
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>Ápolási és kezelési információk</label>
            <textarea
              className={inputCls}
              rows={3}
              value={values.careInfo}
              onChange={(e) => update('careInfo', e.target.value)}
              placeholder="pl. 30°C-os kímélő gépi programon mosható..."
            />
          </div>
        </div>
      </section>

      {/* Trust bar / highlights */}
      <section className="bg-surface-container-lowest rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4 mb-1">
          <h2 className="text-lg font-headline font-bold">Bizalmi információk / termékjellemzők</h2>
          <button
            type="button"
            onClick={() => update('features', [...values.features, ''])}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-surface-container hover:bg-surface-container-high whitespace-nowrap"
          >
            + Sor
          </button>
        </div>
        <p className="text-xs text-on-surface/60 mb-4">
          A kosárba tevő gomb alatti sáv sorai. Ha üresen hagyod, a kategória alapértelmezett
          sorai jelennek meg.
        </p>
        {values.features.length === 0 ? (
          <p className="text-sm text-on-surface/50">
            Nincs egyedi sor — a kategória alapértelmezését használjuk.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {values.features.map((f, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  className={inputCls}
                  value={f}
                  onChange={(e) => updateFeature(idx, e.target.value)}
                  placeholder="pl. OEKO-TEX alapanyagok"
                />
                <button
                  type="button"
                  onClick={() => moveFeature(idx, -1)}
                  disabled={idx === 0}
                  className="px-2 py-1 text-xs text-on-surface/60 hover:text-on-surface disabled:opacity-20"
                  aria-label="Fel"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => moveFeature(idx, 1)}
                  disabled={idx === values.features.length - 1}
                  className="px-2 py-1 text-xs text-on-surface/60 hover:text-on-surface disabled:opacity-20"
                  aria-label="Le"
                >
                  ▼
                </button>
                <button
                  type="button"
                  onClick={() =>
                    update(
                      'features',
                      values.features.filter((_, i) => i !== idx),
                    )
                  }
                  className="px-3 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 whitespace-nowrap"
                >
                  Törlés
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <VariantEditor variants={values.variants} onChange={(next) => update('variants', next)} />

      {/* Images */}
      <section className="bg-surface-container-lowest rounded-2xl p-6">
        <h2 className="text-lg font-headline font-bold mb-4">Képek</h2>
        <div className="flex flex-col gap-6">
          <div>
            <label className={labelCls}>Fő kép</label>
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
                {values.images.map((img, idx) => {
                  const media = parseMediaEntry(img);
                  return (
                  <li key={`${img}-${idx}`} className="relative">
                    <div className="relative">
                      {media.type === 'video' && media.poster ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={media.poster}
                          alt=""
                          className="w-24 h-24 rounded-lg object-cover bg-gray-900 border border-outline-variant"
                        />
                      ) : media.type === 'video' ? (
                        <div className="w-24 h-24 rounded-lg bg-gray-900 border border-outline-variant" />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={media.src}
                          alt=""
                          className="w-24 h-24 rounded-lg object-cover bg-gray-100 border border-outline-variant"
                        />
                      )}
                      {media.type === 'video' && (
                        <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="w-8 h-8 rounded-full bg-white/85 flex items-center justify-center text-[#4A4A4A] text-xs">
                            ▶
                          </span>
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600"
                      aria-label="Törlés"
                    >
                      ×
                    </button>
                    {/* Sorrendezés — a galéria ebben a sorrendben jelenik meg (képek és videók közösen). */}
                    <div className="flex justify-center gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => moveImage(idx, -1)}
                        disabled={idx === 0}
                        className="px-1 text-xs text-on-surface/60 hover:text-on-surface disabled:opacity-20"
                        aria-label="Előrébb"
                      >
                        ◀
                      </button>
                      <button
                        type="button"
                        onClick={() => moveImage(idx, 1)}
                        disabled={idx === values.images.length - 1}
                        className="px-1 text-xs text-on-surface/60 hover:text-on-surface disabled:opacity-20"
                        aria-label="Hátrébb"
                      >
                        ▶
                      </button>
                    </div>
                  </li>
                  );
                })}
              </ul>
            )}
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                <ImageUpload
                  label="További kép feltöltése"
                  onUploaded={(url) => update('images', [...values.images, url])}
                />
                <VideoUpload
                  onUploaded={(videoUrl, posterUrl) =>
                    update('images', [...values.images, makeVideoEntry(videoUrl, posterUrl)])
                  }
                />
              </div>
              <p className="text-xs text-on-surface/50">
                Rövid, tömörített MP4 ajánlott (max 64 MB). A borítókép automatikusan az első
                képkockából készül; a videó a galériában a fenti sorrend szerint jelenik meg,
                és csak kattintásra indul el.
              </p>
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
      <section className="bg-surface-container-lowest rounded-2xl p-6 space-y-3">
        <label className="flex items-center gap-2 text-sm font-body cursor-pointer">
          <input
            type="checkbox"
            checked={values.active}
            onChange={(e) => update('active', e.target.checked)}
          />
          Aktív (látható a boltban)
        </label>
        <label className="flex items-start gap-2 text-sm font-body cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={values.hiddenFromListing}
            onChange={(e) => update('hiddenFromListing', e.target.checked)}
          />
          <span>
            Elrejtés a listázásokból (főoldal + termékek oldal)
            <span className="block text-xs text-on-surface/60 mt-0.5">
              A termékoldal elérhető marad direkt linken keresztül (pl. aliasok).
            </span>
          </span>
        </label>
        <label className="flex items-start gap-2 text-sm font-body cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={values.withdrawalEligible}
            onChange={(e) => update('withdrawalEligible', e.target.checked)}
          />
          <span>
            Elállásra jogosult (14 napos elállási jog)
            <span className="block text-xs text-on-surface/60 mt-0.5">
              Csak nem személyre szabott termékeknél kapcsold be. Ekkor a vásárló online
              kezdeményezheti az elállást a fiókjából és a rendelésnél.
            </span>
          </span>
        </label>
        <label className="flex items-start gap-2 text-sm font-body cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={values.noShipping}
            onChange={(e) => update('noShipping', e.target.checked)}
          />
          <span>
            Nincs szállítási költség (digitális termék)
            <span className="block text-xs text-on-surface/60 mt-0.5">
              Pl. digitális ajándékkártya vagy letölthető poszter. A pénztár nem számol rá
              szállítási díjat; ha a kosárban csak ilyen termékek vannak, a szállítás ingyenes.
            </span>
          </span>
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
