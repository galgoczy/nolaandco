'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const COOKIE_KEY = 'nola_cookie_consent';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(COOKIE_KEY, 'accepted');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[100] bg-[#2C2C2C] text-white px-6 py-4 shadow-lg">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-center sm:text-left leading-relaxed">
          Ez a weboldal sütiket használ a működéshez.{' '}
          <Link href="/adatkezeles" className="underline underline-offset-2 hover:text-[#C4A591] transition-colors">
            Adatkezelési tájékoztató
          </Link>
        </p>
        <button
          onClick={accept}
          className="bg-white text-[#2C2C2C] text-sm font-medium px-6 py-2 rounded-lg hover:bg-[#F5F4EF] transition-colors whitespace-nowrap"
        >
          Elfogadom
        </button>
      </div>
    </div>
  );
}
