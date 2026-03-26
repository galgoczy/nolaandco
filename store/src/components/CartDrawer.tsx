"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/products";

export default function CartDrawer() {
  const { items, isOpen, setCartOpen, removeItem, updateQuantity, totalPrice } =
    useCartStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-warm-beige z-50 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-terracotta/20">
              <h2 className="text-lg font-display font-semibold tracking-wide">
                Kosár
              </h2>
              <button
                onClick={() => setCartOpen(false)}
                className="p-2 hover:text-terracotta transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 text-carbon-light">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <ShoppingBag size={48} strokeWidth={1} />
                </motion.div>
                <p className="text-sm">A kosarad üres</p>
                <button
                  onClick={() => setCartOpen(false)}
                  className="mt-4 px-6 py-2 bg-terracotta text-white text-sm rounded-full hover:bg-terracotta-dark transition-colors"
                >
                  Vásárlás folytatása
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.div
                        key={item.productId + JSON.stringify(item.customData)}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 100 }}
                        className="flex gap-4 bg-white/50 rounded-2xl p-4"
                      >
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-warm-beige-dark flex-shrink-0">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-contain p-2"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium truncate">
                            {item.name}
                          </h3>
                          <p className="text-xs text-carbon-light mt-0.5">
                            {item.style}
                          </p>
                          {item.customData?.babyName && (
                            <p className="text-xs text-terracotta mt-0.5">
                              {item.customData.babyName}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.productId,
                                    item.quantity - 1
                                  )
                                }
                                className="w-6 h-6 rounded-full bg-warm-beige-dark flex items-center justify-center hover:bg-terracotta hover:text-white transition-colors"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="text-sm w-6 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.productId,
                                    item.quantity + 1
                                  )
                                }
                                className="w-6 h-6 rounded-full bg-warm-beige-dark flex items-center justify-center hover:bg-terracotta hover:text-white transition-colors"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            <span className="text-sm font-medium">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="self-start p-1 text-carbon-light hover:text-accent-red transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <div className="border-t border-terracotta/20 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-carbon-light">
                      Összesen
                    </span>
                    <span className="text-lg font-display font-semibold">
                      {formatPrice(totalPrice())}
                    </span>
                  </div>
                  <Link
                    href="/kosar"
                    onClick={() => setCartOpen(false)}
                    className="block w-full py-3 bg-terracotta text-white text-center text-sm font-medium rounded-full hover:bg-terracotta-dark transition-all duration-300 hover:shadow-lg"
                  >
                    Kosár megtekintése
                  </Link>
                  <Link
                    href="/penztar"
                    onClick={() => setCartOpen(false)}
                    className="block w-full py-3 bg-carbon text-white text-center text-sm font-medium rounded-full hover:bg-carbon-light transition-all duration-300"
                  >
                    Fizetés
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
