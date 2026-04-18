'use client';

import Script from 'next/script';
import { useEffect } from 'react';
import { readConsent, COOKIE_CONSENT_EVENT } from '@/lib/cookieConsent';

const GA_ID = 'G-XQ02YFVB9M';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export default function Analytics() {
  useEffect(() => {
    const applyConsent = () => {
      const state = readConsent();
      const analyticsGranted = state === 'accepted' ? 'granted' : 'denied';
      // Marketing/ads stay denied until we explicitly ask for them — safe default.
      const adsGranted = state === 'accepted' ? 'granted' : 'denied';
      window.gtag?.('consent', 'update', {
        ad_storage: adsGranted,
        ad_user_data: adsGranted,
        ad_personalization: adsGranted,
        analytics_storage: analyticsGranted,
      });
    };

    applyConsent();
    window.addEventListener(COOKIE_CONSENT_EVENT, applyConsent);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, applyConsent);
  }, []);

  return (
    <>
      {/* Google Consent Mode v2: default denied before any tag fires. */}
      <Script id="gtag-consent-default" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('consent', 'default', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'denied',
            wait_for_update: 500,
          });
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { anonymize_ip: true });
        `}
      </Script>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
    </>
  );
}
