import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/admin-auth';
import { getFoxpostLabel } from '@/lib/foxpost';
import { getPacketaLabel } from '@/lib/packeta';

/** GET: Download a shipping label PDF (Foxpost or Packeta, by order). */
export async function GET(request: NextRequest) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const orderId = request.nextUrl.searchParams.get('orderId');
  const legacyTrackingId = request.nextUrl.searchParams.get('trackingId');

  let carrier = 'foxpost';
  let trackingId = legacyTrackingId ?? '';

  if (orderId) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { shippingCarrier: true, trackingNumber: true },
    });
    if (!order || !order.trackingNumber) {
      return NextResponse.json({ error: 'Nincs feladott csomag ehhez a rendeléshez.' }, { status: 404 });
    }
    carrier = order.shippingCarrier;
    trackingId = order.trackingNumber;
  }

  if (!trackingId) {
    return NextResponse.json({ error: 'Missing orderId or trackingId' }, { status: 400 });
  }

  try {
    const pdf =
      carrier === 'packeta' ? await getPacketaLabel(trackingId) : await getFoxpostLabel(trackingId);
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="cimke-${trackingId}.pdf"`,
      },
    });
  } catch (err) {
    console.error('Label error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Címke hiba' },
      { status: 500 }
    );
  }
}
