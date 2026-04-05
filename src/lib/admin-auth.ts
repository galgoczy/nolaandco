import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { getAdminSession } from '@/lib/auth';

/**
 * Returns true when the current request belongs to an authenticated admin
 * (either the legacy token-based admin login or a NextAuth Google session
 * whose role is 'admin').
 */
export async function isAdminRequest(): Promise<boolean> {
  const tokenSession = await getAdminSession();
  if (tokenSession) return true;
  const nextAuthSession = await getServerSession(authOptions);
  return nextAuthSession?.user?.role === 'admin';
}
