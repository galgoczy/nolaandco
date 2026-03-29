import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';

interface Props {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function ThankYouPage({ searchParams }: Props) {
  const { session_id } = await searchParams;

  if (!session_id) {
    return (
      <main className="container mx-auto px-4 py-16 text-center max-w-2xl">
        <h1 className="text-3xl font-bold font-heading mb-4">Köszönjük!</h1>
        <p className="text-carbon-light mb-8">
          Köszönjük, hogy meglátogattad az oldalunkat.
        </p>
        <Link
          href="/"
          className="bg-primary text-on-primary rounded-full px-8 py-3 font-bold btn-anim inline-block"
        >
          Vissza a főoldalra
        </Link>
      </main>
    );
  }

  const order = await prisma.order.findFirst({
    where: { stripePaymentId: session_id },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!order) {
    return (
      <main className="container mx-auto px-4 py-16 text-center max-w-2xl">
        <h1 className="text-3xl font-bold font-heading mb-4">Köszönjük a rendelésed!</h1>
        <p className="text-carbon-light mb-8">
          A rendelésed feldolgozás alatt van. Hamarosan kapni fogsz egy visszaigazoló e-mailt.
        </p>
        <Link
          href="/"
          className="bg-primary text-on-primary rounded-full px-8 py-3 font-bold btn-anim inline-block"
        >
          Vissza a főoldalra
        </Link>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold font-heading mb-2">Köszönjük a rendelésed!</h1>
        <p className="text-carbon-light">
          A rendelésed sikeresen rögzítettük.
        </p>
      </div>

      <div className="bg-surface-container rounded-2xl p-6 space-y-6">
        <div>
          <p className="text-sm text-carbon-light">Rendelés azonosító</p>
          <p className="font-bold font-mono">{order.id}</p>
        </div>

        <div>
          <h2 className="font-bold mb-3">Tételek</h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{item.product.name}</p>
                  {item.babyName && (
                    <p className="text-sm text-carbon-light">
                      {item.babyName}
                      {item.birthDate && ` • ${item.birthDate}`}
                    </p>
                  )}
                  <p className="text-sm text-carbon-light">Mennyiség: {item.quantity}</p>
                </div>
                <p className="font-bold">{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-bold mb-2">Szállítási cím</h2>
          <p className="text-carbon-light">
            {order.shippingName}<br />
            {order.shippingZip} {order.shippingCity}<br />
            {order.shippingAddress}
          </p>
        </div>

        <div className="border-t border-outline-variant pt-4 space-y-1">
          <div className="flex justify-between text-carbon-light">
            <span>Részösszeg</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-carbon-light">
            <span>Szállítás</span>
            <span>{formatPrice(order.shippingCost)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-outline-variant">
            <span>Összesen</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="text-center mt-8">
        <Link
          href="/"
          className="bg-primary text-on-primary rounded-full px-8 py-3 font-bold btn-anim inline-block"
        >
          Vissza a főoldalra
        </Link>
      </div>
    </main>
  );
}
