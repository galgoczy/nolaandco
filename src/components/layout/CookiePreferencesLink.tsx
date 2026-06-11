'use client';

import { COOKIE_CONSENT_KEY, COOKIE_CONSENT_EVENT } from '@/lib/cookieConsent';

export default function CookiePreferencesLink() {
  function reopen() {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(COOKIE_CONSENT_KEY);
    window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: null }));
  }

  return (
    <button
      type="button"
      onClick={reopen}
      className="footer-link hover:text-[#4A4A4A] transition-colors text-left"
    >
      Süti beállítások
    </button>
  );
}
