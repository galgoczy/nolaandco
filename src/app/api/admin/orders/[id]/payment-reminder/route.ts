import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/admin-auth';
import { stripe } from '@/lib/stripe';
import { sendEmail } from '@/lib/emails/send';
import {
  paymentReminderSubject,
  paymentReminderHtml,
} from '@/lib/emails/payment-reminder';
import { findLayout } from '@/app/termekek/[slug]/posterData';

/**
 * Manually send a "kindly nudge to pay" reminder for a still-pending bank
 * transfer order. Optionally creates a fresh Stripe Checkout Session so the
 * customer can switch to card payment from the email — controlled by the
 * `includeCardLink` flag in the request body (default: true).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const includeCardLink = body?.includeCardLink !== false;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  });

  if (!order) {
    return NextResponse.json({ error: 'Rendelés nem található' }, { status: 404 });
  }

  if (order.paymentMethod !== 'transfer') {
    return NextResponse.json(
      { error: 'Csak átutalásos rendelésekhez küldhető fizetési emlékeztető.' },
      { status: 400 },
    );
  }

  if (order.status !== 'pending') {
    return NextResponse.json(
      { error: 'Ez a rendelés már nem függő státuszban van.' },
      { status: 400 },
    );
  }

  // Optionally spin up a single-use Stripe Checkout Session so the customer
  // can pay by card right from the email. Stripe sessions expire 24h after
  // creation, but if the customer ignores it, the admin can simply send a
  // new reminder later (which will create a fresh session).
  let payByCardUrl: string | null = null;
  if (includeCardLink && order.total > 0) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nolaandco.hu';
      const stripeSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        locale: 'hu',
        customer_email: order.email,
        line_items: [
          {
            price_data: {
              currency: 'huf',
              product_data: {
                name: `Nola & Co rendelés #${order.id.slice(-8).toUpperCase()}`,
                description: `${order.items.length} tétel`,
              },
              unit_amount: order.total * 100,
            },
            quantity: 1,
          },
        ],
        metadata: {
          orderId: order.id,
          reminderPayment: 'true',
        },
        success_url: `${baseUrl}/koszonjuk?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
        cancel_url: `${baseUrl}/koszonjuk?order_id=${order.id}&payment=transfer`,
      });
      payByCardUrl = stripeSession.url ?? null;
    } catch (err) {
      console.error('Reminder Stripe session create failed:', err);
      // Soft-fail: still send the reminder, just without the card link.
    }
  }

  const reminderItems = order.items.map((item) => ({
    name: item.product.name,
    quantity: item.quantity,
    price: item.price,
    babyName: item.babyName,
    posterLayoutLabel: item.posterLayout ? findLayout(item.posterLayout).label : null,
  }));

  const result = await sendEmail({
    to: order.email,
    subject: paymentReminderSubject(order.id),
    html: paymentReminderHtml({
      customerName: order.shippingName || 'Vásárlónk',
      orderId: order.id,
      items: reminderItems,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      total: order.total,
      payByCardUrl,
    }),
  });

  if (!result.success) {
    console.error('Payment reminder email NOT sent', {
      orderId: order.id,
      to: order.email,
      error: result.error,
    });
    return NextResponse.json(
      { error: 'Hiba történt az email küldésekor.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, payByCardLink: !!payByCardUrl });
}
