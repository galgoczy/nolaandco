'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  readConsent,
  COOKIE_CONSENT_EVENT,
  type ConsentState,
} from '@/lib/cookieConsent';

const GA_ID = 'G-XQ02YFVB9M';
const FB_PIXEL_ID = '1406749431210962';

type FbqFunction = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: FbqFunction;
    _fbq?: FbqFunction;
  }
}

export default function Analytics() {
  const [consent, setConsentState] = useState<ConsentState>(null);
  const pathname = usePathname();

  useEffect(() => {
    const applyConsent = () => {
      const state = readConsent();
      setConsentState(state);
      const granted = state === 'accepted' ? 'granted' : 'denied';
      window.gtag?.('consent', 'update', {
        ad_storage: granted,
        ad_user_data: granted,
        ad_personalization: granted,
        analytics_storage: granted,
      });
      window.fbq?.('consent', state === 'accepted' ? 'grant' : 'revoke');
    };

    applyConsent();
    window.addEventListener(COOKIE_CONSENT_EVENT, applyConsent);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, applyConsent);
  }, []);

  useEffect(() => {
    if (consent !== 'accepted') return;
    window.fbq?.('track', 'PageView');
  }, [pathname, consent]);

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

      {/* Meta Pixel — loaded with consent revoked until the user accepts. */}
      <Script id="fb-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${FB_PIXEL_ID}');
          fbq('consent', 'revoke');
        `}
      </Script>
    </>
  );
}
