"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ProductVariant } from "@/lib/products";

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
      <Link href={`/termek/${product.slug}`} className="group block">
        <div className="relative overflow-hidden">
          {/* Image container - beige/tan background like design */}
          <div className="relative aspect-[3/4] bg-[#e8e0d6] rounded-xl overflow-hidden">
            <motion.div
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.5 }}
              className="relative w-full h-full flex items-center justify-center p-10"
            >
              <Image
                src={product.image}
                alt={product.name}
                width={300}
                height={400}
                className="object-contain drop-shadow-lg transition-transform duration-700 group-hover:scale-105"
              />
            </motion.div>
          </div>

          {/* Name below image - simple, centered */}
          <div className="mt-4 text-center">
            <h3 className="text-sm tracking-[0.15em] text-carbon-light font-light">
              {product.name}
            </h3>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
