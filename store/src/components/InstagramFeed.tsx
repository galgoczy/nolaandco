"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const instaPosts = [
  { id: 1, image: "/icons/Angyalbaba.png", alt: "NOLA&CO Angyalbaba" },
  { id: 2, image: "/icons/Korababa.png", alt: "NOLA&CO Korababa" },
  { id: 3, image: "/icons/Angyalbaba 2.png", alt: "NOLA&CO Natúr Angyalbaba" },
  { id: 4, image: "/icons/Korababa 2.png", alt: "NOLA&CO Natúr Korababa" },
];

export default function InstagramFeed() {
  return (
    <section className="py-24 lg:py-32 bg-warm-beige-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <Image
              src="/icons/Insta 1.png"
              alt="Instagram"
              width={24}
              height={24}
            />
            <span className="text-xs tracking-[0.3em] uppercase text-terracotta font-light">
              @nolaandco
            </span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl text-carbon">
            Kövess minket Instagramon
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {instaPosts.map((post, i) => (
            <motion.a
              key={post.id}
              href="https://instagram.com/nolaandco"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              whileHover={{ scale: 1.03 }}
              className="group relative aspect-square bg-warm-beige rounded-2xl overflow-hidden"
            >
              <Image
                src={post.image}
                alt={post.alt}
                fill
                className="object-contain p-6 transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-carbon/0 group-hover:bg-carbon/20 transition-colors duration-300 flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  whileHover={{ opacity: 1, scale: 1 }}
                  className="w-10 h-10 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <Image
                    src="/icons/Insta 1.png"
                    alt=""
                    width={20}
                    height={20}
                  />
                </motion.div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
