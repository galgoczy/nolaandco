/**
 * Foxpost WebAPI client
 *
 * API base:    https://webapi.foxpost.hu/api
 * API docs:    https://webapi.foxpost.hu/swagger-ui/index.html
 * Auth:        Basic Auth + Api-key header
 *
 * Endpoint paths and body shapes confirmed against the OpenAPI spec
 * (mirrored in @shopickup/adapters-foxpost).
 */

const FOXPOST_API_URL = process.env.FOXPOST_API_URL || 'https://webapi.foxpost.hu/api';
const FOXPOST_USERNAME = process.env.FOXPOST_USERNAME || '';
const FOXPOST_PASSWORD = process.env.FOXPOST_PASSWORD || '';
const FOXPOST_API_KEY = process.env.FOXPOST_API_KEY || '';

class FoxpostNotConfiguredError extends Error {
  constructor() {
    super(
      'Foxpost integráció nincs beállítva. A Vercel env vars-ban hiányzik a ' +
        'FOXPOST_USERNAME, FOXPOST_PASSWORD vagy FOXPOST_API_KEY.',
    );
    this.name = 'FoxpostNotConfiguredError';
  }
}

function ensureFoxpostConfigured(): void {
  if (!FOXPOST_USERNAME || !FOXPOST_PASSWORD || !FOXPOST_API_KEY) {
    throw new FoxpostNotConfiguredError();
  }
}

function authHeaders(): Record<string, string> {
  const basic = Buffer.from(`${FOXPOST_USERNAME}:${FOXPOST_PASSWORD}`).toString('base64');
  return {
    'Authorization': `Basic ${basic}`,
    'Api-key': FOXPOST_API_KEY,
    'Content-Type': 'application/json',
  };
}

/** Parcel size codes (Foxpost expects lowercase). */
export type FoxpostSize = 'xs' | 's' | 'm' | 'l' | 'xl';

/** Delivery mode (used by callers to decide which body shape to send). */
export type FoxpostDeliveryMode = 'automata' | 'home';

export interface FoxpostParcelInput {
  /** Internal reference (e.g. order ID short form) */
  refCode: string;
  /** Recipient full name */
  recipientName: string;
  /** Recipient phone */
  recipientPhone: string;
  /** Recipient email */
  recipientEmail: string;
  /** Destination Foxpost place_id (for automata) */
  destinationPlaceId?: string;
  /** Home delivery address fields */
  recipientZip?: string;
  recipientCity?: string;
  recipientStreet?: string;
  /** Parcel size (any case accepted; we lowercase before sending). */
  size: string;
  /** Delivery mode chooses which body fields to populate. */
  deliveryMode: FoxpostDeliveryMode;
  /** COD amount in HUF (0 = no COD) */
  codAmount?: number;
  /** Comment / note */
  comment?: string;
}

interface FoxpostFieldError {
  field: string;
  message: string;
}

interface FoxpostCreatedPackage {
  /** Foxpost-issued tracking barcode — what we save and show the customer. */
  barcode?: string;
  refCode?: string;
  uniqueBarcode?: string;
  errors?: FoxpostFieldError[];
}

interface FoxpostCreateResponse {
  valid: boolean;
  parcels?: FoxpostCreatedPackage[];
}

export interface FoxpostParcelResponse {
  /** The Foxpost barcode — used everywhere as the canonical tracking number. */
  barcode: string;
  refCode?: string;
  /** Raw response in case the caller wants to log it. */
  raw: unknown;
}

