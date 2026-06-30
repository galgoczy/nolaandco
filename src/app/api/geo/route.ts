import { NextRequest, NextResponse } from 'next/server';
import { getCountryConfig, isPacketaCountry } from '@/lib/shipping';

export const runtime = 'edge';

/**
 * Returns the visitor's country (from the Vercel edge geo header) and whether
 * it's a supported Packeta destination. The checkout uses this to preselect the
 * shipping country: HU / unknown → Magyarország (default), a Packeta country →
 * that country.
 */
export async function GET(request: NextRequest) {
  const raw =
    request.headers.get('x-vercel-ip-country') ||
    request.headers.get('cf-ipcountry') ||
    '';
  const code = raw.toUpperCase();
  // Only surface countries we actually ship to as a non-HU default.
  const supported = code === 'HU' || isPacketaCountry(code);
  const country = supported ? code : 'HU';
  return NextResponse.json({
    country,
    name: getCountryConfig(country).name,
    detected: code || null,
  });
}
