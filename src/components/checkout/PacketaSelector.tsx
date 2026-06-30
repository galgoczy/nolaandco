'use client';

import { useEffect, useRef, useState } from 'react';

export interface PacketaPointData {
  pointId: string;
  name: string;
  address: string;
  country: string;
}

interface Props {
  /** ISO-2 country to filter the widget to. */
  country: string;
  selected: PacketaPointData | null;
  onSelect: (point: PacketaPointData) => void;
}

// Packeta Widget v6 loader (https://widget.packeta.com/v6/).
const WIDGET_SRC = 'https://widget.packeta.com/v6/www/js/library.js';

declare global {
  interface Window {
    Packeta?: {
      Widget: {
        pick: (
          apiKey: string,
          callback: (point: PacketaWidgetPoint | null) => void,
          opts?: Record<string, unknown>,
        ) => void;
      };
    };
  }
}

type PacketaWidgetPoint = {
  id: string | number;
  name?: string;
  street?: string;
  city?: string;
  zip?: string;
  country?: string;
  formatedValue?: string;
};

function loadWidget(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject();
    if (window.Packeta?.Widget) return resolve();
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${WIDGET_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject());
      return;
    }
    const s = document.createElement('script');
    s.src = WIDGET_SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject();
    document.head.appendChild(s);
  });
}

export default function PacketaSelector({ country, selected, onSelect }: Props) {
  const apiKey = process.env.NEXT_PUBLIC_PACKETA_API_KEY || '';
  const [error, setError] = useState('');
  const loadingRef = useRef(false);

  // Reset selection when the country changes (a point belongs to one country).
  useEffect(() => {
    // parent owns `selected`; we just clear via onSelect when needed elsewhere
  }, [country]);

  async function openWidget() {
    setError('');
    if (!apiKey) {
      setError('A Packeta térkép jelenleg nem elérhető (hiányzó konfiguráció).');
      return;
    }
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      await loadWidget();
      window.Packeta!.Widget.pick(
        apiKey,
        (point) => {
          if (point) {
            onSelect({
              pointId: String(point.id),
              name: point.name || point.formatedValue || '',
              address: [point.zip, point.city, point.street].filter(Boolean).join(', '),
              country: (point.country || country).toUpperCase(),
            });
          }
        },
        { language: 'hu', country: country.toLowerCase() },
      );
    } catch {
      setError('Nem sikerült betölteni a Packeta térképet. Kérjük, próbáld újra.');
    } finally {
      loadingRef.current = false;
    }
  }

  return (
    <div className="mt-4">
      {selected ? (
        <div className="rounded-xl border-2 border-[#C4A591] bg-[#C4A591]/5 p-4 flex items-start justify-between gap-3">
          <div>
            <div className="font-medium text-sm text-[#4A4A4A]">{selected.name}</div>
            {selected.address && (
              <div className="text-xs text-[#4A4A4A]/60 mt-0.5">{selected.address}</div>
            )}
          </div>
          <button
            type="button"
            onClick={openWidget}
            className="text-xs text-[#C4A591] underline underline-offset-2 hover:text-[#4A4A4A] whitespace-nowrap"
          >
            Módosítás
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={openWidget}
          className="w-full rounded-xl border-2 border-dashed border-gray-300 hover:border-[#C4A591] p-4 text-sm text-[#4A4A4A]/80 transition-colors"
        >
          📍 Válassz Packeta átvevőpontot a térképen
        </button>
      )}
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  );
}
