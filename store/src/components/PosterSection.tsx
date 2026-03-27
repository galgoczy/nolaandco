"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const posters = [
  {
    label: "ORIGIN DESIGN",
    href: "/termek/origin-poszter",
  },
  {
    label: "NOVA DESIGN",
    href: "/termek/nova-poszter",
  },
];

export default function PosterSection() {
  return (
    <section id="poszterek" className="bg-surface-container-low py-24">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
        {/* Label */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="font-sans font-extrabold text-[12px] tracking-[3.6px] uppercase text-[#4f6168] text-center"
        >
          Artistic Remembrance
        </motion.p>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-heading font-light text-[48px] tracking-[4.8px] uppercase text-[#333] text-center mt-2"
        >
          POSZTEREK
        </motion.h2>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 max-w-[1232px] mx-auto">
          {posters.map((poster, i) => (
            <motion.div
              key={poster.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
            >
              <Link href={poster.href} className="group block">
                {/* Poster card */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.4 }}
                  className="rounded-3xl shadow-lg aspect-[592/379] overflow-hidden bg-[#e8ddd4] flex items-center justify-center"
                >
                  <span className="text-[#999] text-sm tracking-wider uppercase font-sans">
                    {poster.label} Poster
                  </span>
                </motion.div>

                {/* Label below */}
                <p className="font-sans font-bold text-[14px] tracking-[2.8px] uppercase text-[#333] text-center mt-6">
                  {poster.label}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
