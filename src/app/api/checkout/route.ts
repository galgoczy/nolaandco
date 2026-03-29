import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { shippingSchema } from '@/lib/validators';
import type { CartItemData } from '@/store/cart';

const SHIPPING_COST = 1490;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, shipping } = body as {
      items: CartItemData[];
      shipping: Record<string, unknown>;
    };

    // Validate shipping data
    const shippingResult = shippingSchema.safeParse(shipping);
    if (!shippingResult.success) {
      return NextResponse.json(
        { error: 'Érvénytelen szállítási adatok.', details: shippingResult.error.flatten() },
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
    }[] = [];

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `A(z) "${item.name}" termék nem található vagy nem elérhető.` },
          { status: 400 }
        );
      }

      const price = product.onSale && product.salePrice ? product.salePrice : product.price;
      subtotal += price * item.quantity;

      verifiedItems.push({
        productId: product.id,
        quantity: item.quantity,
        price,
        name: product.name,
        babyName: item.babyName || undefined,
        birthDate: item.birthDate || undefined,
        birthWeight: item.birthWeight || undefined,
        birthHeight: item.birthHeight || undefined,
        birthTime: item.birthTime || undefined,
        customNote: item.customNote || undefined,
      });
    }

    const total = subtotal + SHIPPING_COST;
    const shippingData = shippingResult.data;

    // Create order in DB
    const order = await prisma.order.create({
      data: {
        status: 'pending',
        email: shippingData.email,
        phone: shippingData.phone || null,
        shippingName: shippingData.shippingName,
        shippingZip: shippingData.shippingZip,
        shippingCity: shippingData.shippingCity,
        shippingAddress: shippingData.shippingAddress,
        shippingNote: shippingData.shippingNote || null,
        subtotal,
        shippingCost: SHIPPING_COST,
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
          })),
        },
      },
    });

    // Create Stripe Checkout Session
    const lineItems = verifiedItems.map((item) => ({
      price_data: {
        currency: 'huf',
        product_data: {
          name: item.name,
          description: item.babyName ? `Baba neve: ${item.babyName}` : undefined,
        },
        unit_amount: item.price,
      },
      quantity: item.quantity,
    }));

    // Add shipping as a line item
    lineItems.push({
      price_data: {
        currency: 'huf',
        product_data: {
          name: 'Szállítási költség',
          description: undefined,
        },
        unit_amount: SHIPPING_COST,
      },
      quantity: 1,
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${baseUrl}/koszonjuk?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/kosar`,
      metadata: {
        orderId: order.id,
      },
      customer_email: shippingData.email,
    });

    // Update order with Stripe payment ID
    await prisma.order.update({
      where: { id: order.id },
      data: { stripePaymentId: session.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Hiba történt a fizetés indítása során.' },
      { status: 500 }
    );
  }
}
