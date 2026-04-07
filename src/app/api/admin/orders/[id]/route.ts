import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { sendEmail } from '@/lib/emails/send';
import { shippingNotificationSubject, shippingNotificationHtml } from '@/lib/emails/shipping-notification';
import { followUpSubject, followUpHtml } from '@/lib/emails/follow-up';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json(order);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const { status, trackingNumber } = body as {
    status?: string;
    trackingNumber?: string;
  };

  const data: Record<string, string> = {};
  if (status) data.status = status;
  if (trackingNumber !== undefined) data.trackingNumber = trackingNumber;

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: 'No fields to update' },
      { status: 400 }
    );
  }

  try {
    // Get previous status to detect transitions
    const prev = await prisma.order.findUnique({ where: { id }, select: { status: true } });

    const order = await prisma.order.update({
      where: { id },
      data,
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    // Send shipping notification when status changes to "shipped"
    if (status === 'shipped' && prev?.status !== 'shipped') {
      const trackingUrl = order.trackingNumber || '';
      sendEmail({
        to: order.email,
        subject: shippingNotificationSubject(),
        html: shippingNotificationHtml({
          customerName: order.shippingName,
          trackingUrl,
        }),
      }).catch((err) => console.error('Shipping notification email failed:', err));
    }

    // Send follow-up email when status changes to "delivered"
    if (status === 'delivered' && prev?.status !== 'delivered') {
      sendEmail({
        to: order.email,
        subject: followUpSubject(),
        html: followUpHtml({
          customerName: order.shippingName,
        }),
      }).catch((err) => console.error('Follow-up email failed:', err));
    }

    return NextResponse.json(order);
  } catch {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Delete order items first, then the order
    await prisma.orderItem.deleteMany({ where: { orderId: id } });
    await prisma.order.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }
}
