"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

export default function Features() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);

  return (
    <section
      id="hogyan-keszul"
      ref={sectionRef}
      className="relative py-20 lg:py-28 overflow-hidden"
    >
      {/* Terracotta background */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 bg-terracotta -z-10"
      />

      <div className="max-w-[1100px] mx-auto px-6 lg:px-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="font-display text-3xl sm:text-4xl lg:text-[44px] text-white">
            HOGYAN KÉSZÜL?
          </h2>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center text-white/80 font-light text-sm max-w-2xl mx-auto mb-16 space-y-1"
        >
          <p>
            Minden Nola párna a legnagyobb gondossággal készül, hogy a baba első
            emlékei biztonságban legyenek.
          </p>
          <p>• OEKO-TEX® minősítésű alapanyagok (huzat és cérna),</p>
          <p>
            • Hipoallergén, csomósodásmentes, formatartó töltet, ami számtalan
            mosás után is puha marad.
          </p>
          <p>
            • Könnyen kezelhető: Mosógépben, kímélő programon mosható az egész
            párna. Utána levegőn érdemes szárítani.
          </p>
        </motion.div>

        {/* Three tilted photos - artistic arrangement */}
        <div className="relative h-[350px] sm:h-[400px] lg:h-[450px] max-w-3xl mx-auto mb-14">
          {/* Left photo - tilted left */}
          <motion.div
            initial={{ opacity: 0, rotate: -15, y: 40 }}
            whileInView={{ opacity: 1, rotate: -8, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            whileHover={{ rotate: -3, scale: 1.05, zIndex: 10 }}
            className="absolute left-0 top-4 w-[200px] sm:w-[240px] lg:w-[280px] aspect-[3/4] bg-[#e8e0d6] rounded-xl overflow-hidden shadow-xl z-[1]"
          >
            <Image
              src="/icons/Angyalbaba.png"
              alt="Origin párna"
              fill
              className="object-contain p-6"
            />
          </motion.div>

          {/* Center photo - straight */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            whileHover={{ scale: 1.05, zIndex: 10 }}
            className="absolute left-1/2 -translate-x-1/2 top-0 w-[220px] sm:w-[260px] lg:w-[300px] aspect-[3/4] bg-[#d4c4b0] rounded-xl overflow-hidden shadow-xl z-[2]"
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src="/icons/Korababa.png"
                alt="Készítés közben"
                fill
                className="object-contain p-8"
              />
            </div>
          </motion.div>

          {/* Right photo - tilted right */}
          <motion.div
            initial={{ opacity: 0, rotate: 15, y: 40 }}
            whileInView={{ opacity: 1, rotate: 8, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
            whileHover={{ rotate: 3, scale: 1.05, zIndex: 10 }}
            className="absolute right-0 top-4 w-[200px] sm:w-[240px] lg:w-[280px] aspect-[3/4] bg-[#e8e0d6] rounded-xl overflow-hidden shadow-xl z-[1]"
          >
            <Image
              src="/icons/Korababa 2.png"
              alt="Nova párna"
              fill
              className="object-contain p-6"
            />
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center"
        >
          <a
            href="#parnak"
            className="inline-block px-10 py-3 border border-white/40 text-white text-sm tracking-[0.15em] rounded-full hover:bg-white/10 transition-all duration-300"
          >
            FEDEZD FEL A PÁRNÁKAT!
          </a>
        </motion.div>
      </div>
    </section>
  );
}
