'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';
import { readConsent, COOKIE_CONSENT_EVENT } from '@/lib/cookieConsent';

const GA_ID = 'G-XQ02YFVB9M';

export default function Analytics() {
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    setAccepted(readConsent() === 'accepted');
    const handler = () => setAccepted(readConsent() === 'accepted');
    window.addEventListener(COOKIE_CONSENT_EVENT, handler);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, handler);
  }, []);

  if (!accepted) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
