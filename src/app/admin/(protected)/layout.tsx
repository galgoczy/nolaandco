import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import AdminNav from './AdminNav';
import { getServerSession } from 'next-auth';
import { getAdminSession } from '@/lib/auth';
import { authOptions } from '@/lib/auth-options';


export default async function AdminProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Check both custom token auth and NextAuth Google session.
  // NextAuth sessions must have role === 'admin' to access the admin area.
  const tokenSession = await getAdminSession();
  const nextAuthSession = await getServerSession(authOptions);
  const isAdmin =
    !!tokenSession || nextAuthSession?.user?.role === 'admin';

  if (!isAdmin) {
    redirect('/admin/bejelentkezes');
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <AdminNav />

      <main className="flex-1 min-w-0 bg-surface-container-low p-4 sm:p-6 lg:p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
