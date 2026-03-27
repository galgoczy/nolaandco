"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cart";

const navLinks = [
  { href: "/", label: "FŐOLDAL", active: true },
  { href: "/#parnak", label: "PÁRNÁK", active: false },
  { href: "/#stilusok", label: "STÍLUSOK", active: false },
  { href: "/#poszterek", label: "POSZTER", active: false },
  { href: "/#ajandekkartya", label: "AJÁNDÉKKÁRTYA", active: false },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { totalItems, toggleCart } = useCartStore();
  const itemCount = totalItems();

  return (
    <header className="sticky top-0 z-50 bg-[#fdfbf7]">
      <div className="mx-auto max-w-[1440px] px-8 py-6">
        {/* Desktop layout */}
        <div className="flex items-center justify-between">
          {/* LEFT - Navigation links */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-sans text-[14px] uppercase tracking-[0.35px] transition-colors duration-200 ${
                  link.active
                    ? "text-[#a93832] font-semibold"
                    : "text-[rgba(114,89,72,0.7)] font-medium hover:text-[rgba(114,89,72,1)]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile hamburger - left side */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden flex flex-col justify-center gap-[5px] w-6 h-6"
            aria-label="Menü"
          >
            <span
              className={`block h-[2px] w-6 bg-[rgba(114,89,72,0.7)] transition-all duration-300 ${
                menuOpen ? "translate-y-[7px] rotate-45" : ""
              }`}
            />
            <span
              className={`block h-[2px] w-6 bg-[rgba(114,89,72,0.7)] transition-all duration-300 ${
                menuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-[2px] w-6 bg-[rgba(114,89,72,0.7)] transition-all duration-300 ${
                menuOpen ? "-translate-y-[7px] -rotate-45" : ""
              }`}
            />
          </button>

          {/* CENTER - Logo */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
            <Image
              src="/logo.svg"
              alt="NOLA&CO"
              width={144}
              height={40}
              className="h-9 w-auto scale-90"
              priority
            />
          </Link>

          {/* RIGHT - Icons */}
          <div className="flex items-center gap-6">
            {/* Search */}
            <button
              className="transition-opacity hover:opacity-70"
              aria-label="Keresés"
            >
              <Image
                src="/icons/Keresés.png"
                alt="Keresés"
                width={18}
                height={18}
                className="w-[18px] h-[18px] object-contain"
              />
            </button>

            {/* Profile */}
            <Link
              href="/admin"
              className="transition-opacity hover:opacity-70"
              aria-label="Profil"
            >
              <Image
                src="/icons/Profil.png"
                alt="Profil"
                width={16}
                height={16}
                className="w-[16px] h-[16px] object-contain"
              />
            </Link>

            {/* Cart */}
            <button
              onClick={toggleCart}
              className="relative transition-opacity hover:opacity-70"
              aria-label="Kosár"
            >
              <Image
                src="/icons/Kosár.png"
                alt="Kosár"
                width={20}
                height={20}
                className="w-[20px] h-[20px] object-contain"
              />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#a93832] text-[9px] font-medium text-white">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          menuOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="flex flex-col items-center gap-6 bg-[#fdfbf7] px-8 py-8 border-t border-[rgba(114,89,72,0.1)]">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`font-sans text-[14px] uppercase tracking-[0.35px] transition-colors duration-200 ${
                link.active
                  ? "text-[#a93832] font-semibold"
                  : "text-[rgba(114,89,72,0.7)] font-medium hover:text-[rgba(114,89,72,1)]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
