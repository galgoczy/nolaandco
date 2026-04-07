'use client';

import { useEffect, useRef, useState } from 'react';

interface FoxpostLockerData {
  place_id: string;
  name: string;
  address: string;
  city?: string;
  zip?: string;
  [key: string]: unknown;
}

interface FoxpostSelectorProps {
  onSelect: (locker: FoxpostLockerData) => void;
  selected: FoxpostLockerData | null;
}

export default function FoxpostSelector({ onSelect, selected }: FoxpostSelectorProps) {
  const [showMap, setShowMap] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!showMap) return;

    function handleMessage(event: MessageEvent) {
      // Only accept messages from Foxpost CDN
      if (!event.origin.includes('foxpost.hu')) return;

      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data && data.place_id) {
          onSelect({
            place_id: data.place_id,
            name: data.name || data.operator_id || '',
            address: data.address || '',
            city: data.city || '',
            zip: data.zip || '',
          });
          setShowMap(false);
        }
      } catch {
        // Not a JSON message or not from Foxpost — ignore
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [showMap, onSelect]);

  if (selected) {
    return (
      <div className="mt-4">
        <div className="bg-white rounded-xl border-2 border-[#C4A591] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium text-sm text-[#4A4A4A]">{selected.name}</p>
              <p className="text-xs text-[#4A4A4A]/60 mt-1">{selected.address}</p>
            </div>
            <button
              type="button"
              onClick={() => setShowMap(true)}
              className="text-xs text-[#C4A591] underline underline-offset-2 whitespace-nowrap"
            >
              Módosítás
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {showMap ? (
        <div className="rounded-xl overflow-hidden border-2 border-[#C4A591]/30" style={{ height: 720 }}>
          <iframe
            ref={iframeRef}
            src="https://cdn.foxpost.hu/apt-finder/v1/app/?lang=hu"
            title="Foxpost csomagautomata választó"
            className="w-full h-full border-0"
            allow="geolocation"
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowMap(true)}
          className="w-full bg-[#F7F3EE] rounded-xl border-2 border-dashed border-[#C4A591]/30 p-8 text-center hover:border-[#C4A591]/60 transition-colors"
        >
          <div className="text-[#C4A591] mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-[#4A4A4A] mb-1">
            Csomagautomata kiválasztása
          </p>
          <p className="text-xs text-[#4A4A4A]/60">
            Kattints ide a Foxpost térkép megnyitásához
          </p>
        </button>
      )}
    </div>
  );
}
