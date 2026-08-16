import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * A Válogatások lenyíló menü tételei — pontosan az, amit a kategóriaoldal
 * listáz. A bundle kategória oldala a rejtett termékeket is mutatja (közös
 * adatbázis a preview-val, lásd SHOW_HIDDEN_IN_CATEGORY), ezért a menü is.
 */
export async function GET() {
  const bundles = await prisma.product.findMany({
    where: { category: 'bundle', active: true },
    select: { name: true, slug: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  });
  return NextResponse.json({ bundles });
}
