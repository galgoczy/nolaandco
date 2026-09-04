import type { Metadata } from 'next';
import Link from 'next/link';
import { getCard } from '@/lib/promoCards';
import ScratchCard from '@/app/pici-piac/ScratchCard';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Kapard le és nyerj!',
  robots: { index: false, follow: false },
};

/**
 * A vásári kártya oldala — a QR-kód ide visz. A token azonosítja a kártyát:
 * ha még nem kaparták le, a fólia várja; ha már igen, a nyeremény azonnal
 * látszik, kaparás nélkül.
 */
export default async function PromoCardPage({ params }: { params: Promise<{ token: string }> }) {
  const { token: raw } = await params;
  const token = raw.trim().toUpperCase();
  const card = await getCard(token);

  if (!card) {
    return (
      <main className="min-h-[70vh] bg-[#F7F3EE] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="font-headline font-medium text-2xl text-[#4A4A4A] mb-4">
            Ezt a kártyát nem találjuk
          </h1>
          <p className="text-[#4A4A4A]/70 font-body mb-8">
            Lehet, hogy a QR-kód sérült, vagy a kód elgépelődött. Kérdezz minket
            a standnál, szívesen segítünk!
          </p>
          <Link
            href="/termekek"
            className="inline-block bg-[#C4A591] hover:opacity-90 transition-opacity text-white rounded-2xl px-8 py-3 text-sm font-semibold tracking-wide"
          >
            Irány a termékek
          </Link>
        </div>
      </main>
    );
  }

  const alreadyScratched = !!(card.prize && card.code);

  return (
    <main className="min-h-screen bg-[#F7F3EE] flex flex-col items-center px-4 py-10 md:py-16">
      <p className="text-[#B48D76] tracking-[0.22em] font-semibold text-xs mb-3 text-center">
        NOLA &amp; CO &times; PICI PIAC
      </p>
      <h1 className="font-headline text-3xl md:text-4xl font-bold text-[#4A4A4A] text-center mb-3">
        {alreadyScratched ? 'A nyereményed' : 'Kapard le és nyerj!'}
      </h1>
      <p className="font-body text-[#4A4A4A]/70 text-center max-w-md mb-8 md:mb-10">
        {alreadyScratched
          ? 'Ezt a szelvényt már lekapartad — itt a nyereményed, bármikor visszanézheted.'
          : 'Minden szelvény nyer. Kapard le a felületet az ujjaddal, és nézd meg, mi lapul alatta!'}
      </p>

      <ScratchCard
        mode="card"
        token={card.token}
        initial={
          alreadyScratched
            ? { prize: card.prize!, code: card.code!, email: card.email }
            : null
        }
      />

      <p className="mt-10 text-xs text-[#4A4A4A]/45 text-center max-w-sm leading-relaxed">
        Kártya: {card.token} · Tesztváltozat — a kódok beváltása még nem lehetséges.
      </p>
    </main>
  );
}
