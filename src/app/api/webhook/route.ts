import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { createSzamlazzInvoice } from '@/lib/szamlazz';
import { sendEmail } from '@/lib/emails/send';
import { orderConfirmationSubject, orderConfirmationHtml } from '@/lib/emails/order-confirmation';
import { findLayout } from '@/app/termekek/[slug]/posterData';
import Stripe from 'stripe';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'paid',
          stripePaymentId: session.id,
        },
      });

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: { include: { product: true } } },
      });

      if (order) {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nolaandco.hu';

        // Generate Számlázz.hu invoice (awaited so we can capture the PDF
        // and attach it to our confirmation email). If anything goes wrong
        // we still send the confirmation email without the invoice.
        let invoicePdf: Buffer | undefined;
        try {
          const invoiceResult = await createSzamlazzInvoice(order);
          // The szamlazz.js client returns { pdf: Buffer } when
          // requestInvoiceDownload is enabled on the client.
          if (invoiceResult.pdf && Buffer.isBuffer(invoiceResult.pdf) && invoiceResult.pdf.length > 0) {
            invoicePdf = invoiceResult.pdf;
          }
        } catch (err) {
          console.error('Számlázz.hu invoice error:', err);
        }

        // Send confirmation email with order details (and invoice PDF
        // attached if we got it back from Számlázz.hu).
        const emailItems = order.items.map((item) => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.price,
          babyName: item.babyName,
          posterLayoutLabel: item.posterLayout ? findLayout(item.posterLayout).label : null,
        }));

        try {
          await sendEmail({
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
              shippingMethod: order.shippingAddress.toLowerCase().includes('csomagautomata') ? 'parcel' : 'home',
              paymentMethod: 'card',
              hasInvoice: !!invoicePdf,
            }),
            attachments: invoicePdf
              ? [{ filename: `szamla-${order.id.slice(-8).toUpperCase()}.pdf`, content: invoicePdf }]
              : undefined,
          });
        } catch (err) {
          console.error('Order confirmation email failed:', err);
        }
      }
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
