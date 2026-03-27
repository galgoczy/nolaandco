"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      id="hero"
      ref={ref}
      className="relative h-screen min-h-[600px] max-h-[900px] overflow-hidden"
    >
      {/* Background image with parallax */}
      <motion.div style={{ y }} className="absolute inset-0 z-0">
        {/* Placeholder - this would be the baby in crib photo */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#e8ddd0] via-[#d4c4b0] to-[#c4a591]">
          {/* Decorative baby image centered */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="relative w-[300px] h-[400px] lg:w-[400px] lg:h-[550px]"
            >
              <Image
                src="/icons/Angyalbaba.png"
                alt="NOLA&CO babapárna"
                fill
                className="object-contain drop-shadow-2xl"
                priority
              />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* VÁSÁRLÁS button - top left */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        style={{ opacity }}
        className="absolute top-28 left-6 lg:left-10 z-10"
      >
        <a
          href="#parnak"
          className="inline-block px-8 py-3 bg-[#c8d8e4]/80 backdrop-blur-sm text-carbon text-sm font-medium tracking-wider rounded-full hover:bg-[#c8d8e4] transition-all duration-300 hover:shadow-lg"
        >
          VÁSÁRLÁS
        </a>
      </motion.div>

      {/* Bottom overlay text */}
      <motion.div
        style={{ opacity }}
        className="absolute bottom-0 left-0 right-0 z-10 px-6 lg:px-10 pb-8 lg:pb-12"
      >
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-xs tracking-[0.3em] uppercase text-warm-beige/70 font-light mb-2"
        >
          THE SHAPE OF YOUR MEMORIES
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="font-display text-4xl sm:text-5xl lg:text-[64px] xl:text-[72px] leading-[0.95] tracking-wide text-warm-beige/90"
        >
          AZ EMLÉKEID FORMÁBA ÖNTVE
        </motion.h1>
      </motion.div>

      {/* Subtle gradient overlay at bottom for text readability */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent z-[5]" />
    </section>
  );
}
