import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

const PAID_STATUSES = ['paid', 'processing', 'shipped', 'delivered'];

/**
 * Monthly turnover: per-day order count and revenue for a given month.
 * Only "real" (paid+) orders are counted — pending/cancelled excluded, matching
 * the dashboard cards. Day bucketing is by UTC date.
 */
export async function GET(request: NextRequest) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const year = Number(request.nextUrl.searchParams.get('year')) || now.getUTCFullYear();
  const month = Number(request.nextUrl.searchParams.get('month')) || now.getUTCMonth() + 1; // 1-12

  if (month < 1 || month > 12) {
    return NextResponse.json({ error: 'Érvénytelen hónap' }, { status: 400 });
  }

  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: start, lt: end }, status: { in: PAID_STATUSES } },
    select: { createdAt: true, total: true },
  });

  const days = Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    count: 0,
    revenue: 0,
  }));

  let totalCount = 0;
  let totalRevenue = 0;
  for (const o of orders) {
    const d = new Date(o.createdAt).getUTCDate();
    const bucket = days[d - 1];
    if (bucket) {
      bucket.count += 1;
      bucket.revenue += o.total;
    }
    totalCount += 1;
    totalRevenue += o.total;
  }

  return NextResponse.json({ year, month, totalCount, totalRevenue, days });
}
