import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { getFoxpostLabel } from '@/lib/foxpost';

/** GET: Download Foxpost shipping label PDF */
export async function GET(request: NextRequest) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const trackingId = request.nextUrl.searchParams.get('trackingId');
  if (!trackingId) {
    return NextResponse.json({ error: 'Missing trackingId' }, { status: 400 });
  }

  try {
    const pdf = await getFoxpostLabel(trackingId);

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="foxpost-${trackingId}.pdf"`,
      },
    });
  } catch (err) {
    console.error('Foxpost label error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Foxpost címke hiba' },
      { status: 500 }
    );
  }
}
