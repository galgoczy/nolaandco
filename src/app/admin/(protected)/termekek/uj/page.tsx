export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import ProductForm, { emptyProduct } from '../ProductForm';

export default async function NewProductPage() {
  const dbCats = await prisma.category.findMany({ orderBy: { sortOrder: 'asc' } });
  const categories = dbCats.map((c) => ({ value: c.slug, label: c.name }));

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/termekek"
          className="text-sm text-on-surface/60 hover:text-on-surface"
        >
          ← Termékek
        </Link>
        <h1 className="text-2xl font-headline font-bold text-on-surface mt-2">
          Új termék
        </h1>
      </div>
      <ProductForm initial={emptyProduct} categories={categories} />
    </div>
  );
}
