import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { shippingSchema, homeDeliverySchema } from '@/lib/validators';
import { sendEmail } from '@/lib/emails/send';
import { orderConfirmationSubject, orderConfirmationHtml } from '@/lib/emails/order-confirmation';
import {
  ADMIN_NOTIFICATION_RECIPIENT,
  orderNotificationHtml,
  orderNotificationSubject,
} from '@/lib/emails/order-notification';
import { cartItemRequiresShipping } from '@/lib/shippingRules';
import { fulfillGiftCardsForOrder } from '@/lib/giftCards';
import type { CartItemData } from '@/store/cart';

const SHIPPING_COSTS: Record<string, number> = {
  parcel: 1190,
  home: 2490,
};

/**
 * Sends the customer confirmation and admin notification in parallel.
 * sendEmail resolves even on Resend failures, so we inspect the return
 * value explicitly and log delivery outcomes for both messages.
 */
async function sendOrderEmails(args: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  phone?: string | null;
  shippingMethod?: string;
  shippingAddress?: string;
  shippingZip?: string;
  shippingCity?: string;
  billingZip?: string | null;
  billingCity?: string | null;
  billingAddress?: string | null;
  paymentMethod: 'card' | 'transfer';
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    babyName?: string | null;
    posterLayoutLabel?: string | null;
  }>;
  subtotal: number;
  shippingCost: number;
  total: number;
  hasGiftCard: boolean;
  hasInvoice: boolean;
  baseUrl: string;
}) {
  const customerSend = sendEmail({
    to: args.customerEmail,
    subject: orderConfirmationSubject(),
    html: orderConfirmationHtml({
      customerName: args.customerName,
      orderId: args.orderId,
      orderUrl: `${args.baseUrl}/fiok#rendelesek`,
      items: args.items,
      subtotal: args.subtotal,
      shippingCost: args.shippingCost,
      total: args.total,
      shippingMethod: args.shippingMethod,
      paymentMethod: args.paymentMethod,
      hasInvoice: args.hasInvoice,
      hasGiftCard: args.hasGiftCard,
    }),
  });

  const adminSend = sendEmail({
    to: ADMIN_NOTIFICATION_RECIPIENT,
    subject: orderNotificationSubject(args.orderId),
    html: orderNotificationHtml({
      orderId: args.orderId,
      adminOrderUrl: `${args.baseUrl}/admin/rendeles/${args.orderId}`,
      customerName: args.customerName,
      email: args.customerEmail,
      phone: args.phone ?? null,
      shippingMethod: args.shippingMethod,
      shippingAddress: args.shippingAddress,
      shippingZip: args.shippingZip,
      shippingCity: args.shippingCity,
      billingAddress: args.billingAddress ?? undefined,
      billingZip: args.billingZip ?? undefined,
      billingCity: args.billingCity ?? undefined,
      paymentMethod: args.paymentMethod,
      items: args.items,
      subtotal: args.subtotal,
      shippingCost: args.shippingCost,
      total: args.total,
      hasGiftCard: args.hasGiftCard,
    }),
  });

  const [customerResult, adminResult] = await Promise.all([customerSend, adminSend]);

  if (!customerResult.success) {
    console.error('Customer confirmation email NOT sent', {
      orderId: args.orderId,
      to: args.customerEmail,
      error: customerResult.error,
    });
  }
  if (!adminResult.success) {
    console.error('Admin notification email NOT sent', {
      orderId: args.orderId,
      to: ADMIN_NOTIFICATION_RECIPIENT,
      error: adminResult.error,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, shipping, shippingMethod, paymentMethod, couponCode, saveData } = body as {
      items: CartItemData[];
      shipping: Record<string, unknown>;
      shippingMethod: string;
      paymentMethod?: 'card' | 'transfer';
      couponCode?: string | null;
      saveData?: boolean;
    };

    const payMethod: 'card' | 'transfer' = paymentMethod === 'transfer' ? 'transfer' : 'card';

    // Validate shipping data — stricter for home delivery, laxer for digital-only orders
    const schema = shippingMethod === 'home' ? homeDeliverySchema : shippingSchema;
    const shippingResult = schema.safeParse(shipping);
    if (!shippingResult.success) {
      return NextResponse.json(
        { error: 'Érvénytelen számlázási / szállítási adatok.', details: shippingResult.error.flatten() },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'A kosár üres.' },
        { status: 400 }
      );
    }

    // Verify prices against DB
    const productIds = items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, active: true },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    const orderRequiresShipping = items.some((item) => {
      const product = productMap.get(item.productId);
      return cartItemRequiresShipping({
        slug: item.slug,
        variant: item.variant,
        category: product?.category,
      });
    });

    let subtotal = 0;
    const verifiedItems: {
      productId: string;
      quantity: number;
      price: number;
      name: string;
      babyName?: string;
      birthDate?: string;
      birthWeight?: string;
      birthHeight?: string;
      birthTime?: string;
      customNote?: string;
      posterLayout?: string;
      posterLayoutLabel?: string;
    }[] = [];

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `A(z) "${item.name}" termék nem található vagy nem elérhető.` },
          { status: 400 }
        );
      }

      // For variant products (poster/giftcard), use the cart item price
      // since the DB only stores the base price
      const isVariant = product.category === 'poster' || product.category === 'giftcard';
      const price = isVariant
        ? item.price
        : (product.onSale && product.salePrice ? product.salePrice : product.price);
      subtotal += price * item.quantity;

      verifiedItems.push({
        productId: product.id,
        quantity: item.quantity,
        price,
        name: item.name || product.name,
        babyName: item.babyName || undefined,
        birthDate: item.birthDate || undefined,
        birthWeight: item.birthWeight || undefined,
        birthHeight: item.birthHeight || undefined,
        birthTime: item.birthTime || undefined,
        customNote: item.customNote || undefined,
        posterLayout: item.posterLayout || undefined,
        posterLayoutLabel: item.posterLayoutLabel || undefined,
      });
    }

    const baseShippingCost = orderRequiresShipping ? (SHIPPING_COSTS[shippingMethod] ?? 2490) : 0;

    // Apply coupon if provided
    let discount = 0;
    let freeShippingApplied = false;
    if (couponCode) {
      const coupon = await prisma.coupon.findFirst({
        where: {
          code: couponCode,
          active: true,
          startsAt: { lte: new Date() },
          endsAt: { gte: new Date() },
        },
      });
      if (coupon) {
        if (!coupon.usageLimit || coupon.usageCount < coupon.usageLimit) {
          if (!coupon.minOrderAmount || subtotal >= coupon.minOrderAmount) {
            if (coupon.discountType === 'percent') {
              discount = Math.round(subtotal * (coupon.discountValue / 100));
            } else {
              discount = coupon.discountValue;
            }
            if (discount > subtotal) discount = subtotal;

            // Free shipping modifier on parcel method only
            if (coupon.freeShippingOnParcel && shippingMethod === 'parcel' && orderRequiresShipping) {
              freeShippingApplied = true;
            }

            // Increment usage
            await prisma.coupon.update({
              where: { id: coupon.id },
              data: { usageCount: { increment: 1 } },
            });
          }
        }
      }
    }

    const shippingCost = freeShippingApplied ? 0 : baseShippingCost;

    const total = subtotal - discount + shippingCost;
    const shippingData = shippingResult.data;

    // Link to customer if logged in
    let customerId: string | null = null;
    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
      const customer = await prisma.customer.findUnique({
        where: { email: session.user.email },
      });
      if (customer) customerId = customer.id;
    }

    // Create order in DB
    const order = await prisma.order.create({
      data: {
        status: 'pending',
        paymentMethod: payMethod,
        customerId,
        email: shippingData.email,
        phone: shippingData.phone || null,
        shippingName: shippingData.shippingName || 'Csomagautomata',
        shippingZip: shippingData.shippingZip || '',
        shippingCity: shippingData.shippingCity || '',
        shippingAddress: shippingData.shippingAddress || `Csomagautomata (${shippingMethod})`,
        shippingNote: shippingData.shippingNote || null,
        billingZip: shippingData.billingZip || null,
        billingCity: shippingData.billingCity || null,
        billingAddress: shippingData.billingAddress || null,
        subtotal,
        shippingCost,
        total,
        items: {
          create: verifiedItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            babyName: item.babyName || null,
            birthDate: item.birthDate || null,
            birthWeight: item.birthWeight || null,
            birthHeight: item.birthHeight || null,
            birthTime: item.birthTime || null,
            customNote: item.customNote || null,
            posterLayout: item.posterLayout || null,
          })),
        },
      },
    });

    // Save data: upsert customer (auto-register if new, update if existing)
    if (saveData || customerId) {
      const customerData = {
        name: shippingData.shippingName,
        phone: shippingData.phone || null,
        shippingName: shippingData.shippingName,
        shippingZip: shippingData.shippingZip || null,
        shippingCity: shippingData.shippingCity || null,
        shippingAddress: shippingData.shippingAddress || null,
        shippingNote: shippingData.shippingNote || null,
        billingZip: shippingData.billingZip || null,
        billingCity: shippingData.billingCity || null,
        billingAddress: shippingData.billingAddress || null,
      };

      const upsertedCustomer = await prisma.customer.upsert({
        where: { email: shippingData.email },
        update: customerData,
        create: { email: shippingData.email, ...customerData },
      });

      // Link order to customer if not already linked
      if (!customerId) {
        await prisma.order.update({
          where: { id: order.id },
          data: { customerId: upsertedCustomer.id },
        });
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nolaandco.hu';

    const hasGiftCard = verifiedItems.some(
      (item) => productMap.get(item.productId)?.category === 'giftcard',
    );

    const emailItems = verifiedItems.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      babyName: item.babyName ?? null,
      posterLayoutLabel: item.posterLayoutLabel ?? null,
    }));

    // ── Zero-total flow (100% discount / free item): skip Stripe, mark paid. ──
    if (total === 0) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'paid' },
      });

      // Digital gift cards: generate the coupon code(s) and email them.
      try {
        await fulfillGiftCardsForOrder(order.id);
      } catch (err) {
        console.error('Gift card fulfillment error:', err);
      }

      await sendOrderEmails({
        orderId: order.id,
        customerName: shippingData.shippingName || 'Vásárlónk',
        customerEmail: shippingData.email,
        phone: shippingData.phone,
        shippingMethod: orderRequiresShipping ? shippingMethod : undefined,
        shippingAddress: orderRequiresShipping ? shippingData.shippingAddress : undefined,
        shippingZip: orderRequiresShipping ? shippingData.shippingZip : undefined,
        shippingCity: orderRequiresShipping ? shippingData.shippingCity : undefined,
        billingAddress: shippingData.billingAddress,
        billingZip: shippingData.billingZip,
        billingCity: shippingData.billingCity,
        paymentMethod: payMethod,
        items: emailItems,
        subtotal,
        shippingCost,
        total,
        hasGiftCard,
        hasInvoice: false,
        baseUrl,
      });

      return NextResponse.json({
        url: `${baseUrl}/koszonjuk?order_id=${order.id}&free=1`,
      });
    }

    // ── Bank transfer flow: skip Stripe, send confirmation emails immediately. ──
    if (payMethod === 'transfer') {
      await sendOrderEmails({
        orderId: order.id,
        customerName: shippingData.shippingName || 'Vásárlónk',
        customerEmail: shippingData.email,
        phone: shippingData.phone,
        shippingMethod: orderRequiresShipping ? shippingMethod : undefined,
        shippingAddress: orderRequiresShipping ? shippingData.shippingAddress : undefined,
        shippingZip: orderRequiresShipping ? shippingData.shippingZip : undefined,
        shippingCity: orderRequiresShipping ? shippingData.shippingCity : undefined,
        billingAddress: shippingData.billingAddress,
        billingZip: shippingData.billingZip,
        billingCity: shippingData.billingCity,
        paymentMethod: 'transfer',
        items: emailItems,
        subtotal,
        shippingCost,
        total,
        hasGiftCard,
        hasInvoice: false,
        baseUrl,
      });

      return NextResponse.json({
        url: `${baseUrl}/koszonjuk?order_id=${order.id}&payment=transfer`,
      });
    }

    // ── Stripe Checkout Session ───────────────────────────────────────
    try {
      const lineItems = verifiedItems.map((item) => ({
        price_data: {
          currency: 'huf',
          product_data: {
            name: item.name,
            ...(item.babyName ? { description: `${item.babyName}${item.birthDate ? ` · ${item.birthDate}` : ''}` } : {}),
          },
          unit_amount: item.price * 100, // HUF is two-decimal in Stripe (1 Ft = 100)
        },
        quantity: item.quantity,
      }));

      // Add shipping as a line item (omit for digital-only or free-shipping orders)
      if (shippingCost > 0) {
        lineItems.push({
          price_data: {
            currency: 'huf',
            product_data: {
              name: shippingMethod === 'parcel' ? 'Szállítás (Csomagautomata)' : 'Szállítás (Házhozszállítás)',
            },
            unit_amount: shippingCost * 100,
          },
          quantity: 1,
        });
      }

      // Stripe requires a minimum charge of 175 HUF. If the discounted total
      // would fall below that, fail with a clear message instead of Stripe's
      // generic rejection.
      if (total > 0 && total < 175) {
        return NextResponse.json(
          {
            error:
              'A rendelés végösszege a Stripe minimum limit alatt van (175 Ft). Kérjük, csökkentsd a kupon mértékét vagy rendelj több terméket.',
          },
          { status: 400 },
        );
      }

      // Add discount as a Stripe coupon
      const stripeDiscounts: { coupon: string }[] = [];
      if (discount > 0) {
        try {
          const stripeCoupon = await stripe.coupons.create({
            amount_off: discount * 100,
            currency: 'huf',
            duration: 'once',
            name: couponCode || 'Kedvezmény',
          });
          stripeDiscounts.push({ coupon: stripeCoupon.id });
        } catch (err) {
          console.error('Stripe coupon create failed:', err);
          return NextResponse.json(
            { error: 'Hiba történt a kupon beváltása során.' },
            { status: 500 },
          );
        }
      }

      const stripeSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        locale: 'hu',
        customer_email: shippingData.email,
        line_items: lineItems,
        ...(stripeDiscounts.length > 0 ? { discounts: stripeDiscounts } : {}),
        metadata: {
          orderId: order.id,
        },
        success_url: `${baseUrl}/koszonjuk?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
        cancel_url: `${baseUrl}/penztar`,
      });

      await prisma.order.update({
        where: { id: order.id },
        data: { stripePaymentId: stripeSession.id },
      });

      return NextResponse.json({ url: stripeSession.url });
    } catch (err) {
      const stripeErr = err as { message?: string; type?: string; code?: string };
      console.error('Stripe session create failed:', {
        type: stripeErr.type,
        code: stripeErr.code,
        message: stripeErr.message,
        orderId: order.id,
        discount,
        shippingCost,
        total,
      });
      return NextResponse.json(
        { error: 'A fizetési kapcsolat létrehozása nem sikerült. Kérjük, próbáld újra.' },
        { status: 502 },
      );
    }
  } catch (error) {
    const e = error as { message?: string; name?: string; stack?: string };
    console.error('Checkout error:', { name: e.name, message: e.message, stack: e.stack });
    return NextResponse.json(
      { error: 'Hiba történt a rendelés rögzítése során.' },
      { status: 500 }
    );
  }
}
