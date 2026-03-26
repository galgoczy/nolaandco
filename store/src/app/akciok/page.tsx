"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { products } from "@/lib/products";

export default function PromotionsPage() {
  return (
    <>
      <Navbar />
      <CartDrawer />
      <main className="pt-20 bg-warm-beige min-h-screen">
        {/* Banner */}
        <section className="relative bg-terracotta py-20 overflow-hidden">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
            className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"
          />
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="text-xs tracking-[0.3em] uppercase text-white/60 font-light">
                Különleges ajánlatok
              </span>
              <h1 className="font-display text-4xl lg:text-5xl text-white mt-3">
                Akciók & Kedvezmények
              </h1>
              <p className="mt-4 text-white/70 font-light max-w-xl mx-auto">
                Figyelj az aktuális ajánlatainkra! Időszakos kedvezmények,
                csomagajánlatok és exkluzív kupónok.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Current promotions */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-warm-beige-dark rounded-3xl p-8 lg:p-12 mb-12 border border-terracotta/10"
            >
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className="flex-1">
                  <span className="inline-block px-4 py-1 bg-accent-red text-white text-xs font-semibold rounded-full mb-4">
                    Aktuális ajánlat
                  </span>
                  <h2 className="font-display text-2xl lg:text-3xl text-carbon mb-3">
                    Ingyenes szállítás 15 000 Ft felett
                  </h2>
                  <p className="text-carbon-light font-light">
                    Rendelj 15 000 Ft értékben és mi álljuk a szállítás költségét!
                    Érvényes minden termékre, korlátlan ideig.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <a
                    href="/#parnak"
                    className="inline-flex px-8 py-3 bg-terracotta text-white text-sm font-medium rounded-full hover:bg-terracotta-dark transition-colors"
                  >
                    Vásárlás most
                  </a>
                </div>
              </div>
            </motion.div>

            <h2 className="font-display text-2xl text-carbon mb-8 text-center">
              Összes termékünk
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
