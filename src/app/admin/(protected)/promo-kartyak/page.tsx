import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { ACTIVE_PRIZES, PROMO_COUPON_SOURCE, PROMO_VALID_UNTIL_TEXT, prizeById } from '@/lib/promoPrizes';
import ResetCardButton from './ResetCardButton';
import RedeemCardButton from './RedeemCardButton';

export const dynamic = 'force-dynamic';

function fmt(d: Date | null | undefined): string {
  if (!d) return '—';
  return new Intl.DateTimeFormat('hu-HU', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Budapest',
  }).format(d);
}

/**
 * A vásári kaparós kártyák állapota kötegenként: melyiket kaparták le, mit
 * nyert, be lett-e váltva (kupon: rendelés; tárgy: átvétel), kért-e e-mailt.
 * Kötegenként látszik a nyereménykeret is: mennyi ment ki, mennyi van még a
 * zsákban. A lekapart kártya visszaállítható (a link/QR nem változik):
 * tesztkártyánál egy megerősítéssel, éles kártyánál a kód begépelésével — és
 * csak ha még nem ment ki e-mail és nem váltották be a kupont.
 */
export default async function PromoCardsPage() {
  const cards = await prisma.promoCard.findMany({
    orderBy: [{ batch: 'asc' }, { createdAt: 'asc' }],
  });
  const codes = cards.map((c) => c.couponCode).filter((c): c is string => !!c);
  const [coupons, orders] = await Promise.all([
    prisma.coupon.findMany({
      where: { source: PROMO_COUPON_SOURCE, code: { in: codes } },
      select: { code: true, usageCount: true, active: true, endsAt: true },
    }),
    codes.length
      ? prisma.order.findMany({
          where: { couponCode: { in: codes } },
          select: { id: true, couponCode: true, createdAt: true, status: true },
          orderBy: { createdAt: 'asc' },
        })
      : Promise.resolve([] as { id: string; couponCode: string | null; createdAt: Date; status: string }[]),
  ]);
  const couponByCode: Record<string, (typeof coupons)[number]> = {};
  for (const c of coupons) couponByCode[c.code] = c;
  const orderByCode: Record<string, (typeof orders)[number]> = {};
  for (const o of orders) if (o.couponCode && !orderByCode[o.couponCode]) orderByCode[o.couponCode] = o;

  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://nolaandco.hu';

  // Kötegek: az éles előre, a tesztek utána.
  // (Set-spread nélkül — a projekt es5 targetje azt nem fordítja.)
  const seen: Record<string, true> = {};
  const batchNames = cards
    .map((c) => c.batch)
    .filter((b) => (seen[b] ? false : (seen[b] = true)))
    .sort((a, b) => {
      const at = a.includes('teszt') ? 1 : 0;
      const bt = b.includes('teszt') ? 1 : 0;
      return at - bt || a.localeCompare(b);
    });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-headline font-bold text-on-surface">Promó kártyák</h1>
        <p className="text-sm text-on-surface/60 mt-1">
          {cards.length} kártya · {cards.filter((c) => c.scratchedAt).length} lekaparva ·{' '}
          {cards.filter((c) => c.emailedAt).length} e-mailt kért · a nyeremények {PROMO_VALID_UNTIL_TEXT}{' '}
          válthatók be
        </p>
      </div>

      {batchNames.map((batch) => {
        const list = cards.filter((c) => c.batch === batch);
        const isTest = batch.includes('teszt');
        const scratched = list.filter((c) => c.scratchedAt).length;

        // Keret-összesítő nyereményenként.
        const summary = ACTIVE_PRIZES.map((p) => {
          const got = list.filter((c) => c.prizeId === p.id);
          const used = got.filter((c) =>
            p.kind === 'item'
              ? !!c.redeemedAt
              : !!(c.couponCode && (couponByCode[c.couponCode]?.usageCount ?? 0) > 0),
          ).length;
          return { prize: p, assigned: got.length, used };
        });

        return (
          <section key={batch} className="mb-10">
            <div className="flex flex-wrap items-baseline gap-3 mb-3">
              <h2 className="font-headline font-semibold text-on-surface">{batch}</h2>
              <span className="text-xs text-on-surface/60">
                {list.length} kártya · {scratched} lekaparva · {list.length - scratched} érintetlen
              </span>
              {isTest && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">teszt</span>
              )}
            </div>

            <div className="mb-4 bg-surface-container-lowest rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-body">
                  <thead>
                    <tr className="border-b border-outline-variant text-left bg-surface-container-low">
                      <th className="p-3 text-on-surface/60 font-medium">Nyeremény</th>
                      <th className="p-3 text-on-surface/60 font-medium text-right">Keret</th>
                      <th className="p-3 text-on-surface/60 font-medium text-right">Kiosztva</th>
                      <th className="p-3 text-on-surface/60 font-medium text-right">Még a zsákban</th>
                      <th className="p-3 text-on-surface/60 font-medium text-right">Beváltva</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.map((s) => (
                      <tr key={s.prize.id} className="border-b border-outline-variant/40 last:border-none">
                        <td className="p-3">
                          <span className="mr-2">{s.prize.big}</span>
                          {s.prize.label}
                        </td>
                        <td className="p-3 text-right">{s.prize.count}</td>
                        <td className="p-3 text-right">{s.assigned}</td>
                        <td className="p-3 text-right font-medium">{Math.max(0, s.prize.count - s.assigned)}</td>
                        <td className="p-3 text-right">{s.used}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-body">
                  <thead>
                    <tr className="border-b border-outline-variant text-left bg-surface-container-low">
                      <th className="p-3 text-on-surface/60 font-medium">Kártya</th>
                      <th className="p-3 text-on-surface/60 font-medium">Állapot</th>
                      <th className="p-3 text-on-surface/60 font-medium">Nyeremény</th>
                      <th className="p-3 text-on-surface/60 font-medium">Kód</th>
                      <th className="p-3 text-on-surface/60 font-medium">Beváltás</th>
                      <th className="p-3 text-on-surface/60 font-medium">E-mail</th>
                      <th className="p-3 text-on-surface/60 font-medium text-right"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((c) => {
                      const prize = prizeById(c.prizeId);
                      const coupon = c.couponCode ? couponByCode[c.couponCode] : undefined;
                      const order = c.couponCode ? orderByCode[c.couponCode] : undefined;
                      const couponUsed = !!coupon && coupon.usageCount > 0;
                      const canReset = !!c.scratchedAt && (isTest || !c.emailedAt) && !couponUsed;
                      return (
                        <tr key={c.id} className="border-b border-outline-variant/40 last:border-none">
                          <td className="p-3">
                            <a
                              href={`${base}/pp/${c.token}`}
                              target="_blank"
                              rel="noreferrer"
                              className="font-mono font-medium text-primary hover:underline"
                            >
                              {c.token}
                            </a>
                          </td>
                          <td className="p-3">
                            {c.scratchedAt ? (
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Lekaparva {fmt(c.scratchedAt)}
                              </span>
                            ) : (
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                Érintetlen
                              </span>
                            )}
                          </td>
                          <td className="p-3">{prize?.label ?? c.prizeLabel ?? '—'}</td>
                          <td className="p-3 font-mono text-xs">{c.couponCode ?? '—'}</td>
                          <td className="p-3 text-xs">
                            {!prize ? (
                              '—'
                            ) : prize.kind === 'item' ? (
                              c.redeemedAt ? (
                                <span className="text-green-700">Átvéve {fmt(c.redeemedAt)}</span>
                              ) : (
                                <span className="text-on-surface/60">Még nem vette át</span>
                              )
                            ) : !coupon ? (
                              <span className="text-amber-700">Nincs kupon (régi tesztkártya)</span>
                            ) : couponUsed ? (
                              <span className="text-green-700">
                                Beváltva
                                {order && (
                                  <>
                                    {' · '}
                                    <Link href={`/admin/rendeles/${order.id}`} className="underline">
                                      rendelés {fmt(order.createdAt)}
                                    </Link>
                                  </>
                                )}
                              </span>
                            ) : !coupon.active ? (
                              <span className="text-on-surface/60">Kupon kikapcsolva</span>
                            ) : (
                              <span className="text-on-surface/60">Beváltatlan</span>
                            )}
                          </td>
                          <td className="p-3 text-on-surface/70">
                            {c.email ? (
                              <>
                                {c.email}
                                <span className="block text-xs text-on-surface/50">{fmt(c.emailedAt)}</span>
                              </>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="p-3 text-right whitespace-nowrap space-x-3">
                            {prize?.kind === 'item' && c.scratchedAt && (
                              <RedeemCardButton token={c.token} redeemed={!!c.redeemedAt} />
                            )}
                            {canReset && <ResetCardButton token={c.token} live={!isTest} />}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        );
      })}

      {cards.length === 0 && <p className="p-8 text-center text-on-surface/60">Még nincs kártya.</p>}
    </div>
  );
}
