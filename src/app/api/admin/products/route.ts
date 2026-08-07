import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/admin-auth';
import { parseVariants, syncProductVariants } from '@/lib/productVariants';

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
  if (!name || !slug || !description || !category) {
    return NextResponse.json(
      { error: 'Név, slug, leírás és kategória kötelező' },
      { status: 400 },
    );
  }

  // A fő kép később is feltölthető (pl. új kollekció, ahol a fotók még készülnek).
  const intOrNull = (v: unknown) => {
    if (v === null || v === undefined || v === '') return null;
    const n = typeof v === 'number' ? v : Number(v);
    return Number.isFinite(n) ? Math.trunc(n) : null;
  };

  try {
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        longDescription: str(data.longDescription) || null,
        price: num(data.price),
        category,
        series: str(data.series) || 'other',
        variant: str(data.variant) || 'default',
        imageUrl,
        images: arr(data.images),
        badge: str(data.badge) || null,
        active: data.active === undefined ? true : bool(data.active),
        hiddenFromListing: bool(data.hiddenFromListing),
        withdrawalEligible: bool(data.withdrawalEligible),
        noShipping: bool(data.noShipping),
        onSale: bool(data.onSale),
        salePrice: data.salePrice ? num(data.salePrice) : null,
        stock: intOrNull(data.stock),
        productionTime: str(data.productionTime) || null,
        material: str(data.material) || null,
        size: str(data.size) || null,
        careInfo: str(data.careInfo) || null,
        features: arr(data.features),
      },
    });

    const variants = parseVariants(data.variants);
    if (variants && variants.length > 0) {
      await syncProductVariants(product.id, variants);
    }

    return NextResponse.json({ product });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Mentés sikertelen';
    if (msg.includes('Unique constraint')) {
      return NextResponse.json({ error: 'Ez a slug már létezik' }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
