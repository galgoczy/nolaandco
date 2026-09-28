import { NextResponse } from 'next/server';
import { isUrgentEnabled } from '@/lib/urgentProduction.server';
import { URGENT_FIRST_FEE, URGENT_EXTRA_FEE } from '@/lib/urgentProduction';

export const dynamic = 'force-dynamic';

/** Választható-e most a sürgősségi elkészítés — a termékoldal, kosár és pénztár kérdezi. */
export async function GET() {
  const enabled = await isUrgentEnabled();
  return NextResponse.json(
    { enabled, firstFee: URGENT_FIRST_FEE, extraFee: URGENT_EXTRA_FEE },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
