"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useCartStore } from "@/store/cart";

const navLinks = [
  { href: "/#hero", label: "FŐOLDAL" },
  { href: "/#parnak", label: "PÁRNÁK" },
  { href: "/#stilusok", label: "STÍLUSOK" },
  { href: "/#poszterek", label: "POSZTER" },
  { href: "/#ajandekkartya", label: "AJÁNDÉKKÁRTYA" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { totalItems, toggleCart } = useCartStore();
  const itemCount = totalItems();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-[#F5F0E8]/95 backdrop-blur-md shadow-[0_1px_0_rgba(196,165,145,0.1)]"
            : "bg-[#F5F0E8]"
        }`}
      >
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-[70px]">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Image
                  src="/logo.svg"
                  alt="NOLA&CO"
                  width={160}
                  height={45}
                  className="h-9 w-auto"
                  priority
                />
              </motion.div>
            </Link>

            {/* Desktop nav - centered */}
            <nav className="hidden lg:flex items-center gap-10">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative text-[13px] font-extralight tracking-[0.2em] text-terracotta/80 hover:text-terracotta transition-colors duration-300"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right icons */}
            <div className="flex items-center gap-5">
              {/* Search */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-terracotta/60 hover:text-terracotta transition-colors"
                aria-label="Keresés"
              >
                <Image src="/icons/Keresés.png" alt="Keresés" width={22} height={22} className="opacity-50 hover:opacity-80 transition-opacity" />
              </motion.button>

              {/* Profile */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/admin" className="text-terracotta/60 hover:text-terracotta transition-colors">
                  <Image src="/icons/Profil.png" alt="Profil" width={22} height={22} className="opacity-50 hover:opacity-80 transition-opacity" />
                </Link>
              </motion.div>

              {/* Cart */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleCart}
                className="relative text-terracotta/60 hover:text-terracotta transition-colors"
                aria-label="Kosár"
              >
                <Image src="/icons/Kosár.png" alt="Kosár" width={22} height={22} className="opacity-50 hover:opacity-80 transition-opacity" />
                <AnimatePresence>
                  {itemCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-2 -right-2 bg-terracotta text-white text-[9px] font-medium rounded-full w-4 h-4 flex items-center justify-center"
                    >
                      {itemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden p-1 text-terracotta/60 hover:text-terracotta transition-colors"
                aria-label="Menü"
              >
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="fixed top-[70px] left-0 right-0 z-40 bg-[#F5F0E8] border-t border-terracotta/10 lg:hidden"
          >
            <div className="flex flex-col items-center py-8 gap-6">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="text-sm font-extralight tracking-[0.2em] text-terracotta/80 hover:text-terracotta transition-colors"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
