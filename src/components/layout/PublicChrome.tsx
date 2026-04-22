'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Hides the public site chrome (navbar, footer, cookie banner, analytics)
 * on /admin routes so the admin UI owns the viewport. Admin has its own
 * shell with a mobile drawer; the public navbar would collide with it
 * and push it behind.
 */
export default function PublicChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;
  return <>{children}</>;
}
