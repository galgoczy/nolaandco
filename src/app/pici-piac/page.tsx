import type { Metadata } from 'next';
import ScratchCard from './ScratchCard';

/**
 * Rejtett promóciós oldal a Pici Piac vásárra: kaparós nyereményszelvény.
 * A főoldalról szándékosan nem érhető el — a linket a standon adjuk ki
 * (QR-kód / szórólap). Keresők elől elrejtve.
 *
 * DEMÓ: a nyeremény és a kuponkód a böngészőben sorsolódik, a webshop
 * rendszereihez (kuponok, készlet) még semmi nincs bekötve.
 */
export const metadata: Metadata = {
  title: 'Kapard le és nyerj!',
  description: 'Nola & Co × Pici Piac — kaparós nyereményszelvény.',
  robots: { index: false, follow: false },
};

export default function PiciPiacPage() {
  return (
    <main className="min-h-screen bg-[#F7F3EE] flex flex-col items-center px-4 py-10 md:py-16">
      <p className="text-[#B48D76] tracking-[0.22em] font-semibold text-xs mb-3 text-center">
        NOLA &amp; CO &times; PICI PIAC
      </p>
      <h1 className="font-headline text-3xl md:text-4xl font-bold text-[#4A4A4A] text-center mb-3">
        Kapard le és nyerj!
      </h1>
      <p className="font-body text-[#4A4A4A]/70 text-center max-w-md mb-8 md:mb-10">
        Minden szelvény nyer. Kapard le a felületet az ujjaddal, és nézd meg,
        mi lapul alatta!
      </p>

      <ScratchCard />

      <p className="mt-10 text-xs text-[#4A4A4A]/45 text-center max-w-sm leading-relaxed">
        Demó változat — a nyeremények és a kuponkódok illusztrációk, beváltásuk
        még nem lehetséges.
      </p>
    </main>
  );
}
