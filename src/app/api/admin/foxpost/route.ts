import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { createFoxpostParcel, getFoxpostLabel } from '@/lib/foxpost';
import type { FoxpostSize } from '@/lib/foxpost';

/** POST: Create a Foxpost parcel for an order */
export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
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

  const isAutomata = order.shippingAddress.toLowerCase().includes('csomagautomata');

  try {
    const result = await createFoxpostParcel({
      refCode: order.id.slice(-8).toUpperCase(),
      recipientName: order.shippingName,
      recipientPhone: order.phone || '',
      recipientEmail: order.email,
      size: size ?? 'M',
      deliveryMode: isAutomata ? 'automata' : 'home',
      destinationPlaceId: isAutomata ? (order.shippingNote ?? undefined) : undefined,
      recipientZip: !isAutomata ? order.shippingZip : undefined,
      recipientCity: !isAutomata ? order.shippingCity : undefined,
      recipientStreet: !isAutomata ? order.shippingAddress : undefined,
      codAmount: 0,
      comment: order.items.map((it) => `${it.product.name} x${it.quantity}`).join(', '),
    });

    // Save Foxpost tracking ID to the order
    const trackingId = result.foxpost_id || result.barcode || String(result.id);
    await prisma.order.update({
      where: { id: orderId },
      data: {
        trackingNumber: trackingId,
        status: 'processing',
      },
    });

    return NextResponse.json({ success: true, foxpost: result, trackingNumber: trackingId });
  } catch (err) {
    console.error('Foxpost create parcel error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Foxpost hiba' },
      { status: 500 }
    );
  }
}
