import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Az adminban főkategória alá (Emlékőrzők/Textilek/Dekoráció) sorolt
 * kategóriák — a fejléc lenyílói ezekkel egészülnek ki, így egy új kategória
 * kódmódosítás nélkül megjelenik a menüben is.
 */
export async function GET() {
  const categories = await prisma.category.findMany({
    where: { parent: { in: ['emlekorzok', 'textilek', 'dekoracio'] } },
    select: { slug: true, name: true, parent: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  });
  return NextResponse.json({ categories });
}
