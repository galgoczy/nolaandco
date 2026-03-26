"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Heart, Package, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ThankYouPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20 bg-warm-beige min-h-screen flex items-center justify-center">
        <div className="max-w-lg mx-auto px-4 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 15, delay: 0.2 }}
            className="w-24 h-24 bg-terracotta/10 rounded-full flex items-center justify-center mx-auto mb-8"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Heart size={40} className="text-terracotta" fill="#C4A591" />
            </motion.div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="font-display text-3xl lg:text-4xl text-carbon mb-4"
          >
            Köszönjük a rendelésed!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-carbon-light font-light mb-8"
          >
            Rendelésed megkaptuk és hamarosan nekiállunk az elkészítésének.
            E-mailben küldünk értesítést a rendelésed állapotáról.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-warm-beige-dark rounded-2xl p-6 mb-8"
          >
            <div className="flex items-center gap-3 text-carbon">
              <Package size={20} className="text-terracotta" />
              <span className="text-sm font-medium">Várható elkészülés: 5-7 munkanap</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-3 bg-terracotta text-white text-sm font-medium rounded-full hover:bg-terracotta-dark transition-colors"
            >
              Vissza a főoldalra
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