/** Create a new parcel in Foxpost */
export async function createFoxpostParcel(
  input: FoxpostParcelInput,
): Promise<FoxpostParcelResponse> {
  ensureFoxpostConfigured();

  const sizeLower = input.size.toLowerCase();
  const isAutomata = input.deliveryMode === 'automata';

  // Body shape per Foxpost OpenAPI spec. The server decides between APM
  // (locker) and HD (home delivery) based on which fields are present:
  //   APM  → only `destination`
  //   HD   → `recipientCity`, `recipientZip`, `recipientAddress` all set
  // There is no explicit `deliveryMode` field on the wire.
  const body: Record<string, unknown> = {
    refCode: input.refCode,
    recipientName: input.recipientName,
    recipientPhone: input.recipientPhone,
    recipientEmail: input.recipientEmail,
    size: sizeLower,
    cod: input.codAmount ?? 0,
    comment: input.comment ?? '',
  };

  if (isAutomata) {
    if (!input.destinationPlaceId) {
      throw new Error('Foxpost APM feladás: hiányzik a place_id (destination).');
    }
    body.destination = input.destinationPlaceId;
  } else {
    if (!input.recipientZip || !input.recipientCity || !input.recipientStreet) {
      throw new Error('Foxpost házhozszállítás: a teljes cím (irányítószám, város, utca) kötelező.');
    }
    body.recipientCity = input.recipientCity;
    body.recipientZip = input.recipientZip;
    body.recipientAddress = input.recipientStreet;
    body.recipientCountry = 'HU';
  }

  // The create endpoint requires `isWeb` (treated as a web-shop submission)
  // and `isRedirect` (lockout-locker redirect). Defaults: isWeb=true,
  // isRedirect=false. Without these the call returns an empty/invalid
  // response shape and the parcel is not created.
  const url = `${FOXPOST_API_URL}/parcel?isWeb=true&isRedirect=false`;

  const res = await fetch(url, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify([body]),
  });

  const rawText = await res.text();

  if (!res.ok) {
    throw new Error(`Foxpost API error ${res.status}: ${rawText}`);
  }

  let data: FoxpostCreateResponse;
  try {
    data = JSON.parse(rawText) as FoxpostCreateResponse;
  } catch {
    throw new Error(`Foxpost API válasz nem érvényes JSON: ${rawText.slice(0, 500)}`);
  }

  console.log('Foxpost create parcel response:', rawText.slice(0, 1000));

  if (!data.valid) {
    const fieldErrors =
      data.parcels?.[0]?.errors
        ?.map((e) => `${e.field}: ${e.message}`)
        .join('; ') ?? 'ismeretlen Foxpost hiba';
    throw new Error(`Foxpost elutasította a feladást: ${fieldErrors}`);
  }

  const parcel = data.parcels?.[0];
  if (!parcel) {
    throw new Error('Foxpost válasz nem tartalmaz parcel-t. Raw: ' + rawText.slice(0, 500));
  }
  if (parcel.errors && parcel.errors.length > 0) {
    const fieldErrors = parcel.errors.map((e) => `${e.field}: ${e.message}`).join('; ');
    throw new Error(`Foxpost mező hiba: ${fieldErrors}`);
  }
  if (!parcel.barcode) {
    throw new Error('Foxpost válasz nem tartalmaz barcode-ot. Raw: ' + rawText.slice(0, 500));
  }

  return { barcode: parcel.barcode, refCode: parcel.refCode, raw: data };
}

/** Tracking status for a parcel — `GET /api/tracking/{barcode}` */
export async function getFoxpostTracking(barcode: string): Promise<unknown> {
  ensureFoxpostConfigured();
  const res = await fetch(
    `${FOXPOST_API_URL}/tracking/${encodeURIComponent(barcode)}`,
    { method: 'GET', headers: authHeaders() },
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Foxpost tracking error ${res.status}: ${text}`);
  }
  return res.json();
}

/**
 * Download the printable shipping label PDF for one or more parcels.
 *
 * Foxpost's label endpoint is `POST /api/label/{pageSize}` and accepts a
 * JSON array of barcodes in the body. Returns a multi-page PDF.
 * Page size codes: a4, a5, a6 — a6 is the standard Foxpost label.
 */
export async function getFoxpostLabel(
  barcode: string,
  pageSize: 'a4' | 'a5' | 'a6' = 'a6',
): Promise<Buffer> {
  ensureFoxpostConfigured();
  const res = await fetch(`${FOXPOST_API_URL}/label/${pageSize}`, {
    method: 'POST',
    headers: {
      ...authHeaders(),
      'Accept': 'application/pdf',
    },
    body: JSON.stringify([barcode]),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Foxpost label error ${res.status}: ${text}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Cancel a parcel that hasn't been picked up yet. Foxpost may not expose
 * this on the public WebAPI in all environments — the call may 404 even
 * though create works. Caller should treat failure as "ask Foxpost
 * support to cancel manually".
 */
export async function deleteFoxpostParcel(barcode: string): Promise<void> {
  ensureFoxpostConfigured();
  const res = await fetch(
    `${FOXPOST_API_URL}/parcel/${encodeURIComponent(barcode)}`,
    { method: 'DELETE', headers: authHeaders() },
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Foxpost delete error ${res.status}: ${text}`);
  }
}
