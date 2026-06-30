/**
 * Packeta (Zásilkovna) API client — used for the 7 neighbouring countries.
 *
 * Classic REST API (XML over HTTP POST), authenticated with an apiPassword.
 * Endpoints: createPacket, packetLabelPdf.
 *   Docs: https://docs.packeta.com / https://api-docs.packeta.dev
 *
 * NOTE: the exact field set may need tuning to your Packeta contract — the
 * request/response shapes below follow the standard API. Verify with a test
 * shipment once credentials are live.
 *
 * Env:
 *   PACKETA_API_PASSWORD — secret API password
 *   PACKETA_ESHOP        — sender / eshop label configured in Packeta
 *   PACKETA_API_URL      — optional, defaults to the production REST endpoint
 */

const PACKETA_API_URL = process.env.PACKETA_API_URL || 'https://www.zasilkovna.cz/api/rest';

function xmlEscape(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Pull the first <tag>…</tag> value out of an XML string. */
function pick(xml: string, tag: string): string | null {
  const m = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'i'));
  return m ? m[1].trim() : null;
}

/** Split a full name into Packeta's name + surname. */
function splitName(fullName: string): { name: string; surname: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 1) return { name: fullName.trim() || '-', surname: '-' };
  return { name: parts[0], surname: parts.slice(1).join(' ') };
}

export interface PacketaParcelInput {
  /** Our order reference (short id). */
  orderRef: string;
  recipientName: string;
  recipientEmail: string;
  recipientPhone: string;
  /** Selected Packeta pickup point id (from the widget). */
  pointId: string;
  /** Declared value in HUF. */
  value: number;
}

export interface PacketaParcelResult {
  packetId: string;
  barcode?: string;
}

function assertConfigured() {
  if (!process.env.PACKETA_API_PASSWORD || !process.env.PACKETA_ESHOP) {
    throw new Error('Packeta nincs konfigurálva (PACKETA_API_PASSWORD / PACKETA_ESHOP hiányzik).');
  }
}

async function packetaPost(xml: string): Promise<string> {
  const res = await fetch(PACKETA_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/xml; charset=utf-8' },
    body: xml,
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Packeta API ${res.status}: ${text.slice(0, 300)}`);
  }
  const status = pick(text, 'status');
  if (status && status.toLowerCase() !== 'ok') {
    const fault = pick(text, 'string') || pick(text, 'fault') || text.slice(0, 300);
    throw new Error(`Packeta API hiba: ${fault}`);
  }
  return text;
}

/** Create a Packeta parcel to a pickup point. */
export async function createPacketaParcel(input: PacketaParcelInput): Promise<PacketaParcelResult> {
  assertConfigured();
  const { name, surname } = splitName(input.recipientName);

  const xml =
    `<createPacket>` +
    `<apiPassword>${xmlEscape(process.env.PACKETA_API_PASSWORD!)}</apiPassword>` +
    `<packetAttributes>` +
    `<number>${xmlEscape(input.orderRef)}</number>` +
    `<name>${xmlEscape(name)}</name>` +
    `<surname>${xmlEscape(surname)}</surname>` +
    `<email>${xmlEscape(input.recipientEmail)}</email>` +
    `<phone>${xmlEscape(input.recipientPhone)}</phone>` +
    `<addressId>${xmlEscape(input.pointId)}</addressId>` +
    `<value>${Math.max(0, Math.round(input.value))}</value>` +
    `<currency>HUF</currency>` +
    `<eshop>${xmlEscape(process.env.PACKETA_ESHOP!)}</eshop>` +
    `<weight>1</weight>` +
    `</packetAttributes>` +
    `</createPacket>`;

  const responseXml = await packetaPost(xml);
  const packetId = pick(responseXml, 'id');
  if (!packetId) {
    throw new Error('Packeta: a válaszból hiányzik a csomagazonosító.');
  }
  return { packetId, barcode: pick(responseXml, 'barcode') ?? undefined };
}

/** Fetch a Packeta label PDF for a packet id. */
export async function getPacketaLabel(packetId: string): Promise<Buffer> {
  assertConfigured();
  const xml =
    `<packetLabelPdf>` +
    `<apiPassword>${xmlEscape(process.env.PACKETA_API_PASSWORD!)}</apiPassword>` +
    `<packetId>${xmlEscape(packetId)}</packetId>` +
    `<format>A6 on A4</format>` +
    `<offset>0</offset>` +
    `</packetLabelPdf>`;

  const responseXml = await packetaPost(xml);
  const base64 = pick(responseXml, 'result');
  if (!base64) {
    throw new Error('Packeta: a címke válaszból hiányzik a PDF.');
  }
  return Buffer.from(base64, 'base64');
}
