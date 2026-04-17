export const COOKIE_CONSENT_KEY = 'nola_cookie_consent';
export const COOKIE_CONSENT_EVENT = 'nola:consent-change';

export type ConsentValue = 'accepted' | 'rejected';
export type ConsentState = ConsentValue | null;

export function readConsent(): ConsentState {
  if (typeof window === 'undefined') return null;
  const v = window.localStorage.getItem(COOKIE_CONSENT_KEY);
  return v === 'accepted' || v === 'rejected' ? v : null;
}

export function setConsent(value: ConsentValue) {
  window.localStorage.setItem(COOKIE_CONSENT_KEY, value);
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: value }));
}
