import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';

const statuses = [
  { key: 'all', label: 'Összes' },
  { key: 'pending', label: 'Függőben' },
  { key: 'paid', label: 'Fizetett' },
  { key: 'processing', label: 'Feldolgozás alatt' },
  { key: 'shipped', label: 'Kiszállítva' },
] as const;

const statusStyles: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
  pending: 'Függőben',
  paid: 'Fizetett',
  processing: 'Feldolgozás alatt',
  shipped: 'Kiszállítva',
  delivered: 'Kézbesítve',
  cancelled: 'Törölve',
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: filterStatus } = await searchParams;
  const activeFilter = filterStatus || 'all';

  const where = activeFilter !== 'all' ? { status: activeFilter } : {};

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <h1 className="text-2xl font-headline font-bold text-on-surface mb-6">
        Rendelések
      </h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {statuses.map((s) => (
          <Link
            key={s.key}
            href={s.key === 'all' ? '/admin/rendelesek' : `/admin/rendelesek?status=${s.key}`}
            className={`px-4 py-2 rounded-full text-sm font-body transition-colors ${
              activeFilter === s.key
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
            }`}
          >
            {s.label}
          </Link>
        ))}
      </div>

      <div className="bg-surface-container-lowest rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="border-b border-outline-variant text-left">
                <th className="px-6 py-4 text-on-surface/60">Rendelés szám</th>
                <th className="px-6 py-4 text-on-surface/60">Dátum</th>
                <th className="px-6 py-4 text-on-surface/60">Vevő</th>
                <th className="px-6 py-4 text-on-surface/60">Státusz</th>
                <th className="px-6 py-4 text-on-surface/60 text-right">Összeg</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-outline-variant/40 last:border-none hover:bg-surface-container-low/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/rendeles/${order.id}`}
                      className="text-primary font-medium hover:underline"
                    >
                      {order.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-on-surface/70">
                    {new Date(order.createdAt).toLocaleDateString('hu-HU')}
                  </td>
                  <td className="px-6 py-4 text-on-surface/70">{order.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[order.status] ?? 'bg-gray-100 text-gray-800'}`}
                    >
                      {statusLabels[order.status] ?? order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium">
                    {formatPrice(order.total)}
                  </td>
                </tr>
              ))}

              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-on-surface/50">
                    Nincs találat
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
