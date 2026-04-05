'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/cart';
import AccountMenu from './AccountMenu';

const navLinks = [
  { label: 'FŐOLDAL', href: '/' },
  { label: 'V2', href: '/fooldal-v2' },
  { label: 'V3', href: '/fooldal-v3' },
  { label: 'V4', href: '/fooldal-v4' },
  { label: 'RÓLUNK', href: '/rolunk' },
  { label: 'NEKTEK', href: '/nektek' },
  { label: 'PÁRNA', href: '/termekek?category=pillow' },
  { label: 'POSZTER', href: '/termekek?category=poster' },
  { label: 'AJÁNDÉKKÁRTYA', href: '/termekek/nola-ajandekkartya' },
];

type BannerData = {
  text: string;
  textColor: string;
  bgColor: string;
  href: string | null;
};

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [banner, setBanner] = useState<BannerData | null>(null);
  const [showBanner, setShowBanner] = useState(true);
  const count = useCartStore((s) => s.count());

  useEffect(() => {
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
          className="text-center text-sm font-medium py-2 px-8 relative z-[60]"
          style={{
            backgroundColor: banner.bgColor,
            color: banner.textColor,
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
          <div className="flex-1 flex items-center">
            <Link href="/">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo-wide.svg"
                alt="Nola & Co."
                className="h-8 md:h-11 w-auto"
              />
            </Link>
          </div>

          {/* Center: Nav links (hidden on mobile) */}
          <div className="hidden md:flex gap-6 items-center justify-center font-manrope text-sm tracking-wide uppercase font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="nav-link text-[#C4A591] hover:text-[#4A4A4A] transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right: Icons */}
          <div className="flex-1 flex justify-end items-center gap-6">
            {/* Search */}
            <button className="icon-hover text-[#C4A591] hover:text-[#4A4A4A]" aria-label="Keresés">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
            </button>

            {/* Account */}
            <AccountMenu />

            {/* Cart */}
            <Link href="/kosar" className="relative icon-hover text-[#C4A591] hover:text-[#4A4A4A]" aria-label="Kosár">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              {count > 0 && (
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
            <div className="flex flex-col gap-4 pt-4 font-manrope text-sm tracking-wide uppercase font-medium">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="nav-link text-[#C4A591] hover:text-[#4A4A4A] transition-colors duration-200 py-2"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
