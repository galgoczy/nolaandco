"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X, ShoppingBag, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/products";

const SHIPPING_COST = 1490;
const FREE_SHIPPING_THRESHOLD = 15000;

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCartStore();
  const subtotal = totalPrice();
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;

  return (
    <>
      <Navbar />
      <CartDrawer />
      <main className="pt-20 bg-warm-beige min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-carbon-light hover:text-terracotta transition-colors mb-8"
            >
              <ArrowLeft size={16} />
              Vásárlás folytatása
            </Link>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl lg:text-4xl text-carbon mb-8"
          >
            Kosár
          </motion.h1>

          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="inline-block mb-6"
              >
                <ShoppingBag size={64} strokeWidth={1} className="text-carbon-light/30" />
              </motion.div>
              <p className="text-carbon-light mb-6">A kosarad üres</p>
              <Link
                href="/"
                className="inline-flex px-8 py-3 bg-terracotta text-white text-sm rounded-full hover:bg-terracotta-dark transition-colors"
              >
                Termékek böngészése
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item, i) => (
                  <motion.div
                    key={item.productId + JSON.stringify(item.customData)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-4 sm:gap-6 bg-warm-beige-dark rounded-2xl p-4 sm:p-6"
                  >
                    <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-white/50 flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain p-3"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-medium text-carbon">
                            {item.name}
                          </h3>
                          <p className="text-xs text-carbon-light mt-0.5">
                            {item.style}
                          </p>
                          {item.customData?.babyName && (
                            <p className="text-xs text-terracotta mt-1">
                              Név: {item.customData.babyName}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="p-1 text-carbon-light hover:text-accent-red transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center bg-white/50 rounded-full">
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity - 1)
                            }
                            className="w-8 h-8 flex items-center justify-center hover:text-terracotta transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity + 1)
                            }
                            className="w-8 h-8 flex items-center justify-center hover:text-terracotta transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <span className="font-medium text-carbon">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="lg:col-span-1"
              >
                <div className="bg-warm-beige-dark rounded-2xl p-6 sticky top-24">
                  <h2 className="font-display text-lg font-medium text-carbon mb-6">
                    Összegzés
                  </h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-carbon-light">Részösszeg</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-carbon-light">Szállítás</span>
                      <span>
                        {shipping === 0 ? (
                          <span className="text-terracotta">Ingyenes</span>
                        ) : (
                          formatPrice(shipping)
                        )}
                      </span>
                    </div>
                    {subtotal < FREE_SHIPPING_THRESHOLD && (
                      <p className="text-xs text-terracotta">
                        Még {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)}{" "}
                        az ingyenes szállításhoz!
                      </p>
                    )}
                    <div className="border-t border-terracotta/10 pt-3 flex justify-between font-medium text-base">
                      <span>Összesen</span>
                      <span className="text-terracotta">
                        {formatPrice(total)}
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/penztar"
                    className="block w-full mt-6 py-3.5 bg-terracotta text-white text-center text-sm font-medium rounded-full hover:bg-terracotta-dark transition-all duration-300 hover:shadow-xl hover:shadow-terracotta/20"
                  >
                    Tovább a fizetéshez
                  </Link>

                  <Link
                    href="/"
                    className="block w-full mt-3 py-3 border border-terracotta/20 text-carbon text-center text-sm rounded-full hover:border-terracotta hover:bg-terracotta/5 transition-colors"
                  >
                    Vásárlás folytatása
                  </Link>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
