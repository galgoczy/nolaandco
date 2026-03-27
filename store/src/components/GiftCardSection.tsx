"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { formatPrice } from "@/lib/products";

const features = [
  "Egyedi, kézzel készített babapárna",
  "A baba születési adataival díszítve",
  "OEKO-TEX® tanúsított anyagok",
  "Díszdobozban szállítjuk",
];

export default function GiftCardSection() {
  return (
    <section id="ajandekkartya" className="py-20 lg:py-28 bg-[#F5F0E8]">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left - large product image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="relative aspect-[3/4] max-w-[450px] mx-auto"
            >
              <Image
                src="/icons/Angyalbaba.png"
                alt="NOLA&CO Ajándékpárna"
                fill
                className="object-contain drop-shadow-2xl"
              />
            </motion.div>
          </motion.div>

          {/* Right - info */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <h2 className="font-display text-2xl sm:text-3xl lg:text-[36px] text-terracotta leading-tight mb-4">
              AJÁNDÉKOZZ
              <br />
              NOLA PÁRNÁT
            </h2>

            <p className="text-sm text-carbon-light font-light leading-relaxed mb-8">
              A tökéletes ajándék babaváróra, keresztelőre vagy születésnapra.
              Minden NOLA párna egyedi – a kisbaba születési adataival, gyönyörű
              stílizált rajzokkal készül. Egy ajándék, ami egy életen át megmarad.
            </p>

            {/* Feature bars */}
            <div className="space-y-4 mb-10">
              {features.map((feature, i) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-1 h-5 bg-terracotta/50 rounded-full" />
                  <span className="text-sm text-carbon-light font-light">
                    {feature}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Price */}
            <p className="text-3xl lg:text-4xl font-display text-carbon/70 mb-6">
              {formatPrice(14990)}
              <span className="text-base text-carbon-light/50 font-light ml-2">
                -tól
              </span>
            </p>

            {/* CTA */}
            <motion.a
              href="#parnak"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-block px-10 py-3.5 bg-[#c8d8e4]/70 text-carbon text-sm font-medium tracking-wider rounded-full hover:bg-[#c8d8e4] transition-all duration-300"
            >
              Vásárlás
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
