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
    <footer className="bg-footer-bg w-full pt-20 pb-10 px-8">
      <div className="max-w-[1280px] mx-auto">
        {/* Top section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
          {/* Logo + newsletter heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="md:col-span-6 flex flex-col justify-between"
          >
            <div className="h-5 md:h-7 mb-20 opacity-80 scale-75 origin-left">
              <Image
                src="/logo.svg"
                alt="NOLA&CO"
                width={150}
                height={42}
                className="h-full w-auto object-contain"
              />
            </div>
            <h5 className="text-xl font-heading tracking-widest text-footer-text">
              HÍRLEVÉL
            </h5>
          </motion.div>

          {/* Quick links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="md:col-span-2"
          >
            <h5 className="text-[0.75rem] font-semibold tracking-[0.15em] text-footer-text mb-8">
              GYORS LINKEK
            </h5>
            <ul className="space-y-4">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-sans text-sm text-footer-text hover:text-accent-red transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="md:col-span-2"
          >
            <h5 className="text-[0.75rem] font-semibold tracking-[0.15em] text-footer-text mb-8">
              INFORMÁCIÓK
            </h5>
            <ul className="space-y-4">
              {infoLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-sans text-sm text-footer-text hover:text-accent-red transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Social / connect */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="md:col-span-2"
          >
            <h5 className="text-[0.75rem] font-semibold tracking-[0.15em] text-footer-text mb-8">
              KAPCSOLÓDJUNK
            </h5>
            <ul className="space-y-4">
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
                    className="font-sans text-sm text-footer-text hover:text-accent-red transition-colors"
                    whileHover={{ x: 2 }}
                  >
                    {link.label}
                  </motion.a>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-footer-text/10 text-center">
          <p className="text-footer-text text-sm font-light tracking-wide">
            &copy; 2024 Nola &amp; Co. Nordic Serenity. |{" "}
            <a
              href="mailto:hello@nolaandco.hu"
              className="hover:text-accent-red transition-colors"
            >
              hello@nolaandco.hu
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
