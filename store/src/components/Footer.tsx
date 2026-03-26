"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-carbon text-white/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Image
              src="/logo.svg"
              alt="NOLA&CO"
              width={120}
              height={35}
              className="brightness-200 mb-4"
            />
            <p className="text-sm font-light leading-relaxed">
              Egyedi babapárnák és poszterek, szeretettel és odafigyeléssel
              készítve minden kisbabának.
            </p>
            <div className="flex gap-3 mt-4">
              <motion.a
                href="https://instagram.com/nolaandco"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-terracotta transition-colors"
              >
                <Image
                  src="/icons/Insta 2.png"
                  alt="Instagram"
                  width={16}
                  height={16}
                  className="brightness-200"
                />
              </motion.a>
              <motion.a
                href="mailto:hello@nolaandco.hu"
                whileHover={{ scale: 1.1 }}
                className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-terracotta transition-colors"
              >
                <Image
                  src="/icons/Levél 2.png"
                  alt="Email"
                  width={16}
                  height={16}
                  className="brightness-200"
                />
              </motion.a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white text-sm font-medium tracking-wider uppercase mb-4">
              Termékek
            </h4>
            <ul className="space-y-2">
              {[
                { href: "/#parnak", label: "Babapárnák" },
                { href: "/#poszterek", label: "Poszterek" },
                { href: "/akciok", label: "Akciók" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-light hover:text-terracotta transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white text-sm font-medium tracking-wider uppercase mb-4">
              Információ
            </h4>
            <ul className="space-y-2">
              {[
                { href: "/#hogyan-keszul", label: "Hogyan készül" },
                { href: "/#gyik", label: "GYIK" },
                { href: "/hirlevel", label: "Hírlevél" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-light hover:text-terracotta transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white text-sm font-medium tracking-wider uppercase mb-4">
              Vásárlás
            </h4>
            <ul className="space-y-2">
              {[
                { href: "/kosar", label: "Kosár" },
                { href: "/penztar", label: "Pénztár" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-light hover:text-terracotta transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-center gap-3">
              <Image
                src="/icons/Fizetés.png"
                alt="Fizetés"
                width={20}
                height={20}
                className="brightness-200 opacity-50"
              />
              <Image
                src="/icons/Biztonság.png"
                alt="Biztonság"
                width={20}
                height={20}
                className="brightness-200 opacity-50"
              />
              <Image
                src="/icons/Szállítás.png"
                alt="Szállítás"
                width={20}
                height={20}
                className="brightness-200 opacity-50"
              />
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} NOLA&CO. Minden jog fenntartva.
          </p>
          <div className="flex gap-6 text-xs text-white/40">
            <Link href="#" className="hover:text-white/60 transition-colors">
              Adatvédelem
            </Link>
            <Link href="#" className="hover:text-white/60 transition-colors">
              ÁSZF
            </Link>
            <Link href="#" className="hover:text-white/60 transition-colors">
              Süti beállítások
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
