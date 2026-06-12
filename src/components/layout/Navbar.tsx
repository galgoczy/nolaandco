'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/store/cart';
import AccountMenu from './AccountMenu';
import SearchModal from './SearchModal';

type NavItem = {
  label: string;
  href?: string; // no href = placeholder item (not clickable yet)
  children?: { label: string; href: string }[];
};

const navItems: NavItem[] = [
  { label: 'FŐOLDAL', href: '/' },
  {
    label: 'KICSIKRŐL',
    href: '/termekek?category=kicsiknek',
    children: [
      { label: 'Emlékpárnák', href: '/termekek?category=pillow' },
      { label: 'Születési poszterek', href: '/termekek?category=poster' },
    ],
  },
  {
    label: 'NAGYOKNAK',
    href: '/termekek?category=nagyoknak',
    children: [
      { label: 'Kalandköpenyek', href: '/termekek?category=cape' },
      { label: 'Koronák', href: '/termekek?category=crown' },
    ],
  },
  { label: 'VÁLOGATÁSOK', href: '/termekek?category=bundle' },
  { label: 'AJÁNDÉKKÁRTYA', href: '/termekek/nola-digitalis-ajandekkartya' },
  { label: 'NEKTEK', href: '/nektek' },
  { label: 'RÓLUNK', href: '/rolunk' },
];

type BannerData = {
  text: string;
  textColor: string;
  bgColor: string;
  href: string | null;
  bold?: boolean;
};

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [banner, setBanner] = useState<BannerData | null>(null);
  const [showBanner, setShowBanner] = useState(true);
  const [mounted, setMounted] = useState(false);
  const count = useCartStore((s) => s.count());
  const pathname = usePathname();

  // A Főoldal menüpont a főoldalon felesleges — csak aloldalakon jelenik meg.
  const visibleItems = navItems.filter(
    (item) => !(item.href === '/' && pathname === '/')
  );

  useEffect(() => {
    setMounted(true);
    fetch('/api/admin/banner')
      .then((r) => r.json())
      .then((data) => {
        if (data.banner) setBanner(data.banner);
      })
      .catch(() => {});
  }, []);

  return (
    <>
      {/* Dynamic banner from admin */}
      {banner && showBanner && (
        <div
          className="text-center text-sm py-2 px-8 relative z-[60]"
          style={{
            backgroundColor: banner.bgColor,
            color: banner.textColor,
            fontWeight: banner.bold ? 700 : 500,
            minHeight: '38px',
          }}
        >
          {banner.href ? (
            <Link href={banner.href} className="hover:underline">
              {banner.text}
            </Link>
          ) : (
            <span>{banner.text}</span>
          )}
          <button
            onClick={() => setShowBanner(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
            aria-label="Bezárás"
            style={{ color: banner.textColor }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <nav className="nav-animate sticky top-0 z-50 bg-nav-beige glass-nav">
        <div className="max-w-7xl mx-auto px-6 md:px-8 h-16 md:h-[76px] flex items-center justify-between">
          {/* Left: Logo */}
          <div className="flex-1 flex items-center md:-ml-3">
            <Link href="/">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo-wide.svg"
                alt="Nola & Co."
                className="h-8 md:h-[37px] w-auto"
              />
            </Link>
          </div>

          {/* Center: Nav links (hidden on mobile) */}
          <div className="hidden md:flex gap-6 items-center justify-center self-stretch font-manrope text-sm tracking-wide uppercase font-medium">
            {visibleItems.map((item) =>
              item.children ? (
                <div key={item.label} className="relative group h-full flex items-center">
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="nav-link text-[#C4A591] hover:text-[#4A4A4A] transition-colors duration-200 uppercase flex items-center gap-1"
                    >
                      {item.label}
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 transition-transform duration-200 group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="nav-link text-[#C4A591] hover:text-[#4A4A4A] transition-colors duration-200 uppercase flex items-center gap-1"
                    >
                      {item.label}
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 transition-transform duration-200 group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  )}
                  <div className="absolute left-1/2 -translate-x-1/2 top-full hidden group-hover:block group-focus-within:block">
                    <div className="bg-nav-beige glass-nav shadow-lg rounded-b py-2 min-w-[220px] normal-case">
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          className="block px-5 py-2.5 text-[#C4A591] hover:text-[#4A4A4A] hover:bg-black/5 transition-colors duration-200 whitespace-nowrap"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : item.href ? (
                <Link
                  key={item.label}
                  href={item.href}
                  className="nav-link text-[#C4A591] hover:text-[#4A4A4A] transition-colors duration-200"
                >
                  {item.label}
                </Link>
              ) : (
                <span key={item.label} className="nav-link text-[#C4A591]/60 cursor-default">
                  {item.label}
                </span>
              )
            )}
          </div>

          {/* Right: Icons */}
          <div className="flex-1 flex justify-end items-center gap-6">
            {/* Search */}
            <SearchModal />

            {/* Account */}
            <AccountMenu />

            {/* Cart */}
            <Link href="/kosar" className="relative icon-hover text-[#C4A591] hover:text-[#4A4A4A]" aria-label="Kosár">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              {mounted && count > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-red text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {count}
                </span>
              )}
            </Link>

            {/* Mobile hamburger */}
            <button
              className="md:hidden icon-hover text-[#C4A591] hover:text-[#4A4A4A]"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menü"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-nav-beige border-t border-outline-variant/20 px-6 pb-6">
            <div className="flex flex-col gap-2 pt-4 font-manrope text-sm tracking-wide uppercase font-medium">
              {visibleItems.map((item) =>
                item.children ? (
                  <div key={item.label} className="py-1">
                    {item.href ? (
                      <Link
                        href={item.href}
                        className="block text-[#C4A591] hover:text-[#4A4A4A] transition-colors duration-200 py-1"
                        onClick={() => setMobileOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span className="block text-[#C4A591] py-1">{item.label}</span>
                    )}
                    <div className="flex flex-col border-l border-[#C4A591]/30 ml-1 pl-4 mt-1 normal-case">
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          className="nav-link text-[#C4A591] hover:text-[#4A4A4A] transition-colors duration-200 py-2"
                          onClick={() => setMobileOpen(false)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : item.href ? (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="nav-link text-[#C4A591] hover:text-[#4A4A4A] transition-colors duration-200 py-2"
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span key={item.label} className="text-[#C4A591]/60 py-2">
                    {item.label}
                  </span>
                )
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
