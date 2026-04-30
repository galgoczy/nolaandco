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

/**
 * Convert a user-supplied phone number (e.g. "06 20 468 0489", "0036…",
 * "36…") into the E.164 form Foxpost requires: `+36XXXXXXXXX`. The
 * Foxpost API rejects anything that doesn't match
 * `^(\+36|36)(20|30|31|70|50|51)\d{7}$`, so we strip all separators and
 * normalise the prefix. Returns the cleaned input unchanged if we can't
 * recognise the leading country part — Foxpost will surface the field
 * error in that case.
 */
export function normalizeHungarianPhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-().]/g, '');
  if (cleaned.startsWith('+36')) return cleaned;
  if (cleaned.startsWith('0036')) return `+${cleaned.slice(2)}`;
  if (cleaned.startsWith('36')) return `+${cleaned}`;
  if (cleaned.startsWith('06')) return `+36${cleaned.slice(2)}`;
  return cleaned;
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
  /** Foxpost-issued barcode — populated when the carrier prints the label.
   *  May be null on the create response; fall back to clFoxId for tracking. */
  barcode?: string | null;
  /** Foxpost's internal CLFOX… id; this is what the customer pastes into
   *  https://www.foxpost.hu/csomagkovetes/ and what we send as the tracking
   *  number. Always present on a successful create. */
  clFoxId?: string | null;
  /** Foxpost's numeric order id, occasionally useful for support. */
  orderId?: number | null;
  refCode?: string;
  uniqueBarcode?: string | null;
  errors?: FoxpostFieldError[];
}

interface FoxpostCreateResponse {
  valid: boolean;
  parcels?: FoxpostCreatedPackage[];
}

export interface FoxpostParcelResponse {
  /** Tracking identifier shown to the customer and saved on the order.
   *  Foxpost returns `clFoxId` on create (CLFOX…) and fills `barcode` later
   *  when the label is printed; we prefer whichever is available. */
  trackingId: string;
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
    recipientPhone: normalizeHungarianPhone(input.recipientPhone),
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

  // Foxpost issues `clFoxId` immediately on create; `barcode` is filled in
  // later when the label is printed. Either is a valid tracking handle —
  // the public tracking page accepts both.
  const trackingId = parcel.clFoxId || parcel.barcode;
  if (!trackingId) {
    throw new Error(
      'Foxpost válasz nem tartalmaz tracking azonosítót (sem clFoxId, sem barcode). Raw: ' +
        rawText.slice(0, 500),
    );
  }

  return { trackingId, refCode: parcel.refCode, raw: data };
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
 * JSON array of parcel ids (clFoxId or barcode) in the body. Returns a
 * PDF (one page per parcel).
 *
 * Page size codes are **uppercase**: `A6`, `A7`, `_85X85`. A6 is the
 * standard Foxpost label format. Lower-case page sizes return 400.
 */
export async function getFoxpostLabel(
  trackingId: string,
  pageSize: 'A6' | 'A7' | '_85X85' = 'A6',
): Promise<Buffer> {
  ensureFoxpostConfigured();
  const res = await fetch(`${FOXPOST_API_URL}/label/${pageSize}`, {
    method: 'POST',
    headers: {
      ...authHeaders(),
      // Foxpost expects Accept-Encoding (not Accept) — when set, error
      // responses come back as JSON and successful ones as raw PDF.
      'Accept-Encoding': 'application/pdf',
    },
    body: JSON.stringify([trackingId]),
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
