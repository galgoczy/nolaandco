import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { getAdminSession } from '@/lib/auth';
import { authOptions } from '@/lib/auth-options';
import AdminShell from './AdminShell';

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

  return <AdminShell>{children}</AdminShell>;
}
