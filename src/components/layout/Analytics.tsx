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
const FB_PIXEL_ID = '804236036083768';

const INTERNAL_FLAG_KEY = 'nola_internal';

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
  const [isInternal, setIsInternal] = useState(false);
  const [ready, setReady] = useState(false);
  const pathname = usePathname();

  // First: detect & latch the internal-traffic flag. Visitors set it once
  // by visiting `?internal=1`; we honour `?internal=0` to clear it. While
  // the flag is on, GA + Meta Pixel scripts are never rendered, so no
  // network requests or events go out from this browser.
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const param = url.searchParams.get('internal');
      if (param === '1') {
        window.localStorage.setItem(INTERNAL_FLAG_KEY, '1');
        // eslint-disable-next-line no-console
        console.log('[nola] internal traffic flag SET — analytics disabled in this browser');
      } else if (param === '0') {
        window.localStorage.removeItem(INTERNAL_FLAG_KEY);
        // eslint-disable-next-line no-console
        console.log('[nola] internal traffic flag CLEARED — analytics re-enabled');
      }
      const flag = window.localStorage.getItem(INTERNAL_FLAG_KEY) === '1';
      setIsInternal(flag);
      if (flag) {
        // eslint-disable-next-line no-console
        console.log('[nola] internal traffic — analytics skipped');
      }
    } catch {
      // localStorage may be unavailable (privacy mode); fall through to
      // the default behaviour and load analytics normally.
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (isInternal) return;
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
  }, [isInternal]);

  useEffect(() => {
    if (isInternal) return;
    if (consent !== 'accepted') return;
    window.fbq?.('track', 'PageView');
  }, [pathname, consent, isInternal]);

  // Don't inject any analytics until we've checked the internal flag
  // (avoids hydration mismatch and prevents firing on the first paint
  // before the effect runs).
  if (!ready || isInternal) return null;

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

      {/* Meta Pixel — consent is revoked BEFORE init so no setup event
          leaks out before the visitor has accepted cookies. */}
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
          fbq('consent', 'revoke');
          fbq('init', '${FB_PIXEL_ID}');
        `}
      </Script>
    </>
  );
}
