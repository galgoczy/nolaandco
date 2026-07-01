import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export const runtime = 'nodejs';

/**
 * One-click "pay now" for a pending order. Opened from the payment-reminder
 * email: rebuilds a Stripe Checkout Session for the existing order and
 * redirects the customer straight to it. On payment the usual webhook marks
 * the order paid — same path as a normal card checkout.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nolaandco.hu';

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });

  if (!order) {
    return NextResponse.redirect(`${baseUrl}/?fizetes=nem-talalhato`);
  }

  // Already settled — nothing to pay.
  if (order.status !== 'pending') {
    return NextResponse.redirect(`${baseUrl}/koszonjuk?order_id=${order.id}`);
  }

  if (order.total < 175) {
    return NextResponse.redirect(`${baseUrl}/kapcsolat?fizetes=osszeg-hiba`);
  }

  const lineItems = order.items.map((item) => ({
    price_data: {
      currency: 'huf',
      product_data: {
        name: item.product.name,
        ...(item.babyName ? { description: item.babyName } : {}),
      },
      unit_amount: item.price * 100,
    },
    quantity: item.quantity,
  }));

  if (order.shippingCost > 0) {
    lineItems.push({
      price_data: {
        currency: 'huf',
        product_data: { name: 'Szállítási díj' },
        unit_amount: order.shippingCost * 100,
      },
      quantity: 1,
    });
  }

  try {
    // Reproduce any coupon discount so the charged total matches the order.
    const discounts: { coupon: string }[] = [];
    if (order.discount > 0) {
      const coupon = await stripe.coupons.create({
        amount_off: order.discount * 100,
        currency: 'huf',
        duration: 'once',
        name: order.couponCode || 'Kedvezmény',
      });
      discounts.push({ coupon: coupon.id });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      locale: 'hu',
      customer_email: order.email,
      line_items: lineItems,
      ...(discounts.length > 0 ? { discounts } : {}),
      metadata: { orderId: order.id },
      success_url: `${baseUrl}/koszonjuk?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
      cancel_url: `${baseUrl}/?fizetes=megszakitva`,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { stripePaymentId: session.id },
    });

    return NextResponse.redirect(session.url!, { status: 303 });
  } catch (err) {
    console.error('Pay link Stripe session error:', err);
    return NextResponse.redirect(`${baseUrl}/kapcsolat?fizetes=hiba`);
  }
}
