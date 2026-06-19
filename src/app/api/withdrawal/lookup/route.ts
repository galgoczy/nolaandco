import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { isWithdrawalEligibleProduct, isWithdrawalOpen } from '@/lib/withdrawal';

export const runtime = 'nodejs';

const bodySchema = z.object({
  orderNumber: z.string().min(4),
  email: z.string().email(),
});

/**
 * Guest lookup: identify an order by its short number + the e-mail it was
 * placed with, returning the items eligible for withdrawal. Used by the public
 * /elallas page for customers without an account.
 */
export async function POST(request: NextRequest) {
  let parsed;
  try {
    parsed = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: 'Add meg a rendelésszámot és az e-mail címet.' }, { status: 400 });
  }

  // Short id shown to users is the last 8 chars uppercased; the stored id keeps
  // those chars in lowercase, so match by endsWith on the lowercased input.
  const suffix = parsed.orderNumber.trim().replace(/^#/, '').toLowerCase();

  const order = await prisma.order.findFirst({
    where: {
      email: { equals: parsed.email.trim(), mode: 'insensitive' },
      id: { endsWith: suffix },
    },
    include: { items: { include: { product: true } } },
  });

  if (!order) {
    return NextResponse.json(
      { error: 'Nem találtunk ilyen rendelést a megadott adatokkal.' },
      { status: 404 }
    );
  }

  if (!isWithdrawalOpen(order)) {
    return NextResponse.json(
      { error: 'Ehhez a rendeléshez online elállás nem (vagy már nem) kezdeményezhető.' },
      { status: 400 }
    );
  }

  const items = order.items
    .filter((it) => isWithdrawalEligibleProduct(it.product))
    .map((it) => ({
      orderItemId: it.id,
      productName: it.product.name,
      quantity: it.quantity,
      unitPrice: it.price,
    }));

  return NextResponse.json({
    orderId: order.id,
    orderNumber: order.id.slice(-8).toUpperCase(),
    contactEmail: order.email,
    declaredName: order.shippingName,
    items,
  });
}
