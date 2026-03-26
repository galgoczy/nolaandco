"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      id="hero"
      ref={ref}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-warm-beige"
    >
      {/* Parallax background pattern */}
      <motion.div style={{ y }} className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-warm-beige via-warm-beige-dark/30 to-warm-beige" />
        {/* Decorative floating elements */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0],
          }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          className="absolute top-1/4 left-[10%] w-32 h-32 rounded-full bg-terracotta/5"
        />
        <motion.div
          animate={{
            y: [0, 15, 0],
            rotate: [0, -3, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 8,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute top-1/3 right-[15%] w-24 h-24 rounded-full bg-terracotta/8"
        />
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{
            repeat: Infinity,
            duration: 5,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute bottom-1/4 left-[20%] w-16 h-16 rounded-full bg-accent-red/5"
        />
      </motion.div>

      <motion.div style={{ opacity }} className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Text content */}
          <div className="flex-1 text-left">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-block text-xs tracking-[0.3em] uppercase text-terracotta font-light mb-4">
                Egyedi babapárnák & poszterek
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-tight text-carbon"
            >
              Örök emlék
              <br />
              <span className="text-terracotta">kézzel készítve</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-6 text-base lg:text-lg text-carbon-light font-light leading-relaxed max-w-lg"
            >
              Minden NOLA&CO párna és poszter egyedi – a Te kisbabád születési
              adataival, gyönyörű stílizált rajzokkal készül. Tökéletes ajándék,
              ami egy életen át megmarad.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-8 flex flex-col sm:flex-row gap-4"
            >
              <a
                href="#parnak"
                className="group inline-flex items-center justify-center px-8 py-4 bg-terracotta text-white text-sm font-medium tracking-wider rounded-full hover:bg-terracotta-dark transition-all duration-300 hover:shadow-xl hover:shadow-terracotta/20 hover:-translate-y-0.5"
              >
                PÁRNÁK FELFEDEZÉSE
                <motion.span
                  className="ml-2 inline-block"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  →
                </motion.span>
              </a>
              <a
                href="#hogyan-keszul"
                className="inline-flex items-center justify-center px-8 py-4 border border-terracotta/30 text-carbon text-sm font-medium tracking-wider rounded-full hover:border-terracotta hover:bg-terracotta/5 transition-all duration-300"
              >
                HOGYAN KÉSZÜL
              </a>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
              className="mt-12 flex items-center gap-6 text-carbon-light/60"
            >
              <div className="flex items-center gap-2">
                <Image
                  src="/icons/Kézzel készült.png"
                  alt="Kézzel készült"
                  width={24}
                  height={24}
                  className="opacity-60"
                />
                <span className="text-xs tracking-wide">Kézzel készült</span>
              </div>
              <div className="w-px h-4 bg-carbon-light/20" />
              <div className="flex items-center gap-2">
                <Image
                  src="/icons/Oeko.png"
                  alt="Oeko-Tex"
                  width={24}
                  height={24}
                  className="opacity-60"
                />
                <span className="text-xs tracking-wide">Oeko-Tex</span>
              </div>
              <div className="w-px h-4 bg-carbon-light/20" />
              <div className="flex items-center gap-2">
                <Image
                  src="/icons/Egyedi.png"
                  alt="Egyedi"
                  width={24}
                  height={24}
                  className="opacity-60"
                />
                <span className="text-xs tracking-wide">100% egyedi</span>
              </div>
            </motion.div>
          </div>

          {/* Hero image area */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="flex-1 relative"
          >
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              {/* Decorative ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  repeat: Infinity,
                  duration: 30,
                  ease: "linear",
                }}
                className="absolute inset-0 border border-terracotta/10 rounded-full"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{
                  repeat: Infinity,
                  duration: 25,
                  ease: "linear",
                }}
                className="absolute inset-4 border border-dashed border-terracotta/15 rounded-full"
              />

              {/* Main product showcase */}
              <div className="absolute inset-8 bg-gradient-to-br from-warm-beige-dark to-terracotta/10 rounded-full flex items-center justify-center overflow-hidden">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 4,
                    ease: "easeInOut",
                  }}
                  className="relative w-3/4 h-3/4"
                >
                  <Image
                    src="/icons/Angyalbaba.png"
                    alt="NOLA&CO Babapárna"
                    fill
                    className="object-contain drop-shadow-2xl"
                    priority
                  />
                </motion.div>
              </div>

              {/* Floating badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, type: "spring" }}
                className="absolute -bottom-2 -right-2 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-terracotta/10 rounded-full flex items-center justify-center">
                  <Image
                    src="/icons/Minőség.png"
                    alt="Minőség"
                    width={20}
                    height={20}
                  />
                </div>
                <div>
                  <p className="text-xs font-semibold text-carbon">
                    Prémium minőség
                  </p>
                  <p className="text-[10px] text-carbon-light">
                    Oeko-Tex tanúsított
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.a
          href="#parnak"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex flex-col items-center gap-2 text-carbon-light/40 hover:text-terracotta transition-colors"
        >
          <span className="text-[10px] tracking-[0.2em] uppercase">
            Görgess
          </span>
          <ChevronDown size={16} />
        </motion.a>
      </motion.div>
    </section>
  );
}
