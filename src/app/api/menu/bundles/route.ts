import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * A Válogatások lenyíló menü tételei: a kategória látható termékei. Adminból
 * automatikusan követi az új / elrejtett csomagokat.
 */
export async function GET() {
  const bundles = await prisma.product.findMany({
    where: { category: 'bundle', active: true, hiddenFromListing: false },
    select: { name: true, slug: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  });
  return NextResponse.json({ bundles });
}
