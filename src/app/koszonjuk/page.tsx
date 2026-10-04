export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import AnimatedCheck from './AnimatedCheck';
import ClearCartOnSuccess from './ClearCartOnSuccess';
import PurchaseTracker from './PurchaseTracker';
import { cartItemRequiresShipping } from '@/lib/shippingRules';
import {
  NORMAL_DURATION,
  PRODUCTION_START_NOTE,
  URGENT_DURATION,
  URGENT_LABEL,
  URGENT_MIXED_NOTE,
  hasSlowerItems,
  isUrgentEligible,
} from '@/lib/urgentProduction';
import {
  LIGHT_LABEL,
  PREORDER_LABEL,
  WEIGHTED_LABEL,
  WEIGHTED_MIXED_NOTE,
  heightLine,
  weightLine,
} from '@/lib/weightedPillow';

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
      <ClearCartOnSuccess />
      <PurchaseTracker
        orderId={order.id}
        value={order.total}
        items={order.items.map((i) => ({ productId: i.productId, quantity: i.quantity }))}
      />
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
            <p className="font-bold font-mono text-[#4A4A4A]">{order.id.slice(-8).toUpperCase()}</p>
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
                    {item.product.category === 'pillow' && (item.weighted || item.product.weightedEnabled) && (
                      <div className="text-xs text-[#4A4A4A]/60">
                        <p className="font-medium text-[#4A4A4A]">{item.weighted ? WEIGHTED_LABEL : LIGHT_LABEL}</p>
                        {item.birthHeight && <p>{heightLine(item.birthHeight)}</p>}
                        {item.birthWeight && <p>{weightLine(item.birthWeight, item.weighted)}</p>}
                        {item.weighted && item.weightedStatus === 'preorder' && (
                          <p className="font-medium text-[#B5651D]">{PREORDER_LABEL}</p>
                        )}
                        {item.weighted && item.productionNote && <p className="whitespace-pre-line">{item.productionNote}</p>}
                      </div>
                    )}
                    {item.urgent && (
                      <p className="text-xs font-medium text-[#B5651D]">
                        {URGENT_LABEL} ({URGENT_DURATION})
                      </p>
                    )}
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
            {order.urgentFee > 0 && (
              <div className="flex justify-between text-[#4A4A4A]/70">
                <span>{URGENT_LABEL}</span>
                <span>+{formatPrice(order.urgentFee)}</span>
              </div>
            )}
            <div className="flex justify-between text-[#4A4A4A]/70">
              <span>Szállítás</span>
              <span>{formatPrice(order.shippingCost)}</span>
            </div>
            {order.total < order.subtotal + order.urgentFee + order.shippingCost && (
              <div className="flex justify-between text-green-600">
                <span>Kedvezmény</span>
                <span>-{formatPrice(order.subtotal + order.urgentFee + order.shippingCost - order.total)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-100 text-[#4A4A4A]">
              <span>Összesen</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {order.items.some((i) => isUrgentEligible(i.product.category) && !i.weighted) && (
          <div className="bg-[#F5F0E8] border border-[#E8E0D0] rounded-2xl p-6 shadow-sm mt-4">
            <h2 className="font-bold text-[#4A4A4A] mb-3">
              {order.urgentFee > 0 ? URGENT_LABEL : 'Elkészítési idő'}
            </h2>
            <p className="text-sm text-[#4A4A4A]/80 leading-relaxed">
              {order.urgentFee > 0
                ? `A sürgősségi elkészítést választott párnád ${URGENT_DURATION} alatt elkészül.`
                : `Az emlékpárna elkészítési ideje ${NORMAL_DURATION}.`}{' '}
              {PRODUCTION_START_NOTE}
            </p>
            {order.urgentFee > 0 &&
              hasSlowerItems(
                order.items.map((i) => ({
                  category: i.product.category,
                  urgent: i.urgent,
                  quantity: i.quantity,
                  ships: cartItemRequiresShipping({
                    slug: i.product.slug,
                    category: i.product.category,
                    noShipping: i.product.noShipping,
                  }),
                })),
              ) && <p className="text-sm text-[#4A4A4A]/80 leading-relaxed mt-2">{URGENT_MIXED_NOTE}</p>}
          </div>
        )}

        {order.items.some((i) => i.weighted) && (
          <div className="bg-[#F5F0E8] border border-[#E8E0D0] rounded-2xl p-6 shadow-sm mt-4">
            <h2 className="font-bold text-[#4A4A4A] mb-3">
              {order.items.some((i) => i.weighted && i.weightedStatus === 'preorder')
                ? 'Előrendelés – méret- és súlyarányos párna'
                : 'Méret- és súlyarányos párna'}
            </h2>
            {Array.from(new Set<string>(order.items.filter((i) => i.weighted && i.productionNote).map((i) => String(i.productionNote)))).map(
              (note) => (
                <p key={note} className="text-sm text-[#4A4A4A]/80 leading-relaxed whitespace-pre-line mb-2">
                  {note}
                </p>
              ),
            )}
            <p className="text-sm text-[#4A4A4A]/80 leading-relaxed">{PRODUCTION_START_NOTE}</p>
            {order.items.some((i) => i.weighted && i.weightedStatus === 'preorder') &&
              order.items.some(
                (i) =>
                  !(i.weighted && i.weightedStatus === 'preorder') &&
                  cartItemRequiresShipping({ slug: i.product.slug, category: i.product.category, noShipping: i.product.noShipping }),
              ) && <p className="text-sm text-[#4A4A4A]/80 leading-relaxed mt-2">{WEIGHTED_MIXED_NOTE}</p>}
          </div>
        )}

        {order.paymentMethod === 'transfer' && (
          <div className="bg-[#F5F0E8] border border-[#E8E0D0] rounded-2xl p-6 shadow-sm mt-4">
            <h2 className="font-bold text-[#4A4A4A] mb-3">Banki átutalás</h2>
            <p className="text-sm text-[#4A4A4A]/80 leading-relaxed mb-4">
              A termék elkészítése és postázása az utalás beérkezését követően történik.
              Kérjük, az alábbi adatokkal utald el az összeget:
            </p>
            <div className="text-sm text-[#4A4A4A] space-y-1.5">
              <div className="flex justify-between gap-3">
                <span className="text-[#4A4A4A]/60">Összeg</span>
                <span className="font-bold">{formatPrice(order.total)}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-[#4A4A4A]/60">Bankszámlaszám</span>
                <span className="font-mono font-bold">10918001-00000047-88110009</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-[#4A4A4A]/60">Kedvezményezett</span>
                <span>Galgóczy Krisztina EV</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-[#4A4A4A]/60">Közlemény</span>
                <span className="font-mono font-bold">#{order.id.slice(-8).toUpperCase()}</span>
              </div>
            </div>
          </div>
        )}

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
              className="inline-block bg-cta text-white px-8 py-3 rounded-xl font-medium text-sm hover:bg-cta-hover transition-colors"
            >
              Rendeléseim
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
