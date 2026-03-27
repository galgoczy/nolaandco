"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const quickLinks = [
  { href: "/", label: "Főoldal" },
  { href: "/#rolunk", label: "Rólunk" },
  { href: "/termek/origin-core", label: "Origin" },
  { href: "/termek/nova-core", label: "Nova" },
  { href: "/#poszterek", label: "Poszter" },
  { href: "/#ajandekkartya", label: "Ajándékkártya" },
];

const infoLinks = [
  { href: "/#gyik", label: "GYIK" },
  { href: "#", label: "Szállítás és fizetés" },
  { href: "#", label: "Elállás és visszaküldés" },
  { href: "#", label: "Kapcsolat" },
  { href: "#", label: "ÁSZF" },
  { href: "#", label: "Adatkezelési tájékoztató" },
];

const socialLinks = [
  { href: "#", label: "Facebook" },
  { href: "https://instagram.com/nolaandco", label: "Instagram" },
  { href: "mailto:hello@nolaandco.hu", label: "E-mail" },
  { href: "#", label: "Kollaboráció" },
];

export default function Footer() {
  return (
    <footer className="bg-[#F5F0E8] border-t border-terracotta/5">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-14 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Logo + newsletter label */}
          <div className="lg:col-span-1">
            <Image
              src="/logo.svg"
              alt="NOLA&CO"
              width={150}
              height={42}
              className="h-10 w-auto mb-8"
            />
            <p className="text-xs tracking-[0.2em] text-terracotta/60 font-medium italic">
              HÍRLEVÉL
            </p>
          </div>

          {/* Spacer on large screens */}
          <div className="hidden lg:block" />

          {/* Quick links */}
          <div>
            <h4 className="text-xs tracking-[0.15em] text-terracotta/80 font-medium mb-5">
              GYORS LINKEK
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm font-light text-carbon-light/60 hover:text-terracotta transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-xs tracking-[0.15em] text-terracotta/80 font-medium mb-5">
              INFORMÁCIÓK
            </h4>
            <ul className="space-y-3">
              {infoLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm font-light text-carbon-light/60 hover:text-terracotta transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-xs tracking-[0.15em] text-terracotta/80 font-medium mb-5">
              KAPCSOLÓDJUNK
            </h4>
            <ul className="space-y-3">
              {socialLinks.map((link) => (
                <li key={link.label}>
                  <motion.a
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={
                      link.href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="text-sm font-light text-carbon-light/60 hover:text-terracotta transition-colors"
                    whileHover={{ x: 2 }}
                  >
                    {link.label}
                  </motion.a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-6 border-t border-terracotta/10 text-center">
          <p className="text-xs text-carbon-light/40 font-light">
            © 2026 Nola & Co │{" "}
            <a
              href="mailto:hello@nolaandco.hu"
              className="hover:text-terracotta transition-colors"
            >
              hello@nolaandco.hu
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
