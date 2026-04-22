// Thin wrapper around window.fbq for the Meta Pixel.
// Consent is already gated by fbq('consent', 'revoke'/'grant') in
// `src/components/layout/Analytics.tsx` — the pixel drops tracked events
// until the visitor grants consent, so call sites don't need to re-check.

export type MetaStandardEvent =
  | 'PageView'
  | 'ViewContent'
  | 'AddToCart'
  | 'AddToWishlist'
  | 'InitiateCheckout'
  | 'AddPaymentInfo'
  | 'Purchase'
  | 'Lead'
  | 'CompleteRegistration'
  | 'Contact'
  | 'Subscribe';

export type MetaEventParams = {
  value?: number;
  currency?: string;
  content_ids?: string[];
  content_name?: string;
  content_type?: string;
  content_category?: string;
  contents?: Array<{ id: string; quantity: number }>;
  num_items?: number;
  [key: string]: unknown;
};

export function trackMetaEvent(event: MetaStandardEvent, params?: MetaEventParams) {
  if (typeof window === 'undefined') return;
  window.fbq?.('track', event, params);
}
