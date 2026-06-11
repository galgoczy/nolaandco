import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/admin-auth';

export async function PATCH(req: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || !Array.isArray(body.order)) {
    return NextResponse.json({ error: 'order tömb szükséges' }, { status: 400 });
  }

  const order = body.order as { id: string; sortOrder: number }[];

  await Promise.all(
    order.map((item) =>
      prisma.product.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder },
      }),
    ),
  );

  return NextResponse.json({ ok: true });
}
