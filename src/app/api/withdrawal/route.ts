import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/emails/send';
import {
  withdrawalAckSubject,
  withdrawalAckHtml,
  withdrawalAdminSubject,
  withdrawalAdminHtml,
} from '@/lib/emails/withdrawal-acknowledgment';
import { ADMIN_NOTIFICATION_RECIPIENT } from '@/lib/emails/order-notification';
import { isWithdrawalEligibleProduct, isWithdrawalOpen } from '@/lib/withdrawal';

export const runtime = 'nodejs';

const bodySchema = z.object({
  orderId: z.string().min(1),
  declaredName: z.string().min(2, 'Add meg a neved').max(120),
  contactEmail: z.string().email('Érvényes e-mail cím szükséges'),
  items: z
    .array(
      z.object({
        orderItemId: z.string().min(1),
        quantity: z.number().int().positive(),
      })
    )
    .min(1, 'Válassz legalább egy terméket'),
});

const shortId = (id: string) => id.slice(-8).toUpperCase();

export async function POST(request: NextRequest) {
  let parsed;
  try {
    parsed = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: 'Hiányos vagy hibás adatok.' }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: parsed.orderId },
    include: { items: { include: { product: true } } },
  });
  if (!order) {
    return NextResponse.json({ error: 'A rendelés nem található.' }, { status: 404 });
  }

  // Authorisation. A logged-in owner needs no re-identification; a guest must
  // prove possession by supplying the order's e-mail address.
  const session = await getServerSession(authOptions);
  const sessionEmail = session?.user?.email?.toLowerCase();
  const isOwner =
    !!sessionEmail &&
    (sessionEmail === order.email.toLowerCase() ||
      (!!order.customerId &&
        (await prisma.customer.findUnique({ where: { email: sessionEmail } }))?.id ===
          order.customerId));

  if (!isOwner && parsed.contactEmail.toLowerCase() !== order.email.toLowerCase()) {
    return NextResponse.json(
      { error: 'A megadott e-mail cím nem egyezik a rendeléshez tartozóval.' },
      { status: 403 }
    );
  }

  if (!isWithdrawalOpen(order)) {
    return NextResponse.json(
      { error: 'Ehhez a rendeléshez online elállás már nem kezdeményezhető.' },
      { status: 400 }
    );
  }

  // Validate each selected item: belongs to the order, eligible, quantity ok.
  const itemById = new Map(order.items.map((it) => [it.id, it]));
  const snapshot: { orderItemId: string; productName: string; quantity: number; unitPrice: number }[] = [];
  for (const sel of parsed.items) {
    const item = itemById.get(sel.orderItemId);
    if (!item) {
      return NextResponse.json({ error: 'Ismeretlen tétel a rendelésben.' }, { status: 400 });
    }
    if (!isWithdrawalEligibleProduct(item.product)) {
      return NextResponse.json(
        { error: `A(z) "${item.product.name}" termékre nem vonatkozik az elállási jog.` },
        { status: 400 }
      );
    }
    if (sel.quantity > item.quantity) {
      return NextResponse.json({ error: 'A megadott mennyiség túl nagy.' }, { status: 400 });
    }
    snapshot.push({
      orderItemId: item.id,
      productName: item.product.name,
      quantity: sel.quantity,
      unitPrice: item.price,
    });
  }

  const refundAmount = snapshot.reduce((sum, s) => sum + s.unitPrice * s.quantity, 0);
  const sentAt = new Date();

  await prisma.withdrawalRequest.create({
    data: {
      orderId: order.id,
      declaredName: parsed.declaredName.trim(),
      contactEmail: parsed.contactEmail.trim(),
      refundAmount,
      createdAt: sentAt,
      items: {
        create: snapshot.map((s) => ({
          orderItemId: s.orderItemId,
          productName: s.productName,
          quantity: s.quantity,
          unitPrice: s.unitPrice,
        })),
      },
    },
  });

  const orderNumber = shortId(order.id);

  // Durable-medium acknowledgment to the consumer + admin notification.
  await sendEmail({
    to: parsed.contactEmail.trim(),
    subject: withdrawalAckSubject(orderNumber),
    html: withdrawalAckHtml({
      declaredName: parsed.declaredName.trim(),
      orderNumber,
      items: snapshot,
      refundAmount,
      sentAt,
    }),
  });

  sendEmail({
    to: ADMIN_NOTIFICATION_RECIPIENT,
    subject: withdrawalAdminSubject(orderNumber),
    html: withdrawalAdminHtml({
      declaredName: parsed.declaredName.trim(),
      contactEmail: parsed.contactEmail.trim(),
      orderNumber,
      items: snapshot,
      refundAmount,
      sentAt,
    }),
  }).catch((err) => console.error('Withdrawal admin email failed:', err));

  return NextResponse.json({ ok: true });
}
