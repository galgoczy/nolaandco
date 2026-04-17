'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { readConsent, setConsent } from '@/lib/cookieConsent';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (readConsent() === null) setVisible(true);
  }, []);

  function handleAccept() {
    setConsent('accepted');
    setVisible(false);
  }

  function handleReject() {
    setConsent('rejected');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Süti hozzájárulás"
      className="fixed bottom-0 inset-x-0 z-[100] bg-[#2C2C2C] text-white px-4 sm:px-6 py-4 shadow-lg"
    >
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-center sm:text-left leading-relaxed">
          Sütiket használunk az oldal működéséhez és anonim látogatottsági statisztikához.{' '}
          <Link
            href="/adatkezeles"
            className="underline underline-offset-2 hover:text-[#C4A591] transition-colors"
          >
            Adatkezelési tájékoztató
          </Link>
        </p>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={handleReject}
            className="border border-white/40 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-white/10 transition-colors whitespace-nowrap"
          >
            Elutasítom
          </button>
          <button
            onClick={handleAccept}
            className="bg-white text-[#2C2C2C] text-sm font-medium px-6 py-2 rounded-lg hover:bg-[#F5F4EF] transition-colors whitespace-nowrap"
          >
            Elfogadom
          </button>
        </div>
      </div>
    </div>
  );
}
