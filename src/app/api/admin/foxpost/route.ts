import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/admin-auth';
import { createFoxpostParcel } from '@/lib/foxpost';
import type { FoxpostSize } from '@/lib/foxpost';
import { createPacketaParcel } from '@/lib/packeta';

/** POST: Create a Foxpost parcel for an order */
export async function POST(request: NextRequest) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orderId, size } = (await request.json()) as {
    orderId: string;
    size?: FoxpostSize;
  };

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  // Structured pickup-point id (new orders) with a fallback to the legacy
  // shippingNote (older Foxpost orders stored the place_id there).
  const pickupPointId = order.pickupPointId || order.shippingNote || undefined;
  const refCode = order.id.slice(-8).toUpperCase();
  const comment = order.items.map((it) => `${it.product.name} x${it.quantity}`).join(', ');

  try {
    let trackingId: string;

    if (order.shippingCarrier === 'packeta') {
      // Cross-border: Packeta pickup point.
      const result = await createPacketaParcel({
        orderRef: refCode,
        recipientName: order.shippingName,
        recipientEmail: order.email,
        recipientPhone: order.phone || '',
        pointId: pickupPointId ?? '',
        value: order.total,
      });
      trackingId = result.barcode || result.packetId;
    } else {
      // Domestic: Foxpost automata or home delivery.
      const isAutomata =
        order.shippingAddress.toLowerCase().startsWith('foxpost:') ||
        order.shippingAddress.toLowerCase().includes('csomagautomata');
      const result = await createFoxpostParcel({
        refCode,
        recipientName: order.shippingName,
        recipientPhone: order.phone || '',
        recipientEmail: order.email,
        size: size ?? 'M',
        deliveryMode: isAutomata ? 'automata' : 'home',
        destinationPlaceId: isAutomata ? pickupPointId : undefined,
        recipientZip: !isAutomata ? order.shippingZip : undefined,
        recipientCity: !isAutomata ? order.shippingCity : undefined,
        recipientStreet: !isAutomata ? order.shippingAddress : undefined,
        codAmount: 0,
        comment,
      });
      trackingId = result.foxpost_id || result.barcode || String(result.id);
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        trackingNumber: trackingId,
        status: 'processing',
      },
    });

    return NextResponse.json({ success: true, trackingNumber: trackingId });
  } catch (err) {
    console.error('Parcel create error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Csomagfeladási hiba' },
      { status: 500 }
    );
  }
}
