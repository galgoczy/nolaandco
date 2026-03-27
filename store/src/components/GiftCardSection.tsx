"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function GiftCardSection() {
  return (
    <section id="featured-product" className="py-24 bg-white overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left - image area with blue rounded container */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative order-2 lg:order-1"
          >
            <div className="bg-hero-btn/20 rounded-[3rem] p-12 lg:p-24 relative overflow-hidden">
              <div className="aspect-square flex items-center justify-center">
                <span className="text-brown/40 text-sm tracking-wider uppercase font-sans">
                  Nola Core Pillow
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right - text */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="order-1 lg:order-2 space-y-8"
          >
            <h3 className="text-5xl md:text-6xl font-heading text-carbon leading-tight uppercase tracking-tight">
              GET YOUR NOLA CORE TODAY
            </h3>

            <p className="text-carbon-light text-lg font-light leading-relaxed">
              Experience heritage-quality craftsmanship.
            </p>

            <div className="pt-4">
              <p className="text-4xl font-light text-carbon mb-8">16 990 Ft</p>
              <Link href="/termek/origin-core">
                <motion.span
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-block bg-hero-btn text-carbon px-16 py-5 rounded-full text-lg font-bold tracking-wide shadow-xl cursor-pointer transition-all hover:opacity-90"
                >
                  Vásárlás
                </motion.span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
