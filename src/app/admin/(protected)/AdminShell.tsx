'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Vezérlőpult', href: '/admin' },
  { label: 'Rendelések', href: '/admin/rendelesek' },
  { label: 'Termékek', href: '/admin/termekek' },
  { label: 'Termék aliasok', href: '/admin/termek-aliasok' },
  { label: 'Kategóriák', href: '/admin/kategoriak' },
  { label: 'Kuponok', href: '/admin/kuponok' },
  { label: 'Statisztikák', href: '/admin/statisztikak' },
  { label: 'Szalagcím', href: '/admin/szalagcim' },
];

export default function AdminShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer on navigation (mobile flow).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on Escape when the drawer is open.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  return (
    <div className="flex min-h-screen">
      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 bg-[#D5E8F0] flex items-center gap-3 px-4 h-14 border-b border-black/5">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Menü megnyitása"
          className="p-2 -ml-2 rounded-lg hover:bg-white/40 transition-colors"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        </button>
        <h1 className="font-headline text-base font-bold">Nola &amp; Co Admin</h1>
      </header>

      {/* Mobile backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          aria-hidden="true"
          className="md:hidden fixed inset-0 bg-black/40 z-40"
        />
      )}

      {/* Sidebar — fixed + slide on mobile, static on md+. */}
      <aside
        className={`
          w-64 bg-[#D5E8F0] text-carbon flex flex-col shrink-0
          fixed md:static top-0 bottom-0 left-0 z-50
          transform transition-transform duration-200 ease-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        <div className="p-6 border-b border-black/5 flex items-center justify-between">
          <h1 className="font-headline text-lg font-bold">Nola &amp; Co Admin</h1>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Menü bezárása"
            className="md:hidden p-1 rounded hover:bg-white/40 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
          {navItems.map((item) => {
            const active =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`px-4 py-2.5 rounded-lg text-sm font-body transition-colors ${
                  active ? 'bg-white/60 font-medium' : 'hover:bg-white/40'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-black/5">
          <form action="/api/admin/auth" method="POST">
            <input type="hidden" name="_method" value="DELETE" />
            <button
              type="submit"
              className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-body hover:bg-white/40 transition-colors text-red-600"
            >
              Kijelentkezés
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 bg-surface-container-low overflow-auto p-4 pt-20 md:p-8 md:pt-8">
        {children}
      </main>
    </div>
  );
}
