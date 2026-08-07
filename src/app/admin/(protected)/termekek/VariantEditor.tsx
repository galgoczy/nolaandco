'use client';

import ImageUpload from './ImageUpload';

export type VariantFormValue = {
  /** Csak a már mentett variánsoknál van kitöltve. */
  id?: string;
  name: string;
  colorHex: string;
  colorHex2: string;
  images: string[];
  priceDiff: number | '';
  stock: number | '';
  active: boolean;
};

export const emptyVariant: VariantFormValue = {
  name: '',
  colorHex: '#C4A591',
  colorHex2: '',
  images: [],
  priceDiff: 0,
  stock: '',
  active: true,
};

const inputCls =
  'w-full px-3 py-2 rounded-lg border border-outline-variant bg-white text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30';
const labelCls = 'block text-xs font-body text-on-surface/70 mb-1';

/**
 * Termékvariánsok szerkesztése: név, 1–2 színkód (kétoldalas párosításhoz),
 * variánsonkénti felár, készlet és saját képgaléria. A vásárlói oldalon
 * feliratozott swatch gombokként jelennek meg, nem legördülő listaként.
 */
export default function VariantEditor({
  variants,
  onChange,
}: {
  variants: VariantFormValue[];
  onChange: (next: VariantFormValue[]) => void;
}) {
  function update(idx: number, patch: Partial<VariantFormValue>) {
    onChange(variants.map((v, i) => (i === idx ? { ...v, ...patch } : v)));
  }

  function move(idx: number, dir: -1 | 1) {
    const target = idx + dir;
    if (target < 0 || target >= variants.length) return;
    const next = [...variants];
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  }

  function remove(idx: number) {
    if (!confirm('Biztosan törlöd ezt a variánst?')) return;
    onChange(variants.filter((_, i) => i !== idx));
  }

  function moveImage(vIdx: number, imgIdx: number, dir: -1 | 1) {
    const target = imgIdx + dir;
    const imgs = variants[vIdx].images;
    if (target < 0 || target >= imgs.length) return;
    const next = [...imgs];
    [next[imgIdx], next[target]] = [next[target], next[imgIdx]];
    update(vIdx, { images: next });
  }

  return (
    <section className="bg-surface-container-lowest rounded-2xl p-6">
      <div className="flex items-start justify-between gap-4 mb-2">
        <h2 className="text-lg font-headline font-bold">Variánsok</h2>
        <button
          type="button"
          onClick={() => onChange([...variants, { ...emptyVariant }])}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-surface-container hover:bg-surface-container-high whitespace-nowrap"
        >
          + Variáns
        </button>
      </div>
      <p className="text-xs text-on-surface/60 mb-5">
        Pl. színváltozatok vagy kétoldalas színpárosítások. A termékoldalon feliratozott
        színválasztó gombokként jelennek meg. Ha egy variánshoz töltesz fel képeket, a
        kiválasztásakor azok jelennek meg a galériában.
      </p>

      {variants.length === 0 ? (
        <p className="text-sm text-on-surface/50">
          Nincs variáns — a termék egyetlen változatként vásárolható meg.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {variants.map((v, idx) => (
            <li
              key={v.id ?? `new-${idx}`}
              className="rounded-xl border border-outline-variant bg-white p-4"
            >
              <div className="flex items-center gap-3 mb-4">
                <span
                  aria-hidden
                  className="w-8 h-8 rounded-full flex-shrink-0 ring-1 ring-inset ring-black/10"
                  style={{
                    background:
                      v.colorHex && v.colorHex2
                        ? `linear-gradient(135deg, ${v.colorHex} 0 50%, ${v.colorHex2} 50% 100%)`
                        : v.colorHex || '#E5D9C7',
                  }}
                />
                <span className="text-sm font-medium flex-1">{v.name || 'Névtelen variáns'}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(idx, -1)}
                    disabled={idx === 0}
                    className="px-2 py-1 text-xs text-on-surface/60 hover:text-on-surface disabled:opacity-20"
                    aria-label="Fel"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => move(idx, 1)}
                    disabled={idx === variants.length - 1}
                    className="px-2 py-1 text-xs text-on-surface/60 hover:text-on-surface disabled:opacity-20"
                    aria-label="Le"
                  >
                    ▼
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    className="px-3 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100"
                  >
                    Törlés
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className={labelCls}>Megnevezés *</label>
                  <input
                    type="text"
                    className={inputCls}
                    value={v.name}
                    onChange={(e) => update(idx, { name: e.target.value })}
                    placeholder="pl. Púderrózsaszín vagy Bézs – Cappuccino"
                  />
                </div>
                <div>
                  <label className={labelCls}>Szín</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      className="w-10 h-10 rounded border border-outline-variant bg-white p-0.5"
                      value={v.colorHex || '#C4A591'}
                      onChange={(e) => update(idx, { colorHex: e.target.value })}
                    />
                    <input
                      type="text"
                      className={inputCls}
                      value={v.colorHex}
                      onChange={(e) => update(idx, { colorHex: e.target.value })}
                      placeholder="#C4A591"
                    />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Második szín (kétoldalas párosításnál)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      className="w-10 h-10 rounded border border-outline-variant bg-white p-0.5"
                      value={v.colorHex2 || '#E5D9C7'}
                      onChange={(e) => update(idx, { colorHex2: e.target.value })}
                    />
                    <input
                      type="text"
                      className={inputCls}
                      value={v.colorHex2}
                      onChange={(e) => update(idx, { colorHex2: e.target.value })}
                      placeholder="üres = egyszínű"
                    />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Készlet (üres = nincs készletkövetés)</label>
                  <input
                    type="number"
                    className={inputCls}
                    value={v.stock}
                    min={0}
                    onChange={(e) =>
                      update(idx, { stock: e.target.value === '' ? '' : Number(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Felár a termék árához (Ft)</label>
                  <input
                    type="number"
                    className={inputCls}
                    value={v.priceDiff}
                    onChange={(e) =>
                      update(idx, { priceDiff: e.target.value === '' ? '' : Number(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className={labelCls}>Variáns képei (az első lesz a fő kép)</label>
                {v.images.length > 0 && (
                  <ul className="flex flex-wrap gap-3 mb-3">
                    {v.images.map((img, imgIdx) => (
                      <li key={`${img}-${imgIdx}`} className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img}
                          alt=""
                          className="w-20 h-20 rounded-lg object-cover bg-gray-100 border border-outline-variant"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            update(idx, { images: v.images.filter((_, i) => i !== imgIdx) })
                          }
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600"
                          aria-label="Törlés"
                        >
                          ×
                        </button>
                        <div className="flex justify-center gap-1 mt-1">
                          <button
                            type="button"
                            onClick={() => moveImage(idx, imgIdx, -1)}
                            disabled={imgIdx === 0}
                            className="px-1 text-xs text-on-surface/60 hover:text-on-surface disabled:opacity-20"
                            aria-label="Előrébb"
                          >
                            ◀
                          </button>
                          <button
                            type="button"
                            onClick={() => moveImage(idx, imgIdx, 1)}
                            disabled={imgIdx === v.images.length - 1}
                            className="px-1 text-xs text-on-surface/60 hover:text-on-surface disabled:opacity-20"
                            aria-label="Hátrébb"
                          >
                            ▶
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <ImageUpload
                  label="Variáns kép feltöltése"
                  onUploaded={(url) => update(idx, { images: [...v.images, url] })}
                />
              </div>

              <label className="flex items-center gap-2 text-sm font-body cursor-pointer mt-4">
                <input
                  type="checkbox"
                  checked={v.active}
                  onChange={(e) => update(idx, { active: e.target.checked })}
                />
                Aktív (választható a termékoldalon)
              </label>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
