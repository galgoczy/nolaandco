import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/admin-auth';

/** Súlyarányos változat be-/kikapcsolása egy párnafajta (sorozat) összes párnáján. */
export async function POST(req: Request) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { series?: unknown; enabled?: unknown } | null;
  if (typeof body?.series !== 'string' || !body.series.trim() || typeof body.enabled !== 'boolean') {
    return NextResponse.json({ error: 'Hiányzó sorozat vagy érték.' }, { status: 400 });
  }
  const result = await prisma.product.updateMany({
    where: { category: 'pillow', series: body.series },
    data: { weightedEnabled: body.enabled },
  });
  return NextResponse.json({ updated: result.count });
}
