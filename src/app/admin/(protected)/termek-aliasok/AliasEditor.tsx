'use client';

import { useState } from 'react';
import Image from 'next/image';
import ImageUpload from '../termekek/ImageUpload';

const LAYOUT_OPTIONS = [
  { id: 'origin-1', label: 'Origin 1' },
  { id: 'origin-2', label: 'Origin 2' },
  { id: 'origin-3', label: 'Origin 3' },
  { id: 'nova-1', label: 'Nova 1' },
  { id: 'nova-2', label: 'Nova 2' },
  { id: 'nova-3', label: 'Nova 3' },
];

type Alias = {
  id: string;
  slug: string;
  name: string;
  imageUrl: string;
  badge: string | null;
  targetProductSlug: string;
  defaultLayoutId: string;
  sortOrder: number;
  active: boolean;
};

export default function AliasEditor({ alias }: { alias: Alias }) {
  const [name, setName] = useState(alias.name);
  const [imageUrl, setImageUrl] = useState(alias.imageUrl);
  const [defaultLayoutId, setDefaultLayoutId] = useState(alias.defaultLayoutId);
  const [active, setActive] = useState(alias.active);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/aliases/${alias.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, imageUrl, defaultLayoutId, active }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Mentés sikertelen');
      } else {
        setSavedAt(Date.now());
      }
    } catch {
      setError('Hálózati hiba');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
      <div className="flex items-start gap-6">
        <div className="relative w-28 h-40 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container">
          {imageUrl && (
            <Image src={imageUrl} alt={name} fill className="object-cover" sizes="112px" />
          )}
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-on-surface/60 font-body">
                URL: /termekek/{alias.slug}
              </p>
              <p className="text-xs text-on-surface/60 font-body mt-0.5">
                Canonical termék: <code className="bg-surface-container px-1 rounded">{alias.targetProductSlug}</code>
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm text-on-surface font-body cursor-pointer">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              Aktív
            </label>
          </div>

          <div>
            <label className="block text-xs text-on-surface/70 font-body mb-1">Név</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="block text-xs text-on-surface/70 font-body mb-1">Fő kép URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <ImageUpload onUploaded={(url) => setImageUrl(url)} label="Új kép" />
            </div>
          </div>

          <div>
            <label className="block text-xs text-on-surface/70 font-body mb-1">
              Alapból kiválasztott dizájn
            </label>
            <select
              value={defaultLayoutId}
              onChange={(e) => setDefaultLayoutId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {LAYOUT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-sm text-red-600 font-body">{error}</p>}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="bg-primary text-on-primary px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              {saving ? 'Mentés...' : 'Mentés'}
            </button>
            {savedAt && Date.now() - savedAt < 3000 && (
              <span className="text-xs text-green-600 font-body">Mentve ✓</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
