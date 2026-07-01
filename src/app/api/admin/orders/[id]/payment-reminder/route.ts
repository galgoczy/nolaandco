import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/admin-auth';
import { sendEmail } from '@/lib/emails/send';
import { paymentReminderSubject, paymentReminderHtml } from '@/lib/emails/payment-reminder';

export const runtime = 'nodejs';

/**
 * Admin: send a payment-reminder e-mail for a pending (unpaid) order — works
 * for both card and bank-transfer pending orders. The e-mail contains a
 * one-click card-payment link (/api/pay/[orderId]).
 */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  });

  if (!order) {
    return NextResponse.json({ error: 'A rendelés nem található.' }, { status: 404 });
  }
  if (order.status !== 'pending') {
    return NextResponse.json(
      { error: 'Csak fizetésre váró (pending) rendeléshez küldhető emlékeztető.' },
      { status: 400 },
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nolaandco.hu';
  const orderNumber = order.id.slice(-8).toUpperCase();

  const result = await sendEmail({
    to: order.email,
    subject: paymentReminderSubject(orderNumber),
    html: paymentReminderHtml({
      customerName: order.shippingName || 'Vásárlónk',
      orderNumber,
      payUrl: `${baseUrl}/api/pay/${order.id}`,
      items: order.items.map((it) => ({
        name: it.product.name,
        quantity: it.quantity,
        price: it.price,
      })),
      discount: order.discount,
      couponCode: order.couponCode,
      total: order.total,
    }),
  });

  if (!result.success) {
    return NextResponse.json({ error: 'Az e-mail küldése nem sikerült.' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
