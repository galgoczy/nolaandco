import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import Link from 'next/link';
import { getAdminSession } from '@/lib/auth';

const navItems = [
  { label: 'Vezérlőpult', href: '/admin' },
  { label: 'Rendelések', href: '/admin/rendelesek' },
  { label: 'Termékek', href: '/admin/termekek' },
];

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const headerList = await headers();
  const pathname = headerList.get('x-next-pathname') ?? '';
  const session = await getAdminSession();

  const isLoginPage = pathname === '/admin/bejelentkezes';

  if (!session && !isLoginPage) {
    redirect('/admin/bejelentkezes');
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-primary text-on-primary flex flex-col shrink-0">
        <div className="p-6 border-b border-white/10">
          <h1 className="font-headline text-lg font-bold">Nola &amp; Co Admin</h1>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-4 py-2.5 rounded-lg text-sm font-body hover:bg-white/10 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <form action="/api/admin/auth" method="POST">
            <input type="hidden" name="_method" value="DELETE" />
            <button
              type="submit"
              className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-body hover:bg-white/10 transition-colors text-red-300"
            >
              Kijelentkezés
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 bg-surface-container-low p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
