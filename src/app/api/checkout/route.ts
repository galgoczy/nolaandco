import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { shippingSchema, homeDeliverySchema } from '@/lib/validators';
import { sendEmail } from '@/lib/emails/send';
import { orderConfirmationSubject, orderConfirmationHtml } from '@/lib/emails/order-confirmation';
import type { CartItemData } from '@/store/cart';

const SHIPPING_COSTS: Record<string, number> = {
  parcel: 990,
  home: 1490,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, shipping, shippingMethod, couponCode } = body as {
      items: CartItemData[];
      shipping: Record<string, unknown>;
      shippingMethod: string;
      couponCode?: string | null;
    };

    // Validate shipping data — stricter for home delivery
    const schema = shippingMethod === 'home' ? homeDeliverySchema : shippingSchema;
    const shippingResult = schema.safeParse(shipping);
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

    const shippingCost = SHIPPING_COSTS[shippingMethod] ?? 1490;

    // Apply coupon if provided
    let discount = 0;
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

            // Increment usage
            await prisma.coupon.update({
              where: { id: coupon.id },
              data: { usageCount: { increment: 1 } },
            });
          }
        }
      }
    }

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
        customerId,
        email: shippingData.email,
        phone: shippingData.phone || null,
        shippingName: shippingData.shippingName || 'Csomagautomata',
        shippingZip: shippingData.shippingZip || '',
        shippingCity: shippingData.shippingCity || '',
        shippingAddress: shippingData.shippingAddress || `Csomagautomata (${shippingMethod})`,
        shippingNote: shippingData.shippingNote || null,
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
          })),
        },
      },
    });

    // TODO: When Stripe is integrated, create Stripe Checkout Session here
    // and redirect to Stripe. For now, we redirect directly to the thank you page.

    // Send order confirmation email (fire-and-forget)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nolaandco.hu';
    sendEmail({
      to: shippingData.email,
      subject: orderConfirmationSubject(),
      html: orderConfirmationHtml({
        customerName: shippingData.shippingName || 'Vásárlónk',
        orderId: order.id,
        orderUrl: `${baseUrl}/fiok#rendelesek`,
      }),
    }).catch((err) => console.error('Order confirmation email failed:', err));

    return NextResponse.json({ url: `/koszonjuk?order_id=${order.id}` });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Hiba történt a rendelés rögzítése során.' },
      { status: 500 }
    );
  }
}
