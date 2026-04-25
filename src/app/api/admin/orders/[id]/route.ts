import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/admin-auth';
import { sendEmail } from '@/lib/emails/send';
import { shippingNotificationSubject, shippingNotificationHtml } from '@/lib/emails/shipping-notification';
import { followUpSubject, followUpHtml } from '@/lib/emails/follow-up';
import { orderConfirmationSubject, orderConfirmationHtml } from '@/lib/emails/order-confirmation';
import { createSzamlazzInvoice } from '@/lib/szamlazz';
import { findLayout } from '@/app/termekek/[slug]/posterData';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminRequest())) {
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
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const { status, trackingNumber } = body as {
    status?: string;
    trackingNumber?: string;
  };

  const ALLOWED_STATUSES = [
    'pending',
    'paid',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
  ] as const;
  type OrderStatus = (typeof ALLOWED_STATUSES)[number];
  const isAllowedStatus = (v: string): v is OrderStatus =>
    (ALLOWED_STATUSES as readonly string[]).includes(v);

  if (status !== undefined && !isAllowedStatus(status)) {
    return NextResponse.json(
      { error: `Invalid status. Allowed: ${ALLOWED_STATUSES.join(', ')}` },
      { status: 400 },
    );
  }

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

    // Transfer paid: when admin marks a still-pending bank-transfer order
    // as paid, generate the Számlázz invoice and send the customer a
    // "köszönjük, megérkezett az utalásod" email with the invoice attached.
    // We deliberately only fire on the pending → paid transition for
    // transfer orders — admins can skip this side effect by jumping
    // directly to processing/shipped/etc.
    if (
      status === 'paid' &&
      prev?.status === 'pending' &&
      order.paymentMethod === 'transfer'
    ) {
      // Fire-and-forget so the admin UI doesn't wait on Számlázz + Resend.
      void (async () => {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nolaandco.hu';

        const discountAmount = Math.max(
          0,
          order.subtotal + order.shippingCost - order.total,
        );

        let invoicePdf: Buffer | undefined;
        try {
          const invoiceResult = await createSzamlazzInvoice(
            order,
            discountAmount > 0
              ? { amount: discountAmount, code: null }
              : null,
          );
          if (
            invoiceResult.pdf &&
            Buffer.isBuffer(invoiceResult.pdf) &&
            invoiceResult.pdf.length > 0
          ) {
            invoicePdf = invoiceResult.pdf;
          }
        } catch (err) {
          console.error('Számlázz.hu invoice error (transfer paid):', err);
        }

        const emailItems = order.items.map((item) => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.price,
          babyName: item.babyName,
          posterLayoutLabel: item.posterLayout
            ? findLayout(item.posterLayout).label
            : null,
        }));
        const hasGiftCard = order.items.some(
          (item) => item.product.category === 'giftcard',
        );
        const derivedShippingMethod =
          order.shippingCost > 0
            ? order.shippingAddress.toLowerCase().includes('csomagautomata')
              ? 'parcel'
              : 'home'
            : undefined;

        const result = await sendEmail({
          to: order.email,
          subject: orderConfirmationSubject(),
          html: orderConfirmationHtml({
            customerName: order.shippingName || 'Vásárlónk',
            orderId: order.id,
            orderUrl: `${baseUrl}/fiok#rendelesek`,
            items: emailItems,
            subtotal: order.subtotal,
            shippingCost: order.shippingCost,
            total: order.total,
            shippingMethod: derivedShippingMethod,
            paymentMethod: 'transfer',
            hasInvoice: !!invoicePdf,
            hasGiftCard,
            transferPaid: true,
          }),
          attachments: invoicePdf
            ? [
                {
                  filename: `szamla-${order.id.slice(-8).toUpperCase()}.pdf`,
                  content: invoicePdf,
                },
              ]
            : undefined,
        });
        if (!result.success) {
          console.error('Transfer-paid email NOT sent', {
            orderId: order.id,
            to: order.email,
            error: result.error,
          });
        }
      })();
    }

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
  if (!(await isAdminRequest())) {
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
