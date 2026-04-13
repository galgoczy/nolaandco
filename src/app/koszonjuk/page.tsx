export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import AnimatedCheck from './AnimatedCheck';

interface Props {
  searchParams: Promise<{ order_id?: string; session_id?: string }>;
}

export default async function ThankYouPage({ searchParams }: Props) {
  const { order_id, session_id } = await searchParams;
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session?.user?.email;

  // Find order by direct ID or by Stripe session ID (for future Stripe integration)
  let order = null;
  if (order_id) {
    order = await prisma.order.findUnique({
      where: { id: order_id },
      include: { items: { include: { product: true } } },
    });
  } else if (session_id) {
    order = await prisma.order.findFirst({
      where: { stripePaymentId: session_id },
      include: { items: { include: { product: true } } },
    });
  }

  if (!order_id && !session_id) {
    return (
      <main className="min-h-screen bg-[#F7F3EE] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1
            className="text-3xl text-[#4A4A4A] tracking-wide mb-4"
            style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}
          >
            Köszönjük!
          </h1>
          <p className="text-[#4A4A4A]/70 mb-8">
            Köszönjük, hogy meglátogattad az oldalunkat.
          </p>
          <Link
            href="/"
            className="inline-block bg-[#D5E8F0] text-[#4A4A4A] px-8 py-3 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Vissza a főoldalra
          </Link>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-[#F7F3EE] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AnimatedCheck />
          <h1
            className="text-3xl text-[#4A4A4A] tracking-wide mb-4"
            style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}
          >
            Köszönjük a rendelésed!
          </h1>
          <p className="text-[#4A4A4A]/70 mb-8">
            A rendelésed sikeresen rögzítettük, egyedi emléked hamarosan készül!
          </p>
          <Link
            href="/"
            className="inline-block bg-[#D5E8F0] text-[#4A4A4A] px-8 py-3 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Vissza a főoldalra
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F3EE] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success header */}
        <div className="text-center mb-10">
          <AnimatedCheck />
          <h1
            className="text-3xl text-[#4A4A4A] tracking-wide mb-2"
            style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}
          >
            Köszönjük a rendelésed!
          </h1>
          <p className="text-[#4A4A4A]/70">
            A rendelésed sikeresen rögzítettük, egyedi emléked hamarosan készül!
          </p>
        </div>

        {/* Order details card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <p className="text-sm text-[#4A4A4A]/60">Rendelés azonosító</p>
            <p className="font-bold font-mono text-[#4A4A4A]">{order.id.slice(0, 8).toUpperCase()}</p>
          </div>

          <div>
            <h2 className="font-bold text-[#4A4A4A] mb-3">Tételek</h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-start border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-sm text-[#4A4A4A]">{item.product.name}</p>
                    {item.babyName && (
                      <p className="text-xs text-[#4A4A4A]/60">
                        {item.babyName}
                        {item.birthDate && ` · ${item.birthDate}`}
                      </p>
                    )}
                    <p className="text-xs text-[#4A4A4A]/60">{item.quantity} db</p>
                  </div>
                  <p className="font-medium text-sm">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>

          {order.shippingName && order.shippingName !== 'Csomagautomata' && (
            <div>
              <h2 className="font-bold text-[#4A4A4A] mb-2">Szállítási cím</h2>
              <p className="text-sm text-[#4A4A4A]/70">
                {order.shippingName}<br />
                {order.shippingZip} {order.shippingCity}<br />
                {order.shippingAddress}
              </p>
            </div>
          )}

          {order.shippingName === 'Csomagautomata' && (
            <div>
              <h2 className="font-bold text-[#4A4A4A] mb-2">Szállítás</h2>
              <p className="text-sm text-[#4A4A4A]/70">
                Csomagautomata — a pontos helyszínt egyeztetjük e-mailben.
              </p>
            </div>
          )}

          <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-[#4A4A4A]/70">
              <span>Részösszeg</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-[#4A4A4A]/70">
              <span>Szállítás</span>
              <span>{formatPrice(order.shippingCost)}</span>
            </div>
            {order.total < order.subtotal + order.shippingCost && (
              <div className="flex justify-between text-green-600">
                <span>Kedvezmény</span>
                <span>-{formatPrice(order.subtotal + order.shippingCost - order.total)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-100 text-[#4A4A4A]">
              <span>Összesen</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Contact info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mt-4 text-center">
          <p className="text-sm text-[#4A4A4A]/70">
            Visszaigazolást küldtünk a(z) <strong className="text-[#4A4A4A]">{order.email}</strong> címre.
          </p>
          <p className="text-sm text-[#4A4A4A]/70 mt-1">
            Kérdés esetén írj nekünk: <a href="mailto:hello@nolaandco.hu" className="text-[#C4A591] hover:underline">hello@nolaandco.hu</a>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <Link
            href="/"
            className="inline-block bg-[#D5E8F0] text-[#4A4A4A] px-8 py-3 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Vissza a főoldalra
          </Link>
          {isLoggedIn && (
            <Link
              href="/fiok#rendelesek"
              className="inline-block bg-[#C4A591] text-white px-8 py-3 rounded-xl font-medium text-sm hover:bg-[#B8957F] transition-colors"
            >
              Rendeléseim
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
