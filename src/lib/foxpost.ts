/**
 * Foxpost WebAPI client
 *
 * API docs: https://webapi.foxpost.hu/swagger-ui/index.html
 * Auth: Basic Auth + Api-key header
 */

const FOXPOST_API_URL = process.env.FOXPOST_API_URL || 'https://webapi.foxpost.hu/api';
const FOXPOST_USERNAME = process.env.FOXPOST_USERNAME || '';
const FOXPOST_PASSWORD = process.env.FOXPOST_PASSWORD || '';
const FOXPOST_API_KEY = process.env.FOXPOST_API_KEY || '';

function authHeaders(): Record<string, string> {
  const basic = Buffer.from(`${FOXPOST_USERNAME}:${FOXPOST_PASSWORD}`).toString('base64');
  return {
    'Authorization': `Basic ${basic}`,
    'Api-key': FOXPOST_API_KEY,
    'Content-Type': 'application/json',
  };
}

/** Parcel size codes */
export type FoxpostSize = 'XS' | 'S' | 'M' | 'L' | 'XL';

/** Delivery mode */
export type FoxpostDeliveryMode = 'automata' | 'home';

export interface FoxpostParcelInput {
  /** Internal reference (e.g. order ID) */
  refCode: string;
  /** Recipient full name */
  recipientName: string;
  /** Recipient phone */
  recipientPhone: string;
  /** Recipient email */
  recipientEmail: string;
  /** Destination Foxpost place_id (for automata) or null (for home delivery) */
  destinationPlaceId?: string;
  /** Home delivery address fields */
  recipientZip?: string;
  recipientCity?: string;
  recipientStreet?: string;
  /** Parcel size */
  size: FoxpostSize;
  /** Delivery mode */
  deliveryMode: FoxpostDeliveryMode;
  /** COD amount in HUF (0 = no COD) */
  codAmount?: number;
  /** Comment/note */
  comment?: string;
}

export interface FoxpostParcelResponse {
  id: number;
  foxpost_id?: string;
  barcode?: string;
  status?: string;
  [key: string]: unknown;
}

/** Create a new parcel in Foxpost */
export async function createFoxpostParcel(input: FoxpostParcelInput): Promise<FoxpostParcelResponse> {
  const body: Record<string, unknown> = {
    refCode: input.refCode,
    recipientName: input.recipientName,
    recipientPhone: input.recipientPhone,
    recipientEmail: input.recipientEmail,
    size: input.size,
    codAmount: input.codAmount ?? 0,
    comment: input.comment ?? '',
  };

  if (input.deliveryMode === 'automata' && input.destinationPlaceId) {
    body.destination = input.destinationPlaceId;
    body.deliveryMode = 'automata';
  } else {
    body.deliveryMode = 'home';
    body.recipientZip = input.recipientZip ?? '';
    body.recipientCity = input.recipientCity ?? '';
    body.recipientStreet = input.recipientStreet ?? '';
  }

  const res = await fetch(`${FOXPOST_API_URL}/v2/parcels`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify([body]),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Foxpost API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  // API returns array for batch — take first
  return Array.isArray(data) ? data[0] : data;
}

/** Get parcel status/details */
export async function getFoxpostParcel(parcelId: string): Promise<FoxpostParcelResponse> {
  const res = await fetch(`${FOXPOST_API_URL}/v2/parcels/${parcelId}`, {
    method: 'GET',
    headers: authHeaders(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Foxpost API error ${res.status}: ${text}`);
  }

  return res.json();
}

/** Download parcel label (PDF) as Buffer */
export async function getFoxpostLabel(parcelId: string): Promise<Buffer> {
  const res = await fetch(`${FOXPOST_API_URL}/v2/parcels/${parcelId}/label`, {
    method: 'GET',
    headers: {
      ...authHeaders(),
      'Accept': 'application/pdf',
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Foxpost label error ${res.status}: ${text}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/** Delete a parcel (only if status is still CREATE) */
export async function deleteFoxpostParcel(parcelId: string): Promise<void> {
  const res = await fetch(`${FOXPOST_API_URL}/v2/parcels/${parcelId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Foxpost delete error ${res.status}: ${text}`);
  }
}
