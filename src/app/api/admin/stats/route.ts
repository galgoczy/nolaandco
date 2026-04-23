import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  const paidStatuses = ['paid', 'processing', 'shipped', 'delivered'];

  // Run all queries in parallel
  const [
    todayOrders,
    todayRevenue,
    thisMonthOrders,
    thisMonthRevenue,
    lastMonthOrders,
    lastMonthRevenue,
    allTimeRevenue,
    totalOrders,
    avgOrderValue,
    topProducts,
    dailyRevenue,
    statusCounts,
  ] = await Promise.all([
    // Today's orders
    prisma.order.count({
      where: { createdAt: { gte: today }, status: { in: paidStatuses } },
    }),
    // Today's revenue
    prisma.order.aggregate({
      _sum: { total: true },
      where: { createdAt: { gte: today }, status: { in: paidStatuses } },
    }),
    // This month orders
    prisma.order.count({
      where: { createdAt: { gte: thisMonthStart }, status: { in: paidStatuses } },
    }),
    // This month revenue
    prisma.order.aggregate({
      _sum: { total: true },
      where: { createdAt: { gte: thisMonthStart }, status: { in: paidStatuses } },
    }),
    // Last month orders
    prisma.order.count({
      where: {
        createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
        status: { in: paidStatuses },
      },
    }),
    // Last month revenue
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
        status: { in: paidStatuses },
      },
    }),
    // All time revenue
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { in: paidStatuses } },
    }),
    // Total paid orders
    prisma.order.count({ where: { status: { in: paidStatuses } } }),
    // Average order value
    prisma.order.aggregate({
      _avg: { total: true },
      where: { status: { in: paidStatuses } },
    }),
    // Top 5 products by quantity sold
    prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true, price: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    }),
    // Daily revenue last 30 days
    prisma.order.findMany({
      where: {
        createdAt: { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) },
        status: { in: paidStatuses },
      },
      select: { createdAt: true, total: true },
      orderBy: { createdAt: 'asc' },
    }),
    // Status breakdown
    prisma.order.groupBy({
      by: ['status'],
      _count: true,
    }),
  ]);

  // Resolve product names for top products
  const productIds = topProducts.map((p) => p.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true },
  });
  const productMap = new Map(products.map((p) => [p.id, p.name]));

  // Aggregate daily revenue into date buckets
  const dailyMap = new Map<string, number>();
  for (const order of dailyRevenue) {
    const day = order.createdAt.toISOString().slice(0, 10);
    dailyMap.set(day, (dailyMap.get(day) || 0) + order.total);
  }
  const dailyChart = Array.from(dailyMap.entries()).map(([date, revenue]) => ({
    date,
    revenue,
  }));

  return NextResponse.json({
    today: {
      orders: todayOrders,
      revenue: todayRevenue._sum.total ?? 0,
    },
    thisMonth: {
      orders: thisMonthOrders,
      revenue: thisMonthRevenue._sum.total ?? 0,
    },
    lastMonth: {
      orders: lastMonthOrders,
      revenue: lastMonthRevenue._sum.total ?? 0,
    },
    allTime: {
      orders: totalOrders,
      revenue: allTimeRevenue._sum.total ?? 0,
      avgOrderValue: Math.round(avgOrderValue._avg.total ?? 0),
    },
    topProducts: topProducts.map((p) => ({
      name: productMap.get(p.productId) ?? 'Ismeretlen',
      quantity: p._sum.quantity ?? 0,
      revenue: p._sum.price ?? 0,
    })),
    dailyChart,
    statusBreakdown: statusCounts.map((s) => ({
      status: s.status,
      count: s._count,
    })),
  });
}
