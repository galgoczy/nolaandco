'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  readConsent,
  COOKIE_CONSENT_EVENT,
  COOKIE_CONSENT_KEY,
  type ConsentState,
} from '@/lib/cookieConsent';
import { trackPageView } from '@/lib/metaPixel';

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

  // A sorba tevő küldővel: ha a hatás a pixel-szkript előtt fut le, az első
  // PageView sem veszik el.
  useEffect(() => {
    if (consent !== 'accepted') return;
    trackPageView();
  }, [pathname, consent]);

  // A hozzájárulás kezdőállapotát maguk a szkriptek állítják be a mentett
  // döntésből, MIELŐTT bármi elindulna. Korábban ezt a fenti hatás tette meg
  // utólag, ami versenyhelyzet volt: ha a hatás a szkriptek előtt futott,
  // az engedélyezés elveszett (window.fbq / window.gtag még nem létezett),
  // majd a szkript alapból visszavonta — így elfogadott sütik mellett sem
  // ment ki egyetlen Meta-esemény sem. Most a sorrend nem számít: a
  // szkriptek és a hatás ugyanabból a mentett értékből dolgoznak.
  const readStoredConsent = `var __nolaConsent = null; try { __nolaConsent = window.localStorage.getItem('${COOKIE_CONSENT_KEY}'); } catch (e) {}`;

  return (
    <>
      {/* Google Consent Mode v2: az alapállapot a mentett döntésből jön. */}
      <Script id="gtag-consent-default" strategy="afterInteractive">
        {`
          ${readStoredConsent}
          var __nolaGranted = __nolaConsent === 'accepted' ? 'granted' : 'denied';
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('consent', 'default', {
            ad_storage: __nolaGranted,
            ad_user_data: __nolaGranted,
            ad_personalization: __nolaGranted,
            analytics_storage: __nolaGranted,
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

      {/* Meta Pixel — a hozzájárulás az init ELŐTT, a mentett döntésből
          (a Meta dokumentációja szerinti sorrend). */}
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
          ${readStoredConsent}
          fbq('consent', __nolaConsent === 'accepted' ? 'grant' : 'revoke');
          fbq('init', '${FB_PIXEL_ID}');
        `}
      </Script>
    </>
  );
}
