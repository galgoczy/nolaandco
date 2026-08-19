'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Vezérlőpult', href: '/admin' },
  { label: 'Rendelések', href: '/admin/rendelesek' },
  { label: 'Elállások', href: '/admin/elallasok' },
  { label: 'Termékek', href: '/admin/termekek' },
  { label: 'Termék aliasok', href: '/admin/termek-aliasok' },
  { label: 'Kategóriák', href: '/admin/kategoriak' },
  { label: 'Megjelenés', href: '/admin/megjelenes' },
  { label: 'Kuponok', href: '/admin/kuponok' },
  { label: 'Katalógus frissítés', href: '/admin/katalogus' },
  { label: 'Statisztikák', href: '/admin/statisztikak' },
  { label: 'Szalagcím', href: '/admin/szalagcim' },
];

/** Az aktuális oldal a leghosszabb illeszkedő útvonal (a /admin mindenre illeszkedne). */
function activeHref(pathname: string): string {
  let best = '';
  for (const item of navItems) {
    if ((pathname === item.href || pathname.startsWith(item.href + '/')) && item.href.length > best.length) {
      best = item.href;
    }
  }
  return best;
}

/**
 * Admin navigáció. Nagy képernyőn állandóan látszó oldalsáv; mobilon
 * kicsúszó fiók, mert a 256 pixeles sáv egy telefon szélességének a kétharmadát
 * elvette. A fiók lapváltáskor magától becsukódik.
 */
export default function AdminNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const active = activeHref(pathname);

  // Lapváltáskor csukjuk be — különben a fiók eltakarná az új oldalt.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Nyitott fiók mögött ne lehessen görgetni.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Escape zárja.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const currentLabel = navItems.find((i) => i.href === active)?.label ?? 'Admin';

  return (
    <>
      {/* Mobil fejléc: mindig elérhető, ragadós, hogy görgetés közben is nyitható */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center gap-3 bg-[#D5E8F0] px-4 py-3 border-b border-black/5">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Menü megnyitása"
          aria-expanded={open}
          className="p-2 -ml-2 rounded-lg hover:bg-white/40 transition-colors cursor-pointer"
        >
          <span aria-hidden className="block w-5 space-y-1">
            <span className="block h-0.5 bg-carbon rounded" />
            <span className="block h-0.5 bg-carbon rounded" />
            <span className="block h-0.5 bg-carbon rounded" />
          </span>
        </button>
        <span className="font-headline font-bold text-carbon truncate">{currentLabel}</span>
      </header>

      {/* Háttér a nyitott fiók mögött */}
      {open && (
        <div
          aria-hidden
          onClick={() => setOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/40"
        />
      )}

      <aside
        className={`bg-[#D5E8F0] text-carbon flex flex-col shrink-0 w-64
          fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-out
          lg:static lg:translate-x-0 lg:transition-none
          ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-6 border-b border-black/5 flex items-center justify-between gap-2">
          <h1 className="font-headline text-lg font-bold">Nola &amp; Co Admin</h1>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Menü bezárása"
            className="lg:hidden p-1 rounded hover:bg-white/40 transition-colors cursor-pointer text-xl leading-none"
          >
            &times;
          </button>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active === item.href ? 'page' : undefined}
              className={`px-4 py-2.5 rounded-lg text-sm font-body transition-colors ${
                active === item.href ? 'bg-white/70 font-medium' : 'hover:bg-white/40'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-black/5">
          <form action="/api/admin/auth" method="POST">
            <input type="hidden" name="_method" value="DELETE" />
            <button
              type="submit"
              className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-body hover:bg-white/40 transition-colors text-red-600 cursor-pointer"
            >
              Kijelentkezés
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
