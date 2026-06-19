import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const statusLabels: Record<string, string> = {
  received: 'Beérkezett',
  acknowledged: 'Visszaigazolva',
  refunded: 'Visszatérítve',
  rejected: 'Elutasítva',
};

export default async function AdminWithdrawalsPage() {
  const requests = await prisma.withdrawalRequest.findMany({
    orderBy: { createdAt: 'desc' },
    include: { items: true, order: true },
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-headline font-bold text-carbon mb-2">Elállási nyilatkozatok</h1>
      <p className="text-sm text-carbon-light mb-6">
        A vásárlók által online benyújtott elállási nyilatkozatok (45/2014. (II. 26.) Korm. rendelet).
      </p>

      {requests.length === 0 ? (
        <p className="text-sm text-carbon-light">Még nem érkezett elállási nyilatkozat.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((r) => (
            <div key={r.id} className="bg-white rounded-xl shadow-sm border border-black/5 p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <Link
                    href={`/admin/rendeles/${r.orderId}`}
                    className="text-sm font-medium text-[#C4A591] underline underline-offset-2"
                  >
                    Rendelés #{r.orderId.slice(-8).toUpperCase()}
                  </Link>
                  <p className="text-xs text-carbon-light mt-1">
                    {r.createdAt.toLocaleString('hu-HU', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {statusLabels[r.status] ?? r.status}
                </span>
              </div>

              <div className="mt-3 text-sm text-carbon">
                <p>
                  <span className="text-carbon-light">Nyilatkozattevő:</span> {r.declaredName}
                </p>
                <p>
                  <span className="text-carbon-light">Kapcsolat:</span> {r.contactEmail}
                </p>
              </div>

              <ul className="mt-3 text-sm text-carbon list-disc pl-5">
                {r.items.map((it) => (
                  <li key={it.id}>
                    {it.productName} × {it.quantity} — {formatPrice(it.unitPrice * it.quantity)}
                  </li>
                ))}
              </ul>

              <p className="mt-3 text-sm font-semibold text-carbon">
                Visszatérítendő: {formatPrice(r.refundAmount)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
