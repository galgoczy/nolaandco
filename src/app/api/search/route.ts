import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const staticPages = [
  { title: 'Rólunk', description: 'Ismerj meg minket – a Nola & Co. története', href: '/rolunk' },
  { title: 'GYIK – Gyakran Ismételt Kérdések', description: 'Válaszok a leggyakoribb kérdésekre', href: '/gyik' },
  { title: 'Szállítás és fizetés', description: 'Szállítási módok, fizetési lehetőségek', href: '/szallitas' },
  { title: 'Elállás és visszaküldés', description: 'Elállási jog, visszaküldés menete', href: '/visszakuldes' },
  { title: 'ÁSZF', description: 'Általános Szerződési Feltételek', href: '/aszf' },
  { title: 'Adatkezelési tájékoztató', description: 'Adatvédelmi nyilatkozat és cookie kezelés', href: '/adatkezeles' },
  { title: 'Kapcsolat', description: 'Lépj velünk kapcsolatba', href: '/kapcsolat' },
  { title: 'Kollaboráció', description: 'Együttműködési lehetőségek', href: '/kollaboracio' },
  { title: 'Hírlevél', description: 'Iratkozz fel hírlevelünkre', href: '/hirlevel' },
];

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim().toLowerCase();

  if (!q || q.length < 2) {
    return NextResponse.json({ products: [], pages: [] });
  }

  const products = await prisma.product.findMany({
    where: {
      active: true,
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { category: { contains: q, mode: 'insensitive' } },
      ],
    },
    select: {
      name: true,
      slug: true,
      imageUrl: true,
      price: true,
      category: true,
    },
    take: 6,
  });

  const pages = staticPages.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
  );

  return NextResponse.json({ products, pages });
}
