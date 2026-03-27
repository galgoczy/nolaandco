"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <section
      id="hero"
      ref={ref}
      className="relative w-full overflow-hidden"
      style={{ aspectRatio: "1280 / 715" }}
    >
      {/* Background with parallax — replace gradient with actual hero image (baby in crib with Nola pillow) */}
      {/* To add the real image: use next/image with fill + object-cover inside this motion.div */}
      <motion.div style={{ y }} className="absolute inset-0 -top-[15%] -bottom-[15%] z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#e8ddd4] via-[#ddd0c4] to-[#c9b8a8]" />
      </motion.div>

      {/* CTA button — vertically centered, left side */}
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
        className="absolute inset-y-0 left-0 z-10 flex items-center px-32"
      >
        <a
          href="#parnak"
          className="inline-block rounded-full bg-[#d5e8f0] px-14 py-5 font-[Manrope] text-[18px] font-bold leading-none tracking-[0.45px] text-[#333] shadow-xl transition-all duration-300 hover:shadow-2xl hover:brightness-105"
        >
          Explore the Collection
        </a>
      </motion.div>
    </section>
  );
}
