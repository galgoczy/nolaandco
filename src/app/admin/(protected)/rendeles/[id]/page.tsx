import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import { findLayout } from '@/app/termekek/[slug]/posterData';
import OrderActions from './OrderActions';

const statusLabels: Record<string, string> = {
  pending: 'Függőben',
  paid: 'Fizetett',
  processing: 'Feldolgozás alatt',
  shipped: 'Kiszállítva',
  delivered: 'Kézbesítve',
  cancelled: 'Törölve',
};

const statusStyles: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-headline font-bold text-on-surface">
          Rendelés #{order.id.slice(0, 8)}
        </h1>
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusStyles[order.status] ?? 'bg-gray-100 text-gray-800'}`}
        >
          {statusLabels[order.status] ?? order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Order info */}
        <div className="bg-surface-container-lowest rounded-2xl p-6">
          <h2 className="font-headline font-bold text-on-surface mb-4">
            Rendelés adatok
          </h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm font-body">
            <dt className="text-on-surface/60">Azonosító:</dt>
            <dd className="text-on-surface break-all">{order.id}</dd>
            <dt className="text-on-surface/60">Dátum:</dt>
            <dd className="text-on-surface">
              {new Date(order.createdAt).toLocaleString('hu-HU')}
            </dd>
            <dt className="text-on-surface/60">E-mail:</dt>
            <dd className="text-on-surface">{order.email}</dd>
            <dt className="text-on-surface/60">Telefon:</dt>
            <dd className="text-on-surface">{order.phone ?? '-'}</dd>
            <dt className="text-on-surface/60">Fizetés:</dt>
            <dd className="text-on-surface">
              {order.paymentMethod === 'transfer' ? (
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-medium">
                    Banki átutalás
                  </span>
                </span>
              ) : (
                <span className="inline-block px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                  Bankkártya
                </span>
              )}
            </dd>
            {order.stripePaymentId && (
              <>
                <dt className="text-on-surface/60">Stripe:</dt>
                <dd className="text-on-surface break-all text-xs">
                  {order.stripePaymentId}
                </dd>
              </>
            )}
            {order.trackingNumber && (
              <>
                <dt className="text-on-surface/60">Nyomkövetés:</dt>
                <dd className="text-on-surface">{order.trackingNumber}</dd>
              </>
            )}
          </dl>
        </div>

        {/* Shipping info */}
        <div className="bg-surface-container-lowest rounded-2xl p-6">
          <h2 className="font-headline font-bold text-on-surface mb-4">
            Szállítási cím
          </h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm font-body">
            <dt className="text-on-surface/60">Név:</dt>
            <dd className="text-on-surface">{order.shippingName}</dd>
            <dt className="text-on-surface/60">Irányítószám:</dt>
            <dd className="text-on-surface">{order.shippingZip}</dd>
            <dt className="text-on-surface/60">Város:</dt>
            <dd className="text-on-surface">{order.shippingCity}</dd>
            <dt className="text-on-surface/60">Cím:</dt>
            <dd className="text-on-surface">{order.shippingAddress}</dd>
            {order.shippingNote && (
              <>
                <dt className="text-on-surface/60">Megjegyzés:</dt>
                <dd className="text-on-surface">{order.shippingNote}</dd>
              </>
            )}
          </dl>
        </div>
      </div>

      {/* Order items */}
      <div className="bg-surface-container-lowest rounded-2xl p-6 mb-8">
        <h2 className="font-headline font-bold text-on-surface mb-4">
          Tételek
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="border-b border-outline-variant text-left">
                <th className="pb-3 text-on-surface/60">Termék</th>
                <th className="pb-3 text-on-surface/60">Baba neve</th>
                <th className="pb-3 text-on-surface/60">Születési adatok</th>
                <th className="pb-3 text-on-surface/60 text-center">Db</th>
                <th className="pb-3 text-on-surface/60 text-right">Ár</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-outline-variant/40 last:border-none"
                >
                  <td className="py-3 font-medium text-on-surface">
                    {item.product.name}
                    {item.posterLayout && (
                      <div className="text-xs font-normal text-on-surface/60 mt-0.5">
                        Dizájn: {findLayout(item.posterLayout).label}
                      </div>
                    )}
                  </td>
                  <td className="py-3 text-on-surface/70">
                    {item.babyName ?? '-'}
                  </td>
                  <td className="py-3 text-on-surface/70 text-xs">
                    {[
                      item.birthDate
                        ? new Date(item.birthDate).toLocaleDateString('hu-HU')
                        : null,
                      item.birthWeight ? `${item.birthWeight}` : null,
                      item.birthHeight ? `${item.birthHeight}` : null,
                      item.birthTime ?? null,
                    ]
                      .filter(Boolean)
                      .join(' | ') || '-'}
                    {item.customNote && (
                      <span className="block text-on-surface/50 mt-0.5">
                        {item.customNote}
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-center">{item.quantity}</td>
                  <td className="py-3 text-right font-medium">
                    {formatPrice(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="border-t border-outline-variant mt-4 pt-4 flex flex-col items-end gap-1 text-sm font-body">
          <div className="flex gap-8">
            <span className="text-on-surface/60">Részösszeg:</span>
            <span className="font-medium">{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex gap-8">
            <span className="text-on-surface/60">Szállítás:</span>
            <span className="font-medium">{formatPrice(order.shippingCost)}</span>
          </div>
          <div className="flex gap-8 text-base">
            <span className="font-bold text-on-surface">Összesen:</span>
            <span className="font-bold text-on-surface">
              {formatPrice(order.total)}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <OrderActions
        orderId={order.id}
        currentStatus={order.status}
        currentTracking={order.trackingNumber ?? ''}
        paymentMethod={order.paymentMethod}
        shippingCost={order.shippingCost}
        shippingAddress={order.shippingAddress}
      />
    </div>
  );
}
