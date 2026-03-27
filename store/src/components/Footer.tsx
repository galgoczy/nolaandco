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
    <footer className="bg-[#fdfbf7] pt-20 pb-8 px-8">
      <div className="max-w-[1280px] mx-auto">
        {/* Top section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Logo + newsletter heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5"
          >
            <Image
              src="/logo.svg"
              alt="NOLA&CO"
              width={150}
              height={42}
              className="h-10 w-auto mb-8"
            />
            <h4 className="font-sans font-bold text-[14px] tracking-wider uppercase text-[#333]">
              HÍRLEVÉL
            </h4>
          </motion.div>

          {/* Quick links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <h4 className="font-sans font-bold text-[14px] tracking-wider uppercase text-[#333] mb-6">
              GYORS LINKEK
            </h4>
            <ul className="space-y-0">
              {quickLinks.map((link) => (
                <li key={link.label} className="leading-[36px]">
                  <Link
                    href={link.href}
                    className="font-sans text-[14px] text-[#4a4a4a] hover:text-[#333] transition-colors"
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
            className="lg:col-span-3"
          >
            <h4 className="font-sans font-bold text-[14px] tracking-wider uppercase text-[#333] mb-6">
              INFORMÁCIÓK
            </h4>
            <ul className="space-y-0">
              {infoLinks.map((link) => (
                <li key={link.label} className="leading-[36px]">
                  <Link
                    href={link.href}
                    className="font-sans text-[14px] text-[#4a4a4a] hover:text-[#333] transition-colors"
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
            className="lg:col-span-2"
          >
            <h4 className="font-sans font-bold text-[14px] tracking-wider uppercase text-[#333] mb-6">
              KAPCSOLÓDJUNK
            </h4>
            <ul className="space-y-0">
              {socialLinks.map((link) => (
                <li key={link.label} className="leading-[36px]">
                  <motion.a
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={
                      link.href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="font-sans text-[14px] text-[#4a4a4a] hover:text-[#333] transition-colors"
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
        <div className="border-t border-[#e5e5e5] mt-8 pt-8 text-center">
          <p className="text-[14px] text-[#4a4a4a]">
            &copy; 2026 Nola &amp; Co &#x2502;{" "}
            <a
              href="mailto:hello@nolaandco.hu"
              className="hover:text-[#333] transition-colors"
            >
              hello@nolaandco.hu
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
