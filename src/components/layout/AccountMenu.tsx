'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function AccountMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  // Not logged in → direct link to login page
  if (status !== 'authenticated' || !session?.user?.email) {
    return (
      <Link
        href="/bejelentkezes"
        className="icon-hover text-[#C4A591] hover:text-[#4A4A4A]"
        aria-label="Bejelentkezés"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      </Link>
    );
  }

  const user = session.user;
  const isAdmin = user.role === 'admin';
  const displayName = user.name || user.email || '';
  const initials = (user.name || user.email || '?')
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-center w-9 h-9 rounded-full bg-[#C4A591]/15 text-[#4A4A4A] hover:bg-[#C4A591]/25 transition-colors overflow-hidden"
        aria-label="Fiók menü"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.image} alt={displayName} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs font-semibold">{initials}</span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 rounded-xl bg-white shadow-lg border border-black/5 py-2 font-body text-sm z-[55]"
        >
          <div className="px-4 py-2 border-b border-black/5">
            <div className="font-medium text-[#4A4A4A] truncate">{displayName}</div>
            {user.email && user.email !== displayName && (
              <div className="text-xs text-[#4A4A4A]/60 truncate">{user.email}</div>
            )}
            {isAdmin && (
              <div className="mt-1 inline-block text-[10px] uppercase tracking-wide bg-[#D5E8F0] text-[#4A4A4A] px-2 py-0.5 rounded">
                Admin
              </div>
            )}
          </div>

          <Link
            href="/fiok"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-[#4A4A4A] hover:bg-[#F7F3EE] transition-colors"
          >
            Fiókom
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-[#4A4A4A] hover:bg-[#F7F3EE] transition-colors"
            >
              Admin felület
            </Link>
          )}

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              signOut({ callbackUrl: '/' });
            }}
            className="w-full text-left block px-4 py-2 text-red-600 hover:bg-[#F7F3EE] transition-colors"
          >
            Kijelentkezés
          </button>
        </div>
      )}
    </div>
  );
}
