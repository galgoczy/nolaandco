import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { createSzamlazzInvoice } from '@/lib/szamlazz';
import { sendEmail } from '@/lib/emails/send';
import { orderConfirmationSubject, orderConfirmationHtml } from '@/lib/emails/order-confirmation';
import {
  ADMIN_NOTIFICATION_RECIPIENT,
  orderNotificationHtml,
  orderNotificationSubject,
  orderNotificationTelegramText,
} from '@/lib/emails/order-notification';
import { sendTelegramMessage } from '@/lib/telegram';
import { findLayout } from '@/app/termekek/[slug]/posterData';
import Stripe from 'stripe';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    // Fail closed: refuse to process anything if we can't verify signatures.
    console.error('STRIPE_WEBHOOK_SECRET is not set; refusing to process webhook.');
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      // Idempotency: Stripe retries webhooks on non-200 responses and admins
      // can manually resend events from the dashboard. Running the side
      // effects twice would create a duplicate Számlázz.hu invoice
      // (accounting problem) and send duplicate emails + Telegram pings.
      const existing = await prisma.order.findUnique({
        where: { id: orderId },
        select: { status: true },
      });
      if (existing && existing.status !== 'pending') {
        return NextResponse.json({ received: true, skipped: 'already processed' }, { status: 200 });
      }

      // If this Stripe session was created from a payment-reminder flow,
      // the order is currently flagged as transfer in our DB. Flip it to
      // card so the invoice + downstream logic reflect what actually
      // happened.
      const reminderPayment = session.metadata?.reminderPayment === 'true';

      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'paid',
          stripePaymentId: session.id,
          ...(reminderPayment ? { paymentMethod: 'card' } : {}),
        },
      });

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: { include: { product: true } } },
      });

      if (order) {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nolaandco.hu';

        // Derive the discount from the order totals: total = subtotal +
        // shippingCost - discount, so discount = subtotal + shippingCost
        // - total. The Order table doesn't store the discount explicitly;
        // this reconstructs it without a schema change.
        const discountAmount = Math.max(
          0,
          order.subtotal + order.shippingCost - order.total,
        );
        const couponCode = session.metadata?.couponCode ?? null;

        // Generate Számlázz.hu invoice (awaited so we can capture the PDF
        // and attach it to our confirmation email). If anything goes wrong
        // we still send the confirmation email without the invoice.
        let invoicePdf: Buffer | undefined;
        try {
          const invoiceResult = await createSzamlazzInvoice(
            order,
            discountAmount > 0
              ? { amount: discountAmount, code: couponCode }
              : null,
          );
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
          birthDate: item.birthDate,
          birthWeight: item.birthWeight,
          birthHeight: item.birthHeight,
          birthTime: item.birthTime,
          customNote: item.customNote,
        }));
        const hasGiftCard = order.items.some((item) => item.product.category === 'giftcard');

        const derivedShippingMethod = order.shippingCost > 0
          ? (order.shippingAddress.toLowerCase().includes('csomagautomata') ? 'parcel' : 'home')
          : undefined;

        const notificationData = {
          orderId: order.id,
          adminOrderUrl: `${baseUrl}/admin/rendeles/${order.id}`,
          customerName: order.shippingName || 'Vásárlónk',
          email: order.email,
          phone: order.phone,
          shippingMethod: derivedShippingMethod,
          shippingAddress: derivedShippingMethod ? order.shippingAddress : undefined,
          shippingZip: derivedShippingMethod ? order.shippingZip : undefined,
          shippingCity: derivedShippingMethod ? order.shippingCity : undefined,
          billingAddress: order.billingAddress ?? undefined,
          billingZip: order.billingZip,
          billingCity: order.billingCity,
          paymentMethod: 'card' as const,
          items: emailItems,
          subtotal: order.subtotal,
          shippingCost: order.shippingCost,
          total: order.total,
          hasGiftCard,
          couponCode: session.metadata?.couponCode ?? null,
        };

        const [customerResult, adminResult, telegramResult] = await Promise.all([
          sendEmail({
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
              paymentMethod: 'card',
              hasInvoice: !!invoicePdf,
              hasGiftCard,
            }),
            attachments: invoicePdf
              ? [{ filename: `szamla-${order.id.slice(-8).toUpperCase()}.pdf`, content: invoicePdf }]
              : undefined,
          }),
          sendEmail({
            to: ADMIN_NOTIFICATION_RECIPIENT,
            subject: orderNotificationSubject(order.id),
            html: orderNotificationHtml(notificationData),
          }),
          sendTelegramMessage(orderNotificationTelegramText(notificationData)),
        ]);

        if (!customerResult.success) {
          console.error('Customer confirmation email NOT sent', {
            orderId: order.id,
            to: order.email,
            error: customerResult.error,
          });
        }
        if (!adminResult.success) {
          console.error('Admin notification email NOT sent', {
            orderId: order.id,
            to: ADMIN_NOTIFICATION_RECIPIENT,
            error: adminResult.error,
          });
        }
        if (!telegramResult.success) {
          console.error('Admin Telegram notification NOT sent', {
            orderId: order.id,
            error: telegramResult.error,
          });
        }
      }
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
