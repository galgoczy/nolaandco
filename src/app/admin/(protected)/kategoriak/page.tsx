export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import CategoryManager from './CategoryManager';

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: 'asc' } });
  const productCounts = await prisma.product.groupBy({
    by: ['category'],
    _count: { id: true },
  });
  const countMap: Record<string, number> = {};
  productCounts.forEach((g) => {
    countMap[g.category] = g._count.id;
  });

  return (
    <div>
      <h1 className="text-2xl font-headline font-bold text-on-surface mb-6">Kategóriák</h1>
      <CategoryManager
        initial={categories.map((c) => ({
          id: c.id,
          slug: c.slug,
          name: c.name,
          nameEn: c.nameEn ?? '',
          sortOrder: c.sortOrder,
          visibleOnHome: c.visibleOnHome,
          productCount: countMap[c.slug] ?? 0,
        }))}
      />
    </div>
  );
}
