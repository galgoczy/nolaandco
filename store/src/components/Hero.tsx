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

  return (
    <section
      id="hero"
      ref={ref}
      className="relative w-full overflow-hidden leading-[0]"
    >
      <div className="relative w-full">
        {/* Hero image with parallax */}
        <motion.div style={{ y }} className="relative w-full">
          <Image
            src="/hero.png"
            alt="Nola & Co - Baba az egyedi Nola párnával"
            width={1920}
            height={1080}
            className="w-full h-auto object-cover"
            priority
            sizes="100vw"
          />
        </motion.div>

        {/* CTA button — vertically centered, left side */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
          className="absolute inset-0 flex items-center justify-start px-8 md:px-32 pointer-events-none"
        >
          <a
            href="#parnak"
            className="pointer-events-auto inline-block rounded-full bg-hero-btn px-14 py-5 font-sans text-lg font-bold leading-none tracking-wide text-carbon shadow-xl transition-all duration-300 hover:shadow-2xl hover:brightness-105"
          >
            Explore the Collection
          </a>
        </motion.div>
      </div>
    </section>
  );
}
