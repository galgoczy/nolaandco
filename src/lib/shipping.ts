/**
 * Shipping configuration & cost logic — single source of truth, used by both
 * the checkout UI (display) and the checkout API (authoritative price).
 *
 * Domestic (HU) ships with Foxpost (parcel locker or home delivery).
 * The 7 neighbouring countries ship with Packeta to a pickup point.
 */

export type ShippingCarrier = 'foxpost' | 'packeta';

export type CountryConfig = {
  code: string; // ISO-2
  name: string; // Hungarian display name
  carrier: ShippingCarrier;
  /** Pickup-point shipping price in HUF. */
  parcelCost: number;
};

/** Domestic — unchanged Foxpost pricing. */
export const HU_PARCEL_COST = 1190;
export const HU_HOME_COST = 2490;

/**
 * Packeta destination countries. Prices are per-country adjustable; for launch
 * they are a uniform 4500 Ft (to be refined later).
 */
export const PACKETA_COUNTRIES: CountryConfig[] = [
  { code: 'SK', name: 'Szlovákia – Z-Box', carrier: 'packeta', parcelCost: 2650 },
  { code: 'RO', name: 'Románia – Z-Box', carrier: 'packeta', parcelCost: 3650 },
  { code: 'HR', name: 'Horvátország – Box Now', carrier: 'packeta', parcelCost: 4650 },
  { code: 'SI', name: 'Szlovénia – Post Box', carrier: 'packeta', parcelCost: 5000 },
];

/** Billing (invoice) country options — defaults to Hungary. */
export const BILLING_COUNTRIES: { code: string; name: string }[] = [
  { code: 'HU', name: 'Magyarország' },
  { code: 'SK', name: 'Szlovákia' },
  { code: 'RO', name: 'Románia' },
  { code: 'HR', name: 'Horvátország' },
  { code: 'SI', name: 'Szlovénia' },
  { code: 'AT', name: 'Ausztria' },
  { code: 'DE', name: 'Németország' },
];

export const HU_COUNTRY: CountryConfig = {
  code: 'HU',
  name: 'Magyarország',
  carrier: 'foxpost',
  parcelCost: HU_PARCEL_COST,
};

/** All selectable destination countries, HU first. */
export const ALL_COUNTRIES: CountryConfig[] = [HU_COUNTRY, ...PACKETA_COUNTRIES];

const BY_CODE = new Map(ALL_COUNTRIES.map((c) => [c.code, c]));

export function getCountryConfig(code: string | null | undefined): CountryConfig {
  return (code && BY_CODE.get(code.toUpperCase())) || HU_COUNTRY;
}

export function isPacketaCountry(code: string | null | undefined): boolean {
  return getCountryConfig(code).carrier === 'packeta';
}

export function carrierForCountry(code: string | null | undefined): ShippingCarrier {
  return getCountryConfig(code).carrier;
}

/**
 * Authoritative shipping cost for a country + method.
 * - HU: 'parcel' (Foxpost locker) or 'home' (courier).
 * - Packeta countries: pickup-point price (method is always 'parcel').
 */
export function getShippingCost(country: string, method: 'parcel' | 'home'): number {
  const cfg = getCountryConfig(country);
  if (cfg.carrier === 'foxpost') {
    return method === 'home' ? HU_HOME_COST : HU_PARCEL_COST;
  }
  return cfg.parcelCost;
}
