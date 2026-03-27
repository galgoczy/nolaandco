"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";

export default function PosterSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "5%"]);

  return (
    <section
      id="poszterek"
      ref={ref}
      className="relative py-20 lg:py-28 overflow-hidden"
    >
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 bg-[#F5F0E8] -z-10"
      />

      <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="font-display text-2xl sm:text-3xl lg:text-[36px] tracking-[0.15em] text-terracotta">
            POSZTEREK
          </h2>
        </motion.div>

        {/* Two poster mockups side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 max-w-4xl mx-auto">
          {/* ORIGIN poster */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Link href="/termek/origin-poszter" className="group block">
              <div className="relative aspect-[4/5] bg-[#d4cec6] rounded-xl overflow-hidden">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.4 }}
                  className="relative w-full h-full flex items-center justify-center p-12"
                >
                  {/* Frame mockup */}
                  <div className="relative w-full h-full bg-white rounded-sm shadow-xl flex items-center justify-center">
                    <Image
                      src="/icons/Angyalbaba.png"
                      alt="ORIGIN Poszter"
                      width={200}
                      height={280}
                      className="object-contain opacity-80"
                    />
                  </div>
                </motion.div>
              </div>
              <p className="text-center mt-5 text-lg tracking-[0.2em] text-carbon-light font-light">
                ORIGIN
              </p>
            </Link>
          </motion.div>

          {/* NOVA poster */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <Link href="/termek/nova-poszter" className="group block">
              <div className="relative aspect-[4/5] bg-[#d4cec6] rounded-xl overflow-hidden">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.4 }}
                  className="relative w-full h-full flex items-center justify-center p-12"
                >
                  <div className="relative w-full h-full bg-white rounded-sm shadow-xl flex items-center justify-center">
                    <Image
                      src="/icons/Korababa.png"
                      alt="NOVA Poszter"
                      width={200}
                      height={280}
                      className="object-contain opacity-80"
                    />
                  </div>
                </motion.div>
              </div>
              <p className="text-center mt-5 text-lg tracking-[0.2em] text-carbon-light font-light">
                NOVA
              </p>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
