"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import ProductCard from "./ProductCard";
import { getProductsByCategory } from "@/lib/products";

export default function PosterSection() {
  const posters = getProductsByCategory("poszter");
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);

  return (
    <section id="poszterek" ref={ref} className="relative py-24 lg:py-32 overflow-hidden">
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 bg-warm-beige-dark -z-10"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs tracking-[0.3em] uppercase text-terracotta font-light">
            Babaszoba dekoráció
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-carbon mt-3">
            Poszterek
          </h2>
          <p className="mt-4 text-carbon-light font-light max-w-2xl mx-auto">
            Gyönyörű nyomatok a kisbabád születési adataival. Prémium papírra
            nyomtatva, keretbe illeszthető méretben.
          </p>
          <div className="mt-6 w-16 h-[1px] bg-terracotta mx-auto" />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 max-w-3xl mx-auto">
          {posters.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>

        {/* Feature highlights */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 flex flex-wrap justify-center gap-6 lg:gap-12"
        >
          {[
            { label: "Prémium nyomtatás", sub: "250g matt papír" },
            { label: "A3 méret", sub: "30×42 cm" },
            { label: "Keretbe illeszthető", sub: "Standard keret" },
          ].map((feature) => (
            <div key={feature.label} className="text-center">
              <p className="text-sm font-medium text-carbon">{feature.label}</p>
              <p className="text-xs text-carbon-light mt-0.5">{feature.sub}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
