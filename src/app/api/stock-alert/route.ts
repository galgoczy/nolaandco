import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { subscribeToStockAlert } from '@/lib/stockAlerts';

export const runtime = 'nodejs';

const schema = z.object({
  productId: z.string().min(1),
  email: z.string().email('Érvényes e-mail cím szükséges'),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: 'Érvényes e-mail cím szükséges.' }, { status: 400 });
  }

  const email = result.data.email.trim().toLowerCase();

  // Csak létező, árusított termékre lehet feliratkozni — így a végpont nem
  // használható tetszőleges adat beírására.
  const product = await prisma.product.findFirst({
    where: { id: result.data.productId, active: true },
    select: { id: true, stock: true },
  });
  if (!product) {
    return NextResponse.json({ error: 'A termék nem található.' }, { status: 404 });
  }

  // Ha közben újra készletre került, ne várakoztassuk feleslegesen.
  if (product.stock === null || product.stock > 0) {
    return NextResponse.json({ alreadyInStock: true });
  }

  try {
    await subscribeToStockAlert(product.id, email);
  } catch (err) {
    console.error('Készletértesítő feliratkozás sikertelen:', err);
    return NextResponse.json({ error: 'A feliratkozás nem sikerült.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
