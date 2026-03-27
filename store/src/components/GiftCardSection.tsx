"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function GiftCardSection() {
  return (
    <section id="featured-product" className="py-24">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left - image area */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="w-full max-w-[576px] mx-auto"
          >
            <div className="bg-[#f5f4ef] rounded-3xl aspect-square flex items-center justify-center">
              <span className="text-[#999] text-sm tracking-wider uppercase font-sans">
                Pillow Image
              </span>
            </div>
          </motion.div>

          {/* Right - text */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            {/* Title */}
            <h2 className="font-heading font-light text-[40px] tracking-wider uppercase text-[#333]">
              GET YOUR NOLA CORE TODAY
            </h2>

            {/* Subtitle */}
            <p className="font-sans text-[20px] text-[#4a4a4a] mt-4">
              Experience heritage-quality craftsmanship.
            </p>

            {/* Price */}
            <p className="font-sans text-[28px] font-bold text-[#333] mt-8">
              16 990 Ft
            </p>

            {/* CTA button */}
            <motion.div className="mt-6">
              <Link href="/termek/origin-core">
                <motion.span
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-block bg-[#d5e8f0] rounded-full px-16 py-5 font-bold text-[18px] text-[#333] shadow-xl cursor-pointer transition-colors hover:bg-[#c5dbe6]"
                >
                  Vásárlás
                </motion.span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
