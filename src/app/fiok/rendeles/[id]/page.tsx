import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';

export const dynamic = 'force-dynamic';

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

export default async function CustomerOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect('/bejelentkezes?callbackUrl=/fiok');
  }

  const { id } = await params;
  const email = session.user.email;

  const customer = await prisma.customer.findUnique({ where: { email } });

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: true } },
    },
  });

  // Only allow access if the order belongs to this customer
  if (
    !order ||
    (order.email !== email && order.customerId !== customer?.id)
  ) {
    notFound();
  }

  return (
    <div className="min-h-[calc(100vh-200px)] bg-[#F7F3EE] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/fiok#rendelesek"
          className="inline-flex items-center gap-1 text-sm text-[#C4A591] hover:text-[#4A4A4A] transition-colors mb-6"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Vissza a rendeléseimhez
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <h1
            className="text-2xl text-[#4A4A4A] tracking-wide"
            style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}
          >
            Rendelés #{order.id.slice(-8).toUpperCase()}
          </h1>
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusStyles[order.status] ?? 'bg-gray-100 text-gray-800'}`}
          >
            {statusLabels[order.status] ?? order.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Order info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-medium text-[#4A4A4A] mb-3">Rendelés adatok</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-[#4A4A4A]/60">Dátum</dt>
                <dd className="text-[#4A4A4A]">
                  {order.createdAt.toLocaleDateString('hu-HU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#4A4A4A]/60">E-mail</dt>
                <dd className="text-[#4A4A4A]">{order.email}</dd>
              </div>
              {order.phone && (
                <div className="flex justify-between">
                  <dt className="text-[#4A4A4A]/60">Telefon</dt>
                  <dd className="text-[#4A4A4A]">{order.phone}</dd>
                </div>
              )}
              {order.trackingNumber && (
                <div className="flex justify-between">
                  <dt className="text-[#4A4A4A]/60">Nyomkövetés</dt>
                  <dd className="text-[#4A4A4A] font-mono text-xs">{order.trackingNumber}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Shipping */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-medium text-[#4A4A4A] mb-3">Szállítási cím</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-[#4A4A4A]/60">Név</dt>
                <dd className="text-[#4A4A4A]">{order.shippingName}</dd>
              </div>
              {order.shippingZip && (
                <div className="flex justify-between">
                  <dt className="text-[#4A4A4A]/60">Cím</dt>
                  <dd className="text-[#4A4A4A] text-right">
                    {order.shippingZip} {order.shippingCity}, {order.shippingAddress}
                  </dd>
                </div>
              )}
              {order.shippingNote && (
                <div className="flex justify-between">
                  <dt className="text-[#4A4A4A]/60">Megjegyzés</dt>
                  <dd className="text-[#4A4A4A]">{order.shippingNote}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          <h2 className="font-medium text-[#4A4A4A] mb-4">Tételek</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4 items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-[#4A4A4A]">{item.product.name}</p>
                  {item.babyName && (
                    <p className="text-xs text-[#4A4A4A]/60 mt-1">
                      {item.babyName}
                      {item.birthDate && ` — ${item.birthDate}`}
                      {item.birthWeight && ` — ${item.birthWeight}`}
                      {item.birthHeight && ` — ${item.birthHeight}`}
                      {item.birthTime && ` — ${item.birthTime}`}
                    </p>
                  )}
                  {item.customNote && (
                    <p className="text-xs text-[#4A4A4A]/50 mt-1">{item.customNote}</p>
                  )}
                  <p className="text-xs text-[#4A4A4A]/60 mt-1">{item.quantity} db</p>
                </div>
                <p className="font-medium text-sm text-[#4A4A4A] whitespace-nowrap">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-gray-100 mt-4 pt-4 space-y-1 text-sm">
            <div className="flex justify-between text-[#4A4A4A]/70">
              <span>Részösszeg</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-[#4A4A4A]/70">
              <span>Szállítás</span>
              <span>{formatPrice(order.shippingCost)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-[#4A4A4A] pt-2 border-t border-gray-100">
              <span>Összesen</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/fiok#rendelesek"
            className="inline-block bg-[#D5E8F0] text-[#4A4A4A] px-6 py-2.5 rounded-full text-sm hover:opacity-90 transition-opacity"
          >
            Vissza a fiókomhoz
          </Link>
        </div>
      </div>
    </div>
  );
}
