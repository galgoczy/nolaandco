"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import ProductCard from "./ProductCard";
import { getProductsByCategory } from "@/lib/products";

export default function ProductGrid() {
  const ref = useRef(null);
  const pillows = getProductsByCategory("parna");
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);

  return (
    <section
      id="parnak"
      ref={ref}
      className="relative py-24 lg:py-32 overflow-hidden"
    >
      {/* Parallax background */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 bg-warm-beige-dark -z-10"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs tracking-[0.3em] uppercase text-terracotta font-light">
            Kézzel készített
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-carbon mt-3">
            Babapárnáink
          </h2>
          <p className="mt-4 text-carbon-light font-light max-w-2xl mx-auto">
            Minden párna egyedi – a Te kisbabád nevével, születési dátumával és
            adataival készül, gyönyörű stílizált rajzokkal díszítve.
          </p>
          <div className="mt-6 w-16 h-[1px] bg-terracotta mx-auto" />
        </motion.div>

        {/* 3x2 Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {pillows.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
