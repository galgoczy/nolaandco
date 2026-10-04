import { NextRequest, NextResponse } from 'next/server';
import { getOffers } from '@/lib/weightedPillow.server';

export const dynamic = 'force-dynamic';

/**
 * A súlyarányos párna aktuális ajánlata a megadott termékekre (ár, maximum,
 * státusz, tájékoztató). A kosár és a pénztár ezzel ellenőrzi újra a tételeket.
 * GET /api/weighted-pillow?ids=a,b,c
 */
export async function GET(req: NextRequest) {
  const ids = (req.nextUrl.searchParams.get('ids') ?? '').split(',').map((s) => s.trim()).filter(Boolean).slice(0, 50);
  const offers = await getOffers(ids);
  return NextResponse.json({ offers }, { headers: { 'Cache-Control': 'no-store' } });
}
