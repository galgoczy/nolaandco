import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import ProfileForm from './ProfileForm';

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

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect('/bejelentkezes?callbackUrl=/fiok');
  }

  const email = session.user.email;

  const customer = await prisma.customer.upsert({
    where: { email },
    create: {
      email,
      name: session.user.name ?? null,
      image: session.user.image ?? null,
    },
    update: {},
  });

  // Show orders linked by customerId OR by email (for orders placed before linking)
  const orders = await prisma.order.findMany({
    where: {
      OR: [
        { customerId: customer.id },
        { email },
      ],
    },
    orderBy: { createdAt: 'desc' },
    include: { items: { include: { product: true } } },
  });

  return (
    <div className="min-h-[calc(100vh-200px)] bg-[#F7F3EE] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1
          className="text-3xl text-[#4A4A4A] tracking-wide mb-2"
          style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}
        >
          Fiókom
        </h1>
        <p className="text-[#4A4A4A]/60 font-body text-sm mb-8">
          {session.user.email}
          {session.user.role === 'admin' && (
            <span className="ml-2 inline-block text-[10px] uppercase tracking-wide bg-[#D5E8F0] px-2 py-0.5 rounded">
              Admin
            </span>
          )}
        </p>

        {/* Profile */}
        <section className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <h2
            className="text-xl text-[#4A4A4A] mb-4"
            style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}
          >
            Profil adatok
          </h2>
          <ProfileForm
            initial={{
              name: customer.name ?? '',
              phone: customer.phone ?? '',
              shippingName: customer.shippingName ?? customer.name ?? '',
              shippingZip: customer.shippingZip ?? '',
              shippingCity: customer.shippingCity ?? '',
              shippingAddress: customer.shippingAddress ?? '',
              shippingNote: customer.shippingNote ?? '',
              newsletter: customer.newsletter,
            }}
          />
        </section>

        {/* Orders */}
        <section id="rendelesek" className="bg-white rounded-2xl shadow-sm p-6">
          <h2
            className="text-xl text-[#4A4A4A] mb-4"
            style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}
          >
            Korábbi rendelések
          </h2>

          {orders.length === 0 ? (
            <div className="text-center py-8 text-[#4A4A4A]/60 font-body text-sm">
              <p>Még nincs rendelésed.</p>
              <Link
                href="/termekek"
                className="mt-4 inline-block bg-[#D5E8F0] text-[#4A4A4A] px-5 py-2 rounded-full text-sm hover:opacity-90 transition-opacity"
              >
                Termékek böngészése
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {orders.map((order) => (
                <li key={order.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-body text-sm text-[#4A4A4A]">
                          #{order.id.slice(-8).toUpperCase()}
                        </span>
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            statusStyles[order.status] ?? 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {statusLabels[order.status] ?? order.status}
                        </span>
                      </div>
                      <div className="text-xs text-[#4A4A4A]/60 mt-1">
                        {order.createdAt.toLocaleDateString('hu-HU', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                      <div className="text-sm text-[#4A4A4A]/80 mt-2 font-body">
                        {order.items
                          .map((it) => `${it.product.name} × ${it.quantity}`)
                          .join(', ')}
                      </div>
                      {order.trackingNumber && (
                        <div className="text-xs text-[#4A4A4A]/60 mt-1">
                          Követési szám: <span className="font-mono">{order.trackingNumber}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-body text-sm text-[#4A4A4A] font-semibold">
                        {formatPrice(order.total)}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
