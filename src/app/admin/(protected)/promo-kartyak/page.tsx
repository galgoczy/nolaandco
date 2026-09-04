import { prisma } from '@/lib/prisma';

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
 * A vásári kaparós kártyák állapota: melyiket olvasták be és kaparták le,
 * mit nyert, kért-e e-mailt. Csak olvasható — a kártyák létrehozása (köteg,
 * QR-generálás) a következő körben kerül ide.
 */
export default async function PromoCardsPage() {
  const cards = await prisma.promoCard.findMany({
    orderBy: [{ batch: 'asc' }, { createdAt: 'asc' }],
  });
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://nolaandco.hu';
  const scratched = cards.filter((c) => c.scratchedAt).length;
  const emailed = cards.filter((c) => c.emailedAt).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-headline font-bold text-on-surface">Promó kártyák</h1>
        <p className="text-sm text-on-surface/60 mt-1">
          {cards.length} kártya · {scratched} lekaparva · {emailed} e-mailt kért
        </p>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="border-b border-outline-variant text-left bg-surface-container-low">
                <th className="p-4 text-on-surface/60 font-medium">Kártya</th>
                <th className="p-4 text-on-surface/60 font-medium">Köteg</th>
                <th className="p-4 text-on-surface/60 font-medium">Állapot</th>
                <th className="p-4 text-on-surface/60 font-medium">Nyeremény</th>
                <th className="p-4 text-on-surface/60 font-medium">Kód</th>
                <th className="p-4 text-on-surface/60 font-medium">E-mail</th>
              </tr>
            </thead>
            <tbody>
              {cards.map((c) => (
                <tr key={c.id} className="border-b border-outline-variant/40 last:border-none">
                  <td className="p-4">
                    <a
                      href={`${base}/pp/${c.token}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono font-medium text-primary hover:underline"
                    >
                      {c.token}
                    </a>
                  </td>
                  <td className="p-4 text-on-surface/70">{c.batch}</td>
                  <td className="p-4">
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
                  <td className="p-4">{c.prizeLabel ?? '—'}</td>
                  <td className="p-4 font-mono text-xs">{c.couponCode ?? '—'}</td>
                  <td className="p-4 text-on-surface/70">
                    {c.email ? (
                      <>
                        {c.email}
                        <span className="block text-xs text-on-surface/50">{fmt(c.emailedAt)}</span>
                      </>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
              {cards.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-on-surface/60">
                    Még nincs kártya.
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
