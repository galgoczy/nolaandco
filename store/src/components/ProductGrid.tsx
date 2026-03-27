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
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "5%"]);

  return (
    <section
      id="parnak"
      ref={ref}
      className="relative py-20 lg:py-28 overflow-hidden"
    >
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 bg-[#F5F0E8] -z-10"
      />

      <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
        {/* 3x2 Grid - matching design layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10 lg:gap-x-8 lg:gap-y-14">
          {pillows.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
