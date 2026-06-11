export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import CouponManager from './CouponManager';

export default async function AdminCouponsPage() {
  const [coupons, categories] = await Promise.all([
    prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.category.findMany({ orderBy: { sortOrder: 'asc' } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-headline font-bold text-on-surface mb-6">Kuponok</h1>
      <CouponManager
        initial={coupons.map((c) => ({
          ...c,
          startsAt: c.startsAt.toISOString(),
          endsAt: c.endsAt.toISOString(),
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt.toISOString(),
        }))}
        categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
      />
    </div>
  );
}
