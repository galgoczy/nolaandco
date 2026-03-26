"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Eye, ShoppingBag } from "lucide-react";
import { ProductVariant, formatPrice } from "@/lib/products";

interface ProductCardProps {
  product: ProductVariant;
  index: number;
}

export default function ProductCard({ product, index }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <Link
        href={`/termek/${product.slug}`}
        className="group block"
      >
        <div className="relative bg-white/60 rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-terracotta/10 hover:-translate-y-2">
          {/* Image */}
          <div className="relative aspect-square bg-gradient-to-br from-warm-beige-dark to-warm-beige overflow-hidden">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.4 }}
              className="relative w-full h-full flex items-center justify-center p-8"
            >
              <Image
                src={product.image}
                alt={product.name}
                width={280}
                height={280}
                className="object-contain drop-shadow-lg transition-transform duration-500 group-hover:scale-105"
              />
            </motion.div>

            {/* Overlay actions */}
            <div className="absolute inset-0 bg-carbon/0 group-hover:bg-carbon/10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex gap-3">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-terracotta hover:text-white transition-colors"
                >
                  <Eye size={18} />
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-terracotta hover:text-white transition-colors"
                >
                  <ShoppingBag size={18} />
                </motion.div>
              </div>
            </div>

            {/* Category badge */}
            <div className="absolute top-4 left-4">
              <span className="inline-block px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full text-[10px] tracking-wider uppercase text-carbon-light">
                {product.category === "parna" ? "Párna" : "Poszter"}
              </span>
            </div>

            {product.originalPrice && (
              <div className="absolute top-4 right-4">
                <span className="inline-block px-3 py-1 bg-accent-red text-white rounded-full text-[10px] font-semibold tracking-wider">
                  -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-5">
            <h3 className="font-display text-base font-medium text-carbon group-hover:text-terracotta transition-colors">
              {product.name}
            </h3>
            <p className="text-xs text-carbon-light mt-1 line-clamp-2">
              {product.description}
            </p>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-semibold text-terracotta">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-carbon-light/50 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-wider uppercase text-carbon-light">
                {product.dimensions}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
