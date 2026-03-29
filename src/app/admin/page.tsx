export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';

export default async function AdminDashboard() {
  const [
    totalOrders,
    paidOrders,
    processingOrders,
    shippedOrders,
    revenueResult,
    newsletterCount,
    recentOrders,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: 'paid' } }),
    prisma.order.count({ where: { status: 'processing' } }),
    prisma.order.count({ where: { status: 'shipped' } }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { in: ['paid', 'processing', 'shipped', 'delivered'] } },
    }),
    prisma.newsletterSubscriber.count(),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: true } } },
    }),
  ]);

  const totalRevenue = revenueResult._sum.total ?? 0;

  const cards = [
    { label: 'Összes rendelés', value: totalOrders.toString(), color: 'bg-primary text-on-primary' },
    { label: 'Fizetett', value: paidOrders.toString(), color: 'bg-green-600 text-white' },
    { label: 'Feldolgozás alatt', value: processingOrders.toString(), color: 'bg-blue-600 text-white' },
    { label: 'Kiszállítva', value: shippedOrders.toString(), color: 'bg-purple-600 text-white' },
    { label: 'Bevétel összesen', value: formatPrice(totalRevenue), color: 'bg-primary-container text-on-primary' },
    { label: 'Hírlevél feliratkozók', value: newsletterCount.toString(), color: 'bg-secondary text-on-secondary' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-headline font-bold text-on-surface mb-6">
        Vezérlőpult
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`rounded-2xl p-6 ${card.color}`}
          >
            <p className="text-sm opacity-80 font-body">{card.label}</p>
            <p className="text-3xl font-headline font-bold mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-surface-container-lowest rounded-2xl p-6">
        <h2 className="text-lg font-headline font-bold text-on-surface mb-4">
          Legutóbbi rendelések
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="border-b border-outline-variant text-left">
                <th className="pb-3 text-on-surface/60">Rendelés szám</th>
                <th className="pb-3 text-on-surface/60">Dátum</th>
                <th className="pb-3 text-on-surface/60">Vevő</th>
                <th className="pb-3 text-on-surface/60">Státusz</th>
                <th className="pb-3 text-on-surface/60 text-right">Összeg</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-outline-variant/40 last:border-none"
                >
                  <td className="py-3">
                    <Link
                      href={`/admin/rendeles/${order.id}`}
                      className="text-primary font-medium hover:underline"
                    >
                      {order.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="py-3 text-on-surface/70">
                    {new Date(order.createdAt).toLocaleDateString('hu-HU')}
                  </td>
                  <td className="py-3 text-on-surface/70">{order.email}</td>
                  <td className="py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="py-3 text-right font-medium">
                    {formatPrice(order.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const labels: Record<string, string> = {
    pending: 'Függőben',
    paid: 'Fizetett',
    processing: 'Feldolgozás alatt',
    shipped: 'Kiszállítva',
    delivered: 'Kézbesítve',
    cancelled: 'Törölve',
  };

  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] ?? 'bg-gray-100 text-gray-800'}`}
    >
      {labels[status] ?? status}
    </span>
  );
}
