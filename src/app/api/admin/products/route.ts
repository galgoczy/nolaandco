import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/admin-auth';

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ products });
}

export async function POST(req: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Érvénytelen kérés' }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
  const num = (v: unknown) => (typeof v === 'number' ? v : Number(v) || 0);
  const bool = (v: unknown) => Boolean(v);
  const arr = (v: unknown) =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && x.trim() !== '') : [];

  const name = str(data.name);
  const slug = str(data.slug);
  const description = str(data.description);
  const category = str(data.category);
  const imageUrl = str(data.imageUrl);
  if (!name || !slug || !description || !category || !imageUrl) {
    return NextResponse.json(
      { error: 'Név, slug, leírás, kategória és fő kép kötelező' },
      { status: 400 },
    );
  }

  try {
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: num(data.price),
        category,
        series: str(data.series) || 'other',
        variant: str(data.variant) || 'default',
        imageUrl,
        images: arr(data.images),
        badge: str(data.badge) || null,
        active: data.active === undefined ? true : bool(data.active),
        onSale: bool(data.onSale),
        salePrice: data.salePrice ? num(data.salePrice) : null,
      },
    });
    return NextResponse.json({ product });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Mentés sikertelen';
    if (msg.includes('Unique constraint')) {
      return NextResponse.json({ error: 'Ez a slug már létezik' }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
