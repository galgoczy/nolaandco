import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/admin-auth';
import { createFoxpostParcel } from '@/lib/foxpost';
import type { FoxpostSize } from '@/lib/foxpost';
import { sendEmail } from '@/lib/emails/send';
import {
  foxpostShippingHtml,
  foxpostShippingSubject,
  foxpostShippingTelegramText,
} from '@/lib/emails/foxpost-shipping';
import { ADMIN_NOTIFICATION_RECIPIENT } from '@/lib/emails/order-notification';
import { sendTelegramMessage } from '@/lib/telegram';

/** Foxpost's deep-link tracking URL — confirmed via the live page. */
function foxpostTrackingUrl(trackingNumber: string): string {
  return `https://www.foxpost.hu/csomagkovetes/?code=${encodeURIComponent(trackingNumber)}`;
}

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

  const isAutomata = order.shippingAddress.toLowerCase().startsWith('foxpost:') ||
    order.shippingAddress.toLowerCase().includes('csomagautomata');

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

    const trackingNumber = result.foxpost_id || result.barcode || String(result.id);

    // Mark the order shipped right away — the parcel is now in Foxpost's
    // hands. Status flip to 'shipped' here means the manual status PATCH
    // won't re-trigger the legacy shipping-notification email since its
    // guard checks `prev?.status !== 'shipped'`.
    await prisma.order.update({
      where: { id: orderId },
      data: {
        trackingNumber,
        status: 'shipped',
      },
    });

    // Fire customer + admin emails + Telegram in parallel. Errors are
    // logged but don't fail the Foxpost feladás (the parcel is already
    // created on Foxpost's side, no rollback there).
    const trackingUrl = foxpostTrackingUrl(trackingNumber);
    const customerName = order.shippingName || 'Vásárlónk';

    const customerEmailHtml = foxpostShippingHtml({
      customerName,
      trackingNumber,
      trackingUrl,
    });

    const telegramText = foxpostShippingTelegramText({
      orderId: order.id,
      customerName,
      shippingMethodLabel: isAutomata ? 'Csomagautomata' : 'Házhozszállítás',
      shippingAddress: order.shippingAddress,
      trackingNumber,
      items: order.items.map((it) => ({
        name: it.product.name,
        quantity: it.quantity,
        babyName: it.babyName,
      })),
    });

    const [customerResult, adminResult, telegramResult] = await Promise.all([
      sendEmail({
        to: order.email,
        subject: foxpostShippingSubject(),
        html: customerEmailHtml,
      }),
      sendEmail({
        to: ADMIN_NOTIFICATION_RECIPIENT,
        subject: `[Admin másolat] ${foxpostShippingSubject()} #${order.id
          .slice(-8)
          .toUpperCase()}`,
        html: customerEmailHtml,
      }),
      sendTelegramMessage(telegramText),
    ]);

    if (!customerResult.success) {
      console.error('Foxpost customer ship email NOT sent', {
        orderId: order.id,
        to: order.email,
        error: customerResult.error,
      });
    }
    if (!adminResult.success) {
      console.error('Foxpost admin ship email NOT sent', {
        orderId: order.id,
        to: ADMIN_NOTIFICATION_RECIPIENT,
        error: adminResult.error,
      });
    }
    if (!telegramResult.success) {
      console.error('Foxpost ship Telegram NOT sent', {
        orderId: order.id,
        error: telegramResult.error,
      });
    }

    return NextResponse.json({
      success: true,
      foxpost: result,
      trackingNumber,
      notifications: {
        customerEmail: customerResult.success,
        adminEmail: adminResult.success,
        telegram: telegramResult.success,
      },
    });
  } catch (err) {
    console.error('Foxpost create parcel error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Foxpost hiba' },
      { status: 500 }
    );
  }
}
