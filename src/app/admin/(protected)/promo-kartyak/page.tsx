import { prisma } from '@/lib/prisma';
import ResetCardButton from './ResetCardButton';

export const dynamic = 'force-dynamic';

function fmt(d: Date | null): string {
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
 * A vásári kaparós kártyák állapota kötegenként: melyiket olvasták be és
 * kaparták le, mit nyert, kért-e e-mailt. A tesztkötegek kártyái egy
 * gombbal visszaállíthatók érintetlenre; az éles kötegé szándékosan nem.
 */
export default async function PromoCardsPage() {
  const cards = await prisma.promoCard.findMany({
    orderBy: [{ batch: 'asc' }, { createdAt: 'asc' }],
  });
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
          {cards.filter((c) => c.emailedAt).length} e-mailt kért
        </p>
      </div>

      {batchNames.map((batch) => {
        const list = cards.filter((c) => c.batch === batch);
        const isTest = batch.includes('teszt');
        const scratched = list.filter((c) => c.scratchedAt).length;
        return (
          <section key={batch} className="mb-8">
            <div className="flex items-baseline gap-3 mb-3">
              <h2 className="font-headline font-semibold text-on-surface">{batch}</h2>
              <span className="text-xs text-on-surface/60">
                {list.length} kártya · {scratched} lekaparva · {list.length - scratched} érintetlen
              </span>
              {isTest && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  teszt — visszaállítható
                </span>
              )}
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
                      <th className="p-3 text-on-surface/60 font-medium">E-mail</th>
                      {isTest && <th className="p-3 text-on-surface/60 font-medium text-right"></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((c) => (
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
                        <td className="p-3">{c.prizeLabel ?? '—'}</td>
                        <td className="p-3 font-mono text-xs">{c.couponCode ?? '—'}</td>
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
                        {isTest && (
                          <td className="p-3 text-right">
                            {c.scratchedAt && <ResetCardButton token={c.token} />}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        );
      })}

      {cards.length === 0 && (
        <p className="p-8 text-center text-on-surface/60">Még nincs kártya.</p>
      )}
    </div>
  );
}
